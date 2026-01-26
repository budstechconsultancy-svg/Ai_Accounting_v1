import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

with connection.cursor() as cursor:
    tables = connection.introspection.table_names()
    print("Tables found:", tables)
    
    if 'inventory_operation_grn' in tables:
        print("\ninventory_operation_grn EXISTS")
    else:
        print("\ninventory_operation_grn DOES NOT EXIST")

    if 'inventory_operation_new_grn' in tables:
        print("inventory_operation_new_grn EXISTS")
    else:
        print("inventory_operation_new_grn DOES NOT EXIST")
