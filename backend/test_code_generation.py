import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.utils import generate_ledger_code
from accounting.models import MasterLedger

# Mock data
tenant_id = 1
# Case 1: Create a ledger under "Unrestricted Funds" (Group)
# Hierarchy: Category="NPO Funds" (010101?), Group="Unrestricted Funds" (01010101?)
# Based on analysis: NPO Funds -> 010101..., Unrestricted -> 01010101...
# So we expect a prefix of length 8? 01010101.
# Result should be 01010101.001

data_group_level = {
    'category': 'NPO Funds',
    'group': 'Unrestricted Funds',
    'tenant_id': tenant_id
}

print("Testing Group Level Generation:")
code = generate_ledger_code(data_group_level, tenant_id)
print(f"Generated Code: {code}")

# Case 2: Create a ledger under "Secured Loans" (Sub Group 1)
# Secured Loans code was 0101030406...
# Length 10 -> 0101030406
# Result should be 0101030406.001

data_sub_group = {
    'category': 'Liability',
    'group': 'Long-term borrowings',
    'sub_group_1': 'Secured Loans',
    'tenant_id': tenant_id
}

print("\nTesting Sub Group Level Generation:")
code2 = generate_ledger_code(data_sub_group, tenant_id)
print(f"Generated Code: {code2}")

# Verify uniqueness
# If I create a ledger with that code, next one should be .002
print("\nTesting Increment:")
try:
    MasterLedger.objects.create(
        name="Test Ledger 1",
        group="Unrestricted Funds",
        ledger_code=code,
        tenant_id=tenant_id
    )
    code_next = generate_ledger_code(data_group_level, tenant_id)
    print(f"Next Code: {code_next}")
    
    # Cleanup
    MasterLedger.objects.filter(name="Test Ledger 1").delete()
except Exception as e:
    print(f"Error during DB test: {e}")
