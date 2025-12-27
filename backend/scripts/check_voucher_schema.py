"""
Check database schema for voucher tables
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def check_schema():
    """Check the schema of voucher tables"""
    
    print("\n" + "="*60)
    print("CHECKING VOUCHER TABLE SCHEMAS")
    print("="*60 + "\n")
    
    tables = ['voucher_sales', 'voucher_purchase', 'voucher_payment', 'voucher_receipt', 'voucher_contra', 'voucher_journal']
    
    with connection.cursor() as cursor:
        for table in tables:
            try:
                cursor.execute(f"SHOW TABLES LIKE '{table}'")
                if cursor.fetchone():
                    print(f"\n📋 Table: {table}")
                    cursor.execute(f"DESCRIBE {table}")
                    columns = cursor.fetchall()
                    for col in columns:
                        field_name = col[0]
                        field_type = col[1]
                        if 'tenant' in field_name.lower():
                            status = "❌" if 'int' in field_type.lower() else "✅"
                            print(f"  {status} {field_name:20} {field_type}")
                else:
                    print(f"⚠️  Table {table} does not exist")
            except Exception as e:
                print(f"❌ Error checking {table}: {e}")
    
    print("\n" + "="*60 + "\n")

if __name__ == '__main__':
    check_schema()
