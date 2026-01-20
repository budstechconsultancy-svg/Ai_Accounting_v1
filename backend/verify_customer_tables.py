"""
Verify Customer Master Tables Creation
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def verify_tables():
    """Verify all customer master tables exist in the database"""
    
    with connection.cursor() as cursor:
        # Get all customer master tables
        cursor.execute("""
            SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME LIKE 'customer_master_customer_%'
            ORDER BY TABLE_NAME
        """)
        
        tables = cursor.fetchall()
        
        print("=" * 80)
        print("CUSTOMER MASTER TABLES VERIFICATION")
        print("=" * 80)
        print(f"\nTotal tables found: {len(tables)}\n")
        
        print(f"{'Table Name':<45} {'Rows':<10} {'Created'}")
        print("-" * 80)
        
        for table_name, row_count, create_time in tables:
            print(f"{table_name:<45} {row_count:<10} {create_time}")
        
        print("\n" + "=" * 80)
        
        # Verify specific tables
        required_tables = [
            'customer_master_customer_basicdetails',
            'customer_master_customer_gstdetails',
            'customer_master_customer_productservice',
            'customer_master_customer_tds',
            'customer_master_customer_banking',
            'customer_master_customer_termscondition'
        ]
        
        existing_tables = [table[0] for table in tables]
        
        print("\nREQUIRED TABLES CHECK:")
        print("-" * 80)
        
        all_exist = True
        for table in required_tables:
            exists = table in existing_tables
            status = "✓ EXISTS" if exists else "✗ MISSING"
            print(f"{table:<45} {status}")
            if not exists:
                all_exist = False
        
        print("\n" + "=" * 80)
        
        if all_exist:
            print("\n✓ SUCCESS: All 6 required customer master tables exist!")
        else:
            print("\n✗ WARNING: Some required tables are missing!")
        
        print("=" * 80 + "\n")
        
        # Show table structures
        print("\nTABLE STRUCTURES:")
        print("=" * 80)
        
        for table in required_tables:
            if table in existing_tables:
                print(f"\n{table}:")
                print("-" * 80)
                cursor.execute(f"DESCRIBE {table}")
                columns = cursor.fetchall()
                
                print(f"{'Field':<30} {'Type':<20} {'Null':<6} {'Key':<6}")
                print("-" * 80)
                for col in columns[:10]:  # Show first 10 columns
                    field, type_, null, key = col[0], col[1], col[2], col[3]
                    print(f"{field:<30} {type_:<20} {null:<6} {key:<6}")
                
                if len(columns) > 10:
                    print(f"... and {len(columns) - 10} more columns")

if __name__ == '__main__':
    verify_tables()
