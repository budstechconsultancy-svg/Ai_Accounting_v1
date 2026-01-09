import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger, AmountTransaction
from django.contrib.auth import get_user_model

User = get_user_model()

print("🔍 Checking All Bank Ledgers and Transactions\n")
print("=" * 80)

user = User.objects.first()
tenant_id = user.tenant_id

# Find all bank ledgers
ledgers = MasterLedger.objects.filter(
    tenant_id=tenant_id,
    name__startswith='bank'
).order_by('name')

print(f"Found {ledgers.count()} bank ledgers:\n")

for ledger in ledgers:
    print(f"📋 {ledger.name}")
    print(f"  Code: {ledger.code}")
    print(f"  Sub Group 2: {ledger.sub_group_2}")
    
    # Check transactions
    txns = AmountTransaction.objects.filter(
        tenant_id=tenant_id,
        ledger=ledger
    )
    
    if txns.exists():
        print(f"  ✅ Transactions: {txns.count()}")
        for txn in txns:
            print(f"    - Name: {txn.name}, Sub Group 2: {txn.sub_group_2}, Code: {txn.code}")
            print(f"      Balance: {txn.balance}, Date: {txn.transaction_date}")
    else:
        print(f"  ❌ No transactions")
    print()

print("=" * 80)
print(f"\n📊 Summary:")
print(f"  Total bank ledgers: {ledgers.count()}")
total_txns = AmountTransaction.objects.filter(tenant_id=tenant_id).count()
print(f"  Total transactions: {total_txns}")
