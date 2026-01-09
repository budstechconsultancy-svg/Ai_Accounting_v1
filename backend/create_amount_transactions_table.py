import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

# SQL to create amount_transactions table (without FK constraints for now)
sql = """
CREATE TABLE IF NOT EXISTS `amount_transactions` (
    `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
    `tenant_id` varchar(36) NOT NULL,
    `created_at` datetime(6) NULL,
    `updated_at` datetime(6) NULL,
    `transaction_date` date NOT NULL,
    `transaction_type` varchar(20) NOT NULL DEFAULT 'transaction',
    `debit` decimal(15, 2) NOT NULL DEFAULT 0,
    `credit` decimal(15, 2) NOT NULL DEFAULT 0,
    `balance` decimal(15, 2) NOT NULL DEFAULT 0,
    `narration` longtext NULL,
    `ledger_id` bigint NOT NULL,
    `voucher_id` bigint NULL,
    KEY `tenant_id` (`tenant_id`),
    KEY `amount_tran_tenant__d7c201_idx` (`tenant_id`, `ledger_id`, `transaction_date`),
    KEY `amount_tran_tenant__9534d3_idx` (`tenant_id`, `transaction_type`),
    KEY `amount_tran_transac_10f4ee_idx` (`transaction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
"""

with connection.cursor() as cursor:
    try:
        cursor.execute(sql)
        print("✅ Table 'amount_transactions' created successfully!")
    except Exception as e:
        if "already exists" in str(e):
            print("ℹ️  Table 'amount_transactions' already exists")
        else:
            print(f"❌ Error: {e}")
