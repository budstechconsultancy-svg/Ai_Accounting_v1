from django.utils.deprecation import MiddlewareMixin
from core.auth import CustomJWTAuthentication
from core.tenant import get_tenant_from_request

class TenantMiddleware(MiddlewareMixin):
    """Attach request.tenant_id by checking header X-Tenant-ID first, then JWT claim 'tenant_id'."""

    def process_request(self, request):
        # Use centralized tenant resolution logic
        tenant_id = get_tenant_from_request(request)
        request.tenant_id = tenant_id


class PermissionMiddleware(MiddlewareMixin):
    """Enforce RBAC permissions on API endpoints based on user's roles."""

    def process_view(self, request, view_func, view_args, view_kwargs):
        """
        Enforce RBAC permissions.
        - Owners (User model) have full access.
        - Staff (TenantUser model) have access only to submodule IDs in their selected_submodule_ids.
        """
        try:
            if not hasattr(request, 'user') or not request.user.is_authenticated:
                return None

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
                # If no permission is required, allow access
                return None

            # Use centralized RBAC check
            from core.rbac import check_permission
            has_perm, error_response = check_permission(request.user, required_permission)
            
            if not has_perm:
                return error_response

            return None
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger('core.middleware')
            logger.error(f"PermissionMiddleware error: {str(e)}", exc_info=True)
            # Don't block the request - let it proceed
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
                
                User.objects.filter(pk=request.user.pk).update(last_activity=timezone.now())
        except Exception:
            # Silent fail for background tracking
            pass

class ExceptionLoggingMiddleware:
    """
    Log unhandled exceptions to a file for debugging.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        import traceback
        import os
        from django.conf import settings
        
        log_path = os.path.join(settings.BASE_DIR, 'traceback.log')
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write(f"\\n--- Exception at {str(os.environ.get('DJANGO_SETTINGS_MODULE'))} ---\\n")
            f.write(f"Path: {request.path}\\n")
            f.write(f"User: {request.user}\\n")
            traceback.print_exc(file=f)
        
        return None # Let Django handle the 500 response
    
