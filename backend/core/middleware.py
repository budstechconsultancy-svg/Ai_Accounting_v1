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
    """RBAC permissions disabled - all authenticated requests are allowed."""

    def process_view(self, request, view_func, view_args, view_kwargs):
        """
        RBAC system has been removed - allow all requests through.
        """
        # Always return None to allow all requests
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
        
