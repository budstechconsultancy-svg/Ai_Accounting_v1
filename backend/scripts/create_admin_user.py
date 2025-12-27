import os
import django  # type: ignore
from django.conf import settings  # type: ignore

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Tenant  # type: ignore

# Clean up existing data first
try:
    User.objects.filter(username='budstecha').delete()
    Tenant.objects.filter(id='admin-tenant-001').delete()
except:
    pass

# Create admin tenant
admin_tenant = Tenant.objects.create(
    id='admin-tenant-001',
    name='Admin Tenant'
)

# Create admin user
admin_user = User.objects.create_user(
    username='budstech',
    password='123',
    company_name='Admin Company',
    selected_plan='Enterprise',
    tenant_id='admin-tenant-001',
    is_active=True
)

print("Admin user created successfully!")
print(f"Username: budstech")
print(f"Password: 123")
