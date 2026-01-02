-- ============================================================================
-- DYNAMIC QUESTIONS SYSTEM FOR LEDGER CREATION
-- ============================================================================
-- This schema implements a fully data-driven questions system where:
-- 1. Questions are configured globally (from Excel)
-- 2. Questions are mapped to hierarchy nodes (category/group/sub-group/ledger)
-- 3. Answers are stored per tenant in JSON format
-- 4. No hardcoding in frontend - all questions come from backend
-- ============================================================================

-- ============================================================================
-- TABLE 1: MASTER QUESTIONS (GLOBAL - READ ONLY)
-- ============================================================================
-- Stores all possible questions that can be asked during ledger creation
-- This table is populated from Excel and is shared across all tenants
-- Questions are reusable and can be mapped to multiple hierarchy nodes

CREATE TABLE IF NOT EXISTS `master_questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  
  -- Question Identification
  `question_code` varchar(50) NOT NULL COMMENT 'Unique code for the question (e.g., Q_OPENING_BALANCE, Q_GSTIN)',
  `question_text` varchar(500) NOT NULL COMMENT 'The actual question to display in UI',
  `question_type` varchar(50) NOT NULL COMMENT 'text, number, decimal, date, dropdown, checkbox, radio, email, phone, gstin, pan, state',
  
  -- Validation Rules
  `is_required` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Whether this question must be answered',
  `validation_rules` json DEFAULT NULL COMMENT 'JSON object with validation rules: {min, max, pattern, options, etc}',
  `default_value` varchar(255) DEFAULT NULL COMMENT 'Default value if any',
  `help_text` text DEFAULT NULL COMMENT 'Help text to show below the question',
  
  -- Display Order
  `display_order` int NOT NULL DEFAULT 0 COMMENT 'Order in which questions should appear',
  
  -- Metadata
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `master_questions_code_unique` (`question_code`),
  KEY `master_questions_type_idx` (`question_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Global questions library - populated from Excel';

-- ============================================================================
-- TABLE 2: HIERARCHY QUESTION MAPPING (GLOBAL - READ ONLY)
-- ============================================================================
-- Maps questions to specific hierarchy nodes
-- This table defines WHICH questions should be asked for WHICH hierarchy selection
-- Populated from Excel based on your business rules

