import os
import django
import sys
import uuid

# Set up Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Tenant

def verify_user_creation():
    tenant_id = str(uuid.uuid4())
    username = f"testuser_{uuid.uuid4().hex[:6]}"
    
    try:
        # 1. Create Tenant
        tenant = Tenant.objects.create(id=tenant_id, name=f"Test Company {username}")
        print(f"Tenant created: {tenant_id}")
        
        # 2. Create User
        user = User.objects.create(
            username=username,
            email=f"{username}@example.com",
            company_name=f"Test Company {username}",
            selected_plan="Pro",
            tenant_id=tenant_id,
            is_active=True,
            is_superuser=True,
            is_staff=True
        )
        user.set_password("password123")
        user.save()
        
        print(f"User created successfully: {user.username}")
        print(f"is_superuser: {user.is_superuser}")
        
        # Cleanup
        user.delete()
        tenant.delete()
        print("Cleanup complete.")
        return True
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Verification failed: {e}")
        return False

if __name__ == "__main__":
    verify_user_creation()
