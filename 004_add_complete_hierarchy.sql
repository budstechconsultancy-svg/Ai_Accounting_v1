-- Update master_ledgers table to include complete hierarchy
DROP TABLE IF EXISTS `master_ledgers`;

CREATE TABLE `master_ledgers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  
  -- Complete hierarchy from master_hierarchy table
  `financial_statement` varchar(255) NOT NULL COMMENT 'From hierarchy: financial_reporting_1',
  `category` varchar(255) NOT NULL COMMENT 'From hierarchy: major_group_1',
  `group` varchar(255) NOT NULL COMMENT 'From hierarchy: group_1',
  `ledger_type` varchar(255) NOT NULL COMMENT 'From hierarchy: ledger_type',
  
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `master_ledgers_name_tenant_unique` (`name`, `tenant_id`),
  KEY `master_ledgers_tenant_id_idx` (`tenant_id`),
  KEY `master_ledgers_financial_statement_idx` (`financial_statement`),
  KEY `master_ledgers_category_idx` (`category`),
  KEY `master_ledgers_group_idx` (`group`),
  KEY `master_ledgers_ledger_type_idx` (`ledger_type`),
  CONSTRAINT `master_ledgers_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
