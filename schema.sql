-- ============================================================================
-- AI Accounting Database Schema - Essential Tables Only
-- Updated: 2026-01-09
-- Contains only core tables: tenants, users, company_informations, 
-- master_ledgers, master_hierarchy_raw, questions, answers, Transcaction_file
-- ============================================================================

-- Database: ai_accounting
-- Character Set: utf8mb4
-- Collation: utf8mb4_0900_ai_ci

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Tenants Table
CREATE TABLE IF NOT EXISTS `tenants` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Users Table (Owners)
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `selected_plan` varchar(50) NOT NULL,
  `logo_path` varchar(500) DEFAULT NULL,
  `tenant_id` char(36) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `phone_verified` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_superuser` tinyint(1) NOT NULL DEFAULT '1',
  `is_staff` tinyint(1) NOT NULL DEFAULT '1',
  `login_status` varchar(20) DEFAULT 'Offline',
  `last_activity` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `company_name` (`company_name`),
  KEY `users_tenant_id_idx` (`tenant_id`),
  CONSTRAINT `users_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tenant Users Table (Staff)
CREATE TABLE IF NOT EXISTS `tenant_users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `tenant_id` char(36) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `role_id` bigint DEFAULT NULL,
  `selected_submodule_ids` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_users_username_unique` (`username`),
  KEY `tenant_users_tenant_id_idx` (`tenant_id`),
  KEY `tenant_users_role_id_idx` (`role_id`),
  CONSTRAINT `tenant_users_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Company Informations Table
CREATE TABLE IF NOT EXISTS `company_informations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'India',
  `phone` varchar(15) DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `gstin` varchar(15) DEFAULT NULL,
  `pan` varchar(10) DEFAULT NULL,
  `cin` varchar(21) DEFAULT NULL,
  `tan` varchar(10) DEFAULT NULL,
  `business_type` varchar(50) DEFAULT NULL,
  `industry_type` varchar(100) DEFAULT NULL,
  `financial_year_start` date DEFAULT NULL,
  `financial_year_end` date DEFAULT NULL,
  `logo_path` varchar(500) DEFAULT NULL,
  `signature_path` varchar(500) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `bank_account_no` varchar(20) DEFAULT NULL,
  `bank_ifsc` varchar(11) DEFAULT NULL,
  `bank_branch` varchar(255) DEFAULT NULL,
  `voucher_numbering` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `company_informations_tenant_unique` (`tenant_id`),
  CONSTRAINT `company_informations_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- MASTER LEDGERS - HIERARCHY STRUCTURE
-- ============================================================================

-- Master Ledgers (Hierarchy starting from Category)
CREATE TABLE IF NOT EXISTS `master_ledgers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Custom ledger name',
  
  -- Hierarchy from category level onwards
  `category` varchar(255) NOT NULL COMMENT 'From hierarchy: major_group_1',
  `group` varchar(255) NOT NULL COMMENT 'From hierarchy: group_1',
  `sub_group_1` varchar(255) DEFAULT NULL COMMENT 'From hierarchy: sub_group_1_1',
  `sub_group_2` varchar(255) DEFAULT NULL COMMENT 'From hierarchy: sub_group_2_1',
  `sub_group_3` varchar(255) DEFAULT NULL COMMENT 'From hierarchy: sub_group_3_1',
  `ledger_type` varchar(255) DEFAULT NULL COMMENT 'From hierarchy: ledger_1',
  
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `master_ledgers_name_tenant_unique` (`name`, `tenant_id`),
  KEY `master_ledgers_tenant_id_idx` (`tenant_id`),
  KEY `master_ledgers_category_idx` (`category`),
  KEY `master_ledgers_group_idx` (`group`),
  CONSTRAINT `master_ledgers_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Master Hierarchy Raw (Global Chart of Accounts)
-- Stores the complete flattened hierarchy structure for Chart of Accounts
-- This table is GLOBAL (no tenant_id) and shared across all tenants
-- Each row represents a complete path from Type of Business down to Ledger level
CREATE TABLE IF NOT EXISTS `master_hierarchy_raw` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `type_of_business_1` text,
  `financial_reporting_1` text,
  `major_group_1` text,
  `group_1` text,
  `sub_group_1_1` text,
  `sub_group_2_1` text,
  `sub_group_3_1` text,
  `ledger_1` text,
  `code` text,
  `type_of_business_2` text,
  `financial_reporting_2` text,
  `major_group_2` text,
  `group_2` text,
  `sub_group_1_2` text,
  `sub_group_2_2` text,
  `sub_group_3_2` text,
  `ledger_2` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- QUESTIONS SYSTEM
-- ============================================================================

-- Questions Table (Imported from CSV)
-- Stores questions for dynamic ledger creation forms
CREATE TABLE IF NOT EXISTS `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sub_group_1_1` varchar(255) DEFAULT NULL COMMENT 'Sub-group 1 level 1 from hierarchy',
  `sub_group_1_2` varchar(50) DEFAULT NULL COMMENT 'Sub-group 1 level 2 (question code)',
  `question` text DEFAULT NULL COMMENT 'The question text',
  `condition_rule` varchar(255) DEFAULT NULL COMMENT 'Condition rules for displaying the question',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `questions_sub_group_1_2_idx` (`sub_group_1_2`),
  KEY `questions_sub_group_1_1_idx` (`sub_group_1_1`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Questions imported from CSV - maps questions to hierarchy nodes';

-- Answers Table
-- Stores user responses to dynamic questions
CREATE TABLE IF NOT EXISTS `answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ledger_code` varchar(255) DEFAULT NULL COMMENT 'Code of the ledger this answer belongs to',
  `sub_group_1_1` varchar(255) DEFAULT NULL COMMENT 'Copied from questions table',
  `sub_group_1_2` varchar(255) DEFAULT NULL COMMENT 'Copied from questions table',
  `question` text DEFAULT NULL COMMENT 'The question text copied from questions table',
  `answer` text DEFAULT NULL COMMENT 'User provided answer',
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant UUID',
  PRIMARY KEY (`id`),
  KEY `answers_ledger_code_idx` (`ledger_code`),
  KEY `answers_tenant_id_idx` (`tenant_id`),
  KEY `answers_sub_group_1_2_idx` (`sub_group_1_2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Stores user answers to dynamic questions for each ledger';

