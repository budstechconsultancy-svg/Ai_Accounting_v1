
import os
import glob
import shutil
import django
from django.db import connection

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def remove_migrations():
    print("Removing all migration files...")
    # List of apps to clean
    apps = [
        'accounting', 'core', 'inventory', 'payroll', 'services', 
        'vendors', 'login', 'registration', 'masters', 'reports', 
        'customerportal', 'settings'
    ]
    
    for app in apps:
        migration_dir = os.path.join(BASE_DIR, app, 'migrations')
        if os.path.exists(migration_dir):
            files = glob.glob(os.path.join(migration_dir, '*.py'))
            for f in files:
                if not f.endswith('__init__.py'):
                    print(f"Deleting {f}")
                    os.remove(f)
            
            # Remove pycache
            pycache = os.path.join(migration_dir, '__pycache__')
            if os.path.exists(pycache):
                shutil.rmtree(pycache)
                
    print("Migration files removed.")

def reset_django_migrations_table():
    print("Truncating django_migrations table...")
    with connection.cursor() as cursor:
        try:
            cursor.execute("TRUNCATE TABLE django_migrations;")
            print("django_migrations table truncated.")
        except Exception as e:
            print(f"Error truncating django_migrations: {e}")

def apply_schema_sql():
    print("Applying schema.sql...")
    schema_path = os.path.join(os.path.dirname(BASE_DIR), 'schema.sql')
    if not os.path.exists(schema_path):
        print(f"schema.sql not found at {schema_path}")
        return

    # Read schema.sql
    try:
        # Try different encodings
        try:
            with open(schema_path, 'r', encoding='utf-8') as f:
                sql_content = f.read()
        except UnicodeDecodeError:
             with open(schema_path, 'r', encoding='utf-16') as f:
                sql_content = f.read()
                
        statements = sql_content.split(';')
        
        with connection.cursor() as cursor:
            # Disable foreign key checks to allow arbitrary ordering
            cursor.execute("SET FOREIGN_KEY_CHECKS=0;")
            
            for statement in statements:
                if statement.strip():
                    try:
                        # Attempt to run. 
                        # Note: schema.sql often has CREATE TABLE which fails if exists.
                        # We change CREATE TABLE to CREATE TABLE IF NOT EXISTS via regex or python replace for safety
                        # OR we just let it fail providing the table exists.
                        
                        # Just executing as is. If user wants a reset, we should have dropped tables?
                        # The user said "use only the tables in the schema.sql".
                        # Assuming this means "Structure the DB according to this".
                        # If tables exist, errors will happen.
                        
                        # Let's try to inject IF NOT EXISTS if missing
                        stmt_lower = statement.lower().replace('\n', ' ')
                        if 'create table' in stmt_lower and 'if not exists' not in stmt_lower:
                            statement = statement.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS')
                            statement = statement.replace('create table', 'CREATE TABLE IF NOT EXISTS')
                            
                        cursor.execute(statement)
                    except Exception as e:
                        # Ignore "Table exists" errors if we failed to patch it, or just print warning
                        if "already exists" not in str(e) and "1050" not in str(e):
                            print(f"Error executing statement: {e}")
                            
            cursor.execute("SET FOREIGN_KEY_CHECKS=1;")
            
        print("schema.sql applied.")
    except Exception as e:
        print(f"Failed to read/apply schema.sql: {e}")

if __name__ == '__main__':
    remove_migrations()
    reset_django_migrations_table()
    apply_schema_sql()
