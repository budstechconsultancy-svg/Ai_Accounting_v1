"""
Manual table creation command for sales_invoices
Run with: python manage.py create_invoice_table
"""

from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Manually create sales_invoices table'

    def handle(self, *args, **options):
        sql = """
        CREATE TABLE IF NOT EXISTS `sales_invoices` (
            `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
            `tenant_id` VARCHAR(36) NOT NULL,
            `created_at` DATETIME(6) NULL,
            `updated_at` DATETIME(6) NULL,
            `invoice_number` VARCHAR(50) NOT NULL,
            `invoice_date` DATE NOT NULL,
            `bill_to_address` LONGTEXT NOT NULL,
            `bill_to_gstin` VARCHAR(15) NULL,
            `bill_to_contact` VARCHAR(255) NULL,
            `bill_to_state` VARCHAR(100) NULL,
            `bill_to_country` VARCHAR(100) NOT NULL DEFAULT 'India',
            `ship_to_address` LONGTEXT NOT NULL,
            `ship_to_state` VARCHAR(100) NULL,
            `ship_to_country` VARCHAR(100) NOT NULL DEFAULT 'India',
            `tax_type` VARCHAR(20) NOT NULL,
            `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
            `current_step` INT NOT NULL DEFAULT 1,
            `customer_id` BIGINT NOT NULL,
            `voucher_type_id` BIGINT NOT NULL,
            
            INDEX `sales_invoices_tenant_id_idx` (`tenant_id`),
            INDEX `sales_invoi_tenant__62aed4_idx` (`tenant_id`, `invoice_date`),
            INDEX `sales_invoi_custome_aa5d4a_idx` (`customer_id`, `tenant_id`),
            INDEX `sales_invoi_voucher_e4d47a_idx` (`voucher_type_id`),
            
            UNIQUE KEY `unique_invoice` (`tenant_id`, `invoice_number`),
            
            CONSTRAINT `fk_sales_invoice_customer` 
                FOREIGN KEY (`customer_id`) 
                REFERENCES `master_ledgers` (`id`) 
                ON DELETE RESTRICT,
            
            CONSTRAINT `fk_sales_invoice_voucher_type` 
                FOREIGN KEY (`voucher_type_id`) 
                REFERENCES `receipt_voucher_types` (`id`) 
                ON DELETE RESTRICT
                
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
            self.stdout.write(self.style.SUCCESS('✅ sales_invoices table created successfully!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error creating table: {str(e)}'))

