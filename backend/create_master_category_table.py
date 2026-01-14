import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

# SQL to create the table
sql = """
CREATE TABLE IF NOT EXISTS inventory_master_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    category VARCHAR(255) NOT NULL,
    `group` VARCHAR(255) NULL,
    subgroup VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    INDEX idx_tenant_active (tenant_id, is_active),
    INDEX idx_category (category(191)),
    UNIQUE KEY unique_category_hierarchy (tenant_id, category(100), `group`(100), subgroup(100))
)
"""

with connection.cursor() as cursor:
    cursor.execute(sql)
    print("✓ Table 'inventory_master_category' created successfully!")
