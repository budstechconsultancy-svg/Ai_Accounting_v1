"""
Script to check and fix users without tenant_id.
Run this with: python manage.py shell < fix_user_tenant.py
"""

from core.models import User, Tenant

# Get all users
users = User.objects.all()

print(f"\n{'='*60}")
print(f"Found {users.count()} users in the database")
print(f"{'='*60}\n")

for user in users:
    print(f"User: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  Tenant ID: {user.tenant_id if hasattr(user, 'tenant_id') and user.tenant_id else 'MISSING!'}")
    
    # If user has no tenant_id, try to find or create one
    if not hasattr(user, 'tenant_id') or not user.tenant_id:
        print(f"  ⚠️  User {user.username} has no tenant_id!")
        
        # Try to find a tenant by company name
        if hasattr(user, 'company_name') and user.company_name:
            tenant = Tenant.objects.filter(name=user.company_name).first()
            if tenant:
                print(f"  ✅ Found existing tenant: {tenant.name} ({tenant.id})")
                user.tenant_id = tenant.id
                user.save()
                print(f"  ✅ Updated user {user.username} with tenant_id: {tenant.id}")
            else:
                # Create new tenant
                tenant = Tenant.objects.create(name=user.company_name)
                print(f"  ✅ Created new tenant: {tenant.name} ({tenant.id})")
                user.tenant_id = tenant.id
                user.save()
                print(f"  ✅ Updated user {user.username} with tenant_id: {tenant.id}")
        else:
            print(f"  ❌ Cannot fix: User has no company_name")
    else:
        print(f"  ✅ Tenant ID is set")
    
    print()

print(f"\n{'='*60}")
print("Done! All users checked.")
print(f"{'='*60}\n")
