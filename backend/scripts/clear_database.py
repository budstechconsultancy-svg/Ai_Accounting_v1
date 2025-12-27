"""
Database Cleanup Script
Clears all data from the database while preserving schema
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model

User = get_user_model()

def clear_all_data():
    """Clear all data from all tables"""
    
    print("🗑️  Clearing Database Data...")
    print("=" * 50)
    
    # Get all table names
    with connection.cursor() as cursor:
        # Disable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        
        # Get all tables
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()
        
        deleted_count = 0
        for table in tables:
            table_name = table[0]
            
            # Skip Django internal tables
            if table_name.startswith('django_') or table_name == 'auth_permission':
                continue
            
            try:
                cursor.execute(f"TRUNCATE TABLE `{table_name}`;")
                print(f"✓ Cleared: {table_name}")
                deleted_count += 1
            except Exception as e:
                print(f"✗ Error clearing {table_name}: {e}")
        
        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
    
    print("=" * 50)
    print(f"✅ Cleared {deleted_count} tables")
    print("")
    print("Database is now empty (schema preserved)")
    print("You can create new users with: python manage.py createsuperuser")

if __name__ == "__main__":
    # Confirm before clearing
    print("⚠️  WARNING: This will delete ALL data from the database!")
    print("   (Database schema will be preserved)")
    print("")
    confirm = input("Are you sure? Type 'yes' to continue: ")
    
    if confirm.lower() == 'yes':
        clear_all_data()
    else:
        print("❌ Cancelled. No data was deleted.")
