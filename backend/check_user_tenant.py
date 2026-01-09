import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("🔍 Checking User Model and Tenant Association\n")
print("=" * 80)

# Get all users
users = User.objects.all()

if users.count() == 0:
    print("❌ No users found in database")
else:
    print(f"✅ Found {users.count()} user(s)\n")
    
    for user in users:
        print(f"User: {user.username}")
        print(f"  - ID: {user.id}")
        print(f"  - Email: {getattr(user, 'email', 'N/A')}")
        print(f"  - Has tenant_id attribute: {hasattr(user, 'tenant_id')}")
        
        if hasattr(user, 'tenant_id'):
            print(f"  - tenant_id value: {user.tenant_id}")
        else:
            print(f"  - ⚠️  tenant_id attribute missing!")
            
        print(f"  - Is authenticated: {user.is_authenticated}")
        print(f"  - Is active: {user.is_active}")
        print()

print("\n💡 Recommended Actions:")
print("-" * 80)
print("1. If tenant_id is missing, check your User model definition")
print("2. Ensure users are created with tenant_id")
print("3. Check if you're using a custom user model (TenantUser)")
print("4. Verify JWT token includes tenant_id claim")
