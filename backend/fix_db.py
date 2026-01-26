import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

tables_to_ensure = [
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
    for table in tables_to_ensure:
        if table not in existing_tables:
            print(f"Creating dummy table: {table}")
            cursor.execute(f"CREATE TABLE {table} (id INT PRIMARY KEY AUTO_INCREMENT);")
        else:
            print(f"Table exists: {table}")
            
print("DB fixup complete.")
