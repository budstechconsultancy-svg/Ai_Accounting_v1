-- ============================================================================
-- AI Accounting Database Schema
-- Complete database schema for production deployment
-- Updated: 2025-12-20
-- Standardized tenant_id to CHAR(36) and corrected table structures
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
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `phone_verified` tinyint(1) NOT NULL DEFAULT '0',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `tenant_id` char(36) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `selected_plan` varchar(50) DEFAULT NULL,
  `logo_path` varchar(500) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `users_tenant_id_idx` (`tenant_id`),
  CONSTRAINT `users_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tenant Users Table (Staff)
CREATE TABLE IF NOT EXISTS `tenant_users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `username` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `tenant_id` char(36) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'STAFF',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_users_username_tenant_unique` (`username`, `tenant_id`),
  KEY `tenant_users_tenant_id_idx` (`tenant_id`),
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
  `email` varchar(254) DEFAULT NULL,
  `website` varchar(200) DEFAULT NULL,
  `gstin` varchar(15) DEFAULT NULL,
  `pan` varchar(10) DEFAULT NULL,
  `cin` varchar(21) DEFAULT NULL,
  `tan` varchar(10) DEFAULT NULL,
  `logo_path` varchar(500) DEFAULT NULL,
  `financial_year_start` date DEFAULT NULL,
  `financial_year_end` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `company_informations_tenant_unique` (`tenant_id`),
  CONSTRAINT `company_informations_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- ACCOUNTING TABLES - MASTERS
-- ============================================================================

-- Master Ledger Groups
CREATE TABLE IF NOT EXISTS `master_ledger_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `parent` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `master_ledger_groups_name_tenant_unique` (`name`, `tenant_id`),
  KEY `master_ledger_groups_tenant_id_idx` (`tenant_id`),
  CONSTRAINT `master_ledger_groups_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Master Ledgers
CREATE TABLE IF NOT EXISTS `master_ledgers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `group` varchar(255) NOT NULL,
  `gstin` varchar(15) DEFAULT NULL,
  `registration_type` varchar(20) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `master_ledgers_name_tenant_unique` (`name`, `tenant_id`),
  KEY `master_ledgers_tenant_id_idx` (`tenant_id`),
  CONSTRAINT `master_ledgers_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Master Voucher Config
CREATE TABLE IF NOT EXISTS `master_voucher_config` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '__NUMBERING__',
  `sales_prefix` varchar(50) DEFAULT NULL,
  `sales_suffix` varchar(50) DEFAULT NULL,
  `sales_next_number` bigint unsigned NOT NULL DEFAULT '1',
  `sales_padding` int NOT NULL DEFAULT '4',
  `sales_preview` varchar(255) DEFAULT NULL,
  `purchase_prefix` varchar(50) DEFAULT NULL,
  `purchase_suffix` varchar(50) DEFAULT NULL,
  `purchase_next_number` bigint unsigned NOT NULL DEFAULT '1',
  `purchase_padding` int NOT NULL DEFAULT '4',
  `purchase_preview` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `master_voucher_config_tenant_id_idx` (`tenant_id`),
  CONSTRAINT `master_voucher_config_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- ACCOUNTING TABLES - VOUCHERS
-- ============================================================================

-- Unified Vouchers Table
CREATE TABLE IF NOT EXISTS `vouchers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `type` varchar(20) NOT NULL COMMENT 'sales, purchase, payment, receipt, contra, journal',
  `voucher_number` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `narration` text,
  `party` varchar(255) DEFAULT NULL,
  `invoice_no` varchar(100) DEFAULT NULL,
  `is_inter_state` tinyint(1) DEFAULT 0,
  `total_taxable_amount` decimal(15,2) DEFAULT 0.00,
  `total_cgst` decimal(15,2) DEFAULT 0.00,
  `total_sgst` decimal(15,2) DEFAULT 0.00,
  `total_igst` decimal(15,2) DEFAULT 0.00,
  `total` decimal(15,2) DEFAULT 0.00,
  `items_data` json DEFAULT NULL,
  `account` varchar(255) DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `from_account` varchar(255) DEFAULT NULL,
  `to_account` varchar(255) DEFAULT NULL,
  `total_debit` decimal(15,2) DEFAULT 0.00,
  `total_credit` decimal(15,2) DEFAULT 0.00,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vouchers_voucher_number_tenant_type_unique` (`voucher_number`, `tenant_id`, `type`),
  KEY `vouchers_tenant_id_idx` (`tenant_id`),
  KEY `vouchers_type_tenant_date_idx` (`type`, `tenant_id`, `date`),
  CONSTRAINT `vouchers_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Journal Entries
CREATE TABLE IF NOT EXISTS `journal_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `voucher_id` bigint DEFAULT NULL,
  `ledger` varchar(255) NOT NULL,
  `debit` decimal(15,2) NOT NULL DEFAULT '0.00',
  `credit` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `journal_entries_tenant_id_idx` (`tenant_id`),
  KEY `journal_entries_voucher_tenant_idx` (`voucher_id`, `tenant_id`),
  KEY `journal_entries_ledger_idx` (`ledger`),
  CONSTRAINT `journal_entries_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `journal_entries_voucher_id_fk` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- INVENTORY TABLES
-- ============================================================================

-- Units
CREATE TABLE IF NOT EXISTS `inventory_units` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `symbol` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `units_name_tenant_unique` (`name`, `tenant_id`),
  KEY `units_tenant_id_idx` (`tenant_id`),
  CONSTRAINT `units_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Stock Groups
CREATE TABLE IF NOT EXISTS `inventory_stock_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `parent` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_groups_name_tenant_unique` (`name`, `tenant_id`),
  KEY `stock_groups_tenant_id_idx` (`tenant_id`),
  CONSTRAINT `stock_groups_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Stock Items
CREATE TABLE IF NOT EXISTS `inventory_stock_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `group` varchar(255) NOT NULL,
  `unit` varchar(100) NOT NULL,
  `hsn_code` varchar(20) DEFAULT NULL,
  `gst_rate` decimal(5,2) DEFAULT '0.00',
  `opening_stock` decimal(15,3) DEFAULT '0.000',
  `opening_value` decimal(15,2) DEFAULT '0.00',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_items_name_tenant_unique` (`name`, `tenant_id`),
  KEY `stock_items_tenant_id_idx` (`tenant_id`),
  CONSTRAINT `stock_items_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- OTP AND REGISTRATION TABLES
-- ============================================================================

-- OTPs
CREATE TABLE IF NOT EXISTS `otps` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `phone` varchar(15) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `attempt_count` int NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `otps_phone_idx` (`phone`),
  KEY `otps_expires_at_idx` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Pending Registrations
CREATE TABLE IF NOT EXISTS `pending_registrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(15) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `selected_plan` varchar(50) NOT NULL,
  `logo_path` varchar(500) DEFAULT NULL,
  `expires_at` datetime(6) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pending_registrations_phone_unique` (`phone`),
  KEY `pending_registrations_phone_idx` (`phone`),
  KEY `pending_registrations_expires_at_idx` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
