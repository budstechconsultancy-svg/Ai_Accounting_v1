"""
Test the improved Cash/Bank detection logic
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger
from masters.flow import _is_cash_or_bank_ledger

print("=" * 80)
print("Testing Improved Cash/Bank Detection")
print("=" * 80)

# Test with the 'lplplp' ledger
ledger = MasterLedger.objects.get(id=979)

print("Ledger: {}".format(ledger.name))
print("  Category: {}".format(ledger.category))
print("  Group: {}".format(ledger.group))
print("  Sub Group 1: {}".format(ledger.sub_group_1))
print("  Sub Group 2: {}".format(ledger.sub_group_2))

is_cash_bank = _is_cash_or_bank_ledger(ledger)

print("\nDetection Result: {}".format("CASH/BANK" if is_cash_bank else "NOT CASH/BANK"))

if is_cash_bank:
    print("SUCCESS! Ledger is now correctly detected as Cash/Bank")
else:
    print("ERROR: Ledger still not detected as Cash/Bank")

# Test with a few more ledgers
print("\n" + "=" * 80)
print("Testing Other Asset Ledgers")
print("=" * 80)

asset_ledgers = MasterLedger.objects.filter(category='Asset')[:10]

for ledger in asset_ledgers:
    is_cb = _is_cash_or_bank_ledger(ledger)
    print("{}: {} - {}".format(
        ledger.name,
        "CASH/BANK" if is_cb else "OTHER",
        ledger.sub_group_1 or ledger.sub_group_2 or ledger.group or "N/A"
    ))
