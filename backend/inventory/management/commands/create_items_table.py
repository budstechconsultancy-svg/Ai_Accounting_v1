from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Create inventory_items table'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Check if table exists
            cursor.execute("SHOW TABLES LIKE 'inventory_items'")
            if cursor.fetchone():
                self.stdout.write(self.style.WARNING('Table already exists'))
                return
            
            # Create the table
            self.stdout.write('Creating inventory_items table...')
            cursor.execute("""
                CREATE TABLE `inventory_items` (
                    `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                    `tenant_id` varchar(36) NOT NULL,
                    `created_at` datetime(6) NOT NULL,
                    `updated_at` datetime(6) NOT NULL,
                    
                    `item_code` varchar(50) NOT NULL,
                    `name` varchar(255) NOT NULL,
                    `category_id` bigint NOT NULL,
                    `hsn_code` varchar(20) NULL,
                    `description` longtext NULL,
                    
                    `unit` varchar(20) NOT NULL,
                    `has_multiple_units` tinyint(1) NOT NULL DEFAULT 0,
                    `alternative_unit` varchar(20) NULL,
                    `conversion_factor` decimal(10,4) NULL,
                    
                    `gst_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
                    `rate` decimal(15,2) NOT NULL DEFAULT 0.00,
                    
                    `location_id` bigint NULL,
                    `is_active` tinyint(1) NOT NULL DEFAULT 1,
                    
                    UNIQUE KEY `inventory_items_tenant_code` (`tenant_id`, `item_code`),
                    KEY `inventory_items_tenant_name` (`tenant_id`, `name`),
                    KEY `inventory_items_hsn` (`hsn_code`),
                    KEY `inventory_items_category` (`category_id`),
                    KEY `inventory_items_location` (`location_id`),
                    CONSTRAINT `inventory_items_category_fk` FOREIGN KEY (`category_id`) REFERENCES `inventory_categories` (`id`),
                    CONSTRAINT `inventory_items_location_fk` FOREIGN KEY (`location_id`) REFERENCES `inventory_locations` (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            
            self.stdout.write(self.style.SUCCESS('✅ Table created successfully!'))
