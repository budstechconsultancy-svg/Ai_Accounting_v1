import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def fix_users():
    from core.models import User
    users = User.objects.all()
    print(f"Found {users.count()} users.")
    for u in users:
        print(f"User: {u.username}, Active: {u.is_active}")
        if not u.is_active:
            print(f"Reactivating {u.username}...")
            u.is_active = True
            u.save()
            print("Done.")

if __name__ == '__main__':
    fix_users()
