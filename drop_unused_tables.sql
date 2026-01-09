-- ============================================================================
-- Drop Unused Tables - Clean Database
-- This script removes all tables that are NOT in schema.sql
-- ============================================================================

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop legacy accounting tables
DROP TABLE IF EXISTS `accounting_accountgroup`;
DROP TABLE IF EXISTS `accounting_ledger`;
DROP TABLE IF EXISTS `accounting_voucher`;
DROP TABLE IF EXISTS `accounting_voucherline`;

-- Drop inventory tables (not in schema.sql)
DROP TABLE IF EXISTS `inventory_stock_groups`;
DROP TABLE IF EXISTS `inventory_stock_items`;
DROP TABLE IF EXISTS `inventory_units`;
DROP TABLE IF EXISTS `stock_movements`;

-- Drop voucher tables (not in schema.sql)
DROP TABLE IF EXISTS `journal_entries`;
DROP TABLE IF EXISTS `vouchers`;
DROP TABLE IF EXISTS `voucher_types`;

-- Drop master tables not in schema.sql
DROP TABLE IF EXISTS `master_chart_of_accounts`;
DROP TABLE IF EXISTS `master_ledger_groups`;
DROP TABLE IF EXISTS `master_voucher_config`;
DROP TABLE IF EXISTS `masters`;

-- Drop RBAC tables (will be reimplemented later)
DROP TABLE IF EXISTS `modules`;
DROP TABLE IF EXISTS `role_modules`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `permissions`;

-- Drop pending registrations (temporary table)
DROP TABLE IF EXISTS `pending_registrations`;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- Tables Remaining (as per schema.sql):
-- - tenants
-- - users
-- - tenant_users
-- - company_informations
-- - master_ledgers
-- - master_hierarchy_raw
-- - questions
-- - answers
-- - Transcaction_file
-- - django_migrations (Django internal, kept)
-- ============================================================================
