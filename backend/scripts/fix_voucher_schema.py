"""
Fix voucher table schema - ALTER tenant_id to VARCHAR(36)
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def fix_tenant_id_columns():
    """Fix tenant_id columns in all voucher tables"""
    
    print("\n" + "="*60)
    print("FIXING VOUCHER TABLE SCHEMAS")
    print("="*60 + "\n")
    
    tables = [
        'voucher_sales',
        'voucher_purchase', 
        'voucher_payment',
        'voucher_receipt',
        'voucher_contra',
        'voucher_journal',
        'master_ledger_groups',
        'master_ledgers',
        'master_voucher_config',
        'journal_entries'
    ]
    
    with connection.cursor() as cursor:
        for table in tables:
            try:
                # Check if table exists
                cursor.execute(f"SHOW TABLES LIKE '{table}'")
                if cursor.execute(f"SHOW TABLES LIKE '{table}'"):
                    # Alter tenant_id column to VARCHAR(36)
                    print(f"Fixing {table}...")
                    cursor.execute(f"""
                        ALTER TABLE {table} 
                        MODIFY COLUMN tenant_id VARCHAR(36) NOT NULL
                    """)
                    print(f"✅ Fixed {table}")
                else:
                    print(f"⚠️  Table {table} does not exist")
            except Exception as e:
                print(f"❌ Error fixing {table}: {e}")
    
    print("\n" + "="*60)
    print("SCHEMA FIX COMPLETE")
    print("="*60 + "\n")

if __name__ == '__main__':
    print("\n⚠️  WARNING: This will ALTER database table schemas!")
    print("This will change tenant_id columns from INT to VARCHAR(36)\n")
    
    response = input("Type 'FIX' to confirm: ")
    if response == 'FIX':
        fix_tenant_id_columns()
    else:
        print("❌ Schema fix cancelled.")
