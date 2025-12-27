import os
import django
import sys
from datetime import timedelta

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import TenantUser, Tenant
from accounting.models import MasterLedgerGroup
from core.permission_constants import get_permission_by_code
from rest_framework.test import APIRequestFactory, force_authenticate
from accounting.views import MasterLedgerGroupViewSet, MasterLedgerViewSet

User = get_user_model()

def verify_system():
    print("🚀 Starting Security Verification...")

    # 1. Setup Test Data
    tenant_id = "test-tenant-123"
    
    # Try to clean up first
    User.objects.filter(username="test_owner").delete()
    TenantUser.objects.filter(username="test_staff").delete()
    MasterLedgerGroup.objects.filter(tenant_id=tenant_id).delete()
    Tenant.objects.filter(id=tenant_id).delete()

    Tenant.objects.create(id=tenant_id, name="Test Tenant")

    owner = User.objects.create_user(
        username="test_owner", 
        password="password123", 
        tenant_id=tenant_id,
        company_name="Test Company",
        selected_plan="Pro"
    )
    
    # Staff with only MASTERS_LEDGER_GROUPS (ID 3)
    staff = TenantUser.objects.create_user(
        username="test_staff", 
        password="password123", 
        tenant_id=tenant_id,
        selected_submodule_ids=[3] # ID for MASTERS_LEDGER_GROUPS
    )

    factory = APIRequestFactory()

    # -------------------------------------------------------------------------
    # Test 1: Owner Access (Should have FULL authority)
    # -------------------------------------------------------------------------
    print("\nTest 1: Owner accessing restricted module...")
    view = MasterLedgerViewSet.as_view({'get': 'list'})
    request = factory.get('/api/masters/ledgers/')
    force_authenticate(request, user=owner)
    
    # Middleware check (simulating process_view)
    from core.middleware import PermissionMiddleware
    mw = PermissionMiddleware(lambda req: None)
    response = mw.process_view(request, view, [], {})
    
    if response is None:
        print("✅ Success: Owner granted access to restricted module.")
    else:
        print(f"❌ Failure: Owner denied access. Response: {response}")

    # -------------------------------------------------------------------------
    # Test 2: Staff Authorized Access
    # -------------------------------------------------------------------------
    print("\nTest 2: Staff accessing authorized module (Ledger Groups)...")
    view = MasterLedgerGroupViewSet.as_view({'get': 'list'})
    request = factory.get('/api/masters/ledger-groups/')
    force_authenticate(request, user=staff)
    
    response = mw.process_view(request, view, [], {})
    if response is None:
        print("✅ Success: Staff granted access to authorized module.")
    else:
        print(f"❌ Failure: Staff denied access. Response: {response}")

    # -------------------------------------------------------------------------
    # Test 3: Staff Unauthorized Access
    # -------------------------------------------------------------------------
    print("\nTest 3: Staff accessing unauthorized module (Ledgers)...")
    view = MasterLedgerViewSet.as_view({'get': 'list'})
    request = factory.get('/api/masters/ledgers/')
    force_authenticate(request, user=staff)
    
    response = mw.process_view(request, view, [], {})
    if response and response.status_code == 403:
        print("✅ Success: Staff correctly denied access to unauthorized module.")
    else:
        print(f"❌ Failure: Staff NOT denied access. Response: {response}")

    # -------------------------------------------------------------------------
    # Test 4: Automated Tenant Scoping
    # -------------------------------------------------------------------------
    print("\nTest 4: Automated Tenant Scoping on creation...")
    from accounting.serializers import MasterLedgerGroupSerializer
    
    data = {'name': 'Auto Scoped Group'}
    request = factory.post('/api/masters/ledger-groups/', data)
    # Manually attach user and auth to request to simulate DRF request
    request.user = staff
    request.successful_authenticator = None 
    
    print(f"Debug: Request user is {request.user}. tenant_id={getattr(request.user, 'tenant_id', 'MISSING')}")
    
    serializer = MasterLedgerGroupSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        print(f"Debug: Serializer is valid. validated_data={serializer.validated_data}")
        obj = serializer.save()
        print(f"Debug: Object saved. id={obj.id}, name={obj.name}, tenant_id='{obj.tenant_id}'")
        if obj.tenant_id == tenant_id:
            print(f"✅ Success: Object automatically scoped to tenant {obj.tenant_id}")
        else:
            print(f"❌ Failure: Object tenant_id ({obj.tenant_id}) does not match user tenant_id ({tenant_id})")
    else:
        print(f"❌ Failure: Serializer invalid: {serializer.errors}")

    print("\n🎉 Verification Complete!")

if __name__ == "__main__":
    verify_system()
