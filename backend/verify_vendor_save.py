"""
Simple test to verify vendor basic detail data saving.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from vendors.models import VendorMasterBasicDetail
from django.db import connection

print("="*60)
print("TESTING VENDOR BASIC DETAIL DATA SAVING")
print("="*60)

# Test 1: Check table exists
print("\n1. Checking if table exists...")
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'vendor_master_basicdetail'
    """)
    exists = cursor.fetchone()[0]
    if exists:
        print("   ✅ Table exists")
    else:
        print("   ❌ Table does NOT exist")
        exit(1)

# Test 2: Create a vendor
print("\n2. Creating a test vendor...")
try:
    vendor = VendorMasterBasicDetail.objects.create(
        tenant_id='test_001',
        vendor_code='TEST001',
        vendor_name='Test Vendor Company',
        email='test@vendor.com',
        contact_no='9876543210',
        pan_no='ABCDE1234F',
        contact_person='John Doe',
        is_also_customer=False
    )
    print(f"   ✅ Vendor created successfully!")
    print(f"      ID: {vendor.id}")
    print(f"      Code: {vendor.vendor_code}")
    print(f"      Name: {vendor.vendor_name}")
except Exception as e:
    print(f"   ❌ Error creating vendor: {e}")
    exit(1)

# Test 3: Retrieve the vendor
print("\n3. Retrieving the vendor from database...")
try:
    retrieved = VendorMasterBasicDetail.objects.get(id=vendor.id)
    print(f"   ✅ Vendor retrieved successfully!")
    print(f"      Name: {retrieved.vendor_name}")
    print(f"      Email: {retrieved.email}")
except Exception as e:
    print(f"   ❌ Error retrieving vendor: {e}")
    exit(1)

# Test 4: Count records
print("\n4. Counting total vendors...")
count = VendorMasterBasicDetail.objects.count()
print(f"   ✅ Total vendors in database: {count}")

# Test 5: Clean up
print("\n5. Cleaning up test data...")
vendor.delete()
print("   ✅ Test vendor deleted")

print("\n" + "="*60)
print("✅ ALL TESTS PASSED!")
print("Data can be saved to vendor_master_basicdetail table.")
print("="*60)
