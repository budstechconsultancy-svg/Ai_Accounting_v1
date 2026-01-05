
import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import TenantUser, Role
from core.rbac import get_user_role_modules

def list_users():
    print("--- OWERS (User Model) ---")
    User = get_user_model()
    for u in User.objects.all():
        print(f"ID: {u.id} | User: {u.username} | Tenant: {u.tenant_id} | Active: {u.is_active}")
        # Check if actually owner
        # Owners don't use the role/module tables usually, they get full access in is_owner check
        # But let's check what RBAC thinks
        # Note: RBAC functions expect user object
    
    print("\n--- TENANT USERS (Staff) ---")
    for u in TenantUser.objects.all():
        role_name = "None"
        if u.role_id:
            try:
                r = Role.objects.get(id=u.role_id)
                role_name = r.name
            except:
                role_name = "Invalid Role ID"
                
        print(f"ID: {u.id} | User: {u.username} | Tenant: {u.tenant_id} | Role: {role_name} ({u.role_id})")
        print(f"   Direct Submodules: {u.selected_submodule_ids}")
        
        # Check effective permissions
        perms = get_user_role_modules(u)
        print(f"   Effective Modules Count: {len(perms)}")
        if len(perms) < 5:
             print(f"   Effective Modules: {list(perms.keys())}")
        else:
             print(f"   Effective Modules: {list(perms.keys())[:5]} ...")

if __name__ == '__main__':
    list_users()
