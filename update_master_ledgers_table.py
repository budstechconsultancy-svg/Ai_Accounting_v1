import mysql.connector
import sys

# Database connection details
config = {
    'user': 'root',
    'password': 'Ulaganathan@2004',
    'host': 'localhost',
    'database': 'ai_accounting_db'
}

try:
    # Connect to database
    print("Connecting to database...")
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()
    
    # Drop existing table
    print("Dropping old master_ledgers table...")
    cursor.execute("DROP TABLE IF EXISTS master_ledgers")
    
    # Create new table
    print("Creating new master_ledgers table...")
    create_table_sql = """
    CREATE TABLE master_ledgers (
      id bigint NOT NULL AUTO_INCREMENT,
      tenant_id char(36) NOT NULL,
      name varchar(255) NOT NULL COMMENT 'Custom ledger name',
      
      category varchar(255) NOT NULL COMMENT 'From hierarchy: major_group_1',
      `group` varchar(255) NOT NULL COMMENT 'From hierarchy: group_1',
      sub_group_1 varchar(255) DEFAULT NULL COMMENT 'From hierarchy: sub_group_1_1',
      sub_group_2 varchar(255) DEFAULT NULL COMMENT 'From hierarchy: sub_group_2_1',
      sub_group_3 varchar(255) DEFAULT NULL COMMENT 'From hierarchy: sub_group_3_1',
      ledger_type varchar(255) DEFAULT NULL COMMENT 'From hierarchy: ledger_1',
      
      created_at datetime(6) NOT NULL,
      updated_at datetime(6) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY master_ledgers_name_tenant_unique (name, tenant_id),
      KEY master_ledgers_tenant_id_idx (tenant_id),
      KEY master_ledgers_category_idx (category),
      KEY master_ledgers_group_idx (`group`),
      CONSTRAINT master_ledgers_tenant_id_fk FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    """
    
    cursor.execute(create_table_sql)
    conn.commit()
    
    # Verify table structure
    print("\nVerifying table structure...")
    cursor.execute("DESCRIBE master_ledgers")
    columns = cursor.fetchall()
    
    print("\n✓ master_ledgers table updated successfully!")
    print("\nTable structure:")
    for col in columns:
        print(f"  - {col[0]}: {col[1]}")
    
    cursor.close()
    conn.close()
    print("\n✓ Database connection closed.")
    
except mysql.connector.Error as err:
    print(f"\n✗ Error: {err}")
    sys.exit(1)
except Exception as e:
    print(f"\n✗ Unexpected error: {e}")
    sys.exit(1)
