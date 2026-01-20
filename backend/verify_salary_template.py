import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def check_salary_template_schema():
    table_name = 'payroll_salary_template'
    print(f"Checking schema for table: {table_name}")
    try:
        with connection.cursor() as cursor:
            cursor.execute(f"DESCRIBE {table_name};")
            rows = cursor.fetchall()
            print(f"{'Field':<20} {'Type':<15} {'Null':<5} {'Key':<5} {'Default':<10}")
            print("-" * 60)
            for row in rows:
                print(f"{row[0]:<20} {row[1]:<15} {row[2]:<5} {row[3]:<5} {str(row[4]):<10}")
    except Exception as e:
        print(f"Error checking table {table_name}: {e}")
        print("Table likely does not exist.")

if __name__ == "__main__":
    check_salary_template_schema()
