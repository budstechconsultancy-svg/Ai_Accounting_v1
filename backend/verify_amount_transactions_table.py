import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

# Verify table exists and show structure
with connection.cursor() as cursor:
    cursor.execute("SHOW TABLES LIKE 'amount_transactions'")
    result = cursor.fetchone()
    
    if result:
        print("✅ Table 'amount_transactions' exists!")
        print("\nTable structure:")
        cursor.execute("DESCRIBE amount_transactions")
        for row in cursor.fetchall():
            print(f"  {row[0]:<20} {row[1]:<20} {row[2]:<5} {row[3]:<5}")
        
        print("\nIndexes:")
        cursor.execute("SHOW INDEX FROM amount_transactions")
        for row in cursor.fetchall():
            print(f"  {row[2]:<40} on column: {row[4]}")
    else:
        print("❌ Table 'amount_transactions' does not exist")
