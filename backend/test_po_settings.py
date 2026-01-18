"""
Test script to verify Vendor Master PO Settings implementation.
Run this with: python test_po_settings.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from vendors.models import VendorMasterPOSettings
from vendors.posettings_database import POSettingsDatabase
from vendors.posettings_serializers import VendorMasterPOSettingsSerializer

def test_model():
    """Test that the model is properly configured"""
    print("Testing VendorMasterPOSettings model...")
    print(f"  ✅ Table name: {VendorMasterPOSettings._meta.db_table}")
    print(f"  ✅ Fields: {[f.name for f in VendorMasterPOSettings._meta.fields]}")
    print(f"  ✅ Model loaded successfully!")

def test_database_operations():
    """Test database operations"""
    print("\nTesting database operations...")
    
    # Test creating a PO setting
    try:
        po_setting = POSettingsDatabase.create_po_setting(
            tenant_id="test_tenant",
            name="Test PO Series",
            prefix="TEST/",
            suffix="/25",
            digits=4,
            auto_year=False
        )
        print(f"  ✅ Created PO setting: {po_setting}")
        
        # Test retrieving
        retrieved = POSettingsDatabase.get_po_setting_by_id(po_setting.id)
        print(f"  ✅ Retrieved PO setting: {retrieved}")
        
        # Test PO number generation
        po_number = po_setting.generate_po_number()
        print(f"  ✅ Generated PO number: {po_number}")
        
        # Clean up
        POSettingsDatabase.delete_po_setting(po_setting.id, soft_delete=False)
        print(f"  ✅ Cleaned up test data")
        
    except Exception as e:
        print(f"  ❌ Error: {e}")

def test_serializer():
    """Test serializers"""
    print("\nTesting serializers...")
    try:
        from vendors.posettings_serializers import VendorMasterPOSettingsCreateSerializer
        
        data = {
            'name': 'Test Series',
            'prefix': 'PO/',
            'suffix': '/25',
            'digits': 4,
            'auto_year': False
        }
        
        serializer = VendorMasterPOSettingsCreateSerializer(data=data)
        if serializer.is_valid():
            print(f"  ✅ Serializer validation passed")
            print(f"  ✅ Validated data: {serializer.validated_data}")
        else:
            print(f"  ❌ Serializer errors: {serializer.errors}")
            
    except Exception as e:
        print(f"  ❌ Error: {e}")

def test_api_import():
    """Test API imports"""
    print("\nTesting API imports...")
    try:
        from vendors.posettings_api import VendorMasterPOSettingsViewSet
        print(f"  ✅ API ViewSet imported successfully")
        print(f"  ✅ Available actions: {VendorMasterPOSettingsViewSet.get_extra_actions()}")
    except Exception as e:
        print(f"  ❌ Error: {e}")

if __name__ == '__main__':
    print("=" * 60)
    print("Vendor Master PO Settings - Test Suite")
    print("=" * 60)
    
    test_model()
    test_database_operations()
    test_serializer()
    test_api_import()
    
    print("\n" + "=" * 60)
    print("Test suite completed!")
    print("=" * 60)
