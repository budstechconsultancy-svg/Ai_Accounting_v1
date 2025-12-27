import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

# Check the table structure
with connection.cursor() as cursor:
    cursor.execute("DESCRIBE master_hierarchy_raw;")
    columns = cursor.fetchall()
    print("Table structure for master_hierarchy_raw:")
    print(f"{'Column':<30} {'Type':<20} {'Null':<5} {'Key':<5}")
    print("-" * 65)
    for col in columns:
        print(f"{col[0]:<30} {col[1]:<20} {col[2]:<5} {col[3]:<5}")
