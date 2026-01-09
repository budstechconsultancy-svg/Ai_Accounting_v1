import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

print("🔧 Adding 'name' column to amount_transactions table\n")
print("=" * 80)

with connection.cursor() as cursor:
    try:
        # Check if column already exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'amount_transactions' 
            AND COLUMN_NAME = 'name'
        """)
        exists = cursor.fetchone()[0]
        
        if exists:
            print("ℹ️  Column 'name' already exists in amount_transactions table")
        else:
            print("📝 Adding 'name' column...")
            cursor.execute("""
                ALTER TABLE amount_transactions 
                ADD COLUMN name VARCHAR(255) NULL 
                AFTER ledger_id
            """)
            print("✅ Column 'name' added successfully!")
        
        # Show table structure
        print("\n📋 Current table structure:")
        cursor.execute("DESCRIBE amount_transactions")
        for row in cursor.fetchall():
            print(f"  {row[0]:<20} {row[1]:<20} {row[2]:<5}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "=" * 80)
print("\n✅ Done! The 'name' column is ready to store ledger names like 'bank2', 'bank3', etc.")
