"""
Complete demonstration: Ledger Name from UI -> amount_transactions table
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger, AmountTransaction
from core.models import User
from masters import flow

print("=" * 80)
print("DEMONSTRATION: Ledger Name from UI -> amount_transactions")
print("=" * 80)

# Simulate what happens when user creates a ledger via UI
user = User.objects.first()

# This is what the user enters in the "Ledger Name" field in your screenshot
user_entered_name = "Test Bank Account from UI"

ledger_data = {
    'name': user_entered_name,  # <-- This is what user types in "Ledger Name" field
    'category': 'Asset',
    'group': 'Cash and bank balances',
    'sub_group_1': 'Bank',
    'sub_group_2': None,
    'sub_group_3': None,
    'ledger_type': None,
    'additional_data': {
        'opening_balance': '5000'
    }
}

print("\nUser enters in UI:")
print("  Ledger Name field: \"{}\"".format(user_entered_name))
print("  Category: Asset")
print("  Sub Group 1: Bank")

# Inject request
class FakeRequest:
    pass
user._request = FakeRequest()

# Create ledger (this is what happens when user clicks Create)
print("\n" + "=" * 80)
print("Creating ledger...")
print("=" * 80)

ledger = flow.create_ledger(user, ledger_data)

print("Ledger created:")
print("  ID: {}".format(ledger.id))
print("  Name in master_ledgers: \"{}\"".format(ledger.name))

# Check transaction
txn = AmountTransaction.objects.filter(ledger=ledger).first()

print("\n" + "=" * 80)
print("Auto-created transaction in amount_transactions:")
print("=" * 80)

if txn:
    print("  Transaction ID: {}".format(txn.id))
    print("  ledger_name column: \"{}\"".format(txn.ledger_name))
    
    print("\n" + "=" * 80)
    print("VERIFICATION")
    print("=" * 80)
    print("What user entered: \"{}\"".format(user_entered_name))
    print("What's in amount_transactions.ledger_name: \"{}\"".format(txn.ledger_name))
    print("\nMatch: {}".format("YES - CORRECT!" if txn.ledger_name == user_entered_name else "NO"))
    
    if txn.ledger_name == user_entered_name:
        print("\nSUCCESS! The ledger name you enter in the UI is saved correctly!")
else:
    print("ERROR: No transaction was created!")
