
import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

def check_columns():
    with connection.cursor() as cursor:
        cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'answers' AND TABLE_SCHEMA = DATABASE();")
        columns = [row[0] for row in cursor.fetchall()]
        print(f"Columns in 'answers' table: {columns}")

if __name__ == "__main__":
    check_columns()
