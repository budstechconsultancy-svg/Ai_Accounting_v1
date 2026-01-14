import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()
cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'master_hierarchy_raw' AND TABLE_SCHEMA = DATABASE()")
cols = cursor.fetchall()
print("Columns in master_hierarchy_raw table:")
for col in cols:
    print(f"  - {col[0]}")
