import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

print("Fixing vouchers table to add AUTO_INCREMENT to id column...")

with connection.cursor() as cursor:
    try:
        # Disable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS=0")
        print("Disabled foreign key checks")
        
        # Modify the id column to be AUTO_INCREMENT
        cursor.execute("""
            ALTER TABLE vouchers 
            MODIFY COLUMN id BIGINT AUTO_INCREMENT
        """)
        print("✓ Successfully added AUTO_INCREMENT to vouchers.id column")
        
        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS=1")
        print("Re-enabled foreign key checks")
    except Exception as e:
        print(f"✗ Error: {e}")
        # Re-enable foreign key checks even if there's an error
        try:
            cursor.execute("SET FOREIGN_KEY_CHECKS=1")
        except:
            pass
