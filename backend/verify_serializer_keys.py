
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from masters.voucher_master_serializers import MasterVoucherSalesSerializer

def verify_serializer():
    serializer = MasterVoucherSalesSerializer()
    fields = list(serializer.fields.keys())
    
    if 'update_customer_master' in fields:
        print("✅ 'update_customer_master' is present in Serializer fields.")
    else:
        print("❌ 'update_customer_master' is MISSING from Serializer fields.")
        print(f"Available fields: {fields}")

if __name__ == '__main__':
    verify_serializer()
