import os
import json
import base64
import time
import hashlib
import logging
import threading
from typing import Dict, Any, Optional
from django.core.cache import cache
from google.api_core import exceptions
import google.generativeai as genai

logger = logging.getLogger(__name__)


class APIKeyManager:
    """Manages multiple API keys with rate limiting and health tracking"""

    def __init__(self):
        # Load keys from environment variables (can have multiple GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.)
        self.api_keys = []
        for i in range(1, 11):  # Support up to 10 keys
            key = os.getenv(f'GEMINI_API_KEY_{i}') or os.getenv('GEMINI_API_KEY') if i == 1 else None
            if key:
                self.api_keys.append(key)
            else:
                break

        if not self.api_keys:
            logger.warning("No Gemini API keys configured!")
        
        self.unhealthy_keys = set()  # Track unhealthy keys
        self.recheck_interval = 90  # 1.5 minutes cooldown
        self.rotation_counter = 0  # In-memory rotation counter

    def get_healthy_key(self) -> Optional[str]:
        """Get next healthy API key with round-robin rotation"""
        if not self.api_keys:
            return None

        # Skip unhealthy keys
        healthy_keys = [k for k in self.api_keys if k not in self.unhealthy_keys]

        keys_to_use = healthy_keys if healthy_keys else self.api_keys  # Fall back to unhealthy if no healthy available

        if healthy_keys:
            # Use in-memory counter for round-robin
            self.rotation_counter += 1
            key_index = self.rotation_counter % len(healthy_keys)
            selected_key = healthy_keys[key_index]
            return selected_key

        # Fallback when no healthy keys
        return keys_to_use[0] if keys_to_use else None

    def mark_key_unhealthy(self, api_key: str):
        """Mark a key as unhealthy"""
        self.unhealthy_keys.add(api_key)
        logger.warning(f"Marked API key {api_key[:10]}... as unhealthy")

        # Schedule recheck
        threading.Timer(self.recheck_interval, lambda: self._recheck_key(api_key)).start()

    def _recheck_key(self, api_key: str):
        """Recheck if an unhealthy key is now healthy"""
        # Try a simple request to see if key works
        genai.configure(api_key=api_key)
        try:
            # Try a standard model for health check
            genai.GenerativeModel('gemini-flash-latest').generate_content("test")
            self.unhealthy_keys.discard(api_key)
            logger.info(f"Rechecked API key {api_key[:10]}... - now healthy")
        except Exception:
            logger.warning(f"API key {api_key[:10]}... still unhealthy")


class CircuitBreaker:
    """Circuit breaker to stop requests when provider is failing"""

    def __init__(self):
        self.failure_threshold = 5  # Failures per minute
        self.reset_timeout = 300  # 5 minutes

        # In-memory state
        self.failures = 0
        self.last_failure = 0

    def is_open(self) -> bool:
        """Check if circuit breaker is open (blocking requests)"""
        now = time.time()
        if self.failures >= self.failure_threshold:
            if now - self.last_failure < self.reset_timeout:
                return True
            else:
                # Reset failures
                self.failures = 0
                self.last_failure = 0
        return False

    def record_failure(self):
        """Record a failure"""
        self.failures += 1
        self.last_failure = time.time()

    def record_success(self):
        """Record a success to potentially close circuit"""
        if self.failures > 0:
            self.failures -= 1


class RateLimiter:
    """Per-user, tenant, IP rate limiting using in-memory storage"""

    def __init__(self):
        self.limits = {}  # key -> (count, window_start)
        self.lock = threading.Lock()

    def check_rate_limit(self, key: str, limit: int, window: int = 60) -> Dict[str, Any]:
        """Check if request is allowed. Returns {'allowed': bool, 'retry_after': int}"""
        now = time.time()
        
        with self.lock:
            if key in self.limits:
                count, window_start = self.limits[key]
                
                # Check if window has expired
                if now - window_start >= window:
                    # Reset window
                    self.limits[key] = (1, now)
                    return {'allowed': True, 'retry_after': 0}
                
                # Within window
                if count >= limit:
                    retry_after = int(window - (now - window_start))
                    return {'allowed': False, 'retry_after': retry_after}
                
                # Increment count
                self.limits[key] = (count + 1, window_start)
                return {'allowed': True, 'retry_after': 0}
            else:
                # First request
                self.limits[key] = (1, now)
                return {'allowed': True, 'retry_after': 0}


# Global instances
api_key_manager = APIKeyManager()
circuit_breaker = CircuitBreaker()
rate_limiter = RateLimiter()


def generate_cache_key(request_data: dict) -> str:
    """Generate cache key from request data"""
    cacheable_data = json.dumps({
        'type': request_data.get('type'),
        'message': request_data.get('message', ''),
        'contextData': request_data.get('contextData', ''),
        'useGrounding': request_data.get('useGrounding', False),
        'file_hash': request_data.get('file_hash')  # For invoice files
    }, sort_keys=True)
    return hashlib.md5(cacheable_data.encode()).hexdigest()


