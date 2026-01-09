import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import AmountTransaction, MasterLedger
from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 80)
print("CHECKING AMOUNT_TRANSACTIONS DATA")
print("=" * 80)

# Get all users with their tenants
print("\n📋 USERS AND TENANTS:")
users = User.objects.all()
for user in users:
    print(f"  User: {user.username} | Tenant: {user.tenant_id}")

# Get all amount transactions
print("\n💰 AMOUNT_TRANSACTIONS TABLE:")
transactions = AmountTransaction.objects.all().select_related('ledger')
print(f"Total transactions: {transactions.count()}\n")

if transactions.count() > 0:
    print(f"{'ID':<5} {'Tenant':<38} {'Name':<15} {'Sub Group 1':<20} {'Sub Group 2':<20} {'Code':<8} {'Balance':<12}")
    print("-" * 130)
    for txn in transactions:
        print(f"{txn.id:<5} {txn.tenant_id:<38} {txn.name or 'N/A':<15} {txn.sub_group_1 or 'N/A':<20} {txn.sub_group_2 or 'N/A':<20} {txn.code or 'N/A':<8} {txn.balance:<12.2f}")
else:
    print("  ⚠️  No transactions found!")

# Get all Cash/Bank ledgers
print("\n🏦 CASH/BANK LEDGERS:")
ledgers = MasterLedger.objects.filter(
    sub_group_1__icontains='Cash'
).values('id', 'tenant_id', 'name', 'sub_group_1', 'sub_group_2', 'code')

print(f"Total Cash/Bank ledgers: {ledgers.count()}\n")

if ledgers.count() > 0:
    print(f"{'ID':<5} {'Tenant':<38} {'Name':<15} {'Sub Group 1':<20} {'Sub Group 2':<20} {'Code':<8}")
    print("-" * 110)
    for ledger in ledgers:
        print(f"{ledger['id']:<5} {ledger['tenant_id']:<38} {ledger['name']:<15} {ledger['sub_group_1'] or 'N/A':<20} {ledger['sub_group_2'] or 'N/A':<20} {ledger['code'] or 'N/A':<8}")
else:
    print("  ⚠️  No Cash/Bank ledgers found!")

print("\n" + "=" * 80)
