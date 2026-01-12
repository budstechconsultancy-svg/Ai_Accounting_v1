from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Create inventory_locations table'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Check if table exists
            cursor.execute("SHOW TABLES LIKE 'inventory_locations'")
            if cursor.fetchone():
                self.stdout.write(self.style.WARNING('Table already exists'))
                return
            
            # Create the table
            self.stdout.write('Creating inventory_locations table...')
            cursor.execute("""
                CREATE TABLE `inventory_locations` (
                    `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                    `tenant_id` varchar(36) NOT NULL,
                    `created_at` datetime(6) NOT NULL,
                    `updated_at` datetime(6) NOT NULL,
                    `name` varchar(255) NOT NULL,
                    `location_type` varchar(50) NOT NULL,
                    `address` longtext NOT NULL,
                    `gstin` varchar(15) NULL,
                    `is_active` tinyint(1) NOT NULL DEFAULT 1,
                    `is_default` tinyint(1) NOT NULL DEFAULT 0,
                    UNIQUE KEY `inventory_locations_tenant_name` (`tenant_id`, `name`),
                    KEY `inventory_locations_tenant_active` (`tenant_id`, `is_active`),
                    KEY `inventory_locations_type` (`location_type`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            
            self.stdout.write(self.style.SUCCESS('✅ Table created successfully!'))
