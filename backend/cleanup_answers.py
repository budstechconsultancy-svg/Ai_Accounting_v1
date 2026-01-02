
import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

def cleanup_schema():
    with connection.cursor() as cursor:
        # First drop foreign key constraints
        constraints = ['answers_ibfk_1', 'answers_ibfk_2']
        for constraint in constraints:
            try:
                cursor.execute(f"ALTER TABLE answers DROP FOREIGN KEY {constraint};")
                print(f"Dropped constraint: {constraint}")
            except Exception as e:
                print(f"Could not drop constraint {constraint}: {e}")
        
        # Now drop the columns
        columns_to_drop = ['ledger_id', 'created_at', 'question_id']
        
        for col in columns_to_drop:
            try:
                cursor.execute(f"ALTER TABLE answers DROP COLUMN {col};")
                print(f"Dropped column: {col}")
            except Exception as e:
                print(f"Could not drop {col}: {e}")

if __name__ == "__main__":
    cleanup_schema()
