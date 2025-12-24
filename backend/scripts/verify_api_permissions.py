import os
import django
import sys
# Moves imports down
# ...
# Setup Django environment
sys.path.append('c:/108/django v3/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework.test import APIClient
from core.models import TenantUser
from django.contrib.auth import get_user_model

User = get_user_model()
client = APIClient()

print("--- Checking All Owners (User table) ---")
owners = User.objects.all()
first_owner = None
for o in owners:
    print(f"Owner: {o.username} (ID: {o.id}) Active: {o.is_active}")
    first_owner = o

if first_owner:
    print(f"\n--- Verifying Owner Access for {first_owner.username} ---")
    client.force_authenticate(user=first_owner)
    url = f'/api/module-permissions/user/{first_owner.id}'
    response = client.get(url)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        codes = response.data.get('codes', [])
        print(f"Codes: {len(codes)}")
        # If Hardcoded logic works, should be > 0 (ALL modules)
        if len(codes) > 0:
            print("PASS: Owner has permissions.")
        else:
            print("FAIL: Owner has 0 permissions.")
    else:
        print(f"FAIL: Request failed {response.data}")
else:
    print("No Owners found in User table!")

print("\n--- Verifying Staff Access for 'f' ---")
try:
    staff = TenantUser.objects.get(username='f')
    client.force_authenticate(user=staff)
    url = f'/api/module-permissions/user/{staff.id}'
    response = client.get(url)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        codes = response.data.get('codes', [])
        print(f"Codes: {len(codes)}")
        if 'VOUCHERS_SALES' in codes:
            print("PASS: Staff has VOUCHERS_SALES.")
        else:
            print(f"FAIL: Staff missing permissions. Got: {codes}")
            
except TenantUser.DoesNotExist:
    print("'f' not found.")
