import os
import django
import sys

sys.path.append('c:/108/django v3/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Role

print("Checking for Owner users...")
owners = User.objects.filter(roles__name='OWNER')
print(f"Found {owners.count()} owners")

for owner in owners:
    print(f"\nOwner: {owner.username}")
    print(f"  Tenant: {owner.tenant_id}")
    print(f"  Email: {owner.email}")
    print(f"  Company: {owner.company_name}")
    print(f"  Active: {owner.is_active}")
    roles = owner.roles.all()
    print(f"  Roles: {', '.join([r.name for r in roles])}")
