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
        

class DetailedActivityLogMiddleware(MiddlewareMixin):
    """
    Logs every request for audit purposes.
    Filters out static files and health checks.
    """
    def process_response(self, request, response):
        try:
            # Skip if user is not authenticated
            if not hasattr(request, 'user') or not request.user.is_authenticated:
                return response

            # Filter out noisy paths
            path = request.path
            method = request.method
            
            # Skip static files, media, and common noise
            if path.startswith('/static/') or path.startswith('/media/') or path == '/favicon.ico':
                return response

            # Determine action name based on method and path
            # Simple heuristic
            action = f"{method} {path}"
            
            # Identify specific high-value actions
            if 'login' in path and method == 'POST':
                action = "LOGIN ATTEMPT"
            elif 'logout' in path: # logout is often POST/GET
                action = "LOGOUT"
            elif method == 'POST':
                action = f"CREATE {path}"
            elif method == 'PUT' or method == 'PATCH':
                action = f"UPDATE {path}"
            elif method == 'DELETE':
                action = f"DELETE {path}"
            elif method == 'GET':
                 # User wants "every single activity", meaning views too
                 # But we might want to skip "check-status" or keep it if they really want EVERYTHING
                 action = f"VIEW {path}"

            from core.models import UserActivityLog
            
            # Get IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')

            # Get Tenant ID
            tenant_id = getattr(request, 'tenant_id', None)
            if not tenant_id and hasattr(request.user, 'tenant_id'):
                tenant_id = request.user.tenant_id

            # Capture details safely
            details = ""
            if method in ['POST', 'PUT', 'PATCH'] and response.status_code < 400:
                 # Only log body for successful write ops? Or all?
                 # Avoid logging passwords in 'login' or 'register'
                 if 'login' not in path and 'register' not in path and 'password' not in path:
                     # Try to capture body? It's often consumed. 
                     # Middleware accessing request.body might be risky if stream consumed.
                     # Safest is to just log status code or query params
                     pass
            
            # Append query params to details if GET
            if method == 'GET' and request.GET:
                details = f"Query: {request.GET.dict()}"

            UserActivityLog.objects.create(
                user=request.user,
                username=request.user.username,
                action=action,
                method=method,
                path=path,
                ip_address=ip,
                details=f"Status: {response.status_code}. {details}".strip(),
                tenant_id=tenant_id
            )

        except Exception as e:
            # Logging should not break the app
            print(f"Error logging activity: {e}")
            pass

        return response

