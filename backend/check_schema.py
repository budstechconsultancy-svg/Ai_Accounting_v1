
import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

def check_schema():
    with connection.cursor() as cursor:
        cursor.execute("DESCRIBE answers;")
        rows = cursor.fetchall()
        print("Current Schema for 'answers':")
        for row in rows:
            print(row)

if __name__ == "__main__":
    check_schema()
