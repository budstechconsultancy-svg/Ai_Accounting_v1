
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from masters.voucher_master_api import MasterVoucherSalesViewSet
from accounting.models import MasterVoucherSales
from core.models import User

def verify_api():
    # Setup data
    try:
        voucher = MasterVoucherSales.objects.create(
            tenant_id='test-auth-tenant',
            voucher_name='API Test Voucher',
            update_customer_master=True
        )
        
        # Create request
        factory = APIRequestFactory()
        request = factory.get('/api/masters/master-voucher-sales/')
        
        # Mock user
        try:
            user = User.objects.get(username='test_api_user')
        except User.DoesNotExist:
            user = User.objects.create(username='test_api_user', tenant_id='test-auth-tenant')
            
        request.user = user
        
        # Instantiate view
        view = MasterVoucherSalesViewSet.as_view({'get': 'list'})
        response = view(request)
        
        response.render()
        import json
        data = json.loads(response.content)
        
        # Filter for our test voucher
        my_voucher = next((v for v in data if v['voucher_name'] == 'API Test Voucher'), None)
        
        if my_voucher:
            if 'update_customer_master' in my_voucher:
                print("✅ 'update_customer_master' found in API response.")
                print(f"Value: {my_voucher['update_customer_master']}")
            else:
                print("❌ 'update_customer_master' NOT found in API response.")
                print(f"Keys found: {my_voucher.keys()}")
        else:
            print("Could not find test voucher in response.")
            
        voucher.delete()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    verify_api()
