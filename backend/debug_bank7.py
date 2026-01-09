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

print("🔍 Debugging bank7 Ledger\n")
print("=" * 80)

user = User.objects.first()
tenant_id = user.tenant_id

# Find bank7
ledger = MasterLedger.objects.filter(tenant_id=tenant_id, name='bank7').first()

if not ledger:
    print("❌ bank7 not found!")
    print("\nRecent ledgers:")
    for l in MasterLedger.objects.filter(tenant_id=tenant_id).order_by('-created_at')[:5]:
        print(f"  - {l.name} (created: {l.created_at})")
    exit(1)

print(f"✅ Found: {ledger.name}")
print(f"  Code: {ledger.code}")
print(f"  Category: {ledger.category}")
print(f"  Sub Group 2: {ledger.sub_group_2}")
print(f"  Additional Data: {ledger.additional_data}")

# Check if Cash/Bank
from masters.flow import _is_cash_or_bank_ledger
is_cb = _is_cash_or_bank_ledger(ledger)
print(f"  Is Cash/Bank: {is_cb}")

# Check opening balance
ob = None
if ledger.additional_data and isinstance(ledger.additional_data, dict):
    ob = ledger.additional_data.get('opening_balance')
    print(f"  Opening Balance: {ob}")
else:
    print(f"  ⚠️  No additional_data or not a dict!")

# Check transaction
txn = AmountTransaction.objects.filter(tenant_id=tenant_id, ledger=ledger).first()

if txn:
    print(f"\n✅ Transaction EXISTS:")
    print(f"  Name: {txn.name}")
    print(f"  Sub Group 2: {txn.sub_group_2}")
    print(f"  Code: {txn.code}")
    print(f"  Balance: {txn.balance}")
else:
    print(f"\n❌ NO TRANSACTION!")
    print("\n🔍 Diagnosis:")
    if not is_cb:
        print(f"  ❌ Not detected as Cash/Bank (sub_group_2='{ledger.sub_group_2}')")
    else:
        print(f"  ✅ Detected as Cash/Bank")
    
    if not ob:
        print(f"  ❌ No opening balance in additional_data")
    else:
        print(f"  ✅ Has opening balance: {ob}")
    
    # Try to create manually
    if is_cb and ob:
        print(f"\n📝 Creating transaction manually...")
        try:
            txn = AmountTransaction.objects.create(
                tenant_id=tenant_id,
                ledger=ledger,
                name=ledger.name,
                sub_group_2=ledger.sub_group_2,
                code=ledger.code,
                transaction_date=date.today(),
                transaction_type='opening_balance',
                debit=float(ob) if float(ob) >= 0 else 0,
                credit=abs(float(ob)) if float(ob) < 0 else 0,
                balance=float(ob),
                narration='Opening Balance'
            )
            print(f"✅ Transaction created! ID: {txn.id}")
        except Exception as e:
            print(f"❌ Error: {e}")
