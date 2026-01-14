"""
Script to create the inventory_categories table and seed the 6 base categories.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection
with connection.cursor() as cursor:
    # Create inventory_categories table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS `inventory_categories` (
            `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
            `tenant_id` varchar(36) NOT NULL,
            `name` varchar(255) NOT NULL,
            `parent_id` int NULL,
            `is_system` bool NOT NULL DEFAULT 0,
            `is_active` bool NOT NULL DEFAULT 1,
            `description` text NULL,
            `display_order` int NOT NULL DEFAULT 0,
            `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            FOREIGN KEY (`parent_id`) REFERENCES `inventory_categories` (`id`) ON DELETE CASCADE,
            INDEX `idx_tenant_active` (`tenant_id`, `is_active`),
            INDEX `idx_parent` (`parent_id`),
            UNIQUE KEY `unique_tenant_name_parent` (`tenant_id`, `name`, `parent_id`)
        );
    """)
    print("✅ Table 'inventory_categories' created successfully!")
    
    # Get the first tenant ID
    cursor.execute("SELECT id FROM tenants LIMIT 1")
    result = cursor.fetchone()
    
    if result:
        tenant_id = result[0]
        print(f"📝 Using tenant ID: {tenant_id}")
        
        # Insert the 6 base categories
        categories = [
            ('RAW MATERIAL', 1),
            ('Work in Progress', 2),
            ('Finished goods', 3),
            ('Stores and Spares', 4),
            ('Packing Material', 5),
            ('Stock in Trade', 6),
        ]
        
        for name, order in categories:
            try:
                cursor.execute("""
                    INSERT INTO inventory_categories 
                    (tenant_id, name, parent_id, is_system, is_active, description, display_order)
                    VALUES (%s, %s, NULL, 1, 1, %s, %s)
                """, [tenant_id, name, f'Base category for {name}', order])
                print(f"  ✅ {name} - Created")
            except Exception as e:
                if "Duplicate entry" in str(e):
                    print(f"  ⏭️  {name} - Already exists")
                else:
                    print(f"  ❌ {name} - Error: {e}")
        
        print("\n✨ Seeding complete!")
    else:
        print("❌ No tenant found in database!")
