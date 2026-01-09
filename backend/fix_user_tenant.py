import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Tenant

User = get_user_model()

print("🔧 Fixing User Tenant Association\n")
print("=" * 80)

# Get all users
users = User.objects.all()

if users.count() == 0:
    print("❌ No users found in database")
    exit(1)

print(f"Found {users.count()} user(s)\n")

fixed_count = 0
for user in users:
    print(f"Checking user: {user.username}")
    
    if not user.tenant_id:
        print(f"  ⚠️  User has no tenant_id")
        
        # Try to find or create a tenant for this user
        # Option 1: Find tenant by company name
        if user.company_name:
            tenant = Tenant.objects.filter(company_name=user.company_name).first()
            if tenant:
                print(f"  ✅ Found existing tenant: {tenant.tenant_id}")
                user.tenant_id = tenant.tenant_id
                user.save()
                fixed_count += 1
                print(f"  ✅ Updated user.tenant_id to: {tenant.tenant_id}")
            else:
                # Create new tenant
                print(f"  📝 Creating new tenant for company: {user.company_name}")
                tenant = Tenant.objects.create(
                    company_name=user.company_name,
                    tenant_id=f"{user.username}-tenant-001"
                )
                user.tenant_id = tenant.tenant_id
                user.save()
                fixed_count += 1
                print(f"  ✅ Created tenant and updated user.tenant_id to: {tenant.tenant_id}")
        else:
            # No company name, create generic tenant
            tenant_id = f"{user.username}-tenant-001"
            print(f"  📝 Creating generic tenant: {tenant_id}")
            tenant = Tenant.objects.create(
                company_name=f"{user.username} Company",
                tenant_id=tenant_id
            )
            user.tenant_id = tenant_id
            user.save()
            fixed_count += 1
            print(f"  ✅ Created tenant and updated user.tenant_id to: {tenant_id}")
    else:
        print(f"  ✅ User already has tenant_id: {user.tenant_id}")
    
    print()

print("=" * 80)
print(f"\n✅ Fixed {fixed_count} user(s)")
print("\n💡 Next steps:")
print("  1. Restart your Django server")
print("  2. Try creating a ledger again")
print("  3. The 403 error should be resolved")
