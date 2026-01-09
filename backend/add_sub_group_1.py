import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

print("🔧 Adding sub_group_1 column to amount_transactions table\n")
print("=" * 80)

with connection.cursor() as cursor:
    try:
        # Check if column already exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'amount_transactions' 
            AND COLUMN_NAME = 'sub_group_1'
        """)
        exists = cursor.fetchone()[0]
        
        if exists:
            print("ℹ️  Column 'sub_group_1' already exists")
        else:
            print("📝 Adding 'sub_group_1' column...")
            cursor.execute("""
                ALTER TABLE amount_transactions 
                ADD COLUMN sub_group_1 VARCHAR(255) NULL 
                AFTER name
            """)
            print("✅ Column 'sub_group_1' added successfully!")
        
        # Show table structure
        print("\n📋 Current table structure:")
        cursor.execute("DESCRIBE amount_transactions")
        for row in cursor.fetchall():
            print(f"  {row[0]:<20} {row[1]:<20}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "=" * 80)
print("\n✅ Done! The table now has:")
print("  - name: Ledger name")
print("  - sub_group_1: Parent category (Current Assets, etc.)")
print("  - sub_group_2: Cash or Bank")
print("  - code: Ledger code")
