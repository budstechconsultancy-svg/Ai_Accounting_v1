import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

tables = connection.introspection.table_names()
print("Tables found:", tables)

with connection.cursor() as cursor:
    cursor.execute("DESCRIBE inventory_operation_jobwork;")
    print("\nColumns in inventory_operation_jobwork:")
    for row in cursor.fetchall():
        print(row)

    print("\nChecking for items table:")
    if 'inventory_operation_jobwork_items' in tables:
        print("inventory_operation_jobwork_items EXISTS")
    else:
        print("inventory_operation_jobwork_items DOES NOT EXIST")
