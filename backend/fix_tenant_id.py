
import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

def fix_tenant_id():
    with connection.cursor() as cursor:
        try:
            # Change tenant_id from INT to VARCHAR to handle UUIDs
            cursor.execute("ALTER TABLE answers MODIFY COLUMN tenant_id VARCHAR(36);")
            print("Successfully changed tenant_id to VARCHAR(36)")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    fix_tenant_id()
