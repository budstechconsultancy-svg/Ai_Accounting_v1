import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def check_pay_run_table():
    table = 'payroll_pay_run'
    print(f"Checking table: {table}")
    with connection.cursor() as cursor:
        try:
            cursor.execute(f"DESCRIBE {table};")
            rows = cursor.fetchall()
            print(f"Table '{table}' exists.")
            
            columns = [row[0] for row in rows]
            print(f"Columns: {columns}")
            
            required_fields = ['pay_period', 'start_date', 'end_date', 'tenant_id']
            missing = [field for field in required_fields if field not in columns]
            
            if not missing:
                print("\n[SUCCESS] All required fields (Pay Period, Start Date, End Date, Tenant ID) are PRESENT.")
            else:
                print(f"\n[FAILURE] Missing columns: {missing}")
                
        except Exception as e:
            print(f"\n[ERROR] Table '{table}' does NOT exist or error: {e}")

if __name__ == "__main__":
    check_pay_run_table()
