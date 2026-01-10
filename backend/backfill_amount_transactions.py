"""
Backfill script to create amount transactions for existing Cash/Bank ledgers
that don't have any transactions yet.
"""
import os
import sys
import django
from datetime import date

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger, AmountTransaction

def is_cash_or_bank_ledger(ledger):
    """Check if ledger is a Cash or Bank ledger from Asset category."""
    if not ledger.category or ledger.category.lower() != 'asset':
        return False
    
    cash_bank_keywords = ['cash', 'bank', 'cash-in-hand', 'bank accounts']
    
    if ledger.sub_group_2:
        sub_group_2_lower = ledger.sub_group_2.lower()
        return any(keyword in sub_group_2_lower for keyword in cash_bank_keywords)
    
    return False

print("=" * 80)
print("BACKFILL: Creating Amount Transactions for Existing Ledgers")
print("=" * 80)

# Get all Cash/Bank ledgers
all_ledgers = MasterLedger.objects.all()
cash_bank_ledgers = [ledger for ledger in all_ledgers if is_cash_or_bank_ledger(ledger)]

print("Total Cash/Bank Ledgers: {}".format(len(cash_bank_ledgers)))

# Find ledgers without transactions
ledgers_without_txn = []
for ledger in cash_bank_ledgers:
    txn_count = AmountTransaction.objects.filter(ledger=ledger).count()
    if txn_count == 0:
        ledgers_without_txn.append(ledger)

print("Ledgers WITHOUT transactions: {}".format(len(ledgers_without_txn)))

if not ledgers_without_txn:
    print("\nAll Cash/Bank ledgers already have transactions!")
    sys.exit(0)

print("\n" + "=" * 80)
print("Creating transactions for {} ledgers...".format(len(ledgers_without_txn)))
print("=" * 80)

created_count = 0
failed_count = 0

for ledger in ledgers_without_txn:
    try:
        # Get opening balance from additional_data or default to 0
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
            narration='Opening Balance (Backfilled)'
        )
        
        print("SUCCESS: Created transaction for ledger {} (ID: {}, Balance: {})".format(
            ledger.name, ledger.id, opening_balance_value
        ))
        created_count += 1
        
    except Exception as e:
        print("ERROR: Failed to create transaction for ledger {} (ID: {}): {}".format(
            ledger.name, ledger.id, str(e)
        ))
        failed_count += 1

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print("Transactions created: {}".format(created_count))
print("Failed: {}".format(failed_count))
print("\nTotal transactions in database: {}".format(AmountTransaction.objects.count()))
