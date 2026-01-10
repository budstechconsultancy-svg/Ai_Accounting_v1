"""
Test direct registration to verify it saves to users table
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import RequestFactory
from core.direct_registration import DirectRegisterView
from core.models import User, Tenant

# Clean up test data first
print("Cleaning up any existing test data...")
User.objects.filter(username='test_registration_user').delete()
Tenant.objects.filter(name='Test Registration Company').delete()

print("\n" + "=" * 80)
print("TESTING DIRECT REGISTRATION")
print("=" * 80)

# Create a mock request
factory = RequestFactory()
request = factory.post('/api/auth/register/', {
    'username': 'test_registration_user',
    'password': 'testpassword123',
    'company_name': 'Test Registration Company',
    'selected_plan': 'Starter',
    'email': 'test@registration.com',
    'phone': '+1234567890'
})

# Call the registration view
view = DirectRegisterView()
response = view.post(request)

print("\nResponse Status:", response.status_code)
print("Response Data:", response.data)

# Check if user was created in database
print("\n" + "=" * 80)
print("CHECKING DATABASE")
print("=" * 80)

user_exists = User.objects.filter(username='test_registration_user').exists()
print(f"\nUser exists in database: {user_exists}")

if user_exists:
    user = User.objects.get(username='test_registration_user')
    print("\nUser Details:")
    print(f"  ID: {user.id}")
    print(f"  Username: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  Company Name: {user.company_name}")
    print(f"  Phone: {user.phone}")
    print(f"  Tenant ID: {user.tenant_id}")
    print(f"  Selected Plan: {user.selected_plan}")
    print(f"  Is Active: {user.is_active}")
    print(f"  Is Superuser: {user.is_superuser}")
    
    # Check tenant
    tenant_exists = Tenant.objects.filter(id=user.tenant_id).exists()
    print(f"\nTenant exists: {tenant_exists}")
    if tenant_exists:
        tenant = Tenant.objects.get(id=user.tenant_id)
        print(f"  Tenant Name: {tenant.name}")
    
    print("\n✅ SUCCESS! User was saved to the users table!")
else:
    print("\n❌ ERROR! User was NOT saved to the database!")
    print("\nLet me check what went wrong...")
    
# Clean up
print("\n" + "=" * 80)
print("Cleaning up test data...")
User.objects.filter(username='test_registration_user').delete()
Tenant.objects.filter(name='Test Registration Company').delete()
print("Done!")
