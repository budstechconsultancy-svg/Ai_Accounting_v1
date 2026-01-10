"""
Test creating a new amount transaction to verify it saves to database
"""
import os
import sys
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger, AmountTransaction
from django.db import connection

print("=" * 80)
print("DATABASE CONNECTION TEST")
print("=" * 80)
print("Database: {}".format(connection.settings_dict['NAME']))
print("Host: {}".format(connection.settings_dict.get('HOST', 'localhost')))

print("\n" + "=" * 80)
print("BEFORE: Current state")
print("=" * 80)
count_before = AmountTransaction.objects.count()
print("Total transactions: {}".format(count_before))

# Get a Cash/Bank ledger
ledger = MasterLedger.objects.filter(
    category='Asset',
    sub_group_2__icontains='bank'
).first()

if not ledger:
    ledger = MasterLedger.objects.filter(
        category='Asset',
        sub_group_2__icontains='cash'
    ).first()

if not ledger:
    print("ERROR: No Cash/Bank ledgers found!")
    sys.exit(1)

print("\nSelected Ledger:")
print("  ID: {}".format(ledger.id))
print("  Name: {}".format(ledger.name))
print("  Tenant: {}".format(ledger.tenant_id))

print("\n" + "=" * 80)
print("CREATING NEW TRANSACTION")
print("=" * 80)

try:
    txn = AmountTransaction.objects.create(
        tenant_id=ledger.tenant_id,
        ledger=ledger,
        ledger_name=ledger.name,
        sub_group_1=ledger.sub_group_1,
        code=ledger.code,
        transaction_date=date.today(),
        transaction_type='transaction',
        debit=500.00,
        credit=0.00,
        balance=500.00,
        narration='TEST: Verifying database save'
    )
    
    print("Transaction created in memory:")
    print("  ID: {}".format(txn.id))
    print("  Ledger Name: {}".format(txn.ledger_name))
    print("  Balance: {}".format(txn.balance))
    
    # Force refresh from database
    txn.refresh_from_db()
    print("\nAfter refresh_from_db():")
    print("  ID: {}".format(txn.id))
    print("  Ledger Name: {}".format(txn.ledger_name))
    
    # Query directly from database
    verify = AmountTransaction.objects.get(id=txn.id)
    print("\nDirect query from database:")
    print("  ID: {}".format(verify.id))
    print("  Ledger Name: {}".format(verify.ledger_name))
    print("  Sub Group 1: {}".format(verify.sub_group_1))
    print("  Code: {}".format(verify.code))
    
    print("\n" + "=" * 80)
    print("AFTER: Current state")
    print("=" * 80)
    count_after = AmountTransaction.objects.count()
    print("Total transactions: {} (+{})".format(count_after, count_after - count_before))
    
    if count_after > count_before:
        print("\nSUCCESS! Transaction was saved to database!")
    else:
        print("\nERROR! Transaction count did not increase!")
    
except Exception as e:
    print("\nERROR: {}".format(str(e)))
    import traceback
    traceback.print_exc()
    sys.exit(1)
