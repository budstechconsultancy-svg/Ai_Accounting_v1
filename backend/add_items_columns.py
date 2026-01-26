import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

tables_to_update = [
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
    for table in tables_to_update:
        print(f"Checking {table}...")
        try:
            # Check if column exists
            cursor.execute(f"SHOW COLUMNS FROM {table} LIKE 'items';")
            if cursor.fetchone():
                print(f"  Column 'items' already exists in {table}.")
            else:
                print(f"  Adding 'items' column to {table}...")
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN `items` JSON DEFAULT NULL;")
                print(f"  [SUCCESS] Added column.")
        except Exception as e:
            print(f"  [ERROR] Could not update {table}: {e}")

print("Database update complete.")
