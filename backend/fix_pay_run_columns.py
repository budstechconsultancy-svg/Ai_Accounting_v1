import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def fix_columns():
    table_name = 'payroll_pay_run'
    print(f"Fixing columns for table: {table_name}")
    
    # SQL commands to add missing columns
    commands = [
        "ALTER TABLE payroll_pay_run ADD COLUMN payment_date DATE NULL;",
        "ALTER TABLE payroll_pay_run ADD COLUMN total_employees INT NOT NULL DEFAULT 0;",
        "ALTER TABLE payroll_pay_run ADD COLUMN gross_pay DECIMAL(15, 2) NOT NULL DEFAULT 0.00;",
        "ALTER TABLE payroll_pay_run ADD COLUMN total_deductions DECIMAL(15, 2) NOT NULL DEFAULT 0.00;",
        "ALTER TABLE payroll_pay_run ADD COLUMN net_pay DECIMAL(15, 2) NOT NULL DEFAULT 0.00;",
        "ALTER TABLE payroll_pay_run ADD COLUMN processed_by VARCHAR(100) NULL;",
    ]
    
    with connection.cursor() as cursor:
        for cmd in commands:
            try:
                print(f"Executing: {cmd}")
                cursor.execute(cmd)
                print("Success.")
            except Exception as e:
                print(f"Error executing {cmd}: {e}")

if __name__ == "__main__":
    fix_columns()
