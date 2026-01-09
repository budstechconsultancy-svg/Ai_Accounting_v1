import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger, AmountTransaction
from django.contrib.auth import get_user_model
from datetime import date

User = get_user_model()

print("🔧 Manual Transaction Creation for Testing\n")
print("=" * 80)

user = User.objects.first()
tenant_id = user.tenant_id

# Find bank2 or bank3
ledger = MasterLedger.objects.filter(
    tenant_id=tenant_id,
    name__in=['bank2', 'bank3']
).first()

if not ledger:
    print("❌ No bank2 or bank3 found")
    print("\nAvailable ledgers:")
    for l in MasterLedger.objects.filter(tenant_id=tenant_id)[:5]:
        print(f"  - {l.name}")
    exit(1)

print(f"✅ Using ledger: {ledger.name}")
print(f"  Code: {ledger.code}")
print(f"  Sub Group 2: {ledger.sub_group_2}")

# Check if transaction exists
existing = AmountTransaction.objects.filter(
    tenant_id=tenant_id,
    ledger=ledger
).first()

if existing:
    print(f"\n✅ Transaction already exists!")
    print(f"  Name: {existing.name}")
    print(f"  Sub Group 2: {existing.sub_group_2}")
    print(f"  Code: {existing.code}")
    print(f"  Balance: {existing.balance}")
else:
    # Create transaction
    print(f"\n📝 Creating transaction...")
    
    opening_balance = 5000  # Test value
    
    txn = AmountTransaction.objects.create(
        tenant_id=tenant_id,
        ledger=ledger,
        name=ledger.name,
        sub_group_2=ledger.sub_group_2,
        code=ledger.code,
        transaction_date=date.today(),
        transaction_type='opening_balance',
        debit=opening_balance,
        credit=0,
        balance=opening_balance,
        narration='Opening Balance (Manual Test)'
    )
    
    print(f"✅ Transaction created!")
    print(f"  ID: {txn.id}")
    print(f"  Name: {txn.name}")
    print(f"  Sub Group 2: {txn.sub_group_2}")
    print(f"  Code: {txn.code}")
    print(f"  Balance: {txn.balance}")

print("\n" + "=" * 80)
print("\n💡 Check the amount_transactions table in your database!")
print("   The transaction should now be visible.")
