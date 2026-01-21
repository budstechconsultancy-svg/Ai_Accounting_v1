import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import Voucher
from django.contrib.auth import get_user_model

User = get_user_model()

try:
    user = User.objects.get(email='demo@example.com')
    tid = user.tenant_id or str(user.id)
    
    print(f'Tenant ID: {tid}')
    print(f'Sales Vouchers: {Voucher.objects.filter(tenant_id=tid, type="sales").count()}')
    print(f'Purchase Vouchers: {Voucher.objects.filter(tenant_id=tid, type="purchase").count()}')
    print(f'Payment Vouchers: {Voucher.objects.filter(tenant_id=tid, type="payment").count()}')
    print(f'Receipt Vouchers: {Voucher.objects.filter(tenant_id=tid, type="receipt").count()}')
    print(f'\nTotal Vouchers: {Voucher.objects.filter(tenant_id=tid).count()}')
    
    # Show sample data
    print('\n--- Sample Sales Vouchers ---')
    for v in Voucher.objects.filter(tenant_id=tid, type="sales")[:3]:
        print(f'{v.voucher_number}: {v.party} - ₹{v.amount}')
        
except User.DoesNotExist:
    print('Demo user not found!')
except Exception as e:
    print(f'Error: {e}')
