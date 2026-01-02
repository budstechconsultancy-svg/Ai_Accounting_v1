import os
import django
from django.db import connection
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

try:
    with connection.cursor() as cursor:
        cursor.execute("DESCRIBE master_ledgers")
        rows = cursor.fetchall()
        cols = [r[0] for r in rows]
        print(f"Columns: {cols}")
        if 'additional_data' in cols:
            print("additional_data column FOUND")
        else:
            print("additional_data column NOT FOUND")
        
        if 'code' in cols:
            print("'code' column FOUND")
        elif 'ledger_code' in cols:
            print("'ledger_code' column FOUND")
        else:
            print("code/ledger_code column NOT FOUND")
except Exception as e:
    print(f"Error: {e}")
