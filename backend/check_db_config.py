"""
Check if there's an autocommit issue
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
from django.db import connection

print("=" * 80)
print("DATABASE CONFIGURATION CHECK")
print("=" * 80)

print(f"\nDatabase Engine: {settings.DATABASES['default']['ENGINE']}")
print(f"Database Name: {settings.DATABASES['default']['NAME']}")
print(f"Autocommit: {connection.get_autocommit()}")
print(f"In atomic block: {connection.in_atomic_block}")

# Check if there are any active transactions
print(f"\nConnection settings:")
print(f"  Isolation level: {connection.isolation_level if hasattr(connection, 'isolation_level') else 'N/A'}")

# Try to see transaction status
try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT @@autocommit")
        result = cursor.fetchone()
        print(f"  MySQL autocommit: {result[0]}")
except Exception as e:
    print(f"  Could not check autocommit: {e}")