-- ============================================================================
-- VOUCHER CONFIGURATION
-- ============================================================================

-- Voucher Configuration Table
-- Stores voucher numbering configuration for all voucher types
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
-- TRANSACTION FILE
-- ============================================================================

-- Transaction File (Ledger Balances and Details)
CREATE TABLE IF NOT EXISTS `Transcaction_file` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `financial_year_id` BIGINT NOT NULL,
  `ledger_code` VARCHAR(50) UNIQUE,
  `ledger_name` VARCHAR(255) NOT NULL,
  `alias_name` VARCHAR(255),
  `group_id` BIGINT,
  `nature` VARCHAR(20),
  `ledger_type` VARCHAR(50),
  `is_active` BOOLEAN DEFAULT TRUE,
  `opening_balance` DECIMAL(18,2) DEFAULT 0,
  `opening_balance_type` VARCHAR(10),
  `current_balance` DECIMAL(18,2) DEFAULT 0,
  `current_balance_type` VARCHAR(10),
  `closing_balance` DECIMAL(18,2) DEFAULT 0,
  `closing_balance_type` VARCHAR(10),
  `bank_name` VARCHAR(255),
  `branch_name` VARCHAR(255),
  `account_number` VARCHAR(50),
  `ifsc_code` VARCHAR(20),
  `micr_code` VARCHAR(20),
  `upi_id` VARCHAR(100),
  `gst_applicable` BOOLEAN DEFAULT FALSE,
  `gst_registration_type` VARCHAR(50),
  `gstin` VARCHAR(20),
  `hsn_sac_code` VARCHAR(20),
  `gst_rate` DECIMAL(5,2),
  `cgst_rate` DECIMAL(5,2),
  `sgst_rate` DECIMAL(5,2),
  `igst_rate` DECIMAL(5,2),
  `is_tds_applicable` BOOLEAN DEFAULT FALSE,
  `tds_section` VARCHAR(20),
  `tds_rate` DECIMAL(5,2),
  `contact_person` VARCHAR(255),
  `mobile` VARCHAR(20),
  `email` VARCHAR(255),
  `address_line1` VARCHAR(255),
  `address_line2` VARCHAR(255),
  `city` VARCHAR(100),
  `state` VARCHAR(100),
  `pincode` VARCHAR(20),
  `country` VARCHAR(100),
  `allow_bill_wise` BOOLEAN DEFAULT FALSE,
  `credit_limit` DECIMAL(18,2),
  `credit_days` INT,
  `is_cost_center_required` BOOLEAN DEFAULT FALSE,
  `is_inventory_linked` BOOLEAN DEFAULT FALSE,
  `is_system_ledger` BOOLEAN DEFAULT FALSE,
  `lock_editing` BOOLEAN DEFAULT FALSE,
  `created_by` BIGINT,
  `updated_by` BIGINT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `transcaction_file_tenant_id_idx` (`tenant_id`),
  KEY `transcaction_file_ledger_code_idx` (`ledger_code`),
  CONSTRAINT `transcaction_file_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- AMOUNT TRANSACTIONS
-- ============================================================================

-- Amount Transactions Table
-- Stores all Cash and Bank ledger transactions with denormalized ledger data
CREATE TABLE IF NOT EXISTS `amount_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant identifier for multi-tenancy',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  
  -- Foreign Keys
  `ledger_id` bigint NOT NULL COMMENT 'Link to master_ledgers table',
  `voucher_id` bigint DEFAULT NULL COMMENT 'Link to vouchers table (nullable)',
  
  -- Denormalized Ledger Data (for quick access without joins)
  `ledger_name` varchar(255) DEFAULT NULL COMMENT 'Ledger name (e.g., bank2, Cash, HDFC Bank)',
  `sub_group_1` varchar(255) DEFAULT NULL COMMENT 'Parent category (e.g., Current Assets)',
  `code` varchar(50) DEFAULT NULL COMMENT 'Ledger code from master_ledgers table',
  
  -- Transaction Details
  `transaction_date` date NOT NULL COMMENT 'Date of the transaction',
  `transaction_type` varchar(20) NOT NULL COMMENT 'Type: opening_balance, payment, receipt, etc.',
  
  -- Amounts
  `debit` decimal(15,2) DEFAULT '0.00' COMMENT 'Debit amount',
  `credit` decimal(15,2) DEFAULT '0.00' COMMENT 'Credit amount',
  `balance` decimal(15,2) DEFAULT '0.00' COMMENT 'Running balance after this transaction',
  
  -- Additional Info
  `narration` longtext COMMENT 'Transaction description/narration',
  
  -- Indexes
  PRIMARY KEY (`id`),
  KEY `idx_tenant_ledger` (`tenant_id`, `ledger_id`),
  KEY `idx_transaction_date` (`transaction_date`),
  KEY `idx_transaction_type` (`transaction_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `accounting_amountt_ledger_id_e1c0e5a0_fk_accountin` (`ledger_id`),
  KEY `accounting_amountt_voucher_id_d0b3e5a0_fk_accountin` (`voucher_id`)
  
  -- Foreign Key Constraints (uncomment after master_ledgers and vouchers tables exist)
  -- CONSTRAINT `fk_amount_txn_ledger` FOREIGN KEY (`ledger_id`) REFERENCES `master_ledgers` (`id`) ON DELETE CASCADE,
  -- CONSTRAINT `fk_amount_txn_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci 
COMMENT='Stores all Cash and Bank ledger transactions with denormalized data for performance';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
