import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def check_table():
    table = 'payroll_employee_salary_structure'
    with connection.cursor() as cursor:
        cursor.execute(f"SHOW TABLES LIKE '{table}';")
        if cursor.fetchone():
            print(f"Table {table} EXISTS.")
        else:
            print(f"Table {table} DOES NOT EXIST.")

if __name__ == "__main__":
    check_table()
