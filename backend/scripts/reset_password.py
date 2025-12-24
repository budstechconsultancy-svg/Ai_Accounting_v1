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
    u.set_password('f')
    u.save()
    print("Successfully reset password for 'f' to 'f'")
except TenantUser.DoesNotExist:
    print("'f' not found.")
