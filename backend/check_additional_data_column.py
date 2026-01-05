"""
Check if additional_data column exists in master_ledgers table
"""

import os
import sys
import django
from pathlib import Path

# Setup Django
sys.path.append(str(Path(__file__).resolve().parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def check_master_ledgers_schema():
    """Check the master_ledgers table schema"""
    
    with connection.cursor() as cursor:
        # Get table schema
        cursor.execute("""
            DESCRIBE master_ledgers
        """)
        
        columns = cursor.fetchall()
        
        print("=" * 80)
        print("MASTER_LEDGERS TABLE SCHEMA")
        print("=" * 80)
        print(f"{'Field':<30} {'Type':<20} {'Null':<8} {'Key':<8} {'Default':<15}")
        print("-" * 80)
        
        has_additional_data = False
        for col in columns:
            field, type_, null, key, default, extra = col
            print(f"{field:<30} {type_:<20} {null:<8} {key:<8} {str(default):<15}")
            if field == 'additional_data':
                has_additional_data = True
        
        print("=" * 80)
        
        if has_additional_data:
            print("\n✅ additional_data column EXISTS in master_ledgers table")
        else:
            print("\n❌ additional_data column DOES NOT EXIST in master_ledgers table")
            print("   You need to run a migration to add this column!")
        
        # Check if there are any ledgers with additional_data
        if has_additional_data:
            cursor.execute("""
                SELECT COUNT(*) FROM master_ledgers WHERE additional_data IS NOT NULL
            """)
            count = cursor.fetchone()[0]
            print(f"\n📊 Ledgers with additional_data: {count}")
            
            if count > 0:
                cursor.execute("""
                    SELECT id, name, additional_data 
                    FROM master_ledgers 
                    WHERE additional_data IS NOT NULL 
                    LIMIT 3
                """)
                print("\nSample ledgers with additional_data:")
                for row in cursor.fetchall():
                    print(f"  ID: {row[0]}, Name: {row[1]}, Data: {row[2][:100]}...")

if __name__ == '__main__':
    try:
        check_master_ledgers_schema()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
