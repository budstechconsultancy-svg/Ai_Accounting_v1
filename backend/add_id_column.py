
import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

def add_id_column():
    with connection.cursor() as cursor:
        try:
            # Add id column as auto-increment primary key
            cursor.execute("ALTER TABLE answers ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;")
            print("Successfully added id column to answers table")
        except Exception as e:
            print(f"Error adding id column: {e}")

if __name__ == "__main__":
    add_id_column()
