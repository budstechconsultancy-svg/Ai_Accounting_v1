-- ============================================================================
-- Cleanup Script: Remove Unused/Waste Tables
-- This script removes all old, deprecated, and unused tables from the database
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

-- ============================================================================
-- Cleanup Complete
-- ============================================================================
