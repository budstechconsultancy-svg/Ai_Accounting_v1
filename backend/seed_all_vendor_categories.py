"""
Seed ALL Vendor Categories with Groups and Subgroups
This script adds the standard groups and subgroups to every vendor category:
- With in country (Indigenous)
  - Consumables
  - Machinery Spares
  - Others
- Import
  - Consumables
  - Machinery Spares
  - Others
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from vendors.models import VendorMasterCategory
from core.models import Tenant


def seed_all_vendor_categories():
    """Seed all vendor categories with standard groups and subgroups"""
    
    print("Seeding ALL Vendor Categories with Groups and Subgroups...")
    
    # Get the first tenant
    tenant = Tenant.objects.first()
    if not tenant:
        print("❌ No tenant found. Please create a tenant first.")
        return
    
    print(f"Using tenant: {tenant.id}\n")
    
    # All vendor categories
    all_categories = [
        'RAW MATERIAL',
        'Work in Progress',
        'Finished goods',
        'Stores and Spares',
        'Packing Material',
        'Stock in Trade'
    ]
    
    # Standard groups and subgroups for ALL categories
    groups_data = {
        "With in country (Indigenous)": ["Consumables", "Machinery Spares", "Others"],
        "Import": ["Consumables", "Machinery Spares", "Others"]
    }
    
    created_count = 0
    existing_count = 0
    
    # Process each category
    for category_name in all_categories:
        print(f"\n{'='*60}")
        print(f"Processing: {category_name}")
        print(f"{'='*60}")
        
        # Create category only (top level)
        cat, created = VendorMasterCategory.objects.get_or_create(
            tenant_id=tenant.id,
            category=category_name,
            group=None,
            subgroup=None,
            defaults={'is_active': True}
        )
        if created:
            print(f"✅ Created category: {category_name}")
            created_count += 1
        else:
            print(f"ℹ️  Category already exists: {category_name}")
            existing_count += 1
        
        # Create groups and subgroups for this category
        for group_name, subgroups in groups_data.items():
            # Create category + group
            cat_group, created = VendorMasterCategory.objects.get_or_create(
                tenant_id=tenant.id,
                category=category_name,
                group=group_name,
                subgroup=None,
                defaults={'is_active': True}
            )
            if created:
                print(f"  ✅ Created group: {category_name} > {group_name}")
                created_count += 1
            else:
                print(f"  ℹ️  Group already exists: {category_name} > {group_name}")
                existing_count += 1
            
            # Create category + group + subgroup
            # ONLY for Stores and Spares
            if category_name == 'Stores and Spares':
                for subgroup_name in subgroups:
                    cat_group_subgroup, created = VendorMasterCategory.objects.get_or_create(
                        tenant_id=tenant.id,
                        category=category_name,
                        group=group_name,
                        subgroup=subgroup_name,
                        defaults={'is_active': True}
                    )
                    if created:
                        print(f"    ✅ Created subgroup: {category_name} > {group_name} > {subgroup_name}")
                        created_count += 1
                    else:
                        print(f"    ℹ️  Subgroup already exists: {category_name} > {group_name} > {subgroup_name}")
                        existing_count += 1
    
    print(f"\n{'='*60}")
    print(f"✅ ALL Vendor categories seeded successfully!")
    print(f"   Created: {created_count} entries")
    print(f"   Already existed: {existing_count} entries")
    print(f"   Total: {created_count + existing_count} entries")
    print(f"{'='*60}")
    
    # Display sample hierarchy
    print("\n📊 Sample Category Hierarchy (RAW MATERIAL):")
    print("└── RAW MATERIAL")
    print("    ├── With in country (Indigenous)")
    print("    │   ├── Consumables")
    print("    │   ├── Machinery Spares")
    print("    │   └── Others")
    print("    └── Import")
    print("        ├── Consumables")
    print("        ├── Machinery Spares")
    print("        └── Others")
    print("\n(Same structure applies to all 6 categories)")


if __name__ == '__main__':
    seed_all_vendor_categories()
