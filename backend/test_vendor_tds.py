"""
Test script to verify vendor_master_tds table and API functionality.
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection
from vendors.models import VendorMasterTDS, VendorMasterBasicDetail

def test_table_exists():
    """Test if vendor_master_tds table exists"""
    print("=" * 60)
    print("Testing vendor_master_tds table existence...")
    print("=" * 60)
    
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES LIKE 'vendor_master_tds'")
        result = cursor.fetchone()
        
        if result:
            print("✓ Table 'vendor_master_tds' exists!")
            
            # Show table structure
            cursor.execute("DESCRIBE vendor_master_tds")
            columns = cursor.fetchall()
            
            print("\nTable Structure:")
            print("-" * 60)
            for col in columns:
                print(f"  {col[0]:<30} {col[1]:<20} {col[2]}")
            
            return True
        else:
            print("✗ Table 'vendor_master_tds' does not exist!")
            return False

def test_model():
    """Test if VendorMasterTDS model is working"""
    print("\n" + "=" * 60)
    print("Testing VendorMasterTDS model...")
    print("=" * 60)
    
    try:
        # Try to query the model
        count = VendorMasterTDS.objects.count()
        print(f"✓ Model is working! Current record count: {count}")
        
        # Show model fields
        print("\nModel Fields:")
        print("-" * 60)
        for field in VendorMasterTDS._meta.get_fields():
            print(f"  {field.name:<30} {field.__class__.__name__}")
        
        return True
    except Exception as e:
        print(f"✗ Model test failed: {str(e)}")
        return False

def test_create_sample():
    """Test creating a sample TDS record"""
    print("\n" + "=" * 60)
    print("Testing sample TDS record creation...")
    print("=" * 60)
    
    try:
        # First, check if we have any vendor basic details
        vendor_count = VendorMasterBasicDetail.objects.count()
        print(f"Available vendor basic details: {vendor_count}")
        
        if vendor_count > 0:
            vendor = VendorMasterBasicDetail.objects.first()
            print(f"Using vendor: {vendor.vendor_name}")
            
            # Create a test TDS record
            tds = VendorMasterTDS.objects.create(
                tenant_id=vendor.tenant_id,
                vendor_basic_detail=vendor,
                pan_number="ABCDE1234F",
                tan_number="TANA12345B",
                tds_section="194C",
                tds_rate=2.00,
                enable_automatic_tds_posting=True,
                created_by="test_script",
                updated_by="test_script"
            )
            
            print(f"✓ Sample TDS record created with ID: {tds.id}")
            print(f"  PAN: {tds.pan_number}")
            print(f"  TAN: {tds.tan_number}")
            print(f"  TDS Section: {tds.tds_section}")
            print(f"  TDS Rate: {tds.tds_rate}%")
            
            # Clean up
            tds.delete()
            print("✓ Sample record deleted (cleanup)")
            
            return True
        else:
            print("⚠ No vendor basic details found. Skipping sample creation.")
            return True
            
    except Exception as e:
        print(f"✗ Sample creation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("VENDOR MASTER TDS - TABLE AND MODEL VERIFICATION")
    print("=" * 60 + "\n")
    
    results = []
    
    # Test 1: Table existence
    results.append(("Table Exists", test_table_exists()))
    
    # Test 2: Model functionality
    results.append(("Model Works", test_model()))
    
    # Test 3: Sample creation
    results.append(("Sample Creation", test_create_sample()))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {test_name:<30} {status}")
    
    all_passed = all(result for _, result in results)
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✓ ALL TESTS PASSED!")
    else:
        print("✗ SOME TESTS FAILED!")
    print("=" * 60 + "\n")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
