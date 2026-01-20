import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def check_and_fix_tables():
    tables_to_check = [
        'payroll_employee_basic_details',
        'payroll_employee_employment',
        'payroll_employee_salary',
        'payroll_employee_statutory',
        'payroll_employee_bank_details'
    ]

    with connection.cursor() as cursor:
        print("Checking tables for 'tenant_id' column...")
        for table in tables_to_check:
            print(f"\nChecking table: {table}")
            try:
                cursor.execute(f"DESCRIBE {table};")
                rows = cursor.fetchall()
                found = False
                for row in rows:
                    if row[0] == 'tenant_id':
                        found = True
                        break
                
                if found:
                    print(f"  [OK] 'tenant_id' exists in {table}.")
                else:
                    print(f"  [MISSING] 'tenant_id' NOT FOUND in {table}.")
                    print(f"  Attempting to add 'tenant_id' to {table}...")
                    try:
                        # Add as nullable first to be safe with existing data
                        cursor.execute(f"ALTER TABLE {table} ADD COLUMN tenant_id VARCHAR(36) NULL;")
                        print(f"  [SUCCESS] Added 'tenant_id' to {table}.")
                    except Exception as e:
                        print(f"  [ERROR] Failed to add column: {e}")

            except Exception as e:
                print(f"  [ERROR] Could not check table {table}: {e}")

if __name__ == "__main__":
    check_and_fix_tables()
