
import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def run_schema():
    print("Applying Schema...")
    with open('backend/correct_schema.sql', 'r', encoding='utf-8') as f:
        sql = f.read()
    
    # Split by statement (;) but careful with triggers/procedures. 
    # This schema is simple enough.
    statements = sql.split(';')
    
    with connection.cursor() as cursor:
        for statement in statements:
            if statement.strip():
                try:
                    cursor.execute(statement)
                except Exception as e:
                    print(f"Warning executing statement: {e}")
                    # Continue - e.g. "index already exists"
        
        # Explicit Alter for Users login_status
        try:
            print("Adding login_status to users...")
            cursor.execute("ALTER TABLE users ADD COLUMN login_status VARCHAR(20) NOT NULL DEFAULT 'Offline';")
        except Exception as e:
            print(f"Skipping Add login_status (probably exists): {e}")

        # Drop index on vouchers if exists
        try:
            print("Dropping unique index on vouchers...")
            cursor.execute("DROP INDEX ux_vouchers_tenant_invoice ON vouchers;")
        except Exception as e:
            print(f"Skipping Drop Index: {e}")

    print("Schema applied.")

if __name__ == '__main__':
    run_schema()
