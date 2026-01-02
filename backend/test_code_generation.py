"""
Simple test script to verify ledger code generation works.

Run with: python test_code_generation.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.utils import generate_ledger_code
from accounting.models import MasterLedger, MasterHierarchyRaw
from core.models import Tenant

print("=" * 60)
print("LEDGER CODE GENERATION TEST")
print("=" * 60)

# Get or create a test tenant
try:
    tenant = Tenant.objects.first()
    if not tenant:
        print("❌ No tenant found in database. Please create a tenant first.")
        exit(1)
    print(f"✅ Using tenant: {tenant.name} (ID: {tenant.id})")
except Exception as e:
    print(f"❌ Error getting tenant: {e}")
    exit(1)

print("\n" + "-" * 60)
print("TEST 1: Fallback Code Generation (No Hierarchy)")
print("-" * 60)

ledger_data = {
    'name': 'Test Ledger - Fallback'
}

try:
    code = generate_ledger_code(ledger_data, tenant.id)
    print(f"✅ Generated code: {code}")
    print(f"   Expected: 9001 or higher")
    assert code.startswith('9'), f"Code should start with 9, got: {code}"
    print("   ✓ Test passed!")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "-" * 60)
print("TEST 2: Hierarchy-Based Code Generation")
print("-" * 60)

# Check if hierarchy data exists
hierarchy_count = MasterHierarchyRaw.objects.count()
print(f"📊 Found {hierarchy_count} records in master_hierarchy_raw")

if hierarchy_count > 0:
    # Get a sample hierarchy record
    sample = MasterHierarchyRaw.objects.filter(
        code__isnull=False
    ).first()
    
    if sample:
        print(f"   Sample: {sample.major_group_1} > {sample.group_1}")
        print(f"   Code: {sample.code}")
        
        ledger_data = {
            'name': 'Test Ledger - Hierarchy',
            'category': sample.major_group_1,
            'group': sample.group_1
        }
        
        try:
            code = generate_ledger_code(ledger_data, tenant.id)
            print(f"✅ Generated code: {code}")
            print(f"   Should start with group code (8 digits)")
            assert '.' in code, f"Code should contain a dot, got: {code}"
            print("   ✓ Test passed!")
        except Exception as e:
            print(f"❌ Error: {e}")
    else:
        print("⚠️  No hierarchy records with codes found")
else:
    print("⚠️  No hierarchy data found - skipping hierarchy test")

print("\n" + "-" * 60)
print("TEST 3: Nested Ledger Code Generation")
print("-" * 60)

# Create a parent ledger
try:
    parent = MasterLedger.objects.filter(
        tenant_id=tenant.id,
        code__isnull=False
    ).first()
    
    if not parent:
        # Create one
        parent = MasterLedger.objects.create(
            name="Test Parent Ledger",
            code="9999",
            tenant_id=tenant.id
        )
        print(f"✅ Created parent ledger with code: {parent.code}")
    else:
        print(f"✅ Using existing parent ledger: {parent.name} (code: {parent.code})")
    
    ledger_data = {
        'name': 'Test Child Ledger',
        'parent_ledger_id': parent.id
    }
    
    code = generate_ledger_code(ledger_data, tenant.id)
    print(f"✅ Generated child code: {code}")
    print(f"   Should start with parent code: {parent.code}")
    assert code.startswith(parent.code), f"Child code should start with parent code"
    assert '.' in code, f"Child code should contain a dot"
    print("   ✓ Test passed!")
    
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("TEST SUMMARY")
print("=" * 60)
print("✅ All basic tests completed!")
print("\nNext steps:")
print("1. Run full test suite: python manage.py test accounting.tests")
print("2. Run migration: python manage.py migrate")
print("3. Test via API: Create a ledger through the frontend")
print("=" * 60)
