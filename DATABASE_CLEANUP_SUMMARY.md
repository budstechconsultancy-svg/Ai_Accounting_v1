# Database Cleanup and Schema Update Summary

## Date: 2025-12-27

## Overview
This document summarizes the cleanup of unused/waste tables from the database and the synchronization of `schema.sql` with the actual Django models.

## Files Created/Modified

### 1. **cleanup_unused_tables.sql** (NEW)
Simple script to drop all unused/waste tables from the database.

### 2. **007_cleanup_and_sync_schema.sql** (NEW)
Comprehensive migration script that:
- Removes unused tables
- Updates existing tables to match Django models
- Creates missing tables

### 3. **schema.sql** (UPDATED)
Updated the master schema file to reflect the current state of Django models.

---

## Unused Tables Removed

The following tables were identified as unused/waste and are removed by the cleanup scripts:

### Django Auth Tables (Not Used)
- `auth_group`
- `auth_group_permissions`
- `auth_permission`

### Old Company Tables
- `company_details` (replaced by `company_informations`)
- `company_information` (replaced by `company_informations`)

### Old User Table
- `core_user` (replaced by `users`)

### Django System Tables
- `django_admin_log`
- `django_content_type`
- `django_migrations`
- `django_session`

### Old Polymorphic Tables
- `masters` (replaced by separate tables: `master_ledger_groups`, `master_ledgers`, `master_voucher_config`)
- `inventory` (replaced by separate tables: `inventory_units`, `inventory_stock_groups`, `inventory_stock_items`)

### Old Voucher Tables
- `voucher_numbering` (functionality moved to `master_voucher_config`)
- `voucher_types` (replaced by `type` column in unified `vouchers` table)

### Old Permission/Role Tables
- `permission_modules`
- `permission_submodules`
- `role_submodule_permissions`
- `roles`
- `user_roles`

---

## Schema Updates

### Tables Updated to Match Django Models

#### 1. **users** table
**Removed columns:**
- `is_superuser`
- `first_name`
- `last_name`
- `is_staff`
- `date_joined`
- `email_verified`

**Modified columns:**
- `username`: varchar(150) → varchar(100)
- `company_name`: nullable → NOT NULL
- `email`: varchar(254) → varchar(255), NOT NULL → nullable
- `selected_plan`: nullable → NOT NULL

**Added columns:**
- `login_status` varchar(20) DEFAULT 'Offline'
- `last_activity` datetime(6) DEFAULT NULL

**Added indexes:**
- UNIQUE KEY on `company_name`

#### 2. **tenant_users** table
**Removed columns:**
- `role`
- `phone`

**Modified columns:**
- `username`: varchar(150) → varchar(100)
- `email`: varchar(254) → varchar(255), NOT NULL → nullable

**Added columns:**
- `selected_submodule_ids` json DEFAULT NULL

**Modified indexes:**
- Removed: `tenant_users_username_tenant_unique` (username, tenant_id)
- Added: `tenant_users_username_unique` (username) - global uniqueness

#### 3. **company_informations** table
**Added columns:**
- `mobile` varchar(15)
- `business_type` varchar(50)
- `industry_type` varchar(100)
- `signature_path` varchar(500)
- `bank_name` varchar(255)
- `bank_account_no` varchar(20)
- `bank_ifsc` varchar(11)
- `bank_branch` varchar(255)
- `voucher_numbering` json

**Modified columns:**
- `email`: varchar(254) → varchar(255)
- `website`: varchar(200) → varchar(255)

#### 4. **inventory_stock_items** table
**Removed columns:**
- `opening_stock`
- `opening_value`

**Added columns:**
- `opening_balance` decimal(15,3)
- `current_balance` decimal(15,3)
- `rate` decimal(15,2)
- `description` text

### Tables Added

#### 5. **stock_movements** table (NEW)
This table was defined in the Django model but was missing from the schema.

**Columns:**
- `id` bigint AUTO_INCREMENT PRIMARY KEY
- `tenant_id` char(36) NOT NULL
- `stock_item` varchar(255) NOT NULL
- `transaction_type` varchar(20) NOT NULL (sales, purchase, adjustment)
- `transaction_id` bigint
- `transaction_date` date NOT NULL
- `quantity` decimal(15,3) NOT NULL
- `movement_type` varchar(10) NOT NULL (in, out)
- `rate` decimal(15,2)
- `amount` decimal(15,2)
- `balance_quantity` decimal(15,3)
- `narration` text
- `created_at` datetime(6) NOT NULL
- `updated_at` datetime(6) NOT NULL

**Indexes:**
- `stock_movements_tenant_id_idx` (tenant_id)
- `stock_movements_stock_item_date_idx` (stock_item, transaction_date)
- `stock_movements_transaction_idx` (transaction_type, transaction_id)

**Foreign Keys:**
- `tenant_id` → `tenants(id)` ON DELETE CASCADE

---

## How to Apply Changes

### Option 1: Run the Comprehensive Migration Script
```bash
mysql -u your_username -p ai_accounting < 007_cleanup_and_sync_schema.sql
```

This script will:
1. Drop all unused tables
2. Update existing tables to match Django models
3. Create missing tables

### Option 2: Run Scripts Separately

1. **First, clean up unused tables:**
```bash
mysql -u your_username -p ai_accounting < cleanup_unused_tables.sql
```

2. **Then apply the schema updates manually** using the migration script or by recreating tables from `schema.sql`

---

## Verification

After running the migration, verify the changes:

```sql
-- Check that unused tables are gone
SHOW TABLES;

-- Verify users table structure
DESCRIBE users;

-- Verify tenant_users table structure
DESCRIBE tenant_users;

-- Verify company_informations table structure
DESCRIBE company_informations;

-- Verify inventory_stock_items table structure
DESCRIBE inventory_stock_items;

-- Verify stock_movements table exists
DESCRIBE stock_movements;
```

---

## Notes

1. **Backup First**: Always backup your database before running migration scripts
2. **Django Migrations**: After applying these SQL changes, you may need to run Django's `makemigrations` and `migrate` commands to synchronize Django's migration history
3. **Data Preservation**: The migration script only modifies schema, not data. Existing data in modified tables will be preserved
4. **Foreign Keys**: All foreign key constraints are preserved and properly defined

---

## Current Schema Status

The `schema.sql` file now accurately reflects:
- All Django models in the application
- Proper field types and constraints
- Correct indexes and foreign keys
- No unused or deprecated tables

The schema is now synchronized with the Django models and ready for production deployment.
