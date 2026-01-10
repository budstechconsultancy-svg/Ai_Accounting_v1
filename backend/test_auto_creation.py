"""
Test: Create a new Cash/Bank ledger and verify auto-creation of amount transaction
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
print("TEST: Auto-Creation of Amount Transaction When Creating Ledger")
print("=" * 80)

# Get a user
user = User.objects.first()
print("User: {} (tenant: {})".format(user.username, user.tenant_id))

# Count before
ledger_count_before = MasterLedger.objects.count()
txn_count_before = AmountTransaction.objects.count()

print("\nBEFORE Creation:")
print("  Total Ledgers: {}".format(ledger_count_before))
print("  Total Transactions: {}".format(txn_count_before))

# Create a NEW Cash ledger
ledger_data = {
    'name': 'My New Cash Account',
    'category': 'Asset',
    'group': 'Current Assets',
    'sub_group_1': 'Current Assets',
    'sub_group_2': 'Cash-in-Hand',
    'sub_group_3': None,
    'ledger_type': None,
    'additional_data': {
        'opening_balance': '10000'
    }
}

print("\n" + "=" * 80)
print("Creating NEW Cash Ledger...")
print("=" * 80)
print("Ledger Name: {}".format(ledger_data['name']))
print("Category: {}".format(ledger_data['category']))
print("Sub Group 2: {}".format(ledger_data['sub_group_2']))
print("Opening Balance: {}".format(ledger_data['additional_data']['opening_balance']))

try:
    # Inject request for tenant resolution
    class FakeRequest:
        pass
    user._request = FakeRequest()
    
    # Create ledger through flow layer (this should auto-create transaction)
    ledger = flow.create_ledger(user, ledger_data)
    
    print("\nLedger Created Successfully!")
    print("  ID: {}".format(ledger.id))
    print("  Name: {}".format(ledger.name))
    print("  Code: {}".format(ledger.code))
    
    # Count after
    ledger_count_after = MasterLedger.objects.count()
    txn_count_after = AmountTransaction.objects.count()
    
    print("\nAFTER Creation:")
    print("  Total Ledgers: {} (+{})".format(ledger_count_after, ledger_count_after - ledger_count_before))
    print("  Total Transactions: {} (+{})".format(txn_count_after, txn_count_after - txn_count_before))
    
    # Check if transaction was auto-created
    ledger_txns = AmountTransaction.objects.filter(ledger=ledger)
    
    print("\n" + "=" * 80)
    print("VERIFICATION: Amount Transaction Auto-Created?")
    print("=" * 80)
    
    if ledger_txns.exists():
        print("SUCCESS! Transaction was AUTO-CREATED!")
        txn = ledger_txns.first()
        print("\nTransaction Details:")
        print("  ID: {}".format(txn.id))
        print("  Ledger Name: {}".format(txn.ledger_name))
        print("  Sub Group 1: {}".format(txn.sub_group_1))
        print("  Code: {}".format(txn.code))
        print("  Transaction Type: {}".format(txn.transaction_type))
        print("  Debit: {}".format(txn.debit))
        print("  Credit: {}".format(txn.credit))
        print("  Balance: {}".format(txn.balance))
        print("  Narration: {}".format(txn.narration))
        
        # Verify ledger_name matches
        if txn.ledger_name == ledger.name:
            print("\nVERIFIED: ledger_name '{}' matches master_ledgers.name!".format(txn.ledger_name))
        else:
            print("\nERROR: ledger_name mismatch!")
    else:
        print("ERROR: No transaction was auto-created!")
        print("This means the auto-creation logic is not working.")
    
except Exception as e:
    print("\nERROR: {}".format(str(e)))
    import traceback
    traceback.print_exc()
