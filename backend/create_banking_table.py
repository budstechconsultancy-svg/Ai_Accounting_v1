"""
Script to create vendor_master_banking_detail table in the database.
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def create_table():
    """Create vendor_master_banking table"""
    sql = """
CREATE TABLE IF NOT EXISTS `vendor_master_banking` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `vendor_basic_detail_id` bigint DEFAULT NULL COMMENT 'Foreign key to vendor_master_basicdetail',
  `bank_account_no` varchar(50) NOT NULL COMMENT 'Bank Account Number',
  `bank_name` varchar(200) NOT NULL COMMENT 'Bank Name',
  `ifsc_code` varchar(11) NOT NULL COMMENT 'IFSC Code',
  `branch_name` varchar(200) DEFAULT NULL COMMENT 'Branch Name',
  `swift_code` varchar(11) DEFAULT NULL COMMENT 'SWIFT Code',
  `vendor_branch` varchar(200) DEFAULT NULL COMMENT 'Associate to a vendor branch',
  `account_type` varchar(20) NOT NULL DEFAULT 'current' COMMENT 'Type of bank account',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this banking detail is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  `updated_by` varchar(100) DEFAULT NULL COMMENT 'Updated by user',
  PRIMARY KEY (`id`),
  KEY `vendor_banking_tenant_id_idx` (`tenant_id`),
  KEY `vendor_banking_vendor_basic_detail_id_idx` (`vendor_basic_detail_id`),
  KEY `vendor_banking_bank_account_no_idx` (`bank_account_no`),
  CONSTRAINT `vendor_banking_vendor_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Master Banking Information';
    """
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql)
        print("✓ Table 'vendor_master_banking' created successfully!")
        return True
    except Exception as e:
        print(f"✗ Error creating table: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Creating vendor_master_banking table...")
    success = create_table()
    sys.exit(0 if success else 1)
