import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

# Add id column to master_hierarchy_raw table
with connection.cursor() as cursor:
    try:
        print("Adding id column to master_hierarchy_raw table...")
        cursor.execute("""
            ALTER TABLE master_hierarchy_raw 
            ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;
        """)
        print("✅ Successfully added id column!")
    except Exception as e:
        if "Duplicate column name" in str(e):
            print("✅ id column already exists!")
        else:
            print(f"❌ Error: {e}")
