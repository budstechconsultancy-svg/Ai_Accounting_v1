# AI Rate Limiting Configuration

This document explains the AI service rate limiting implementation and how to configure/tune the limits.

## Current Limits

The AI service implements three-tier rate limiting:

- **User Limit**: 10 requests per minute per user
- **Tenant Limit**: 50 requests per minute per tenant
- **Global Limit**: 100 requests per minute across all users

## How It Works

### Rate Limiting Logic
1. **Multi-tier Check**: Each request is checked against user, tenant, and global limits
2. **Fixed Window**: 60-second sliding window for all limits
3. **First Failure**: If any limit is exceeded, request is rejected
4. **Queue Management**: Requests are queued (max 5) and processed serially

### Request Processing
1. **Spacing**: Minimum 400ms between AI provider calls
2. **Serialization**: Only one AI request processed at a time
3. **Caching**: 5-minute cache for identical prompts
4. **Retry Logic**: 500ms, 1000ms, 2000ms delays on provider errors

## Tuning the Limits

### Modifying Limits

Update the `RateLimiter` class in `backend/core/ai_proxy.py`:

```python
def allow(self, key: str, limit: int) -> bool:
    # Change the limit parameter when calling allow()
```

Current call sites:
- `rate_limiter.allow(user_id, 10)` - User limit
- `rate_limiter.allow(f"tenant:{tenant_id}", 50)` - Tenant limit
- `rate_limiter.allow('global', 100)` - Global limit

### Adjusting Queue Size

```python
# In RequestQueue.__init__
if len(self.queue) >= 5:  # Change this number
```

### Modifying Request Spacing

```python
# In RequestQueue.__init__
self.min_spacing = 0.4  # Seconds between requests (0.3-0.5 range)
```

### Cache Duration

```python
cache.set(f"ai_cache:{cache_key}", result, 300)  # 300 seconds = 5 minutes
```

## Monitoring

### Metrics Endpoint
```
GET /api/metrics/ai/
Authorization: Bearer <admin_token>
```

Returns:
```json
{
  "queue_size": 2,
  "rate_limit_count": 15,
  "cache_info": "Redis/memory cache with 5min TTL"
}
```

### Alert Thresholds
- Soft alert when 429 count exceeds 10/minute
- Logged in Django logs with WARNING level

## Testing

Run the rate limiting test:
```bash
cd backend
python test_429_reproduction.py
```

Expected behavior:
- Rate limiting activates under load
- Requests are queued when limits hit
- Test shows mix of success/queued/rejected responses

## Error Responses

### Rate Limited
```json
{
  "error": "AI service busy. Please try again later."
}
```

### Queue Full
```json
{
  "error": "AI service busy. Please try again later."
}
```

### Cache Hit
- Immediate response (no cost to limits)

## Logging

All AI requests are logged:
```
INFO AI request: user=123, tenant=456, hash=abc1234
INFO AI response: user=123, tenant=456, hash=abc1234, success=true
ERROR AI request failed: user=123, tenant=456, hash=abc1234, error=...
```

## Production Considerations

### Redis Configuration
For production, enable Redis caching by setting:
```env
REDIS_URL=redis://your-redis-server:6379/1
```

### Scaling
- Current design supports ~10 concurrent users effectively
- For more users, consider:
  - Shorter request spacing
  - Higher limits
  - Multiple AI provider instances
  - Distributed rate limiting (Redis)

### Monitoring Integration
Consider integrating with monitoring systems:
- Prometheus metrics
- AlertManager for rate limit alerts
- ELK stack for log aggregation
