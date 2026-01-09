import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger, AmountTransaction
from django.contrib.auth import get_user_model

User = get_user_model()

print("🔍 Complete Database Check\n")
print("=" * 80)

# Check all users and tenants
users = User.objects.all()
print(f"Total users: {users.count()}\n")

for user in users[:3]:  # Show first 3 users
    print(f"User: {user.username}, Tenant: {user.tenant_id}")

print("\n" + "-" * 80 + "\n")

# Check ALL ledgers (no tenant filter)
all_ledgers = MasterLedger.objects.all().order_by('-created_at')[:10]
print(f"Total ledgers in database: {MasterLedger.objects.count()}")
print(f"\nRecent 10 ledgers:")
for l in all_ledgers:
    print(f"  - {l.name} (Tenant: {l.tenant_id}, Created: {l.created_at})")

print("\n" + "-" * 80 + "\n")

# Check ALL transactions (no tenant filter)
all_txns = AmountTransaction.objects.all()
print(f"Total transactions in database: {all_txns.count()}\n")

if all_txns.count() > 0:
    print("Transactions:")
    for txn in all_txns[:10]:
        print(f"  - {txn.name} (Tenant: {txn.tenant_id})")
        print(f"    Sub Group 2: {txn.sub_group_2}, Code: {txn.code}")
        print(f"    Balance: {txn.balance}")
else:
    print("❌ NO TRANSACTIONS FOUND!")

print("\n" + "=" * 80)
