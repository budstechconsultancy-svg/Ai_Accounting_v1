import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from masters import flow

User = get_user_model()

# Get the first user (you can modify this to get a specific user)
try:
    user = User.objects.first()
    if not user:
        print("❌ No users found in the database")
        exit(1)
    
    print(f"✅ Using user: {user.username} (Tenant: {user.tenant_id})")
    print("\n🔄 Syncing opening balances from Cash and Bank ledgers...")
    
    # Call the sync function
    created_count = flow.sync_opening_balances_to_transactions(user)
    
    print(f"\n✅ Successfully synced {created_count} opening balance transactions!")
    
    if created_count > 0:
        print("\n📋 Verifying created transactions:")
        from accounting.models import AmountTransaction
        transactions = AmountTransaction.objects.filter(
            tenant_id=user.tenant_id,
            transaction_type='opening_balance'
        )
        
        for txn in transactions:
            print(f"  - {txn.ledger.name}: Dr {txn.debit}, Cr {txn.credit}, Balance: {txn.balance}")
    else:
        print("\nℹ️  No new transactions created. Opening balances may already be synced.")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
