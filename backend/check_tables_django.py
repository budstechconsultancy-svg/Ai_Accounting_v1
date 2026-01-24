import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def check_tables():
    tables_to_check = [
        'inventory_operation_jobwork',
        'inventory_operation_interunit',
        'inventory_operation_locationchange',
        'inventory_operation_production',
        'inventory_operation_consumption',
        'inventory_operation_scrap',
        'inventory_operation_outward'
    ]
    
    with connection.cursor() as cursor:
        # Get all table names
        cursor.execute("SHOW TABLES")
        existing_tables = [row[0] for row in cursor.fetchall()]
        
        print("Checking tables in database...")
        all_exist = True
        for table in tables_to_check:
            if table in existing_tables:
                print(f"[OK] {table} exists")
            else:
                print(f"[MISSING] {table} matches no table in DB")
                all_exist = False
        
        if all_exist:
            print("SUCCESS: All inventory operation tables exist.")
        else:
            print("FAILURE: Some tables are missing.")

if __name__ == '__main__':
    check_tables()
