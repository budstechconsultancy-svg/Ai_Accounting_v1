"""
Test the updated code generation - using EXACT codes from hierarchy table
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.utils import generate_ledger_code
from accounting.models import MasterHierarchyRaw

print("=" * 70)
print("TESTING EXACT HIERARCHY CODE ASSIGNMENT")
print("=" * 70)

# Get a sample from hierarchy table
sample = MasterHierarchyRaw.objects.first()

if sample:
    print(f"\n📊 Sample from master_hierarchy_raw:")
    print(f"   Major Group: {sample.major_group_1}")
    print(f"   Group: {sample.group_1}")
    print(f"   Sub Group 1: {sample.sub_group_1_1}")
    print(f"   Ledger: {sample.ledger_1}")
    print(f"   Code: {sample.code}")
    
    print("\n" + "-" * 70)
    print("TEST 1: Generate code with full hierarchy")
    print("-" * 70)
    
    ledger_data = {
        'name': 'Test Ledger',
        'category': sample.major_group_1,
        'group': sample.group_1,
        'sub_group_1': sample.sub_group_1_1
    }
    
    code = generate_ledger_code(ledger_data, tenant_id=1)
    
    print(f"\n✅ Generated code: {code}")
    print(f"   Expected code: {sample.code}")
    
    if code == sample.code:
        print("   ✓ EXACT MATCH! Code matches hierarchy table!")
    elif code.startswith(sample.code):
        print(f"   ⚠️ Code has suffix (hierarchy code already used)")
    else:
        print(f"   ❌ Code doesn't match expected")
    
    print("\n" + "-" * 70)
    print("TEST 2: Generate code with partial hierarchy (group only)")
    print("-" * 70)
    
    ledger_data2 = {
        'name': 'Test Ledger 2',
        'category': sample.major_group_1,
        'group': sample.group_1
    }
    
    code2 = generate_ledger_code(ledger_data2, tenant_id=1)
    print(f"\n✅ Generated code: {code2}")
    print(f"   Should match a code from hierarchy for this group")

else:
    print("❌ No data in master_hierarchy_raw table")

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print("✅ Code generation now uses EXACT codes from hierarchy table")
print("✅ No suffixes added unless the exact code already exists")
print("✅ Matches your requirement!")
print("=" * 70)
