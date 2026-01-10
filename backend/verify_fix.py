"""
Final verification for lplplp ledger
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger, AmountTransaction

ledger = MasterLedger.objects.get(id=979)
txn = AmountTransaction.objects.filter(ledger=ledger).first()

print("=" * 80)
print("FINAL VERIFICATION")
print("=" * 80)
print("Ledger: {}".format(ledger.name))
print("  Has Transaction: {}".format("YES" if txn else "NO"))

if txn:
    print("\nTransaction Details:")
    print("  ID: {}".format(txn.id))
    print("  Ledger Name: {}".format(txn.ledger_name))
    print("  Match: {}".format("YES" if txn.ledger_name == ledger.name else "NO"))
    print("\nSUCCESS! The ledger '{}' now has a transaction in amount_transactions table!".format(ledger.name))
else:
    print("\nERROR: No transaction found!")
