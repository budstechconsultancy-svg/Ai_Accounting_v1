-- ============================================================================
-- Voucher Configuration Table
-- Stores voucher numbering configuration for all voucher types
-- ============================================================================

CREATE TABLE IF NOT EXISTS `voucher_configurations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  
  -- Voucher Type and Name
  `voucher_type` varchar(50) NOT NULL COMMENT 'sales, credit-note, receipts, purchases, debit-note, payments, expenses, journal, contra',
  `voucher_name` varchar(255) NOT NULL COMMENT 'Custom voucher name',
  
  -- Automatic Numbering Series
  `enable_auto_numbering` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Enable automatic numbering series',
  `prefix` varchar(50) DEFAULT NULL COMMENT 'Prefix for voucher number (alphanumeric with / and -)',
  `suffix` varchar(50) DEFAULT NULL COMMENT 'Suffix for voucher number (alphanumeric with / and -)',
  `start_from` bigint unsigned NOT NULL DEFAULT '1' COMMENT 'Starting number for the series',
  `current_number` bigint unsigned NOT NULL DEFAULT '1' COMMENT 'Current/next number in the series',
  `required_digits` int NOT NULL DEFAULT '4' COMMENT 'Number of digits for padding (e.g., 4 = 0001)',
  
  -- Effective Period
  `effective_from` date NOT NULL COMMENT 'Start date of voucher series validity',
  `effective_to` date NOT NULL COMMENT 'End date of voucher series validity',
  
  -- Sales-specific fields
  `update_customer_master` tinyint(1) DEFAULT NULL COMMENT 'For sales: whether to update customer master (Yes/No)',
  `include_from_existing_series_id` bigint DEFAULT NULL COMMENT 'For sales: reference to existing series to include from',
  
  -- Status and Metadata
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this configuration is active',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `voucher_config_unique` (`tenant_id`, `voucher_type`, `voucher_name`, `effective_from`),
  KEY `voucher_config_tenant_id_idx` (`tenant_id`),
  KEY `voucher_config_type_idx` (`voucher_type`),
  KEY `voucher_config_effective_idx` (`effective_from`, `effective_to`),
  CONSTRAINT `voucher_config_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Voucher numbering configuration for all voucher types';

-- ============================================================================
-- Example Data
-- ============================================================================

-- Example: Sales voucher configuration
-- INSERT INTO voucher_configurations (
--   tenant_id, voucher_type, voucher_name, enable_auto_numbering,
--   prefix, suffix, start_from, current_number, required_digits,
--   effective_from, effective_to, update_customer_master, is_active, created_at, updated_at
-- ) VALUES (
--   'demo-tenant-001', 'sales', 'Sales Invoice', 1,
--   'INV-', '/24-25', 1, 1, 4,
--   '2024-04-01', '2025-03-31', 1, 1, NOW(), NOW()
-- );
