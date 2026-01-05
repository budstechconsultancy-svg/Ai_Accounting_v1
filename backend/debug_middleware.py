
import os
import django
import sys
import traceback

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from core.middleware import TenantMiddleware
from core.auth import CustomJWTAuthentication
from core.models import TenantUser

def debug_middleware():
    print("Debug: Starting Middleware Verification...")
    factory = RequestFactory()
    
    # 1. Test with Owner User
    print("\n--- Testing Owner User ---")
    owner = get_user_model().objects.first()
    if owner:
        print(f"Using Owner: {owner.username} (Tenant: {owner.tenant_id})")
        request = factory.get('/api/masters/ledgers/')
        request.user = owner # simulate auth
        
        try:
            print("Running TenantMiddleware...")
            mw = TenantMiddleware(lambda r: None)
            mw.process_request(request)
            print(f"✅ TenantMiddleware Success. Tenant ID: {getattr(request, 'tenant_id', 'NOT SET')}")
        except Exception:
            print("❌ TenantMiddleware Failed:")
            traceback.print_exc()
    else:
        print("Skipping Owner test (no user found)")

    # 2. Test with TenantUser (if exists)
    print("\n--- Testing TenantUser ---")
    tenant_user = TenantUser.objects.first()
    if tenant_user:
        print(f"Using TenantUser: {tenant_user.username} (Tenant: {tenant_user.tenant_id})")
        request = factory.get('/api/masters/ledgers/')
        request.user = tenant_user # simulate auth
        
        try:
            print("Running TenantMiddleware...")
            mw = TenantMiddleware(lambda r: None)
            mw.process_request(request)
            print(f"✅ TenantMiddleware Success. Tenant ID: {getattr(request, 'tenant_id', 'NOT SET')}")
        except Exception:
            print("❌ TenantMiddleware Failed:")
            traceback.print_exc()
    else:
        print("Skipping TenantUser test (no user found)")
        
    # 3. Test Authentication (Mock Token)
    # This is harder to test without a valid signed token, but we can verify imports
    # 4. Test RBAC & PermissionMiddleware
    print("\n--- Testing PermissionMiddleware & RBAC ---")
    from core.rbac import check_permission
    from core.middleware import PermissionMiddleware
    
    # Mock view function with required_permission
    def mock_view(request):
        return "View Called"
    mock_view.required_permission = 'MASTERS_LEDGERS'
    
    if owner:
        print(f"Testing RBAC for Owner on 'MASTERS_LEDGERS'...")
        try:
            has_perm, error = check_permission(owner, 'MASTERS_LEDGERS')
            print(f"✅ check_permission (Owner): {has_perm}, Error: {error}")
            
            # Middleware test
            print("Testing PermissionMiddleware (Owner)...")
            pmw = PermissionMiddleware(lambda r: None)
            # Simulate attached tenant
            request = factory.get('/api/masters/ledgers/')
            request.user = owner
            request.tenant_id = owner.tenant_id
            
            error_response = pmw.process_view(request, mock_view, [], {})
            if error_response:
                 print(f"❌ PermissionMiddleware returned error: {error_response}")
            else:
                 print("✅ PermissionMiddleware allowed request.")
                 
        except Exception:
            print("❌ RBAC/PermissionMiddleware Failed (Owner):")
            traceback.print_exc()

    if tenant_user:
        print(f"Testing RBAC for TenantUser on 'MASTERS_LEDGERS'...")
        try:
            has_perm, error = check_permission(tenant_user, 'MASTERS_LEDGERS')
            print(f"✅ check_permission (TenantUser): {has_perm}, Error: {error}")
            
            # Middleware test
            print("Testing PermissionMiddleware (TenantUser)...")
            pmw = PermissionMiddleware(lambda r: None)
            # Simulate attached tenant
            request = factory.get('/api/masters/ledgers/')
            request.user = tenant_user
            request.tenant_id = tenant_user.tenant_id
            
            error_response = pmw.process_view(request, mock_view, [], {})
            if error_response:
                 print(f"ℹ️ PermissionMiddleware result: {error_response.content if hasattr(error_response, 'content') else error_response}")
            else:
                 print("✅ PermissionMiddleware allowed request.")
        except Exception:
             print("❌ RBAC/PermissionMiddleware Failed (TenantUser):")
             traceback.print_exc()

    print("\n--- Testing Auth Module Imports ---")
    try:
        from core.auth import CustomJWTAuthentication
        print("✅ core.auth imported successfully")
    except Exception:
        print("❌ core.auth import failed:")
        traceback.print_exc()

if __name__ == '__main__':
    debug_middleware()
