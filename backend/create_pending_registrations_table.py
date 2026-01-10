"""
Create pending_registrations table directly
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

# SQL to create the pending_registrations table
create_table_sql = """
CREATE TABLE IF NOT EXISTS `pending_registrations` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `phone` varchar(15) NOT NULL UNIQUE,
    `username` varchar(100) NOT NULL,
    `email` varchar(255) DEFAULT NULL,
    `password_hash` varchar(255) NOT NULL,
    `company_name` varchar(255) NOT NULL,
    `selected_plan` varchar(50) NOT NULL,
    `logo_path` varchar(500) DEFAULT NULL,
    `expires_at` datetime(6) NOT NULL,
    `created_at` datetime(6) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_phone` (`phone`),
    KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
"""

print("=" * 80)
print("Creating pending_registrations table")
print("=" * 80)

try:
    with connection.cursor() as cursor:
        cursor.execute(create_table_sql)
    print("\nSUCCESS! Table created successfully!")
    
    # Verify table exists
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES LIKE 'pending_registrations'")
        result = cursor.fetchone()
        if result:
            print("VERIFIED: Table 'pending_registrations' now exists in database!")
        else:
            print("ERROR: Table still doesn't exist!")
            
except Exception as e:
    print("\nERROR: {}".format(str(e)))
    import traceback
    traceback.print_exc()
