import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger, AmountTransaction
from django.contrib.auth import get_user_model
from datetime import date

User = get_user_model()

print("🔧 Manually Creating Transactions for Existing Ledgers\n")
print("=" * 80)

user = User.objects.first()
if not user:
    print("❌ No users found")
    exit(1)

tenant_id = user.tenant_id
print(f"✅ Tenant: {tenant_id}\n")

# Find bank2 and bank3 ledgers
ledgers = MasterLedger.objects.filter(
    tenant_id=tenant_id,
    name__in=['bank2', 'bank3']
)

if ledgers.count() == 0:
    print("❌ No bank2 or bank3 ledgers found")
    print("💡 Create them through the UI first")
    exit(1)

created_count = 0
for ledger in ledgers:
    print(f"\nProcessing: {ledger.name}")
    
    # Check if transaction already exists
    existing = AmountTransaction.objects.filter(
        tenant_id=tenant_id,
        ledger=ledger,
        transaction_type='opening_balance'
    ).first()
    
    if existing:
        print(f"  ℹ️  Transaction already exists")
        continue
    
    # Get opening balance from additional_data
    opening_balance = None
    if ledger.additional_data and isinstance(ledger.additional_data, dict):
        opening_balance = ledger.additional_data.get('opening_balance')
    
    if not opening_balance:
        print(f"  ⚠️  No opening balance found, using 0")
        opening_balance = 0
    
    try:
        opening_balance_value = float(opening_balance)
        
        # Create transaction
        AmountTransaction.objects.create(
            tenant_id=tenant_id,
            ledger=ledger,
            name=ledger.name,
            transaction_date=date.today(),
            transaction_type='opening_balance',
            debit=opening_balance_value if opening_balance_value >= 0 else 0,
            credit=abs(opening_balance_value) if opening_balance_value < 0 else 0,
            balance=opening_balance_value,
            narration='Opening Balance'
        )
        print(f"  ✅ Created transaction with opening balance: {opening_balance_value}")
        created_count += 1
    except Exception as e:
        print(f"  ❌ Error: {e}")

print("\n" + "=" * 80)
print(f"\n✅ Created {created_count} transaction(s)")

# Verify
print("\n📋 Verifying amount_transactions table:")
all_txns = AmountTransaction.objects.filter(tenant_id=tenant_id)
print(f"Total transactions: {all_txns.count()}\n")

for txn in all_txns:
    print(f"  {txn.name} (Ledger: {txn.ledger.name})")
    print(f"    Date: {txn.transaction_date}, Type: {txn.transaction_type}")
    print(f"    Dr: {txn.debit}, Cr: {txn.credit}, Balance: {txn.balance}")
    print()
