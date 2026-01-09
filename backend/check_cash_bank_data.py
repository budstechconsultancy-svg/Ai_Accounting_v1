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

try:
    user = User.objects.first()
    if not user:
        print("❌ No users found")
        exit(1)
    
    tenant_id = user.tenant_id
    print(f"✅ Tenant: {tenant_id}\n")
    
    # Find Cash and Bank ledgers
    print("📋 Cash and Bank Ledgers:")
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
    
    for ledger in cash_bank_ledgers:
        opening_balance = None
        if ledger.additional_data and 'opening_balance' in ledger.additional_data:
            opening_balance = ledger.additional_data['opening_balance']
        
        print(f"  {ledger.name} (Code: {ledger.code})")
        print(f"    Category: {ledger.category}, Sub Group 2: {ledger.sub_group_2}")
        print(f"    Opening Balance: {opening_balance}")
        
        # Check if transaction exists
        txn_count = AmountTransaction.objects.filter(
            tenant_id=tenant_id,
            ledger=ledger
        ).count()
        print(f"    Transactions in amount_transactions: {txn_count}")
        print()
    
    print("\n📊 Amount Transactions Table:")
    print("-" * 80)
    
    all_txns = AmountTransaction.objects.filter(tenant_id=tenant_id)
    print(f"Total transactions: {all_txns.count()}\n")
    
    if all_txns.count() > 0:
        for txn in all_txns:
            print(f"  {txn.ledger.name}:")
            print(f"    Date: {txn.transaction_date}")
            print(f"    Type: {txn.transaction_type}")
            print(f"    Debit: {txn.debit}, Credit: {txn.credit}")
            print(f"    Balance: {txn.balance}")
            print(f"    Narration: {txn.narration}")
            print()
    else:
        print("  No transactions found.\n")
        print("💡 Tip: Run sync_opening_balances to populate initial data")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
