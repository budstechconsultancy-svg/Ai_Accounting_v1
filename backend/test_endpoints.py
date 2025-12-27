"""
Test script to check API endpoints with proper authentication
"""
import django
import os
import sys

# Setup Django
sys.path.insert(0, 'c:/108/AI-accounting-finalist-dev/AI-accounting-finalist-dev/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import RequestFactory
from accounting.views import MasterLedgerViewSet
from inventory.views import InventoryStockItemViewSet
from core.views import CompanySettingsViewSet
from core.models import User

# Create a test request
factory = RequestFactory()

# Get a user
try:
    user = User.objects.first()
    print(f"✅ Found user: {user.username}, tenant_id: {user.tenant_id}")
    
    # Test MasterLedgerViewSet
    print("\n" + "="*60)
    print("Testing MasterLedgerViewSet")
    print("="*60)
    try:
        request = factory.get('/api/masters/ledgers/')
        request.user = user
        view = MasterLedgerViewSet.as_view({'get': 'list'})
        response = view(request)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"✅ Success! Data: {response.data}")
        else:
            print(f"❌ Error: {response.data}")
    except Exception as e:
        print(f"❌ Exception: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # Test InventoryStockItemViewSet
    print("\n" + "="*60)
    print("Testing InventoryStockItemViewSet")
    print("="*60)
    try:
        request = factory.get('/api/inventory/stock-items/')
        request.user = user
        view = InventoryStockItemViewSet.as_view({'get': 'list'})
        response = view(request)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"✅ Success! Data: {response.data}")
        else:
            print(f"❌ Error: {response.data}")
    except Exception as e:
        print(f"❌ Exception: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # Test CompanySettingsViewSet
    print("\n" + "="*60)
    print("Testing CompanySettingsViewSet")
    print("="*60)
    try:
        request = factory.get('/api/company-settings/')
        request.user = user
        view = CompanySettingsViewSet.as_view({'get': 'list'})
        response = view(request)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"✅ Success! Data: {response.data}")
        else:
            print(f"❌ Error: {response.data}")
    except Exception as e:
        print(f"❌ Exception: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        
except Exception as e:
    print(f"❌ Failed to get user: {e}")
    import traceback
    traceback.print_exc()
