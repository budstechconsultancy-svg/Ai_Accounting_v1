#!/usr/bin/env python3
"""
Create all missing database tables for AI Accounting application.
This script creates: roles, company_informations, tenant_ledgers, 
master_chart_of_accounts, and sessions tables.
"""
import os
import pymysql
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME', 'ai_accounting')
DB_PORT = int(os.getenv('DB_PORT', 3306))

def create_missing_tables():
    """Create all missing database tables"""
    print(f"🔧 Connecting to database {DB_NAME}...")
    
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            database=DB_NAME
        )
        
        cursor = connection.cursor()
        
        # 1. Create roles table
        print("\n📦 Creating 'roles' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `roles` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `tenant_id` VARCHAR(36) NOT NULL,
              `name` VARCHAR(100) NOT NULL,
              `description` TEXT,
              `is_system` BOOLEAN DEFAULT FALSE,
              `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
              `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY `unique_role_per_tenant` (`tenant_id`, `name`),
              INDEX `idx_tenant_roles` (`tenant_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ 'roles' table created")
        
        # 2. Create company_informations table
        print("\n📦 Creating 'company_informations' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `company_informations` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `tenant_id` VARCHAR(36) NOT NULL,
              `company_name` VARCHAR(255) NOT NULL,
              `address_line1` VARCHAR(255),
              `address_line2` VARCHAR(255),
              `city` VARCHAR(100),
              `state` VARCHAR(100),
              `pincode` VARCHAR(10),
              `country` VARCHAR(100) DEFAULT 'India',
              `phone` VARCHAR(15),
              `mobile` VARCHAR(15),
              `email` VARCHAR(255),
              `website` VARCHAR(255),
              `gstin` VARCHAR(15),
              `pan` VARCHAR(10),
              `cin` VARCHAR(21),
              `tan` VARCHAR(10),
              `business_type` VARCHAR(50),
              `industry_type` VARCHAR(100),
              `financial_year_start` DATE,
              `financial_year_end` DATE,
              `logo_path` VARCHAR(500),
              `signature_path` VARCHAR(500),
              `bank_name` VARCHAR(255),
              `bank_account_no` VARCHAR(20),
              `bank_ifsc` VARCHAR(11),
              `bank_branch` VARCHAR(255),
              `voucher_numbering` JSON,
              `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
              `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX `idx_tenant_company` (`tenant_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ 'company_informations' table created")
        
        # 3. Create master_chart_of_accounts table
        print("\n📦 Creating 'master_chart_of_accounts' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `master_chart_of_accounts` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `type_of_business` VARCHAR(255) NOT NULL,
              `financial_reporting` VARCHAR(255) NOT NULL,
              `major_group` VARCHAR(255) NOT NULL,
              `group` VARCHAR(255) NOT NULL,
              `sub_group_1` VARCHAR(255),
              `sub_group_2` VARCHAR(255),
              `sub_group_3` VARCHAR(255),
              `ledger_name` VARCHAR(255),
              `ledger_code` VARCHAR(50) UNIQUE,
              `level_depth` INT DEFAULT 1,
              `import_version` VARCHAR(20) DEFAULT '1.0',
              `imported_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
              `is_leaf` BOOLEAN DEFAULT FALSE,
              INDEX `idx_ledger_code` (`ledger_code`),
              INDEX `idx_business_type` (`type_of_business`),
              INDEX `idx_major_group` (`major_group`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ 'master_chart_of_accounts' table created")
        
        # 4. Create tenant_ledgers table
        print("\n📦 Creating 'tenant_ledgers' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `tenant_ledgers` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `tenant_id` VARCHAR(36) NOT NULL,
              `master_ledger_id` INT NOT NULL,
              `custom_alias` VARCHAR(255),
              `is_active` BOOLEAN DEFAULT TRUE,
              `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
              `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY `unique_tenant_ledger` (`tenant_id`, `master_ledger_id`),
              INDEX `idx_tenant_ledgers` (`tenant_id`),
              INDEX `idx_master_ledger` (`master_ledger_id`),
              FOREIGN KEY (`master_ledger_id`) REFERENCES `master_chart_of_accounts`(`id`) ON DELETE RESTRICT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ 'tenant_ledgers' table created")
        
        # 5. Create sessions table (Django sessions)
        print("\n📦 Creating 'sessions' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `django_session` (
              `session_key` VARCHAR(40) PRIMARY KEY,
              `session_data` LONGTEXT NOT NULL,
              `expire_date` DATETIME NOT NULL,
              INDEX `django_session_expire_date_idx` (`expire_date`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ 'django_session' table created")
        
        connection.commit()
        cursor.close()
        connection.close()
        
        print("\n" + "=" * 60)
        print("✅ All missing tables created successfully!")
        print("=" * 60)
        print("\n📋 Tables created:")
        print("  1. roles")
        print("  2. company_informations")
        print("  3. master_chart_of_accounts")
        print("  4. tenant_ledgers")
        print("  5. django_session (sessions)")
        print("\n🎉 Database is now complete!")
        return True
        
    except pymysql.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    create_missing_tables()