def process_ai_request(request_data: dict) -> dict:
    """Worker function to process AI requests"""

    user_id = request_data.get('user_id', 'unknown')
    tenant_id = request_data.get('tenant_id', 'anonymous')
    cache_key = request_data.get('cache_key')

    try:
        # Check circuit breaker first
        if circuit_breaker.is_open():
            logger.warning("Circuit breaker is open, rejecting request")
            return {'error': 'AI service is temporarily unavailable. Please try again in a few minutes.', 'code': 'CIRCUIT_BREAKER'}

        # Get API key
        api_key = api_key_manager.get_healthy_key()
        if not api_key:
            # Check if we have any keys at all
            if not api_key_manager.api_keys:
                 logger.error("No Gemini API keys configured")
                 return {'error': 'Configuration Error: No Gemini API keys found. Please set GEMINI_API_KEY environment variable.'}
            
            return {'error': 'AI service busy (No healthy keys). Please try again later.'}

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        # Build prompt
        if request_data.get('type') == 'agent':
            prompt = f"""
            You are Kiki, an expert accounting AI assistant. You are friendly, helpful, and highly knowledgeable about finance and accounting.
            Always introduce yourself as Kiki if asked who you are.
            
            Use the following context data to provide accurate answers:
            {request_data.get('contextData', '')}

            User query: {request_data['message']}

            Provide a helpful, accurate response focused on accounting and finance.
            """
        elif request_data.get('type') == 'invoice':
            prompt_text = request_data.get('prompt', 'Extract invoice data from this image')
            if 'image_data' in request_data:
                try:
                    image_bytes = base64.b64decode(request_data['image_data'])
                    prompt = [
                        prompt_text,
                        {
                            'mime_type': request_data.get('mime_type', 'image/jpeg'),
                            'data': image_bytes
                        }
                    ]
                except Exception as e:
                    logger.error(f"Failed to decode image data: {e}")
                    return {'error': 'Invalid image data'}
            else:
                prompt = prompt_text
        else:
            return {'error': 'Invalid request type'}

        # Log request
        msg_content = request_data.get('message', 'invoice_processing')
        request_hash = hashlib.md5(msg_content.encode()).hexdigest()[:8]
        logger.info(f"Processing AI request: user={user_id}, tenant={tenant_id}, hash={request_hash}")

        # Execute with retry
        response_text = execute_with_retry(model, prompt, request_data, api_key)

        # Record success
        circuit_breaker.record_success()

        # Cache the result
        if cache_key:
            try:
                cache.set(f"ai_cache:{cache_key}", {'reply': response_text}, 300)
            except:
                pass  # Cache failure, continue

        logger.info(f"AI response success: user={user_id}, tenant={tenant_id}, hash={request_hash}")
        return {'reply': response_text}

    except Exception as e:
        logger.error(f"AI request failed: user={user_id}, tenant={tenant_id}, error={str(e)}")

        # Record failure for circuit breaker
        circuit_breaker.record_failure()

        if isinstance(e, exceptions.ResourceExhausted):
            return {'error': 'AI service quota exceeded. Please try again later.', 'code': 'RATE_LIMIT'}
        return {'error': f'AI service busy. Error: {str(e)}'}


def execute_with_retry(model, prompt: str, request_data: dict, api_key: str) -> str:
    """Execute AI request with exponential backoff, retry-after respect, and model fallback"""
    max_attempts = 5
    base_delay = 1
    api_key_used = api_key
    
    # List of models to try in order of preference
    # We try flash first (fast/cheap), then pro (better), then legacy
    candidate_models = [
        'gemini-2.0-flash-exp', 
        'gemini-2.0-flash-lite', 
        'gemini-2.0-flash', 
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-pro-latest',
        'gemini-1.5-pro-latest',
        'gemini-pro-latest',
    ]

    for attempt in range(max_attempts):
        try:
            # Configure API key for this attempt
            genai.configure(api_key=api_key_used)
            
            # Try each model in the list until one works or we run out
            last_error = None
            for model_name in candidate_models:
                try:
                    logger.info(f"Attempting with model: {model_name} (Key: {api_key_used[:4]}...)")
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(prompt)
                    return response.text.strip()
                except exceptions.NotFound:
                    logger.warning(f"Model {model_name} not found, trying next...")
                    continue
                except exceptions.InvalidArgument as e:
                     if "not supported" in str(e).lower():
                         logger.warning(f"Model {model_name} doesn't support this request, trying next...")
                         continue
                     raise e
                except Exception as e:
                    # Let other exceptions (like Quota) bubble up to the outer loop logic
                    raise e
            
            # If we get here, all models failed with NotFound or InvalidArgument
            raise Exception("All available Gemini models failed (404 Not Found)")

        except exceptions.ResourceExhausted as e:
            logger.warning(f"Resource exhausted on attempt {attempt + 1}")

            # Check retry_after header
            retry_after = getattr(e, 'retry_after', None)
            if retry_after and isinstance(retry_after, (int, float)):
                sleep_time = min(retry_after, 60)  # Max 1 minute
            else:
                # Exponential backoff
                sleep_time = base_delay * (2 ** attempt) + (0.5 * attempt)  # Add jitter

            if attempt < max_attempts - 1:
                logger.info(f"Retrying AI request in {sleep_time:.2f} seconds")
                time.sleep(sleep_time)

                # Try a different key if available
                new_key = api_key_manager.get_healthy_key()
                if new_key and new_key != api_key_used:
                    api_key_used = new_key
                    logger.info("Switching to alternative API key")
                    continue

                # Mark current key as unhealthy
                api_key_manager.mark_key_unhealthy(api_key_used)
                new_key = api_key_manager.get_healthy_key()
                if new_key:
                    api_key_used = new_key
                else:
                    raise Exception("All API keys unhealthy")
            else:
                raise

        except Exception as e:
            logger.error(f"AI request error on attempt {attempt + 1}: {e}")
            if attempt == max_attempts - 1:
                raise
            continue

    raise Exception("All retries failed")


