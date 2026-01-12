from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Create inventory_categories table'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Check if table exists
            cursor.execute("SHOW TABLES LIKE 'inventory_categories'")
            if cursor.fetchone():
                self.stdout.write(self.style.WARNING('Table already exists, dropping it...'))
                cursor.execute("DROP TABLE inventory_categories")
            
            # Create the table
            self.stdout.write('Creating inventory_categories table...')
            cursor.execute("""
                CREATE TABLE `inventory_categories` (
                    `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                    `tenant_id` varchar(36) NOT NULL,
                    `created_at` datetime(6) NOT NULL,
                    `updated_at` datetime(6) NOT NULL,
                    `name` varchar(255) NOT NULL,
                    `parent_id` bigint NULL,
                    `is_system` tinyint(1) NOT NULL DEFAULT 0,
                    `is_active` tinyint(1) NOT NULL DEFAULT 1,
                    `description` longtext NULL,
                    `display_order` int NOT NULL DEFAULT 0,
                    UNIQUE KEY `inventory_categories_tenant_name_parent` (`tenant_id`, `name`, `parent_id`),
                    KEY `inventory_categories_tenant_active` (`tenant_id`, `is_active`),
                    KEY `inventory_categories_parent_id` (`parent_id`),
                    CONSTRAINT `inventory_categories_parent_id_fk` 
                        FOREIGN KEY (`parent_id`) 
                        REFERENCES `inventory_categories` (`id`) 
                        ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            
            self.stdout.write(self.style.SUCCESS('✅ Table created successfully!'))
