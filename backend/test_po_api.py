"""
Quick test to verify PO Settings API endpoint is working.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import RequestFactory
from vendors.posettings_api import VendorMasterPOSettingsViewSet
from django.contrib.auth.models import AnonymousUser
from rest_framework.test import force_authenticate

# Create a mock user
class MockUser:
    def __init__(self):
        self.id = 'test_tenant_001'
        self.tenant_id = 'test_tenant_001'
        self.username = 'test_user'
        self.is_authenticated = True

def test_create_po_setting():
    """Test creating a PO setting via API"""
    print("Testing PO Settings API...")
    print("=" * 60)
    
    factory = RequestFactory()
    
    # Create POST request
    data = {
        'name': 'API Test PO',
        'prefix': 'PO/',
        'suffix': '/26',
        'digits': 4,
        'auto_year': False
    }
    
    request = factory.post('/api/vendors/po-settings/', data, content_type='application/json')
    request.user = MockUser()
    
    # Create viewset and call create
    viewset = VendorMasterPOSettingsViewSet.as_view({'post': 'create'})
    
    try:
        response = viewset(request)
        print(f"Status Code: {response.status_code}")
        print(f"Response Data: {response.data}")
        
        if response.status_code == 201:
            print("\n✅ PO Setting created successfully!")
            print(f"   ID: {response.data.get('id')}")
            print(f"   Name: {response.data.get('name')}")
            print(f"   Preview: {response.data.get('preview_po_number')}")
            
            # Clean up
            from vendors.models import VendorMasterPOSettings
            VendorMasterPOSettings.objects.filter(id=response.data.get('id')).delete()
            print("\n✅ Test record cleaned up")
        else:
            print(f"\n❌ Failed to create PO Setting")
            print(f"   Error: {response.data}")
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        import traceback
        traceback.print_exc()

def test_list_po_settings():
    """Test listing PO settings"""
    print("\n" + "=" * 60)
    print("Testing List PO Settings...")
    print("=" * 60)
    
    factory = RequestFactory()
    request = factory.get('/api/vendors/po-settings/')
    request.user = MockUser()
    
    viewset = VendorMasterPOSettingsViewSet.as_view({'get': 'list'})
    
    try:
        response = viewset(request)
        print(f"Status Code: {response.status_code}")
        print(f"Number of records: {len(response.data) if isinstance(response.data, list) else 'N/A'}")
        
        if response.status_code == 200:
            print("✅ List endpoint working")
        else:
            print(f"❌ List failed: {response.data}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_create_po_setting()
    test_list_po_settings()
    print("\n" + "=" * 60)
    print("API Test Completed")
    print("=" * 60)
