"""
Script to create vendor_master_tds table in the database.
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
    """Create vendor_master_tds table"""
    sql = """
CREATE TABLE IF NOT EXISTS `vendor_master_tds` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `vendor_basic_detail_id` bigint DEFAULT NULL COMMENT 'Foreign key to vendor_master_basicdetail',
  `pan_number` varchar(10) DEFAULT NULL COMMENT 'PAN Number',
  `tan_number` varchar(10) DEFAULT NULL COMMENT 'TAN Number',
  `tds_section` varchar(50) DEFAULT NULL COMMENT 'TDS Section (e.g., 194C, 194J)',
  `tds_rate` decimal(5,2) DEFAULT NULL COMMENT 'TDS Rate in percentage',
  `tds_section_applicable` varchar(100) DEFAULT NULL COMMENT 'TDS Section Applicable',
  `enable_automatic_tds_posting` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Enable automatic TDS posting',
  `msme_udyam_no` varchar(50) DEFAULT NULL COMMENT 'MSME Udyam Registration Number',
  `fssai_license_no` varchar(50) DEFAULT NULL COMMENT 'FSSAI License Number',
  `import_export_code` varchar(50) DEFAULT NULL COMMENT 'Import Export Code (IEC)',
  `eou_status` varchar(100) DEFAULT NULL COMMENT 'Export Oriented Unit Status',
  `cin_number` varchar(21) DEFAULT NULL COMMENT 'Corporate Identification Number',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this TDS detail is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  `updated_by` varchar(100) DEFAULT NULL COMMENT 'Updated by user',
  PRIMARY KEY (`id`),
  KEY `vendor_tds_tenant_id_idx` (`tenant_id`),
  KEY `vendor_tds_vendor_basic_detail_id_idx` (`vendor_basic_detail_id`),
  KEY `vendor_tds_pan_number_idx` (`pan_number`),
  CONSTRAINT `vendor_tds_vendor_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Master TDS & Other Statutory Details'
    """
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql)
        print("✓ Table 'vendor_master_tds' created successfully!")
        return True
    except Exception as e:
        print(f"✗ Error creating table: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Creating vendor_master_tds table...")
    success = create_table()
    sys.exit(0 if success else 1)
