import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

print("🔧 Adding sub_group_2 and code columns to amount_transactions table\n")
print("=" * 80)

with connection.cursor() as cursor:
    try:
        # Add sub_group_2 column
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'amount_transactions' 
            AND COLUMN_NAME = 'sub_group_2'
        """)
        exists_sub_group = cursor.fetchone()[0]
        
        if not exists_sub_group:
            print("📝 Adding 'sub_group_2' column...")
            cursor.execute("""
                ALTER TABLE amount_transactions 
                ADD COLUMN sub_group_2 VARCHAR(255) NULL 
                AFTER name
            """)
            print("✅ Column 'sub_group_2' added successfully!")
        else:
            print("ℹ️  Column 'sub_group_2' already exists")
        
        # Add code column
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'amount_transactions' 
            AND COLUMN_NAME = 'code'
        """)
        exists_code = cursor.fetchone()[0]
        
        if not exists_code:
            print("📝 Adding 'code' column...")
            cursor.execute("""
                ALTER TABLE amount_transactions 
                ADD COLUMN code VARCHAR(50) NULL 
                AFTER sub_group_2
            """)
            print("✅ Column 'code' added successfully!")
        else:
            print("ℹ️  Column 'code' already exists")
        
        # Show table structure
        print("\n📋 Current table structure:")
        cursor.execute("DESCRIBE amount_transactions")
        for row in cursor.fetchall():
            print(f"  {row[0]:<20} {row[1]:<20} {row[2]:<5}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "=" * 80)
print("\n✅ Done! The table now has:")
print("  - name: Ledger name (bank2, bank3, Cash, etc.)")
print("  - sub_group_2: Cash or Bank")
print("  - code: Ledger code from master_ledgers")
