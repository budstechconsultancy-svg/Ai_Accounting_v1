
import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import TenantUser, Module
from core.rbac import get_user_role_modules

def check_user_d():
    print("Checking user 'd'...")
    try:
        user = TenantUser.objects.get(username='d')
    except TenantUser.DoesNotExist:
        print("❌ User 'd' NOT found!")
        return

    print(f"User: {user.username} (ID: {user.id})")
    print(f"Tenant: {user.tenant_id}")
    print(f"Selected Submodule IDs: {user.selected_submodule_ids}")
    
    # Check effective permissions
    perms = get_user_role_modules(user)
    print(f"Effective Modules Count: {len(perms)}")
    if len(perms) < 10:
        print(f"Effective Modules: {list(perms.keys())}")
    else:
        print(f"Effective Modules (first 10): {list(perms.keys())[:10]} ...")
        
    # Check if 'MASTERS_LEDGERS' is in there (one of the failing endpoints)
    if 'MASTERS_LEDGERS' in perms:
        print("✅ Has 'MASTERS_LEDGERS' access.")
    else:
        print("❌ MISSING 'MASTERS_LEDGERS' access!")

    # Verify Module IDs match what we expect
    print("\nVerifying Module IDs in DB:")
    mods = Module.objects.filter(code='MASTERS_LEDGERS')
    for m in mods:
        print(f"Module 'MASTERS_LEDGERS': ID={m.id}, IsActive={m.is_active}")

if __name__ == '__main__':
    check_user_d()
