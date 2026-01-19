"""
Test script to verify Vendor Basic Detail API and database operations.
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from vendors.models import VendorMasterBasicDetail
from vendors.vendorbasicdetail_database import VendorBasicDetailDatabase
from django.db import connection

def test_table_exists():
    """Check if vendor_master_basicdetail table exists"""
    print("\n" + "="*80)
    print("1. CHECKING TABLE EXISTENCE")
    print("="*80)
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'vendor_master_basicdetail'
        """)
        exists = cursor.fetchone()[0]
        
        if exists:
            print("✅ Table 'vendor_master_basicdetail' EXISTS")
            
            # Get table structure
            cursor.execute("DESCRIBE vendor_master_basicdetail")
            columns = cursor.fetchall()
            print("\nTable Structure:")
            print("-" * 80)
            for col in columns:
                print(f"  {col[0]:20} {col[1]:20} {col[2]:10} {col[3]:10}")
        else:
            print("❌ Table 'vendor_master_basicdetail' DOES NOT EXIST")
            return False
    
    return True

def test_direct_insert():
    """Test direct database insert"""
    print("\n" + "="*80)
    print("2. TESTING DIRECT DATABASE INSERT")
    print("="*80)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO vendor_master_basicdetail 
                (tenant_id, vendor_name, email, contact_no, vendor_code, is_also_customer, is_active)
                VALUES 
                ('test_tenant_001', 'Test Vendor Direct', 'direct@test.com', '9876543210', 'VEN9999', 0, 1)
            """)
            
            # Verify insert
            cursor.execute("""
                SELECT id, vendor_code, vendor_name, email 
                FROM vendor_master_basicdetail 
                WHERE vendor_code = 'VEN9999'
            """)
            result = cursor.fetchone()
            
            if result:
                print(f"✅ Direct INSERT successful!")
                print(f"   ID: {result[0]}, Code: {result[1]}, Name: {result[2]}, Email: {result[3]}")
                
                # Clean up
                cursor.execute("DELETE FROM vendor_master_basicdetail WHERE vendor_code = 'VEN9999'")
                print("   (Test record cleaned up)")
                return True
            else:
                print("❌ Direct INSERT failed - no data found")
                return False
                
    except Exception as e:
        print(f"❌ Direct INSERT error: {e}")
        return False

def test_django_model():
    """Test Django model operations"""
    print("\n" + "="*80)
    print("3. TESTING DJANGO MODEL")
    print("="*80)
    
    try:
        # Create using Django ORM
        vendor = VendorMasterBasicDetail.objects.create(
            tenant_id='test_tenant_002',
            vendor_code='VEN8888',
            vendor_name='Test Vendor Django',
            email='django@test.com',
            contact_no='9876543211',
            pan_no='ABCDE1234F',
            contact_person='Django Test',
            is_also_customer=False
        )
        
        print(f"✅ Django ORM CREATE successful!")
        print(f"   ID: {vendor.id}")
        print(f"   Code: {vendor.vendor_code}")
        print(f"   Name: {vendor.vendor_name}")
        print(f"   Email: {vendor.email}")
        
        # Verify it's in database
        count = VendorMasterBasicDetail.objects.filter(vendor_code='VEN8888').count()
        print(f"   Verification: {count} record(s) found in DB")
        
        # Clean up
        vendor.delete()
        print("   (Test record cleaned up)")
        
        return True
        
    except Exception as e:
        print(f"❌ Django ORM error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_database_layer():
    """Test database layer operations"""
    print("\n" + "="*80)
    print("4. TESTING DATABASE LAYER")
    print("="*80)
    
    try:
        # Test vendor code generation
        vendor_code = VendorBasicDetailDatabase.generate_vendor_code('test_tenant_003')
        print(f"✅ Generated vendor code: {vendor_code}")
        
        # Create vendor using database layer
        vendor_data = {
            'vendor_name': 'Test Vendor DB Layer',
            'email': 'dblayer@test.com',
            'contact_no': '9876543212',
            'pan_no': 'FGHIJ5678K',
            'contact_person': 'DB Layer Test',
            'is_also_customer': False
        }
        
        vendor = VendorBasicDetailDatabase.create_vendor_basic_detail(
            tenant_id='test_tenant_003',
            vendor_data=vendor_data,
            created_by='test_user'
        )
        
        print(f"✅ Database layer CREATE successful!")
        print(f"   ID: {vendor.id}")
        print(f"   Code: {vendor.vendor_code}")
        print(f"   Name: {vendor.vendor_name}")
        print(f"   Email: {vendor.email}")
        
        # Test retrieval
        retrieved = VendorBasicDetailDatabase.get_vendor_basic_detail_by_id(vendor.id)
        print(f"✅ Database layer RETRIEVE successful!")
        print(f"   Retrieved: {retrieved.vendor_name}")
        
        # Test search
        results = VendorBasicDetailDatabase.search_vendors_basic_detail('test_tenant_003', 'DB Layer')
        print(f"✅ Database layer SEARCH successful!")
        print(f"   Found: {results.count()} record(s)")
        
        # Clean up
        VendorBasicDetailDatabase.delete_vendor_basic_detail(vendor.id, soft_delete=False)
        print("   (Test record cleaned up)")
        
        return True
        
    except Exception as e:
        print(f"❌ Database layer error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_simulation():
    """Simulate API request"""
    print("\n" + "="*80)
    print("5. SIMULATING API REQUEST")
    print("="*80)
    
    try:
        from rest_framework.test import APIRequestFactory
        from vendors.vendorbasicdetail_api import VendorBasicDetailViewSet
        
        factory = APIRequestFactory()
        
        # Create POST request
        request_data = {
            'vendor_name': 'API Test Vendor',
            'email': 'api@test.com',
            'contact_no': '9876543213',
            'pan_no': 'KLMNO9012P',
            'contact_person': 'API Test',
            'is_also_customer': False
        }
        
        request = factory.post('/api/vendors/basic-details/', request_data, format='json')
        
        # Create a mock user with tenant_id
        class MockUser:
            id = 'test_tenant_004'
            tenant_id = 'test_tenant_004'
            username = 'test_user'
            is_authenticated = True
        
        request.user = MockUser()
        
        # Call the view
        view = VendorBasicDetailViewSet.as_view({'post': 'create'})
        response = view(request)
        
        print(f"✅ API simulation completed!")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.data}")
        
        if response.status_code == 201:
            # Clean up
            vendor_id = response.data.get('id')
            if vendor_id:
                VendorBasicDetailDatabase.delete_vendor_basic_detail(vendor_id, soft_delete=False)
                print("   (Test record cleaned up)")
            return True
        else:
            print(f"   ⚠️  Expected 201, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ API simulation error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("VENDOR BASIC DETAIL - COMPREHENSIVE TEST")
    print("="*80)
    
    results = []
    
    # Run tests
    results.append(("Table Exists", test_table_exists()))
    results.append(("Direct Insert", test_direct_insert()))
    results.append(("Django Model", test_django_model()))
    results.append(("Database Layer", test_database_layer()))
    results.append(("API Simulation", test_api_simulation()))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:20} {status}")
    
    total_passed = sum(1 for _, result in results if result)
    total_tests = len(results)
    
    print("-" * 80)
    print(f"Total: {total_passed}/{total_tests} tests passed")
    
    if total_passed == total_tests:
        print("\n🎉 ALL TESTS PASSED! The module is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")

if __name__ == '__main__':
    main()
