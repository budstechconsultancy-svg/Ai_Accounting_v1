"""
Remove unwanted subgroups
This script removes subgroups from all categories EXCEPT 'Stores and Spares'
in both Inventory and Vendor master tables.
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from inventory.models import InventoryMasterCategory
from vendors.models import VendorMasterCategory

def clean_database():
    print("🧹 Cleaning up unwanted subgroups...")

    # 1. Clean Inventory Categories
    print("\n--- Inventory ---")
    deleted_count, _ = InventoryMasterCategory.objects.exclude(
        category='Stores and Spares'
    ).exclude(
        subgroup__isnull=True
    ).delete()
    print(f"Removed {deleted_count} unwanted subgroups from Inventory.")
    
    # Also remove empty string subgroups if any
    deleted_count_empty, _ = InventoryMasterCategory.objects.exclude(
        category='Stores and Spares'
    ).filter(
        subgroup=''
    ).delete()
    if deleted_count_empty:
         print(f"Removed {deleted_count_empty} empty string subgroups from Inventory.")


    # 2. Clean Vendor Categories
    print("\n--- Vendors ---")
    deleted_count_v, _ = VendorMasterCategory.objects.exclude(
        category='Stores and Spares'
    ).exclude(
        subgroup__isnull=True
    ).delete()
    print(f"Removed {deleted_count_v} unwanted subgroups from Vendors.")

    # Also remove empty string subgroups if any
    deleted_count_v_empty, _ = VendorMasterCategory.objects.exclude(
        category='Stores and Spares'
    ).filter(
        subgroup=''
    ).delete()
    if deleted_count_v_empty:
        print(f"Removed {deleted_count_v_empty} empty string subgroups from Vendors.")

    print("\n✅ Cleanup complete! Only 'Stores and Spares' retains subgroups.")

if __name__ == '__main__':
    clean_database()
