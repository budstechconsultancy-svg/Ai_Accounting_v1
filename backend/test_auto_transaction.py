import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger, AmountTransaction
from django.contrib.auth import get_user_model

User = get_user_model()

print("🔍 Testing Auto-Transaction Creation\n")
print("=" * 80)

user = User.objects.first()
if not user:
    print("❌ No users found")
    exit(1)

tenant_id = user.tenant_id
print(f"✅ Tenant: {tenant_id}\n")

# Find Cash and Bank ledgers
print("📋 Cash and Bank Ledgers with Transactions:")
print("-" * 80)

cash_bank_ledgers = MasterLedger.objects.filter(
    tenant_id=tenant_id,
    category__iexact='asset'
).filter(
    sub_group_2__icontains='cash'
) | MasterLedger.objects.filter(
    tenant_id=tenant_id,
    category__iexact='asset',
    sub_group_2__icontains='bank'
)

for ledger in cash_bank_ledgers.distinct():
    print(f"\n{ledger.name} (Code: {ledger.code})")
    print(f"  Category: {ledger.category}, Sub Group 2: {ledger.sub_group_2}")
    
    # Get opening balance from additional_data
    opening_balance = None
    if ledger.additional_data and isinstance(ledger.additional_data, dict):
        opening_balance = ledger.additional_data.get('opening_balance')
    print(f"  Opening Balance in Ledger: {opening_balance}")
    
    # Check transactions
    transactions = AmountTransaction.objects.filter(
        tenant_id=tenant_id,
        ledger=ledger
    ).order_by('transaction_date')
    
    print(f"  Transactions in amount_transactions: {transactions.count()}")
    
    if transactions.count() > 0:
        for txn in transactions:
            print(f"    - Date: {txn.transaction_date}, Type: {txn.transaction_type}")
            print(f"      Dr: {txn.debit}, Cr: {txn.credit}, Balance: {txn.balance}")
            print(f"      Narration: {txn.narration}")
    else:
        print("    ⚠️  No transactions found!")

print("\n" + "=" * 80)
print("\n💡 If no transactions are shown:")
print("  1. Create a new Cash or Bank ledger through the UI")
print("  2. Add an opening balance when creating the ledger")
print("  3. The transaction should be auto-created")
