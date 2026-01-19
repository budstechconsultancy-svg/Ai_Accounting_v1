"""
Simple verification of customer tables
"""
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection
connection = pymysql.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD'),
    database=os.getenv('DB_NAME', 'ai_accounting')
)

try:
    with connection.cursor() as cursor:
        # Get all customer master tables
        cursor.execute("""
            SELECT TABLE_NAME, TABLE_ROWS
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = %s
            AND TABLE_NAME LIKE 'customer_master_customer_%%'
            ORDER BY TABLE_NAME
        """, (os.getenv('DB_NAME', 'ai_accounting'),))
        
        tables = cursor.fetchall()
        
        print("\n" + "=" * 80)
        print("CUSTOMER MASTER TABLES - VERIFICATION REPORT")
        print("=" * 80)
        print(f"\nDatabase: {os.getenv('DB_NAME', 'ai_accounting')}")
        print(f"Total tables found: {len(tables)}\n")
        
        print(f"{'#':<4} {'Table Name':<50} {'Rows':<10}")
        print("-" * 80)
        
        for idx, (table_name, row_count) in enumerate(tables, 1):
            print(f"{idx:<4} {table_name:<50} {row_count or 0:<10}")
        
        print("\n" + "=" * 80)
        
        # Check for required tables
        required_tables = [
            'customer_master_customer_basicdetails',
            'customer_master_customer_gstdetails',
            'customer_master_customer_productservice',
            'customer_master_customer_tds',
            'customer_master_customer_banking',
            'customer_master_customer_termscondition'
        ]
        
        existing_tables = [table[0] for table in tables]
        
        print("\nREQUIRED TABLES STATUS:")
        print("-" * 80)
        
        all_exist = True
        for idx, table in enumerate(required_tables, 1):
            exists = table in existing_tables
            status = "✓ EXISTS" if exists else "✗ MISSING"
            print(f"{idx}. {table:<50} {status}")
            if not exists:
                all_exist = False
        
        print("\n" + "=" * 80)
        
        if all_exist:
            print("\n✓ SUCCESS: All 6 required customer master tables have been created!")
            print("\nYou can now use these tables to store customer data:")
            print("  1. Basic Details")
            print("  2. GST Details")
            print("  3. Products/Services")
            print("  4. TDS & Statutory Details")
            print("  5. Banking Information")
            print("  6. Terms & Conditions")
        else:
            print("\n✗ WARNING: Some required tables are missing!")
        
        print("\n" + "=" * 80 + "\n")

finally:
    connection.close()
