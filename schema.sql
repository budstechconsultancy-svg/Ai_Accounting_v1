-- ============================================================================
-- AI Accounting Database Schema
-- Complete database schema for production deployment
-- Updated: 2025-12-27
-- Cleaned up unused tables and synchronized with Django models
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
  `selected_submodule_ids` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_users_username_unique` (`username`),
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
  `opening_balance` decimal(15,3) DEFAULT '0.000',
  `current_balance` decimal(15,3) DEFAULT '0.000',
  `rate` decimal(15,2) DEFAULT '0.00',
  `hsn_code` varchar(20) DEFAULT NULL,
  `gst_rate` decimal(5,2) DEFAULT '0.00',
  `description` text,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_items_name_tenant_unique` (`name`, `tenant_id`),
  KEY `stock_items_tenant_id_idx` (`tenant_id`),
  CONSTRAINT `stock_items_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Stock Movements
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `stock_item` varchar(255) NOT NULL,
  `transaction_type` varchar(20) NOT NULL COMMENT 'sales, purchase, adjustment',
  `transaction_id` bigint DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `movement_type` varchar(10) NOT NULL COMMENT 'in, out',
  `rate` decimal(15,2) DEFAULT '0.00',
  `amount` decimal(15,2) DEFAULT '0.00',
  `balance_quantity` decimal(15,3) DEFAULT '0.000',
  `narration` text,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `stock_movements_tenant_id_idx` (`tenant_id`),
  KEY `stock_movements_stock_item_date_idx` (`stock_item`, `transaction_date`),
  KEY `stock_movements_transaction_idx` (`transaction_type`, `transaction_id`),
  CONSTRAINT `stock_movements_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
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
