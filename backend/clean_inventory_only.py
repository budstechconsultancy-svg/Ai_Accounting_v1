"""
Minimal Cleanup for Inventory
Removes subgroups from Inventory Master Category table for non-Stores-and-Spares.
"""

import os
import django
from django.db.models import ProtectedError

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Import ONLY inventory model
from inventory.models import InventoryMasterCategory

def clean_inventory():
    print("🧹 Cleaning Inventory subgroups...")
    
    # Target: All categories except 'Stores and Spares', where subgroup is present
    cutoff_date = '2025-01-01' # Arbitrary safeguards irrelevant here
    
    candidates = InventoryMasterCategory.objects.exclude(
        category='Stores and Spares'
    ).exclude(
        subgroup__isnull=True
    ).exclude(subgroup='')

    print(f"Found {candidates.count()} candidates to remove.")

    deleted = 0
    skipped = 0
    
    for item in candidates:
        try:
            item.delete()
            deleted += 1
        except ProtectedError:
            skipped += 1
        except Exception as e:
            print(f"Error on {item}: {e}")
            skipped += 1

    print(f"✅ Removed: {deleted}")
    print(f"⚠️ Skipped: {skipped}")

if __name__ == '__main__':
    clean_inventory()
