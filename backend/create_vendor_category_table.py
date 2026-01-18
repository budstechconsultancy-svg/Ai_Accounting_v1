"""
Create vendor_master_category table in the database
"""

import os
import django
import mysql.connector
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'ai_accounting')
}

# SQL to create vendor_master_category table
create_table_sql = """
CREATE TABLE IF NOT EXISTS `vendor_master_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `category` varchar(255) NOT NULL COMMENT 'Top-level category (e.g., RAW MATERIAL, Stores and Spares)',
  `group` varchar(255) DEFAULT NULL COMMENT 'Group under category (optional)',
  `subgroup` varchar(255) DEFAULT NULL COMMENT 'Subgroup under group (optional)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this category is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  `updated_by` varchar(100) DEFAULT NULL COMMENT 'Updated by user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_category_unique` (`tenant_id`,`category`(100),`group`(100),`subgroup`(100)),
  KEY `vendor_category_tenant_id_idx` (`tenant_id`,`is_active`),
  KEY `vendor_category_category_idx` (`category`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Master Category for vendor classification';
"""

try:
    # Connect to database
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()
    
    print("Creating vendor_master_category table...")
    cursor.execute(create_table_sql)
    connection.commit()
    
    print("✅ Table vendor_master_category created successfully!")
    
    # Verify table was created
    cursor.execute("SHOW TABLES LIKE 'vendor_master_category'")
    result = cursor.fetchone()
    
    if result:
        print(f"✅ Table exists: {result[0]}")
        
        # Show table structure
        cursor.execute("DESCRIBE vendor_master_category")
        columns = cursor.fetchall()
        print("\n📊 Table Structure:")
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
    
    cursor.close()
    connection.close()
    
except mysql.connector.Error as error:
    print(f"❌ Error: {error}")
except Exception as e:
    print(f"❌ Unexpected error: {e}")
