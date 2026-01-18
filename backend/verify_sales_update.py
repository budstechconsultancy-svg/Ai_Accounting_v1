
import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterVoucherSales
from rest_framework.test import APIRequestFactory
from masters.voucher_master_api import MasterVoucherSalesViewSet

def verify_sales_field():
    print("Checking MasterVoucherSales model fields...")
    fields = [f.name for f in MasterVoucherSales._meta.get_fields()]
    if 'update_customer_master' in fields:
        print("✅ 'update_customer_master' field exists in model.")
    else:
        print("❌ 'update_customer_master' field MISSING in model.")

    # Create a test entry
    print("\nCreating test voucher...")
    obj = MasterVoucherSales.objects.create(
        tenant_id='test-tenant',
        voucher_name='Test Update Field',
        prefix='TEST-',
        update_customer_master=True
    )
    
    # Reload from DB
    obj.refresh_from_db()
    print(f"Saved object 'update_customer_master' value: {obj.update_customer_master}")
    
    if obj.update_customer_master:
        print("✅ Field saved correctly to DB.")
    else:
        print("❌ Field NOT saved correctly.")
        
    obj.delete()

if __name__ == '__main__':
    verify_sales_field()
