#!/usr/bin/env python3
"""
Create missing modules and role_modules tables directly.
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

def create_modules_tables():
    """Create modules and role_modules tables"""
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
        
        # Create modules table
        print("📦 Creating modules table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `modules` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `code` VARCHAR(50) UNIQUE NOT NULL,
              `name` VARCHAR(100) NOT NULL,
              `description` TEXT,
              `parent_module_id` INT,
              `display_order` INT DEFAULT 0,
              `is_active` BOOLEAN DEFAULT TRUE,
              `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_parent (`parent_module_id`),
              INDEX idx_display (`display_order`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ Modules table created")
        
        # Create role_modules table
        print("📦 Creating role_modules table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `role_modules` (
              `id` INT AUTO_INCREMENT PRIMARY KEY,
              `role_id` INT NOT NULL,
              `module_id` INT NOT NULL,
              `can_view` BOOLEAN DEFAULT TRUE,
              `can_create` BOOLEAN DEFAULT FALSE,
              `can_edit` BOOLEAN DEFAULT FALSE,
              `can_delete` BOOLEAN DEFAULT FALSE,
              `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
              UNIQUE KEY `unique_role_module` (`role_id`, `module_id`),
              INDEX `idx_role_id` (`role_id`),
              INDEX `idx_module_id` (`module_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✅ Role_modules table created")
        
        connection.commit()
        cursor.close()
        connection.close()
        
        print("\n✅ All tables created successfully!")
        return True
        
    except pymysql.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    create_modules_tables()
