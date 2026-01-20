import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def check_schema():
    table_name = 'payroll_pay_run'
    print(f"Checking schema for table: {table_name}")
    with connection.cursor() as cursor:
        cursor.execute(f"DESCRIBE {table_name};")
        rows = cursor.fetchall()
        print(f"{'Field':<20} {'Type':<15} {'Null':<5} {'Key':<5} {'Default':<10}")
        print("-" * 60)
        for row in rows:
            print(f"{row[0]:<20} {row[1]:<15} {row[2]:<5} {row[3]:<5} {str(row[4]):<10}")

if __name__ == "__main__":
    check_schema()
