-- ============================================================================
-- Migration: Add Master Ledger Extended Fields
-- Purpose: Add proper columns for all ledger type-specific fields
-- Date: 2025-12-26
-- ============================================================================

USE ai_accounting;

-- Add master hierarchy reference
ALTER TABLE `master_ledgers` 
ADD COLUMN `master_reference_id` bigint DEFAULT NULL COMMENT 'FK to master_hierarchy_raw for COA reference';

-- Loan Fields (Secured/Unsecured Loans)
ALTER TABLE `master_ledgers`
ADD COLUMN `loan_account_number` varchar(100) DEFAULT NULL,
ADD COLUMN `pan_gstin` varchar(15) DEFAULT NULL,
ADD COLUMN `lender_name` varchar(255) DEFAULT NULL,
ADD COLUMN `loan_amount` decimal(15,2) DEFAULT NULL,
ADD COLUMN `interest_type` varchar(50) DEFAULT NULL COMMENT 'Fixed/Floating/etc',
ADD COLUMN `interest_rate` decimal(5,2) DEFAULT NULL COMMENT 'Interest rate percentage',
ADD COLUMN `tenure` int DEFAULT NULL COMMENT 'Loan tenure in months';

-- Bank Account Fields (Bank OD/CC Accounts)
ALTER TABLE `master_ledgers`
ADD COLUMN `bank_account_number` varchar(100) DEFAULT NULL,
ADD COLUMN `gstin_pan` varchar(15) DEFAULT NULL,
ADD COLUMN `enable_bank_reconciliation` tinyint(1) DEFAULT 0,
ADD COLUMN `bank_name` varchar(255) DEFAULT NULL,
ADD COLUMN `ifsc_code` varchar(11) DEFAULT NULL,
ADD COLUMN `branch` varchar(255) DEFAULT NULL,
ADD COLUMN `banking_currency` varchar(3) DEFAULT 'INR';

-- Trade Payables Fields
ALTER TABLE `master_ledgers`
ADD COLUMN `reference_wise_tracking` varchar(50) DEFAULT NULL,
ADD COLUMN `credit_period` int DEFAULT NULL COMMENT 'Credit period in days';

-- Tangible Assets Fields
ALTER TABLE `master_ledgers`
ADD COLUMN `is_depreciation_per_income_tax` varchar(10) DEFAULT NULL,
ADD COLUMN `depreciation_percentage` decimal(5,2) DEFAULT NULL;

-- Intangible Assets Fields
ALTER TABLE `master_ledgers`
ADD COLUMN `is_amortization_per_income_tax` varchar(10) DEFAULT NULL,
ADD COLUMN `amortization_percentage` decimal(5,2) DEFAULT NULL;

-- Investment in Preference Shares Fields
ALTER TABLE `master_ledgers`
ADD COLUMN `company_cin` varchar(21) DEFAULT NULL,
ADD COLUMN `dividend_rate` decimal(5,2) DEFAULT NULL;

-- Investment in Equity Instruments Fields
ALTER TABLE `master_ledgers`
ADD COLUMN `equity_instruments_cin` varchar(21) DEFAULT NULL;

-- Investment in Debentures/Bonds Fields
ALTER TABLE `master_ledgers`
ADD COLUMN `debenture_bond_cin` varchar(21) DEFAULT NULL,
ADD COLUMN `debenture_bond_interest_rate` decimal(5,2) DEFAULT NULL,
ADD COLUMN `debenture_bond_maturity_date` date DEFAULT NULL;

-- Inventory Fields
ALTER TABLE `master_ledgers`
ADD COLUMN `inventory_type` varchar(100) DEFAULT NULL,
ADD COLUMN `inventory_valuation_method` varchar(50) DEFAULT NULL;

-- Capital Work in Progress Fields
ALTER TABLE `master_ledgers`
ADD COLUMN `cwip_project_name` varchar(255) DEFAULT NULL,
ADD COLUMN `cwip_estimated_completion_date` date DEFAULT NULL;

-- Add index for master_reference_id for better query performance
CREATE INDEX `master_ledgers_master_ref_idx` ON `master_ledgers` (`master_reference_id`);

-- ============================================================================
-- Migration Complete
-- ============================================================================
