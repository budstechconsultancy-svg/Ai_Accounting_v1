import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

# Verify table is removed
with connection.cursor() as cursor:
    cursor.execute("SHOW TABLES LIKE 'extracted_invoices'")
    result = cursor.fetchone()
    
    if result:
        print("⚠️  Table 'extracted_invoices' still exists")
    else:
        print("✅ Confirmed: Table 'extracted_invoices' has been removed from the database")
        
    # Show all tables for reference
    print("\n📋 Current tables in database:")
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    for table in sorted(tables):
        print(f"  - {table[0]}")
