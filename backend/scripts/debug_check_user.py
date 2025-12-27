import os
import django
import sys

# Setup Django environment
sys.path.append('c:/108/django v3/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import TenantUser

print("Checking Tenant User 'f':")
try:
    u = TenantUser.objects.get(username='f')
    print(f"Username: {u.username}")
    print(f"Active: {u.is_active}")
    print(f"Password Hash: {u.password}")
    
    # Test check_password
    is_valid = u.check_password('f') # Assuming password is same as username
    print(f"check_password('f'): {is_valid}")
    
    is_valid_dots = u.check_password('...') # Maybe password was ...
    print(f"check_password('...'): {is_valid_dots}")

except TenantUser.DoesNotExist:
    print("'f' not found.")
