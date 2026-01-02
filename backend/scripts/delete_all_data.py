"""
Database Data Cleanup Script
Deletes all data from application tables while preserving schema.
Keeps Django system tables intact.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def delete_all_data():
    """Delete all data from application tables"""
    
    print("\n" + "="*60)
    print("DATABASE DATA CLEANUP")
    print("="*60 + "\n")
    
    # Tables to clear (in order to respect foreign key constraints)
    tables_to_clear = [
        # Clear dependent tables first
        'journal_entries',
        'vouchers',
        'inventory',
        'masters',
        'company_informations',
        'company_information',
        'company_details',
        'tenant_users',
        'users',
        'tenants',
        'pending_registrations',
    ]
    
    with connection.cursor() as cursor:
        # Disable foreign key checks temporarily
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        
        for table in tables_to_clear:
            try:
                # Check if table exists
                cursor.execute(f"SHOW TABLES LIKE '{table}'")
                if cursor.fetchone():
                    # Delete all data
                    cursor.execute(f"DELETE FROM {table}")
                    deleted_count = cursor.rowcount
                    
                    # Reset auto-increment
                    cursor.execute(f"ALTER TABLE {table} AUTO_INCREMENT = 1")
                    
                    print(f"✅ Cleared {table}: {deleted_count} rows deleted")
                else:
                    print(f"⚠️  Table {table} does not exist")
            except Exception as e:
                print(f"❌ Error clearing {table}: {e}")
        
        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    
    print("\n" + "="*60)
    print("DATABASE CLEANUP COMPLETE")
    print("="*60 + "\n")
    print("All application data has been deleted.")
    print("Database schema and Django system tables are intact.")
    print("\n")

if __name__ == '__main__':
    # Confirm before running
    print("\n⚠️  WARNING: This will delete ALL data from the database!")
    print("Schema and tables will be preserved.\n")
    
    response = input("Type 'DELETE' to confirm: ")
    if response == 'DELETE':
        delete_all_data()
    else:
        print("❌ Cleanup cancelled.")
