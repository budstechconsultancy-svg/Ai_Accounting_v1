import os
import django
import sys

# Setup Django environment
sys.path.append('c:/108/django v3/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import TenantUser

try:
    u = TenantUser.objects.get(username='f')
    print(f"User: {u.username}")
    
    # Verify 'f'
    is_valid = u.check_password('f')
    print(f"check_password('f'): {is_valid}")
    
    if is_valid:
        print("Password check PASSED.")
    else:
        print("Password check FAILED.")
        # Try resetting again using set_password explicitly
        print("Attempting reset again...")
        u.set_password('f')
        u.save()
        print("Reset done. Re-checking...")
        print(f"check_password('f') (retry): {u.check_password('f')}")

except TenantUser.DoesNotExist:
    print("'f' not found.")
