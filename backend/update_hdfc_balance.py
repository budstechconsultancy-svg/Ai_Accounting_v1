from accounting.models import MasterLedger
from core.models import User

# Get first user's tenant
user = User.objects.first()
if not user:
    print("No user found!")
    exit()

tenant_id = user.tenant_id
print(f"Using tenant_id: {tenant_id}")

# Update HDFC Bank ledger
ledger = MasterLedger.objects.filter(name__icontains='HDFC', tenant_id=tenant_id).first()

if ledger:
    print(f"Found ledger: {ledger.name}")
    ledger.additional_data = {
        'opening_balance': 250000.00,
        'current_balance': 250000.00
    }
    ledger.save()
    print(f"✅ Updated HDFC Bank balance to ₹2,50,000")
    print(f"Additional data: {ledger.additional_data}")
else:
    print("❌ HDFC Bank ledger not found!")
    print("Creating it now...")
    
    ledger = MasterLedger.objects.create(
        name='HDFC Bank',
        group='Bank Accounts',
        category='Asset',
        sub_group_1='Current Assets',
        sub_group_2='Bank Accounts',
        tenant_id=tenant_id,
        additional_data={
            'opening_balance': 250000.00,
            'current_balance': 250000.00,
            'account_number': '50100123456789',
            'ifsc': 'HDFC0001234',
            'branch': 'Main Branch'
        }
    )
    print(f"✅ Created HDFC Bank with balance ₹2,50,000")