class AIServiceProxy:
    """Main AI service interface with direct processing (no Redis queue)"""

    def __init__(self):
        # Concurrency limiter for direct processing
        self.concurrency_semaphore = threading.Semaphore(5)

    def make_request(self, request_type: str, request_data: dict,
                    user_id: str, tenant_id: str = None) -> dict:
        """
        Main entry point for AI requests

        Args:
            request_type: 'agent' or 'invoice'
            request_data: Request payload
            user_id: User identifier
            tenant_id: Tenant identifier
        """

        # Check circuit breaker at entry point
        if circuit_breaker.is_open():
            return {'error': 'AI service is temporarily unavailable. Please try again later.', 'code': 'CIRCUIT_BREAKER'}

        # Check rate limits
        try:
            user_limit = rate_limiter.check_rate_limit(f"user:{user_id}", 50)  # 50 per minute per user
            if not user_limit['allowed']:
                return {
                    'error': 'Rate limit exceeded. Please wait before making another request.',
                    'code': 'RATE_LIMIT',
                    'retryAfter': user_limit['retry_after']
                }

            tenant_limit = rate_limiter.check_rate_limit(f"tenant:{tenant_id or 'anonymous'}", 200)  # 200 per minute per tenant
            if not tenant_limit['allowed']:
                return {
                    'error': 'Rate limit exceeded for your organization.',
                    'code': 'RATE_LIMIT',
                    'retryAfter': tenant_limit['retry_after']
                }

            global_limit = rate_limiter.check_rate_limit('global', 1000)  # 1000 per minute global
            if not global_limit['allowed']:
                return {
                    'error': 'Service is busy. Please try again later.',
                    'code': 'RATE_LIMIT',
                    'retryAfter': global_limit['retry_after']
                }
        except Exception as e:
            logger.warning(f"Rate limiting error: {e}")

        # Check cache
        cache_key = generate_cache_key(request_data)
        try:
            cached_result = cache.get(f"ai_cache:{cache_key}")
            if cached_result:
                logger.info(f"Cache hit for user {user_id}")
                return cached_result
        except Exception as e:
            logger.warning(f"Cache unavailable: {e}")

        # Prepare full request
        full_request = request_data.copy()
        full_request.update({
            'type': request_type,
            'user_id': user_id,
            'tenant_id': tenant_id or 'anonymous',
            'cache_key': cache_key
        })

        # Process directly - limit concurrency
        if not self.concurrency_semaphore.acquire(blocking=False):
            logger.warning(f"Concurrency limit reached, rejecting direct request for user {user_id}")
            return {'error': 'AI service busy. Please try again later.', 'code': 'CONCURRENCY_LIMIT'}

        try:
            logger.info(f"Processing {request_type} request directly for user {user_id}")
            result = process_ai_request(full_request)
            if result and 'error' not in result:
                # Try to cache the result
                try:
                    cache.set(f"ai_cache:{cache_key}", result, 300)
                except:
                    pass  # Cache failure, continue
            return result
        finally:
            self.concurrency_semaphore.release()

    def get_stats(self) -> dict:
        """Get service statistics"""
        return {
            'circuit_breaker_open': circuit_breaker.is_open(),
            'circuit_breaker_failures': circuit_breaker.failures,
            'api_keys_total': len(api_key_manager.api_keys),
            'api_keys_unhealthy': len(api_key_manager.unhealthy_keys),
            'cache_info': 'In-memory cache with 5min TTL'
        }


# Global instance
ai_service = AIServiceProxy()
