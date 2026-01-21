import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def update_vendor_gst_schema():
    with connection.cursor() as cursor:
        try:
            # Check if columns exist to avoid errors
            cursor.execute("DESCRIBE vendor_master_gstdetails")
            columns = [col[0] for col in cursor.fetchall()]
            
            alter_statements = []
            
            if 'reference_name' not in columns:
                alter_statements.append("ADD COLUMN reference_name varchar(200) DEFAULT NULL")
            
            if 'branch_address' not in columns:
                alter_statements.append("ADD COLUMN branch_address longtext")
                
            if 'branch_contact_person' not in columns:
                alter_statements.append("ADD COLUMN branch_contact_person varchar(100) DEFAULT NULL")
                
            if 'branch_email' not in columns:
                alter_statements.append("ADD COLUMN branch_email varchar(255) DEFAULT NULL")
                
            if 'branch_contact_no' not in columns:
                alter_statements.append("ADD COLUMN branch_contact_no varchar(20) DEFAULT NULL")
            
            if alter_statements:
                sql = f"ALTER TABLE vendor_master_gstdetails {', '.join(alter_statements)};"
                print(f"Executing: {sql}")
                cursor.execute(sql)
                print("Successfully added columns to vendor_master_gstdetails")
            else:
                print("Columns already exist in vendor_master_gstdetails")
                
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    update_vendor_gst_schema()
