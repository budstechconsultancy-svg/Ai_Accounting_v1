-- ============================================================================
-- Database Migration Script
-- Purpose: Clean up unused tables and update schema to match Django models
-- Date: 2025-12-27
-- ============================================================================

-- Step 1: Remove all unused/waste tables
-- ============================================================================

-- Old Django Auth Tables (not used in current implementation)
DROP TABLE IF EXISTS `auth_group_permissions`;
DROP TABLE IF EXISTS `auth_group`;
DROP TABLE IF EXISTS `auth_permission`;

-- Old Company Tables (replaced by company_informations)
DROP TABLE IF EXISTS `company_details`;
DROP TABLE IF EXISTS `company_information`;

-- Old User Table (replaced by users table with proper schema)
DROP TABLE IF EXISTS `core_user`;

-- Django System Tables (can be regenerated if needed)
DROP TABLE IF EXISTS `django_admin_log`;
DROP TABLE IF EXISTS `django_content_type`;
DROP TABLE IF EXISTS `django_migrations`;
DROP TABLE IF EXISTS `django_session`;

-- Old Polymorphic Tables (replaced by separate tables)
DROP TABLE IF EXISTS `masters`;
DROP TABLE IF EXISTS `inventory`;

-- Old Voucher Tables (replaced by unified vouchers table)
DROP TABLE IF EXISTS `voucher_numbering`;
DROP TABLE IF EXISTS `voucher_types`;

-- Old Permission/Role Tables (no longer using database tables for permissions)
DROP TABLE IF EXISTS `permission_modules`;
DROP TABLE IF EXISTS `permission_submodules`;
DROP TABLE IF EXISTS `role_submodule_permissions`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `user_roles`;

-- Step 2: Update existing tables to match Django models
-- ============================================================================

-- Update users table
ALTER TABLE `users` 
  DROP COLUMN IF EXISTS `is_superuser`,
  DROP COLUMN IF EXISTS `first_name`,
  DROP COLUMN IF EXISTS `last_name`,
  DROP COLUMN IF EXISTS `is_staff`,
  DROP COLUMN IF EXISTS `date_joined`,
  DROP COLUMN IF EXISTS `email_verified`,
  MODIFY COLUMN `username` varchar(100) NOT NULL,
  MODIFY COLUMN `company_name` varchar(255) NOT NULL,
  MODIFY COLUMN `email` varchar(255) DEFAULT NULL,
  MODIFY COLUMN `selected_plan` varchar(50) NOT NULL,
  ADD COLUMN IF NOT EXISTS `login_status` varchar(20) DEFAULT 'Offline' AFTER `is_active`,
  ADD COLUMN IF NOT EXISTS `last_activity` datetime(6) DEFAULT NULL AFTER `login_status`,
  ADD UNIQUE KEY IF NOT EXISTS `company_name` (`company_name`);

-- Update tenant_users table
ALTER TABLE `tenant_users`
  DROP COLUMN IF EXISTS `role`,
  DROP COLUMN IF EXISTS `phone`,
  MODIFY COLUMN `username` varchar(100) NOT NULL,
  MODIFY COLUMN `email` varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `selected_submodule_ids` json DEFAULT NULL AFTER `is_active`,
  DROP INDEX IF EXISTS `tenant_users_username_tenant_unique`,
  ADD UNIQUE KEY IF NOT EXISTS `tenant_users_username_unique` (`username`);

-- Update company_informations table
ALTER TABLE `company_informations`
  ADD COLUMN IF NOT EXISTS `mobile` varchar(15) DEFAULT NULL AFTER `phone`,
  MODIFY COLUMN `email` varchar(255) DEFAULT NULL,
  MODIFY COLUMN `website` varchar(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `business_type` varchar(50) DEFAULT NULL AFTER `tan`,
  ADD COLUMN IF NOT EXISTS `industry_type` varchar(100) DEFAULT NULL AFTER `business_type`,
  ADD COLUMN IF NOT EXISTS `signature_path` varchar(500) DEFAULT NULL AFTER `logo_path`,
  ADD COLUMN IF NOT EXISTS `bank_name` varchar(255) DEFAULT NULL AFTER `signature_path`,
  ADD COLUMN IF NOT EXISTS `bank_account_no` varchar(20) DEFAULT NULL AFTER `bank_name`,
  ADD COLUMN IF NOT EXISTS `bank_ifsc` varchar(11) DEFAULT NULL AFTER `bank_account_no`,
  ADD COLUMN IF NOT EXISTS `bank_branch` varchar(255) DEFAULT NULL AFTER `bank_ifsc`,
  ADD COLUMN IF NOT EXISTS `voucher_numbering` json DEFAULT NULL AFTER `bank_branch`;

-- Update inventory_stock_items table
ALTER TABLE `inventory_stock_items`
  ADD COLUMN IF NOT EXISTS `opening_balance` decimal(15,3) DEFAULT '0.000' AFTER `unit`,
  ADD COLUMN IF NOT EXISTS `current_balance` decimal(15,3) DEFAULT '0.000' AFTER `opening_balance`,
  ADD COLUMN IF NOT EXISTS `rate` decimal(15,2) DEFAULT '0.00' AFTER `current_balance`,
  ADD COLUMN IF NOT EXISTS `description` text AFTER `gst_rate`,
  DROP COLUMN IF EXISTS `opening_stock`,
  DROP COLUMN IF EXISTS `opening_value`;

-- Step 3: Create missing tables
-- ============================================================================

-- Create stock_movements table if it doesn't exist
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
-- Migration Complete
-- ============================================================================
