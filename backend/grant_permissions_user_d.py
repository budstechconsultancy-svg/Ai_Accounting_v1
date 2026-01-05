
import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import TenantUser
from core.rbac import get_all_permission_ids

def grant_d_permissions():
    print("Granting permissions to user 'd'...")
    try:
        user = TenantUser.objects.get(username='d')
    except TenantUser.DoesNotExist:
        print("❌ User 'd' NOT found!")
        return

    all_ids = get_all_permission_ids()
    user.selected_submodule_ids = all_ids
    user.save()
    
    print(f"✅ Granted {len(all_ids)} permissions to {user.username} (ID: {user.id})")
    print(f"Permissions: {user.selected_submodule_ids}")

if __name__ == '__main__':
    grant_d_permissions()
