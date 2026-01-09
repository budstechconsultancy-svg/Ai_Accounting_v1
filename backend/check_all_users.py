import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("🔍 Checking All Users for Tenant Association\n")
print("=" * 80)

users = User.objects.all()

if users.count() == 0:
    print("❌ No users found")
    exit(1)

print(f"Found {users.count()} user(s)\n")

for user in users:
    print(f"User: {user.username}")
    print(f"  - ID: {user.id}")
    print(f"  - Email: {getattr(user, 'email', 'N/A')}")
    print(f"  - tenant_id: {user.tenant_id if user.tenant_id else '❌ NULL'}")
    print(f"  - Company: {user.company_name if hasattr(user, 'company_name') else 'N/A'}")
    print()

print("=" * 80)
print("\n💡 If tenant_id is NULL:")
print("  1. Run: python fix_user_tenant.py")
print("  2. Restart Django server")
print("  3. Log out and log in again in the frontend")
