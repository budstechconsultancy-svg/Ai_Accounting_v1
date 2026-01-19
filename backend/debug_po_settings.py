"""
Test script to debug vendor_master_posettings data saving issue.
"""

import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from vendors.models import VendorMasterPOSettings
from vendors.posettings_database import POSettingsDatabase
from django.db import connection

def check_table_exists():
    """Check if the table exists in the database"""
    print("=" * 60)
    print("Checking if vendor_master_posettings table exists...")
    print("=" * 60)
    
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'vendor_master_posettings'
        """)
        result = cursor.fetchone()
        
        if result[0] > 0:
            print("✅ Table 'vendor_master_posettings' EXISTS")
            
            # Get table structure
            cursor.execute("DESCRIBE vendor_master_posettings")
            columns = cursor.fetchall()
            print("\nTable Structure:")
            print("-" * 60)
            for col in columns:
                print(f"  {col[0]:<25} {col[1]:<20} {col[2]}")
            
            # Check row count
            cursor.execute("SELECT COUNT(*) FROM vendor_master_posettings")
            count = cursor.fetchone()[0]
            print(f"\n✅ Current row count: {count}")
            
            return True
        else:
            print("❌ Table 'vendor_master_posettings' DOES NOT EXIST")
            return False

def test_direct_insert():
    """Test direct database insert"""
    print("\n" + "=" * 60)
    print("Testing direct database insert...")
    print("=" * 60)
    
    try:
        # Try to create a test record
        po_setting = VendorMasterPOSettings.objects.create(
            tenant_id="test_tenant_123",
            name="Test PO Series",
            prefix="TEST/",
            suffix="/25",
            digits=4,
            auto_year=False,
            current_number=1
        )
        
        print(f"✅ Successfully created PO Setting:")
        print(f"   ID: {po_setting.id}")
        print(f"   Name: {po_setting.name}")
        print(f"   Tenant: {po_setting.tenant_id}")
        print(f"   Preview: {po_setting.generate_po_number()}")
        
        # Verify it was saved
        retrieved = VendorMasterPOSettings.objects.get(id=po_setting.id)
        print(f"\n✅ Successfully retrieved PO Setting from database")
        print(f"   Name: {retrieved.name}")
        
        # Clean up
        po_setting.delete()
        print(f"\n✅ Test record deleted")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during insert: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_database_layer():
    """Test the database layer"""
    print("\n" + "=" * 60)
    print("Testing POSettingsDatabase layer...")
    print("=" * 60)
    
    try:
        # Create using database layer
        po_setting = POSettingsDatabase.create_po_setting(
            tenant_id="test_tenant_456",
            name="Database Layer Test",
            prefix="DB/",
            suffix="/TEST",
            digits=5,
            auto_year=False
        )
        
        print(f"✅ Successfully created via database layer:")
        print(f"   ID: {po_setting.id}")
        print(f"   Name: {po_setting.name}")
        
        # Retrieve
        retrieved = POSettingsDatabase.get_po_setting_by_id(po_setting.id)
        print(f"\n✅ Successfully retrieved:")
        print(f"   Name: {retrieved.name}")
        
        # Clean up
        POSettingsDatabase.delete_po_setting(po_setting.id, soft_delete=False)
        print(f"\n✅ Test record deleted")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in database layer: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_existing_records():
    """Check existing records in the table"""
    print("\n" + "=" * 60)
    print("Checking existing records...")
    print("=" * 60)
    
    try:
        all_records = VendorMasterPOSettings.objects.all()
        count = all_records.count()
        
        print(f"Total records: {count}")
        
        if count > 0:
            print("\nExisting records:")
            print("-" * 60)
            for record in all_records[:10]:  # Show first 10
                print(f"  ID: {record.id}, Name: {record.name}, Tenant: {record.tenant_id}")
        else:
            print("No records found in the table")
            
    except Exception as e:
        print(f"❌ Error checking records: {e}")

def test_api_simulation():
    """Simulate API request"""
    print("\n" + "=" * 60)
    print("Simulating API request...")
    print("=" * 60)
    
    try:
        from vendors.posettings_serializers import VendorMasterPOSettingsCreateSerializer
        
        # Simulate request data
        data = {
            'name': 'API Test Series',
            'prefix': 'API/',
            'suffix': '/26',
            'digits': 4,
            'auto_year': False
        }
        
        serializer = VendorMasterPOSettingsCreateSerializer(data=data)
        
        if serializer.is_valid():
            print("✅ Serializer validation passed")
            print(f"   Validated data: {serializer.validated_data}")
            
            # Create via database
            po_setting = POSettingsDatabase.create_po_setting(
                tenant_id="api_test_tenant",
                name=serializer.validated_data['name'],
                prefix=serializer.validated_data.get('prefix'),
                suffix=serializer.validated_data.get('suffix'),
                digits=serializer.validated_data.get('digits', 4),
                auto_year=serializer.validated_data.get('auto_year', False)
            )
            
            print(f"✅ Created via API simulation:")
            print(f"   ID: {po_setting.id}")
            print(f"   Name: {po_setting.name}")
            
            # Clean up
            po_setting.delete()
            print(f"\n✅ Test record deleted")
            
            return True
        else:
            print(f"❌ Serializer validation failed: {serializer.errors}")
            return False
            
    except Exception as e:
        print(f"❌ Error in API simulation: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("VENDOR MASTER PO SETTINGS - DEBUG SCRIPT")
    print("=" * 60)
    
    # Run all tests
    table_exists = check_table_exists()
    
    if table_exists:
        check_existing_records()
        test_direct_insert()
        test_database_layer()
        test_api_simulation()
    else:
        print("\n❌ Cannot proceed - table does not exist!")
        print("   Please run: python manage.py migrate vendors")
    
    print("\n" + "=" * 60)
    print("DEBUG SCRIPT COMPLETED")
    print("=" * 60)
