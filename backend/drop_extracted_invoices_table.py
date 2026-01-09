import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

# Check if table exists and drop it
with connection.cursor() as cursor:
    # Check if table exists
    cursor.execute("SHOW TABLES LIKE 'extracted_invoices'")
    result = cursor.fetchone()
    
    if result:
        print("📋 Table 'extracted_invoices' found. Dropping...")
        try:
            cursor.execute("DROP TABLE IF EXISTS `extracted_invoices`")
            print("✅ Table 'extracted_invoices' has been successfully removed!")
        except Exception as e:
            print(f"❌ Error dropping table: {e}")
    else:
        print("ℹ️  Table 'extracted_invoices' does not exist in the database")
