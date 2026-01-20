import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def fix_salary_template_schema():
    table_name = 'payroll_salary_template'
    print(f"Checking/Fixing schema for table: {table_name}")
    
    # Check if table exists
    with connection.cursor() as cursor:
        cursor.execute(f"SHOW TABLES LIKE '{table_name}';")
        if not cursor.fetchone():
            print(f"Table {table_name} does not exist. Please run migration first.")
            return

        # Check if tenant_id column exists
        cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE 'tenant_id';")
        if not cursor.fetchone():
            print("Adding missing tenant_id column...")
            try:
                cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN tenant_id VARCHAR(36) NOT NULL DEFAULT 'default-tenant';")
                print("tenant_id column added successfully.")
            except Exception as e:
                print(f"Error adding column: {e}")
        else:
            print("tenant_id column already exists.")

if __name__ == "__main__":
    fix_salary_template_schema()
