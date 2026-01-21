import os
from rest_framework import viewsets, status, generics, views  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework.permissions import IsAuthenticated, AllowAny  # type: ignore
from rest_framework.decorators import api_view, permission_classes  # type: ignore
from django.utils.decorators import method_decorator  # type: ignore
from django.views.decorators.csrf import csrf_exempt  # type: ignore
from django.utils import timezone  # type: ignore
from datetime import timedelta
from django.contrib.auth import get_user_model  # type: ignore
from django.db import models

User = get_user_model()

from .models import CompanyFullInfo
from .serializers import (
    UserSignupSerializer,
    CompanySettingsSerializer
)
from .utils import TenantQuerysetMixin, IsTenantMember

class SignupView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSignupSerializer

from rest_framework.parsers import MultiPartParser, FormParser, JSONParser  # type: ignore

class CompanySettingsViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = CompanySettingsSerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    required_permission = 'SETTINGS_COMPANY'
    queryset = CompanyFullInfo.objects.all()
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def perform_create(self, serializer):
        tid = self.request.user.tenant_id
        serializer.save(tenant_id=tid)

@api_view(['GET'])
@permission_classes([AllowAny]) # Or IsAuthenticated depending on need
def health_check(request):
    return Response({
        'status': 'ok',
        'timestamp': timezone.now().isoformat()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_status(request):
    return Response({'isActive': True})

class ModulePermissionsSchemaView(views.APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Placeholder schema
        return Response({
            "accounting": ["read", "write"],
            "inventory": ["read", "write"]
        })

class UserModulePermissionsView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        """Get permissions for a user - Owner gets all 33, TenantUser gets selected IDs"""
        current_user = request.user
        from .models import TenantUser
        from .rbac import get_all_permission_ids, get_permission_codes_from_ids
        
        # Determine if current user is Owner (User model) or Staff (TenantUser model)
        is_owner = not isinstance(current_user, TenantUser)
        
        # Owner gets ALL 33 permissions automatically
        if is_owner:
            all_ids = get_all_permission_ids()  # [1, 2, 3, ..., 33]
            codes = get_permission_codes_from_ids(all_ids)
            return Response({
                'user_id': user_id,
                'tenant_id': current_user.tenant_id,
                'submodule_ids': all_ids,
                'codes': codes,
                'is_owner': True
            })
        
        # TenantUser gets only selected permissions
        if str(current_user.id) == str(user_id):
            target_user = current_user
        else:
            # Admin viewing another user
            try:
                target_user = TenantUser.objects.get(id=user_id, tenant_id=current_user.tenant_id)
            except TenantUser.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)
        
        # Get selected submodule IDs from TenantUser
        selected_ids = target_user.selected_submodule_ids or []
        codes = get_permission_codes_from_ids(selected_ids)
        
        return Response({
            'user_id': user_id,
            'tenant_id': current_user.tenant_id,
            'submodule_ids': selected_ids,
            'codes': codes,
            'is_owner': False
        })

    def put(self, request, user_id):
        """Update permissions for a user"""
        return Response({
            "success": True,
            "message": "Permissions updated",
            "codes": request.data.get('codes', [])
        })

from .ai_proxy import ai_service

@method_decorator(csrf_exempt, name='dispatch')
class AgentMessageView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        msg = request.data.get('message', '').strip()
        use_grounding = request.data.get('useGrounding', False)

        if not msg:
            return Response({'error': 'AI service busy. Please try again later.'}, status=429)

        # Extract user and tenant info
        user_id = str(request.user.id)
        tenant_id = getattr(request.user, 'tenant_id', None)
        if tenant_id:
            tenant_id = str(tenant_id)

        # Prepare request data
        request_data = {
            'message': msg,
            'contextData': request.data.get('contextData', ''),
            'useGrounding': use_grounding
        }

        # Use AI proxy
        result = ai_service.make_request('agent', request_data, user_id, tenant_id)

        if 'error' in result:
            return Response(result, status=429)

        return Response({'reply': result['reply']})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_metrics(request):
    """Get comprehensive AI service metrics for monitoring"""
    stats = ai_service.get_stats()

    # Add additional metrics
    import redis
    redis_client = redis.from_url(os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/0'))

    # Calculate real-time metrics
    now = timezone.now().timestamp()
    five_min_ago = now - 300

    total_requests_5min = redis_client.zcount('ai_requests', five_min_ago, now)
    successful_requests_5min = redis_client.zcount('ai_successes', five_min_ago, now)
    failed_requests_5min = redis_client.zcount('ai_failures', five_min_ago, now)
    rate_limited_requests_5min = redis_client.zcount('rate_limited', five_min_ago, now)
    provider_429_5min = redis_client.zcount('provider_429', five_min_ago, now)

    # Cost tracking (simulated)
    cost_per_request = 0.0001  # $0.0001 per request (adjust based on actual Gemini pricing)
    estimated_cost_5min = successful_requests_5min * cost_per_request

    enhanced_stats = {
        **stats,
        'metrics_5min': {
            'total_requests': total_requests_5min,
            'successful_requests': successful_requests_5min,
            'failed_requests': failed_requests_5min,
            'rate_limited_requests': rate_limited_requests_5min,
            'provider_429_errors': provider_429_5min,
            'success_rate_percent': (successful_requests_5min / max(total_requests_5min, 1)) * 100,
            'estimated_cost_usd': estimated_cost_5min
        },
        'alerts': {
            'high_429_rate': provider_429_5min > 50,  # More than 50 429s in 5 min
            'queue_too_deep': stats.get('queue_size', 0) > 20,
            'low_success_rate': ((successful_requests_5min / max(total_requests_5min, 1)) * 100) < 95
        }
    }

    return Response(enhanced_stats)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_with_metrics(request):
    """Enhanced health check with basic metrics"""
    from django.db import connections  # type: ignore
    from django.core.cache import cache  # type: ignore

    # Check database
    db_status = 'ok'
    try:
        with connections['default'].cursor() as cursor:
            cursor.execute("SELECT 1")
    except:
        db_status = 'error'

    # Check cache
    cache_status = 'ok'
    try:
        cache.set('health_test', 'ok', 1)
        if cache.get('health_test') != 'ok':
            cache_status = 'error'
    except:
        cache_status = 'error'

    # Basic AI stats (without authentication)
    ai_stats = {
        'total_requests': ai_service.stats.get('total_requests', 0),
        'cache_hits': ai_service.stats.get('cache_hit', 0),
        'queue_size': ai_service.request_queue.size(),
        'active_flights': len(ai_service.single_flight)
    }

    return Response({
        'status': 'ok' if db_status == 'ok' and cache_status == 'ok' else 'error',
        'timestamp': timezone.now().isoformat(),
        'services': {
            'database': db_status,
            'cache': cache_status,
            'ai_service': 'ok'
        },
        'ai_metrics': ai_stats
    })


class AdminSubscriptionsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get all users as subscriptions
        users = User.objects.all().order_by('-created_at')
        subscriptions = []
        for user in users:
            # Determine Online status dynamically
            is_online = False
            if user.last_activity:
                # Online if activity within last 5 minutes
                time_threshold = timezone.now() - timedelta(minutes=5)
                if user.last_activity > time_threshold:
                    is_online = True
            
            login_status = 'Online' if is_online else 'Offline'

            # Map user to subscription format
            subscription = {
                'id': user.id,
                'username': user.username,
                'companyName': user.company_name,
                'registrationDate': user.created_at.isoformat(),
                'subscriptionPlan': user.selected_plan,
                'subscriptionStartDate': user.created_at.isoformat(),  # Default to created
                'subscriptionEndDate': (user.created_at.replace(year=user.created_at.year + 1)).isoformat(),  # 1 year later
                'totalUploads': 1000,  # Default quota
                'uploadsUsed': 0,  # TODO: track actual usage
                'isActive': user.is_active,
                'tenantId': user.tenant_id,
                'lastLogin': user.last_login.isoformat() if user.last_login else user.created_at.isoformat(),
                'loginStatus': login_status,
            }
            subscriptions.append(subscription)
        return Response(subscriptions)

    def put(self, request):
        user_id = request.data.get('userId')
        is_active = request.data.get('isActive')
        if user_id is None or is_active is None:
            return Response({'error': 'userId and isActive required'}, status=400)
        try:
            user = User.objects.get(id=user_id)
            user.is_active = is_active
            user.save()
            return Response({'success': True})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


class AdminPaymentsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all().order_by('-created_at')
        payments = []
        for user in users:
            # Mock payment data based on user plan
            amount = 0
            if user.selected_plan == 'Pro':
                amount = 2999
            elif user.selected_plan == 'Enterprise':
                amount = 9999
            
            payments.append({
                'id': user.id,
                'username': user.username,
                'companyName': user.company_name,
                'totalAmountPaid': amount,
            })
        return Response(payments)


@method_decorator(csrf_exempt, name='dispatch')
class AIProxyView(views.APIView):
    """Unified AI proxy endpoint for all AI operations"""

    def post(self, request, action):
        # Require authentication for AI services
        if not request.user.is_authenticated:
            return Response({'error': 'AI service busy. Please try again later.'}, status=429)

        # Extract user and tenant info
        user_id = str(request.user.id)
        tenant_id = getattr(request.user, 'tenant_id', None)
        if tenant_id:
            tenant_id = str(tenant_id)

        if action == 'extract-invoice':
            # Handle file upload for invoice extraction
            if 'file' not in request.FILES:
                return Response({'error': 'No file provided.'}, status=400)

            file_obj = request.FILES['file']

            # Use updated invoice processing
            from .ai_service import create_invoice_processing_request
            result = create_invoice_processing_request(
                file_obj,
                mime_type=file_obj.content_type,
                user_id=user_id,
                tenant_id=tenant_id
            )

        elif action == 'agent-message':
            # Handle agent messages
            msg = request.data.get('message', '').strip()
            if not msg:
                return Response({'error': 'AI service busy. Please try again later.'}, status=429)

            request_data = {
                'message': msg,
                'contextData': request.data.get('contextData', ''),
                'useGrounding': request.data.get('useGrounding', False)
            }
            result = ai_service.make_request('agent', request_data, user_id, tenant_id)
        else:
            return Response({'error': 'AI service busy. Please try again later.'}, status=429)

        if 'error' in result:
            return Response(result, status=429)

        return Response(result)

    def get(self, request, action):
        """Get AI service stats"""
        if action == 'stats':
            if not request.user.is_staff:  # Only staff can see stats
                return Response({'error': 'Unauthorized'}, status=403)
            return Response(ai_service.get_stats())
        return Response({'error': 'Unknown action'}, status=400)


class SettingsUsersView(views.APIView):
    permission_classes = [IsAuthenticated]
    required_permission = 'USERS_MANAGE'

    def get(self, request):
        """Return TenantUsers for the same tenant with their selected submodule IDs"""
        from .models import TenantUser
        
        tenant_id = request.user.tenant_id
        if not tenant_id:
             return Response({'users': []})

        users = TenantUser.objects.filter(tenant_id=tenant_id).order_by('-created_at')
        
        user_list = []
        for u in users:
            user_list.append({
                'id': u.id,
                'name': u.username,
                'email': u.email,
                'is_active': u.is_active,
                'last_login': getattr(u, 'last_login', None),
                'submodule_ids': u.selected_submodule_ids or []
            })
        return Response({'users': user_list})

    def post(self, request):
        """Create TenantUser with selected submodule IDs"""
        data = request.data
        try:
            username = data.get('name')
            password = data.get('password')
            email = data.get('email')
            submodule_ids = data.get('submodule_ids', [])  # Array of IDs like [1, 5, 8]
            
            from .models import TenantUser
            
            if TenantUser.objects.filter(username=username).exists():
                return Response({'error': 'Username already exists'}, status=400)
            
            if User.objects.filter(username=username).exists():
                 return Response({'error': 'Username already exists (as owner)'}, status=400)

            # Create TenantUser with selected submodule IDs
            user = TenantUser.objects.create_user(
                username=username,
                password=password,
                email=email,
                tenant_id=request.user.tenant_id,
                selected_submodule_ids=submodule_ids  # Store IDs directly
            )
            
            return Response({'success': True})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    def put(self, request):
        """Update TenantUser permissions"""
        user_id = request.data.get('userId')
        submodule_ids = request.data.get('submodule_ids', [])
        
        if not user_id:
            return Response({'error': 'userId is required'}, status=400)
        
        from .models import TenantUser
        
        try:
            # Ensure user belongs to same tenant
            user = TenantUser.objects.get(id=user_id, tenant_id=request.user.tenant_id)
            
            # Update selected submodule IDs
            user.selected_submodule_ids = submodule_ids
            user.save()
            
            return Response({'success': True})
        except TenantUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    def delete(self, request, user_id=None):
        """Delete TenantUser"""
        if not user_id:
            user_id = request.data.get('userId')
        
        if not user_id:
            return Response({'error': 'userId is required'}, status=400)
        
        from .models import TenantUser
        
        try:
            # Ensure user belongs to same tenant
            user = TenantUser.objects.get(id=user_id, tenant_id=request.user.tenant_id)
            user.delete()
            return Response({'success': True})
        except TenantUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


# REMOVED: Role-related views - no longer using roles table
# class SettingsRolesView(views.APIView):
#     permission_classes = [IsAuthenticated]
#     def get(self, request):
#         from .models import Role
#         ...
# class SeedModuleRolesView(views.APIView):
#     ...
# class ModuleRolesView(views.APIView):
#     ...
