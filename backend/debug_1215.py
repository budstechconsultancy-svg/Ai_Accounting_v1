
import os
import django
import traceback

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from core.models import User

try:
    print("Attempting to create user...")
    User.objects.create(username='testdebug', password='password', tenant_id='uuid_debug')
    print("User created!")
except Exception:
    with open("debug_output.txt", "w") as f:
        traceback.print_exc(file=f)
    print("Traceback written to debug_output.txt")
