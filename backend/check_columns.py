import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

tables = [
    'inventory_operation_jobwork',
    'inventory_operation_interunit',
    'inventory_operation_locationchange',
    'inventory_operation_production',
    'inventory_operation_consumption',
    'inventory_operation_scrap',
    'inventory_operation_grn',
    'inventory_operation_outward',
    'inventory_operation_new_grn'
]

with connection.cursor() as cursor:
    for table in tables:
        print(f"\nChecking {table}:")
        try:
            cursor.execute(f"DESCRIBE {table};")
            columns = [row[0] for row in cursor.fetchall()]
            if 'items' in columns:
                print(f"  [OK] 'items' column found.")
            else:
                print(f"  [MISSING] 'items' column missing!")
        except Exception as e:
            print(f"  Error checking table: {e}")
