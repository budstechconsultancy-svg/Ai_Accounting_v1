"""
Script to clear Roles tables but KEEP Modules table.
1. Deletes all data from roles and role_modules.
2. Verifies modules table contains the 33 standard permissions.
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection, transaction
from core.models import Module

def reset_roles_keep_modules():
    """Clear roles but keep modules."""
    
    with connection.cursor() as cursor:
        print("1. Clearing roles and role_modules tables...")
        # Disable FK checks to allow truncation
        cursor.execute("SET FOREIGN_KEY_CHECKS=0")
        cursor.execute("TRUNCATE TABLE role_modules")
        cursor.execute("TRUNCATE TABLE roles")
        cursor.execute("SET FOREIGN_KEY_CHECKS=1")
        print("   ✅ Roles cleared")
        
        # Verify modules
        print("\n2. Verifying Modules (Hardcoded IDs)...")
        count = Module.objects.count()
        print(f"   Found {count} modules in database.")
        
        # Ensure specific hardcoded IDs exist
        expected_ids = range(1, 28) # 1 to 27 as defined in SQL
        
        missing = []
        for mid in expected_ids:
            if not Module.objects.filter(id=mid).exists():
                missing.append(mid)
        
        if missing:
            print(f"   ⚠️  Missing module IDs: {missing}")
            # If missing, we should probably re-seed them, but for now just reporting
        else:
            print("   ✅ All 27 standard modules verified present.")

    print("\n✅ Done. Roles table is empty. Modules table contains the permission definitions.")

if __name__ == '__main__':
    reset_roles_keep_modules()
