import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

print("🔧 Updating amount_transactions table schema\n")
print("=" * 80)

with connection.cursor() as cursor:
    try:
        # 1. Rename 'name' column to 'ledger_name'
        print("1️⃣ Renaming 'name' to 'ledger_name'...")
        cursor.execute("""
            ALTER TABLE amount_transactions 
            CHANGE COLUMN name ledger_name VARCHAR(255) NULL 
            COMMENT 'Ledger name (e.g., bank2, Cash, HDFC Bank)'
        """)
        print("   ✅ Column renamed successfully!")
        
    except Exception as e:
        if "Unknown column" in str(e):
            print(f"   ℹ️  Column 'name' doesn't exist (already renamed or not created yet)")
        else:
            print(f"   ❌ Error renaming column: {e}")
    
    try:
        # 2. Drop 'sub_group_2' column
        print("\n2️⃣ Dropping 'sub_group_2' column...")
        cursor.execute("""
            ALTER TABLE amount_transactions 
            DROP COLUMN sub_group_2
        """)
        print("   ✅ Column dropped successfully!")
        
    except Exception as e:
        if "Can't DROP" in str(e) or "doesn't exist" in str(e):
            print(f"   ℹ️  Column 'sub_group_2' doesn't exist (already dropped)")
        else:
            print(f"   ❌ Error dropping column: {e}")

    # 3. Show final table structure
    print("\n📋 Final table structure:")
    cursor.execute("DESCRIBE amount_transactions")
    for row in cursor.fetchall():
        print(f"  {row[0]:<20} {row[1]:<20}")

print("\n" + "=" * 80)
print("✅ Schema update complete!")
