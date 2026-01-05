
import os
import django
import sys
import uuid

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, TenantUser
from users_roles import flow

def test_user_creation():
    print("Testing user creation with submodule_ids...")
    
    # Get an owner to act as creator
    owner = User.objects.first()
    if not owner:
        print("❌ No owner found to create user.")
        return

    # Tenant context
    owner.tenant_id = owner.tenant_id or "demo-tenant-id" # Ensure valid tenant

    # Test Data
    username = f"test_user_{str(uuid.uuid4())[:8]}"
    payload = {
        "username": username,
        "password": "Password123!",
        "email": f"{username}@example.com",
        "submodule_ids": [1, 2, 3] # Test direct permission assignment
    }
    
    print(f"Creating user {username} for tenant {owner.tenant_id}...")
    
    try:
        user = flow.create_tenant_user(owner, payload)
        print(f"✅ User created: {user.username} (ID: {user.id})")
        print(f"   Role ID: {user.role_id}")
        print(f"   Selected Submodules: {user.selected_submodule_ids}")
        
        if user.selected_submodule_ids == [1, 2, 3]:
            print("✅ Submodules correctly assigned.")
        else:
            print("❌ Submodules verification FAILED.")
            
        # Clean up
        print("Cleaning up...")
        user.delete()
        
    except Exception as e:
        print(f"❌ Creation failed: {e}")

if __name__ == '__main__':
    test_user_creation()
