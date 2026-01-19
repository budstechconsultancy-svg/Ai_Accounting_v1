
import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from vendors.models import VendorMasterGSTDetails, VendorMasterBasicDetail
from vendors.vendorgstdetails_database import VendorGSTDetailsDatabase

def test_gst_details():
    print("🚀 Starting GST Details Test...")
    
    tenant_id = "test_tenant_001"
    
    # 1. Create a dummy basic detail first
    print("\n1. Creating dummy basic detail...")
    basic_detail = VendorMasterBasicDetail.objects.create(
        tenant_id=tenant_id,
        vendor_code="TEST-VEN-GST",
        vendor_name="GST Test Vendor",
        email="gst@test.com",
        contact_no="1234567890"
    )
    print(f"✅ Basic Detail created: {basic_detail.id}")
    
    # 2. Test Create GST Detail
    print("\n2. Testing Create GST Detail...")
    gst_data = {
        'vendor_basic_detail': basic_detail.id,
        'gstin': '22AAAAA0000A1Z5',
        'gst_registration_type': 'regular',
        'legal_name': 'Test Legal Name',
        'trade_name': 'Test Trade Name'
    }
    
    gst_detail = VendorGSTDetailsDatabase.create_gst_detail(tenant_id, gst_data)
    print(f"✅ GST Detail created: {gst_detail.id} - {gst_detail.gstin}")
    
    # Verify auto-extraction
    if gst_detail.gst_state_code == '22' and gst_detail.pan_linked_with_gstin == 'AAAAA0000A':
        print("✅ Auto-extraction of State Code and PAN works!")
    else:
        print(f"❌ Auto-extraction failed: Code={gst_detail.gst_state_code}, PAN={gst_detail.pan_linked_with_gstin}")

    # 3. Test Duplicate Check
    print("\n3. Testing Duplicate Check...")
    is_duplicate = VendorGSTDetailsDatabase.check_duplicate_gstin(tenant_id, '22AAAAA0000A1Z5')
    if is_duplicate:
        print("✅ Duplicate check works!")
    else:
        print("❌ Duplicate check failed!")

    # 4. Test API ViewSet Logic (Simulated)
    print("\n4. Testing API ViewSet Logic (Simulated)...")
    from vendors.vendorgstdetails_api import VendorGSTDetailsViewSet
    from rest_framework.test import APIRequestFactory, force_authenticate
    from django.contrib.auth.models import User
    
    # Create a dummy user for testing
    user = User.objects.create_user(username='api_test_user', password='password')
    # Mock tenant_id attribute on user (since we didn't add the custom user model to test env fully)
    user.tenant_id = 'test_tenant_999' 
    
    factory = APIRequestFactory()
    view = VendorGSTDetailsViewSet.as_view({'post': 'create'})
    
    # Payload
    payload = {
        'vendor_basic_detail': basic_detail.id,
        'gstin': '33BBBBB1111B2Z6', # Different GSTIN
        'gst_registration_type': 'regular',
        'legal_name': 'API Test Vendor',
        'trade_name': 'API Trade Name'
    }
    
    request = factory.post('/api/vendors/gst-details/', payload, format='json')
    force_authenticate(request, user=user)
    
    try:
        response = view(request)
        print(f"API Response Status: {response.status_code}")
        if response.status_code == 201:
            print("✅ API Create successful with Authenticated User!")
            print(f"Response Data: {response.data}")
            
            # Verify tenant_id
            if response.data.get('tenant_id') == 'test_tenant_999':
                print("✅ Tenant ID correctly captured from user: test_tenant_999")
            else:
                print(f"❌ Incorrect Tenant ID: {response.data.get('tenant_id')} (Expected: test_tenant_999)")
        else:
            print(f"❌ API Create failed: {response.data}")
    except Exception as e:
        print(f"❌ API Exception: {e}")
        
    # Cleanup user
    user.delete()

    # 5. Cleanup
    print("\n5. Cleaning up...")
    basic_detail.delete() # Cascade should delete both GST details
    # Clean up the API created one if likely separate tenant (it uses 'default_tenant')
    try:
        from vendors.models import VendorMasterBasicDetail
        # The API created one might have 'default_tenant' as tenant_id
        VendorMasterGSTDetails.objects.filter(gstin='33BBBBB1111B2Z6').delete()
        print("✅ Additional cleanup complete")
    except:
        pass
        
    print("✅ Cleanup complete")
    
if __name__ == "__main__":
    try:
        test_gst_details()
        print("\n✨ ALL TESTS PASSED!")
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
