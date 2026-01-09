import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger, AmountTransaction
from django.contrib.auth import get_user_model

User = get_user_model()

print("🔍 Debugging bank5 Ledger\n")
print("=" * 80)

user = User.objects.first()
tenant_id = user.tenant_id

# Find bank5 ledger
ledger = MasterLedger.objects.filter(tenant_id=tenant_id, name='bank5').first()

if not ledger:
    print("❌ bank5 ledger not found!")
    print("\nℹ️  Available ledgers:")
    for l in MasterLedger.objects.filter(tenant_id=tenant_id).order_by('-created_at')[:5]:
        print(f"  - {l.name} (created: {l.created_at})")
    exit(1)

print(f"✅ Found ledger: {ledger.name}")
print(f"  Code: {ledger.code}")
print(f"  Category: {ledger.category}")
print(f"  Sub Group 2: {ledger.sub_group_2}")
print(f"  Additional Data: {ledger.additional_data}")

# Check if it's detected as Cash/Bank
from masters.flow import _is_cash_or_bank_ledger
is_cash_bank = _is_cash_or_bank_ledger(ledger)
print(f"  Is Cash/Bank: {is_cash_bank}")

# Check for opening balance
opening_balance = None
if ledger.additional_data and isinstance(ledger.additional_data, dict):
    opening_balance = ledger.additional_data.get('opening_balance')
print(f"  Opening Balance: {opening_balance}")

# Check if transaction exists
txn = AmountTransaction.objects.filter(tenant_id=tenant_id, ledger=ledger).first()
if txn:
    print(f"\n✅ Transaction exists:")
    print(f"  Name: {txn.name}")
    print(f"  Sub Group 2: {txn.sub_group_2}")
    print(f"  Code: {txn.code}")
    print(f"  Balance: {txn.balance}")
else:
    print(f"\n❌ No transaction found!")
    print("\n💡 Reasons:")
    if not is_cash_bank:
        print("  - Ledger not detected as Cash/Bank")
        print(f"    (sub_group_2='{ledger.sub_group_2}' doesn't contain 'cash' or 'bank')")
    if not opening_balance:
        print("  - No opening balance in additional_data")
