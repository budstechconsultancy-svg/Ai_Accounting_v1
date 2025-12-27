import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def fix_timestamp_defaults():
    tables_to_fix = [
        'tenants',
        'users',
        'tenant_users',
        'company_informations',
        'master_ledger_groups',
        'master_ledgers',
        'master_voucher_config',
        'vouchers',
        'journal_entries'
    ]
    
    with connection.cursor() as cursor:
        for table in tables_to_fix:
            print(f"Checking table: {table}...")
            try:
                # Check if updated_at exists
                cursor.execute(f"SHOW COLUMNS FROM `{table}` LIKE 'updated_at'")
                column = cursor.fetchone()
                
                if column:
                    print(f"  Fixing updated_at for {table}...")
                    # MySQL 8.x syntax for auto-timestamp
                    sql = f"""
                    ALTER TABLE `{table}` 
                    MODIFY COLUMN `updated_at` DATETIME(6) NOT NULL 
                    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
                    """
                    cursor.execute(sql)
                    print(f"  ✅ {table}.updated_at updated successfully.")
                
                # Also fix created_at if it's missing a default
                cursor.execute(f"SHOW COLUMNS FROM `{table}` LIKE 'created_at'")
                column = cursor.fetchone()
                if column and column[4] is None: # column[4] is the default value
                    print(f"  Fixing created_at for {table}...")
                    sql = f"""
                    ALTER TABLE `{table}` 
                    MODIFY COLUMN `created_at` DATETIME(6) NOT NULL 
                    DEFAULT CURRENT_TIMESTAMP(6)
                    """
                    cursor.execute(sql)
                    print(f"  ✅ {table}.created_at updated successfully.")

                # Special fix for RBAC fields in users table
                if table == 'users':
                    for col in ['is_superuser', 'is_staff']:
                        cursor.execute(f"SHOW COLUMNS FROM `users` LIKE '{col}'")
                        column = cursor.fetchone()
                        if column:
                            print(f"  Fixing {col} for users...")
                            cursor.execute(f"ALTER TABLE `users` MODIFY COLUMN `{col}` TINYINT(1) NOT NULL DEFAULT 0")
                            print(f"  ✅ users.{col} updated with default 0.")
                    
            except Exception as e:
                print(f"  ❌ Error processing {table}: {e}")

if __name__ == "__main__":
    print("🚀 Starting timestamp default fix...")
    fix_timestamp_defaults()
    print("🏁 Finished.")
