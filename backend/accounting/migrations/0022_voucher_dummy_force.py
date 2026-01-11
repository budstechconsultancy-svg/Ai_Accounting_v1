from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0021_add_sales_invoice_model'),
    ]

    operations = [
        migrations.RunSQL(
            """
            CREATE TABLE IF NOT EXISTS `vouchers` (
                `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                `tenant_id` varchar(36) NOT NULL,
                `created_at` datetime(6) NOT NULL,
                `updated_at` datetime(6) NOT NULL,
                `type` varchar(20) NOT NULL,
                `voucher_number` varchar(50) NOT NULL,
                `date` date NOT NULL,
                `party` varchar(255) NULL,
                `account` varchar(255) NULL,
                `amount` numeric(15, 2) NULL,
                `total` numeric(15, 2) NULL,
                `narration` longtext NULL,
                `invoice_no` varchar(50) NULL,
                `is_inter_state` tinyint(1) NULL,
                `total_taxable_amount` numeric(15, 2) NULL,
                `total_cgst` numeric(15, 2) NULL,
                `total_sgst` numeric(15, 2) NULL,
                `total_igst` numeric(15, 2) NULL,
                `total_debit` numeric(15, 2) NULL,
                `total_credit` numeric(15, 2) NULL,
                `from_account` varchar(255) NULL,
                `to_account` varchar(255) NULL,
                `items_data` json NULL,
                `dummy_force` integer NULL,
                CONSTRAINT `vouchers_unique_number` UNIQUE (`voucher_number`, `tenant_id`, `type`)
            );
            """,
            reverse_sql="DROP TABLE IF EXISTS `vouchers`"
        )
    ]
