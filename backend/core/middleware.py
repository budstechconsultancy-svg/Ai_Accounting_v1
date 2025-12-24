from django.utils.deprecation import MiddlewareMixin
from core.authentication import CustomJWTAuthentication

class TenantMiddleware(MiddlewareMixin):
    """Attach request.tenant_id by checking header X-Tenant-ID first, then JWT claim 'tenant_id'."""

    def process_request(self, request):
        # header override (useful for postman/testing)
        header_tid = request.META.get('HTTP_X_TENANT_ID')
        if header_tid:
            request.tenant_id = header_tid
            return

        # try JWT
        try:
            auth = CustomJWTAuthentication()
            user_auth_tuple = auth.authenticate(request)
            if user_auth_tuple is not None:
                user = user_auth_tuple[0]
                validated_token = user_auth_tuple[1]
                tid = validated_token.get('tenant_id')
                request.tenant_id = tid
                return
        except Exception:
            pass

        request.tenant_id = None


class PermissionMiddleware(MiddlewareMixin):
    """Enforce RBAC permissions on API endpoints based on user's roles."""

    def process_view(self, request, view_func, view_args, view_kwargs):
        """
        Enforce RBAC permissions.
        - Owners (User model) have full access.
        - Staff (TenantUser model) have access only to submodule IDs in their selected_submodule_ids.
        """
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return None

        # 1. Check if user is Owner (User model)
        from .models import TenantUser
        # Owners are not instances of TenantUser
        is_owner = not isinstance(request.user, TenantUser)
        
        if is_owner:
            # Owners have full authority over their tenant
            return None

        # 2. User is Staff (TenantUser) - Check permissions
        # Get required permission from view class or function
        required_permission = None
        
        # Check CBV (ViewSet/APIView)
        view_class = getattr(view_func, 'cls', None)
        if view_class:
            required_permission = getattr(view_class, 'required_permission', None)
        
        # Check FBV or specific method override
        if not required_permission:
            required_permission = getattr(view_func, 'required_permission', None)

        if not required_permission:
            # If no permission is required, default to restricted (or allowed? 
            # In our case, let's default to allowed if not specified, 
            # but we will tag all important views)
            return None

        # 3. Verify access
        from .permission_constants import get_permission_by_code
        
        # If required_permission is a string (code), convert to ID
        if isinstance(required_permission, str):
            perm_data = get_permission_by_code(required_permission)
            if perm_data:
                perm_id = perm_data['id']
            else:
                # Code not found, deny for safety
                from django.http import JsonResponse
                return JsonResponse({'detail': f'Permission configuration error: {required_permission}'}, status=403)
        else:
            perm_id = required_permission

        # Check if perm_id is in user's selected list
        selected_ids = getattr(request.user, 'selected_submodule_ids', []) or []
        
        if perm_id not in selected_ids:
            from django.http import JsonResponse
            return JsonResponse({
                'detail': 'You do not have permission to access this module. Please contact your administrator.',
                'code': 'permission_denied',
                'required_permission_id': perm_id
            }, status=403)

        return None


class ActivityTrackingMiddleware(MiddlewareMixin):
    """Update user's last_activity timestamp on every request and log logins."""

    def process_request(self, request):
        # Check if user attribute exists (in case Auth middleware is missing)
        if not hasattr(request, 'user'):
            return

        try:
            if request.user.is_authenticated:
                from django.utils import timezone
                from django.contrib.auth import get_user_model
                from django.http import JsonResponse
                User = get_user_model()
                
                # Check if user is still active - force logout if deactivated
                # Use hasattr to safely check is_active attribute
                if hasattr(request.user, 'is_active') and not request.user.is_active:
                    # User has been deactivated - force logout
                    response = JsonResponse({
                        'detail': 'Your account has been deactivated. Please contact the administrator.',
                        'code': 'account_deactivated'
                    }, status=401)
                    # Clear cookies to force logout
                    response.delete_cookie('access_token')
                    response.delete_cookie('refresh_token')
                    return response
                
                # Using queryset update to avoid overhead
                # We catch exceptions to prevent blocking the main request
                User.objects.filter(pk=request.user.pk).update(last_activity=timezone.now())
        except Exception:
            # Silent fail for background tracking
            pass
    
