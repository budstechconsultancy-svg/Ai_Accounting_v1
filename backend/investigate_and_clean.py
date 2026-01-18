"""
Check references to likely unused Inventory Categories and clean them if possible.
"""

import os
import django
from django.db.models import ProtectedError

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from inventory.models import InventoryMasterCategory
from vendors.models import Vendor, VendorMasterPOSettings

def investigate_and_clean():
    print("🕵️ Investigating protected categories...")
    
    candidates = InventoryMasterCategory.objects.exclude(
        category='Stores and Spares'
    ).exclude(
        subgroup__isnull=True
    ).exclude(subgroup='')
    
    for cat in candidates:
        print(f"\nChecking: {cat}")
        
        # Check Vendors
        vendors = Vendor.objects.filter(category=cat)
        if vendors.exists():
            print(f"  - Used by {vendors.count()} Vendors. Updating them to NULL...")
            vendors.update(category=None)
            print("    - Vendors updated.")
            
        # Check PO Settings (if related) - based on model scan, it seems to have a link?
        # Found in posettings_serializers.py: queryset=InventoryMasterCategory.objects.all()
        # But let's check the model class explicitly if we can
        
        # Try deleting now
        try:
            cat.delete()
            print("  ✅ Deleted successfully.")
        except ProtectedError as e:
            print(f"  ❌ Still protected: {e}")
            # print(e.protected_objects)

if __name__ == '__main__':
    investigate_and_clean()
