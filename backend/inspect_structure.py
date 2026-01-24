
import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def inspect_db():
    with connection.cursor() as cursor:
        print("--- TABLES ---")
        cursor.execute("SHOW TABLES")
        tables = [row[0] for row in cursor.fetchall()]
        print(tables)
        
        if 'django_content_type' in tables:
            print("\n--- CONTENT TYPE COLUMNS ---")
            cursor.execute("DESCRIBE django_content_type")
            for row in cursor.fetchall():
                print(row)

if __name__ == "__main__":
    inspect_db()
