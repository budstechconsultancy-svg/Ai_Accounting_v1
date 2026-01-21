import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def drop_table():
    table = 'payroll_employee_salary_structure'
    print(f"Dropping table {table}...")
    with connection.cursor() as cursor:
        cursor.execute(f"DROP TABLE IF EXISTS {table};")
        print("Table dropped successfully.")

if __name__ == "__main__":
    drop_table()
