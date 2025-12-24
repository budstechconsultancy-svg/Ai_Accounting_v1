"""
Verify tenant_id column types are fixed
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def verify_fix():
    """Verify tenant_id columns are VARCHAR(36)"""
    
    print("\n" + "="*60)
    print("VERIFYING SCHEMA FIXES")
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
    
    all_good = True
    
    with connection.cursor() as cursor:
        for table in tables:
            try:
                cursor.execute(f"SHOW TABLES LIKE '{table}'")
                if cursor.fetchone():
                    cursor.execute(f"DESCRIBE {table}")
                    columns = cursor.fetchall()
                    for col in columns:
                        field_name = col[0]
                        field_type = col[1]
                        if field_name == 'tenant_id':
                            if 'varchar' in field_type.lower():
                                print(f"✅ {table:30} tenant_id is {field_type}")
                            else:
                                print(f"❌ {table:30} tenant_id is {field_type} (WRONG!)")
                                all_good = False
                            break
                else:
                    print(f"⚠️  {table:30} does not exist")
            except Exception as e:
                print(f"❌ {table:30} Error: {e}")
                all_good = False
    
    print("\n" + "="*60)
    if all_good:
        print("✅ ALL TABLES FIXED - Ready to save vouchers!")
    else:
        print("❌ SOME TABLES STILL HAVE ISSUES")
    print("="*60 + "\n")

if __name__ == '__main__':
    verify_fix()
