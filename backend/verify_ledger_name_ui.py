"""
Verify that the Ledger Name entered by user is saved correctly
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger, AmountTransaction

print("=" * 80)
print("VERIFICATION: Ledger Name from UI -> amount_transactions table")
print("=" * 80)

# Get the most recent ledger
recent_ledger = MasterLedger.objects.order_by('-id').first()

print("\nMost Recent Ledger Created:")
print("  ID: {}".format(recent_ledger.id))
print("  Name (what user entered in UI): \"{}\"".format(recent_ledger.name))

# Check if transaction exists
txn = AmountTransaction.objects.filter(ledger=recent_ledger).first()

print("\nCorresponding Transaction in amount_transactions:")
if txn:
    print("  Transaction ID: {}".format(txn.id))
    print("  ledger_name column: \"{}\"".format(txn.ledger_name))
    print("\n" + "=" * 80)
    print("RESULT")
    print("=" * 80)
    if txn.ledger_name == recent_ledger.name:
        print("SUCCESS! The ledger name entered in UI is correctly saved!")
        print("  User entered: \"{}\"".format(recent_ledger.name))
        print("  Saved in DB: \"{}\"".format(txn.ledger_name))
    else:
        print("ERROR: Mismatch detected!")
        print("  User entered: \"{}\"".format(recent_ledger.name))
        print("  Saved in DB: \"{}\"".format(txn.ledger_name))
else:
    print("  No transaction found for this ledger")
    print("\nThis ledger might not be a Cash/Bank ledger under Assets")