CREATE TABLE IF NOT EXISTS `hierarchy_question_mapping` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  
  -- Hierarchy Node Identification (matches master_hierarchy_raw structure)
  `category` varchar(255) DEFAULT NULL COMMENT 'Maps to major_group_1 in master_hierarchy_raw',
  `group` varchar(255) DEFAULT NULL COMMENT 'Maps to group_1 in master_hierarchy_raw',
  `sub_group_1` varchar(255) DEFAULT NULL COMMENT 'Maps to sub_group_1_1 in master_hierarchy_raw',
  `sub_group_2` varchar(255) DEFAULT NULL COMMENT 'Maps to sub_group_2_1 in master_hierarchy_raw',
  `sub_group_3` varchar(255) DEFAULT NULL COMMENT 'Maps to sub_group_3_1 in master_hierarchy_raw',
  `ledger_type` varchar(255) DEFAULT NULL COMMENT 'Maps to ledger_1 in master_hierarchy_raw',
  
  -- Question Reference
  `question_id` bigint NOT NULL COMMENT 'Foreign key to master_questions',
  
  -- Conditional Logic (Advanced Feature)
  `condition_rules` json DEFAULT NULL COMMENT 'Optional: Show this question only if certain conditions are met',
  
  -- Metadata
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  
  PRIMARY KEY (`id`),
  KEY `hierarchy_question_mapping_question_idx` (`question_id`),
  KEY `hierarchy_question_mapping_category_idx` (`category`),
  KEY `hierarchy_question_mapping_group_idx` (`group`),
  KEY `hierarchy_question_mapping_ledger_idx` (`ledger_type`),
  CONSTRAINT `hierarchy_question_mapping_question_fk` 
    FOREIGN KEY (`question_id`) REFERENCES `master_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Maps questions to hierarchy nodes - defines which questions to ask for which selection';

-- ============================================================================
-- TABLE 3: UPDATED MASTER LEDGERS (TENANT DATA)
-- ============================================================================
-- CRITICAL FIX: Add `code` field and `additional_data` field to master_ledgers
-- This stores the actual ledger instances created by tenants

-- First, let's create the ALTER statement to add missing fields
ALTER TABLE `master_ledgers` 
  ADD COLUMN `code` varchar(50) DEFAULT NULL COMMENT 'Ledger code from master_hierarchy_raw' AFTER `name`,
  ADD COLUMN `additional_data` json DEFAULT NULL COMMENT 'Stores answers to dynamic questions in JSON format' AFTER `ledger_type`,
  ADD INDEX `master_ledgers_code_idx` (`code`);

-- ============================================================================
-- EXAMPLE DATA STRUCTURE FOR additional_data JSON field:
-- ============================================================================
-- {
--   "Q_OPENING_BALANCE": "50000.00",
--   "Q_GSTIN": "27AABCU9603R1ZM",
--   "Q_STATE": "Maharashtra",
--   "Q_REGISTRATION_TYPE": "Regular",
--   "Q_PARTY_TYPE": "Vendor",
--   "Q_CREDIT_LIMIT": "100000.00",
--   "Q_CREDIT_DAYS": "30"
-- }
-- ============================================================================

-- ============================================================================
-- SAMPLE DATA: MASTER QUESTIONS
-- ============================================================================
-- These are examples of questions that would be imported from Excel

INSERT INTO `master_questions` 
(`question_code`, `question_text`, `question_type`, `is_required`, `validation_rules`, `default_value`, `help_text`, `display_order`, `created_at`, `updated_at`) 
VALUES
-- Financial Questions
('Q_OPENING_BALANCE', 'Opening Balance', 'decimal', 1, '{"min": 0, "max": 999999999.99, "decimal_places": 2}', '0.00', 'Enter the opening balance for this ledger', 1, NOW(), NOW()),
('Q_CREDIT_LIMIT', 'Credit Limit', 'decimal', 0, '{"min": 0, "max": 999999999.99, "decimal_places": 2}', NULL, 'Maximum credit allowed for this party', 2, NOW(), NOW()),
('Q_CREDIT_DAYS', 'Credit Period (Days)', 'number', 0, '{"min": 0, "max": 365}', '0', 'Number of days credit allowed', 3, NOW(), NOW()),

-- GST Related Questions
('Q_GSTIN', 'GSTIN', 'gstin', 0, '{"pattern": "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"}', NULL, 'Enter 15-digit GSTIN (e.g., 27AABCU9603R1ZM)', 4, NOW(), NOW()),
('Q_STATE', 'State', 'dropdown', 0, '{"options": ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"]}', NULL, 'Select the state for GST registration', 5, NOW(), NOW()),
('Q_REGISTRATION_TYPE', 'GST Registration Type', 'dropdown', 0, '{"options": ["Regular", "Composition", "Unregistered"]}', 'Regular', 'Type of GST registration', 6, NOW(), NOW()),

-- Party Related Questions
('Q_PARTY_TYPE', 'Party Type', 'dropdown', 0, '{"options": ["Customer", "Vendor", "Both"]}', NULL, 'Is this party a customer, vendor, or both?', 7, NOW(), NOW()),
('Q_PAN', 'PAN', 'pan', 0, '{"pattern": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$"}', NULL, 'Enter 10-character PAN (e.g., ABCDE1234F)', 8, NOW(), NOW()),
('Q_EMAIL', 'Email Address', 'email', 0, '{"pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"}', NULL, 'Email address for communication', 9, NOW(), NOW()),
('Q_PHONE', 'Phone Number', 'phone', 0, '{"pattern": "^[6-9][0-9]{9}$"}', NULL, 'Enter 10-digit mobile number', 10, NOW(), NOW()),
('Q_ADDRESS', 'Address', 'text', 0, '{"max_length": 500}', NULL, 'Full address of the party', 11, NOW(), NOW()),

-- Bank Related Questions
('Q_BANK_NAME', 'Bank Name', 'text', 0, '{"max_length": 255}', NULL, 'Name of the bank', 12, NOW(), NOW()),
('Q_ACCOUNT_NUMBER', 'Account Number', 'text', 0, '{"max_length": 20}', NULL, 'Bank account number', 13, NOW(), NOW()),
('Q_IFSC_CODE', 'IFSC Code', 'text', 0, '{"pattern": "^[A-Z]{4}0[A-Z0-9]{6}$"}', NULL, 'Bank IFSC code (e.g., SBIN0001234)', 14, NOW(), NOW()),

-- Tax Related Questions
('Q_TDS_APPLICABLE', 'TDS Applicable', 'checkbox', 0, NULL, 'false', 'Is TDS applicable for this ledger?', 15, NOW(), NOW()),
('Q_TDS_RATE', 'TDS Rate (%)', 'decimal', 0, '{"min": 0, "max": 100, "decimal_places": 2}', NULL, 'TDS rate percentage', 16, NOW(), NOW()),
('Q_TCS_APPLICABLE', 'TCS Applicable', 'checkbox', 0, NULL, 'false', 'Is TCS applicable for this ledger?', 17, NOW(), NOW());

-- ============================================================================
-- SAMPLE DATA: HIERARCHY QUESTION MAPPING
-- ============================================================================
-- These examples show how questions are mapped to specific hierarchy nodes
-- In production, this would be imported from your Excel file

-- Example 1: Questions for "Sundry Debtors" (Customers)
-- When user selects: Category=Assets, Group=Current Assets, Sub-group=Sundry Debtors
INSERT INTO `hierarchy_question_mapping` 
(`category`, `group`, `sub_group_1`, `sub_group_2`, `sub_group_3`, `ledger_type`, `question_id`, `created_at`, `updated_at`)
SELECT 'Assets', 'Current Assets', 'Sundry Debtors', NULL, NULL, NULL, id, NOW(), NOW()
FROM `master_questions` WHERE `question_code` IN ('Q_OPENING_BALANCE', 'Q_CREDIT_LIMIT', 'Q_CREDIT_DAYS', 'Q_GSTIN', 'Q_STATE', 'Q_PAN', 'Q_EMAIL', 'Q_PHONE', 'Q_ADDRESS');

-- Example 2: Questions for "Sundry Creditors" (Vendors)
-- When user selects: Category=Liabilities, Group=Current Liabilities, Sub-group=Sundry Creditors
INSERT INTO `hierarchy_question_mapping` 
(`category`, `group`, `sub_group_1`, `sub_group_2`, `sub_group_3`, `ledger_type`, `question_id`, `created_at`, `updated_at`)
SELECT 'Liabilities', 'Current Liabilities', 'Sundry Creditors', NULL, NULL, NULL, id, NOW(), NOW()
FROM `master_questions` WHERE `question_code` IN ('Q_OPENING_BALANCE', 'Q_CREDIT_LIMIT', 'Q_CREDIT_DAYS', 'Q_GSTIN', 'Q_STATE', 'Q_PAN', 'Q_EMAIL', 'Q_PHONE', 'Q_ADDRESS', 'Q_TDS_APPLICABLE', 'Q_TDS_RATE');

-- Example 3: Questions for "Bank Accounts"
-- When user selects: Category=Assets, Group=Current Assets, Sub-group=Bank Accounts
INSERT INTO `hierarchy_question_mapping` 
(`category`, `group`, `sub_group_1`, `sub_group_2`, `sub_group_3`, `ledger_type`, `question_id`, `created_at`, `updated_at`)
SELECT 'Assets', 'Current Assets', 'Bank Accounts', NULL, NULL, NULL, id, NOW(), NOW()
FROM `master_questions` WHERE `question_code` IN ('Q_OPENING_BALANCE', 'Q_BANK_NAME', 'Q_ACCOUNT_NUMBER', 'Q_IFSC_CODE');

-- Example 4: Questions for "Cash in Hand"
-- When user selects: Category=Assets, Group=Current Assets, Sub-group=Cash in Hand
INSERT INTO `hierarchy_question_mapping` 
(`category`, `group`, `sub_group_1`, `sub_group_2`, `sub_group_3`, `ledger_type`, `question_id`, `created_at`, `updated_at`)
SELECT 'Assets', 'Current Assets', 'Cash in Hand', NULL, NULL, NULL, id, NOW(), NOW()
FROM `master_questions` WHERE `question_code` = 'Q_OPENING_BALANCE';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- These indexes ensure fast lookups when matching hierarchy nodes to questions

CREATE INDEX `hierarchy_question_mapping_full_path_idx` 
ON `hierarchy_question_mapping` (`category`, `group`, `sub_group_1`, `sub_group_2`, `sub_group_3`, `ledger_type`);

-- ============================================================================
-- END OF QUESTIONS SYSTEM SCHEMA
-- ============================================================================
