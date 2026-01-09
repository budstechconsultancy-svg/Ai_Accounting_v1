import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger
from django.contrib.auth import get_user_model

User = get_user_model()

print("🔍 Debugging Auto-Transaction Issue\n")
print("=" * 80)

user = User.objects.first()
if not user:
    print("❌ No users found")
    exit(1)

tenant_id = user.tenant_id
print(f"✅ Tenant: {tenant_id}\n")

# Find bank2 and bank3 ledgers
print("📋 Checking bank2 and bank3 Ledgers:")
print("-" * 80)

ledgers = MasterLedger.objects.filter(
    tenant_id=tenant_id,
    name__in=['bank2', 'bank3']
)

for ledger in ledgers:
    print(f"\nLedger: {ledger.name}")
    print(f"  Code: {ledger.code}")
    print(f"  Category: {ledger.category}")
    print(f"  Sub Group 2: {ledger.sub_group_2}")
    print(f"  Additional Data: {ledger.additional_data}")
    
    # Check if it would be detected as Cash/Bank
    from masters.flow import _is_cash_or_bank_ledger
    is_cash_bank = _is_cash_or_bank_ledger(ledger)
    print(f"  Is Cash/Bank: {is_cash_bank}")
    
    if ledger.additional_data:
        opening_balance = ledger.additional_data.get('opening_balance')
        print(f"  Opening Balance: {opening_balance}")
    else:
        print(f"  ⚠️  No additional_data found!")

print("\n" + "=" * 80)
print("\n💡 Diagnosis:")
print("  - If 'Is Cash/Bank' is False, the ledger isn't being detected correctly")
print("  - If 'Opening Balance' is None, the opening balance wasn't saved")
print("  - Check if sub_group_2 contains 'cash' or 'bank' keywords")
