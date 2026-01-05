
import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, TenantUser, Module
from core.rbac import get_all_permission_ids, get_permission_codes_from_ids

def check_owner_perms():
    print("Checking Owner Permission Logic...")
    
    # 1. Check Modules in DB
    active_modules_count = Module.objects.filter(is_active=True).count()
    print(f"Active Modules in DB: {active_modules_count}")
    
    if active_modules_count == 0:
        print("❌ NO ACTIVE MODULES! Use seed_modules_db.py to fix.")
        return

    # 2. Check get_all_permission_ids
    ids = get_all_permission_ids()
    print(f"get_all_permission_ids() returned {len(ids)} IDs.")
    
    # 3. Check codes
    codes = get_permission_codes_from_ids(ids)
    print(f"get_permission_codes_from_ids() returned {len(codes)} codes.")
    print(f"Sample codes: {codes[:5]}")
    
    # 4. Find an Owner
    owner = User.objects.first()
    if owner:
        print(f"\nFound Owner: {owner.username} (ID: {owner.id})")
        from login.flow import authenticate_user
        # We need password to authenticate, which we don't have in plaintext.
        # But we can verify the logic block manually.
        
        is_owner = not isinstance(owner, TenantUser)
        print(f"is_owner check: {is_owner} (Should be True)")
        
        if is_owner:
            p_ids = get_all_permission_ids()
            p_codes = get_permission_codes_from_ids(p_ids)
            print(f"Computed Permissions for Owner: {len(p_codes)}")
            
            # Check for MASTERS_LEDGERS
            if 'MASTERS_LEDGERS' in p_codes:
                print("✅ MASTERS_LEDGERS present.")
            else:
                print("❌ MASTERS_LEDGERS MISSING!")
    else:
        print("❌ No Owner user found in DB.")

if __name__ == '__main__':
    check_owner_perms()
