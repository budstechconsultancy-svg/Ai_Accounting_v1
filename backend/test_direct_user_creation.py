"""
Simpler test - just check if we can create a user directly
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Tenant
from django.contrib.auth.hashers import make_password
import uuid

print("=" * 80)
print("DIRECT USER CREATION TEST")
print("=" * 80)

# Clean up
User.objects.filter(username='direct_test_user').delete()
Tenant.objects.filter(name='Direct Test Company').delete()

# Create tenant
tenant_uuid = str(uuid.uuid4())
tenant = Tenant.objects.create(id=tenant_uuid, name='Direct Test Company')
print(f"\n✅ Tenant created: {tenant.id}")

# Create user
password_hash = make_password('testpass123')
user = User.objects.create(
    username='direct_test_user',
    email='direct@test.com',
    password=password_hash,
    company_name='Direct Test Company',
    phone='+1234567890',
    phone_verified=True,
    selected_plan='Starter',
    tenant_id=tenant_uuid,
    is_active=True,
    is_superuser=True,
    is_staff=True
)

print(f"✅ User created: ID={user.id}, Username={user.username}")

# Verify
user_exists = User.objects.filter(id=user.id).exists()
print(f"\n🔍 User exists in database: {user_exists}")

if user_exists:
    print("\n✅ SUCCESS! Direct user creation works!")
else:
    print("\n❌ ERROR! User not found after creation!")

# Clean up
User.objects.filter(username='direct_test_user').delete()
Tenant.objects.filter(name='Direct Test Company').delete()
print("\nCleaned up test data.")
