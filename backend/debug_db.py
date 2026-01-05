
import os
import django
import sys
from django.db import connection

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def debug_schema():
    print("Checking database schema...")
    with connection.cursor() as cursor:
        # Check master_ledgers columns
        cursor.execute("DESCRIBE master_ledgers;")
        columns = [row[0] for row in cursor.fetchall()]
        print(f"\nmaster_ledgers columns ({len(columns)}): {columns}")
        
        required = ['parent_ledger_id', 'additional_data', 'ledger_code']
        missing = [col for col in required if col not in columns]
        if missing:
            print(f"❌ MISSING COLUMNS in master_ledgers: {missing}")
        else:
            print("✅ All critical columns present in master_ledgers")
        
        # Check modules columns
        cursor.execute("DESCRIBE modules;")
        columns = [row[0] for row in cursor.fetchall()]
        print(f"\nmodules columns: {columns}")

if __name__ == '__main__':
    try:
        debug_schema()
        print("\n✅ Schema Check Complete")
    except Exception as e:
        print(f"\n❌ Schema Check Failed: {e}")
