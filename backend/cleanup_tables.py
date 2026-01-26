import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

tables_to_drop = [
    'inventory_operation_jobwork_items',
    'inventory_operation_interunit_items',
    'inventory_operation_locationchange_items',
    'inventory_operation_production_items',
    'inventory_operation_consumption_items',
    'inventory_operation_scrap_items',
    'inventory_operation_grn_items',
    'inventory_operation_outward_items',
    'inventory_operation_new_grn_items'
]

with connection.cursor() as cursor:
    existing_tables = connection.introspection.table_names()
    for table in tables_to_drop:
        if table in existing_tables:
            print(f"Dropping table: {table}")
            cursor.execute(f"DROP TABLE {table};")
        else:
            print(f"Table already gone: {table}")
            
print("Cleanup complete.")
