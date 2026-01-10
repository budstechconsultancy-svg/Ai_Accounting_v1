"""
Fix: Create transaction for the 'lplplp' ledger
"""
import os
import sys
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger, AmountTransaction

print("=" * 80)
print("Finding and fixing ledger 'lplplp'")
print("=" * 80)

# Find the ledger
ledger = MasterLedger.objects.filter(name__icontains='lplplp').first()

if not ledger:
    print("ERROR: Ledger 'lplplp' not found!")
    sys.exit(1)

print("Found Ledger:")
print("  ID: {}".format(ledger.id))
print("  Name: {}".format(ledger.name))
print("  Category: {}".format(ledger.category))
print("  Sub Group 2: {}".format(ledger.sub_group_2))
print("  Tenant ID: {}".format(ledger.tenant_id))

# Check if transaction exists
existing_txn = AmountTransaction.objects.filter(ledger=ledger).first()

if existing_txn:
    print("\nTransaction already exists:")
    print("  ID: {}".format(existing_txn.id))
    print("  Ledger Name: {}".format(existing_txn.ledger_name))
    print("\nNo action needed!")
else:
    print("\nNo transaction found. Creating one...")
    
    # Get opening balance from additional_data
    opening_balance = 0
    if ledger.additional_data and isinstance(ledger.additional_data, dict):
        opening_balance = ledger.additional_data.get('opening_balance', 0)
    
    opening_balance_value = float(opening_balance) if opening_balance else 0
    
    # Create transaction
    txn = AmountTransaction.objects.create(
        tenant_id=ledger.tenant_id,
        ledger=ledger,
        ledger_name=ledger.name,
        sub_group_1=ledger.sub_group_1,
        code=ledger.code,
        transaction_date=ledger.created_at.date() if ledger.created_at else date.today(),
        transaction_type='opening_balance',
        debit=opening_balance_value if opening_balance_value >= 0 else 0,
        credit=abs(opening_balance_value) if opening_balance_value < 0 else 0,
        balance=opening_balance_value,
        narration='Opening Balance'
    )
    
    print("\nSUCCESS! Transaction created:")
    print("  ID: {}".format(txn.id))
    print("  Ledger Name: {}".format(txn.ledger_name))
    print("  Sub Group 1: {}".format(txn.sub_group_1))
    print("  Code: {}".format(txn.code))
    print("  Balance: {}".format(txn.balance))

print("\n" + "=" * 80)
print("VERIFICATION")
print("=" * 80)
final_count = AmountTransaction.objects.filter(ledger=ledger).count()
print("Transactions for ledger '{}': {}".format(ledger.name, final_count))
