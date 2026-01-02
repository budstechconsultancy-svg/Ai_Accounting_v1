
import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

def update_schema():
    with connection.cursor() as cursor:
        # Add new columns
        try:
            cursor.execute("ALTER TABLE answers ADD COLUMN sub_group_1_1 VARCHAR(255) NULL;")
            print("Added sub_group_1_1")
        except Exception as e:
            print(f"sub_group_1_1 error: {e}")

        try:
            cursor.execute("ALTER TABLE answers ADD COLUMN sub_group_1_2 VARCHAR(255) NULL;")
            print("Added sub_group_1_2")
        except Exception as e:
            print(f"sub_group_1_2 error: {e}")

        try:
            cursor.execute("ALTER TABLE answers ADD COLUMN question TEXT NULL;")
            print("Added question")
        except Exception as e:
            print(f"question error: {e}")

        # Drop old columns (Audit)
        try:
            cursor.execute("ALTER TABLE answers DROP COLUMN question_code;")
            print("Dropped question_code")
        except Exception:
            pass
            
        try:
            cursor.execute("ALTER TABLE answers DROP COLUMN question_text;")
            print("Dropped question_text")
        except Exception:
            pass

if __name__ == "__main__":
    update_schema()
