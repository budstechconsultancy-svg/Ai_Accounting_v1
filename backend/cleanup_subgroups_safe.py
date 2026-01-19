"""
Safe Cleanup of unwanted subgroups
This script attempts to remove subgroups from all categories EXCEPT 'Stores and Spares'.
It iterates one by one to skip active records that are protected.
"""

import os
import django
from django.db.models import ProtectedError

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from inventory.models import InventoryMasterCategory
from vendors.models import VendorMasterCategory

def safe_clean_database():
    print("🧹 Safely cleaning up unwanted subgroups...")

    # 1. Clean Inventory Categories
    print("\n--- Inventory ---")
    candidates = InventoryMasterCategory.objects.exclude(
        category='Stores and Spares'
    ).exclude(
        subgroup__isnull=True
    ).exclude(subgroup='')
    
    deleted_count = 0
    protected_count = 0
    
    for item in candidates:
        try:
            item.delete()
            deleted_count += 1
        except ProtectedError:
            protected_count += 1
            # print(f"  Skipping in-use category: {item}")

    print(f"Inventory: Removed {deleted_count} unused subgroups. Skipped {protected_count} in-use subgroups.")

    # 2. Clean Vendor Categories
    print("\n--- Vendors ---")
    candidates_v = VendorMasterCategory.objects.exclude(
        category='Stores and Spares'
    ).exclude(
        subgroup__isnull=True
    ).exclude(subgroup='')

    deleted_count_v = 0
    protected_count_v = 0

    for item in candidates_v:
        try:
            item.delete()
            deleted_count_v += 1
        except ProtectedError:
            protected_count_v += 1
            # print(f"  Skipping in-use category: {item}")

    print(f"Vendors: Removed {deleted_count_v} unused subgroups. Skipped {protected_count_v} in-use subgroups.")
    
    print("\n✅ Cleanup complete!")

if __name__ == '__main__':
    safe_clean_database()
