
import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import TenantUser
from core.rbac import get_all_permission_ids

def grant_all_permissions():
    print("Granting ALL permissions to ALL TenantUsers...")
    
    all_ids = get_all_permission_ids()
    users = TenantUser.objects.all()
    
    if not users.exists():
        print("❌ No TenantUsers found.")
        return

    count = 0
    for user in users:
        user.selected_submodule_ids = all_ids
        user.save()
        print(f"✅ Granted {len(all_ids)} permissions to: {user.username} (ID: {user.id})")
        count += 1
        
    print(f"\nSuccessfully updated {count} users.")

if __name__ == '__main__':
    grant_all_permissions()
