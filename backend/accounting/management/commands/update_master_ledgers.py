from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Update master_ledgers table structure'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            self.stdout.write("Dropping old master_ledgers table...")
            cursor.execute("DROP TABLE IF EXISTS master_ledgers")
            
            self.stdout.write("Creating new master_ledgers table...")
            cursor.execute("""
                CREATE TABLE master_ledgers (
                  id bigint NOT NULL AUTO_INCREMENT,
                  tenant_id char(36) NOT NULL,
                  name varchar(255) NOT NULL COMMENT 'Custom ledger name',
                  
                  category varchar(255) NOT NULL COMMENT 'From hierarchy: major_group_1',
                  `group` varchar(255) NOT NULL COMMENT 'From hierarchy: group_1',
                  sub_group_1 varchar(255) DEFAULT NULL COMMENT 'From hierarchy: sub_group_1_1',
                  sub_group_2 varchar(255) DEFAULT NULL COMMENT 'From hierarchy: sub_group_2_1',
                  sub_group_3 varchar(255) DEFAULT NULL COMMENT 'From hierarchy: sub_group_3_1',
                  ledger_type varchar(255) DEFAULT NULL COMMENT 'From hierarchy: ledger_1',
                  
                  created_at datetime(6) NOT NULL,
                  updated_at datetime(6) NOT NULL,
                  PRIMARY KEY (id),
                  UNIQUE KEY master_ledgers_name_tenant_unique (name, tenant_id),
                  KEY master_ledgers_tenant_id_idx (tenant_id),
                  KEY master_ledgers_category_idx (category),
                  KEY master_ledgers_group_idx (`group`),
                  CONSTRAINT master_ledgers_tenant_id_fk FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
            """)
            
            self.stdout.write(self.style.SUCCESS('✓ master_ledgers table updated successfully!'))
            
            # Show table structure
            cursor.execute("DESCRIBE master_ledgers")
            columns = cursor.fetchall()
            self.stdout.write("\nTable structure:")
            for col in columns:
                self.stdout.write(f"  - {col[0]}: {col[1]}")
