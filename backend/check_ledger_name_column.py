"""
Check what's stored in the ledger_name column
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import AmountTransaction, MasterLedger

print("=" * 80)
print("CHECKING LEDGER_NAME COLUMN")
print("=" * 80)

txns = AmountTransaction.objects.all()[:10]

print("\nSample Transactions:")
for t in txns:
    print("\nTransaction ID: {}".format(t.id))
    print("  ledger_name column: \"{}\"".format(t.ledger_name))
    print("  master_ledgers.name: \"{}\"".format(t.ledger.name))
    print("  Match: {}".format("YES" if t.ledger_name == t.ledger.name else "NO"))
    
    # Check if there's any extra data
    if t.ledger_name != t.ledger.name:
        print("  WARNING: Mismatch detected!")
        print("  Length in DB: {}".format(len(t.ledger_name) if t.ledger_name else 0))
        print("  Length in master: {}".format(len(t.ledger.name)))

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)

all_match = all(t.ledger_name == t.ledger.name for t in txns)
if all_match:
    print("SUCCESS: All ledger_name values match master_ledgers.name exactly!")
    print("The column stores ONLY the ledger name, nothing else.")
else:
    print("WARNING: Some ledger_name values don't match!")
