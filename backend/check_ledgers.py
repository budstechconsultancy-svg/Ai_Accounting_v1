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

print("🔍 Checking All Cash/Bank Ledgers\n")
print("=" * 80)

user = User.objects.first()
tenant_id = user.tenant_id

print(f"Tenant: {tenant_id}\n")

# Find all ledgers
ledgers = MasterLedger.objects.filter(tenant_id=tenant_id).order_by('-created_at')

print(f"Total ledgers: {ledgers.count()}\n")
print("Recent ledgers:")
for l in ledgers[:10]:
    print(f"  - {l.name} (Code: {l.code}, Sub Group 2: {l.sub_group_2})")
    print(f"    Category: {l.category}, Created: {l.created_at}")
    
    # Check if Cash/Bank
    from masters.flow import _is_cash_or_bank_ledger
    is_cb = _is_cash_or_bank_ledger(l)
    print(f"    Is Cash/Bank: {is_cb}")
    
    # Check for transaction
    txn_count = AmountTransaction.objects.filter(tenant_id=tenant_id, ledger=l).count()
    print(f"    Transactions: {txn_count}")
    
    # Check opening balance
    if l.additional_data:
        ob = l.additional_data.get('opening_balance')
        print(f"    Opening Balance: {ob}")
    print()

print("\n" + "=" * 80)
print("\n💡 To create transaction for a ledger manually:")
print("  1. Note the ledger name from above")
print("  2. Run: python create_manual_transaction.py <ledger_name>")
