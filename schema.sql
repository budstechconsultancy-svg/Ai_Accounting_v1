-- ============================================================================
-- AI Accounting Database Schema - Current Database Structure
-- Total Tables: 37
-- ============================================================================


-- Table: amount_transactions
--------------------------------------------------------------------------------
CREATE TABLE `amount_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `transaction_type` varchar(20) NOT NULL DEFAULT 'transaction',
  `debit` decimal(15,2) NOT NULL DEFAULT '0.00',
  `credit` decimal(15,2) NOT NULL DEFAULT '0.00',
  `balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `narration` longtext,
  `ledger_id` bigint NOT NULL,
  `ledger_name` varchar(255) DEFAULT NULL COMMENT 'Ledger name (e.g., bank2, Cash, HDFC Bank)',
  `sub_group_1` varchar(255) DEFAULT NULL,
  `code` varchar(50) DEFAULT NULL,
  `voucher_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `amount_tran_tenant__d7c201_idx` (`tenant_id`,`ledger_id`,`transaction_date`),
  KEY `amount_tran_tenant__9534d3_idx` (`tenant_id`,`transaction_type`),
  KEY `amount_tran_transac_10f4ee_idx` (`transaction_date`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: answers
--------------------------------------------------------------------------------
CREATE TABLE `answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ledger_code` varchar(50) DEFAULT NULL,
  `answer` longtext,
  `tenant_id` varchar(36) DEFAULT NULL,
  `sub_group_1_1` varchar(255) DEFAULT NULL,
  `sub_group_1_2` varchar(255) DEFAULT NULL,
  `question` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: company_informations
--------------------------------------------------------------------------------
CREATE TABLE `company_informations` (
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: customer_addresses
--------------------------------------------------------------------------------
CREATE TABLE `customer_addresses` (
  `address_id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `customer_id` bigint NOT NULL,
  `address_type` enum('billing','shipping') DEFAULT NULL,
  `address_line1` text NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`address_id`),
  KEY `idx_cust_addr_tenant` (`tenant_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customer_addresses_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: customer_portal_users
--------------------------------------------------------------------------------
CREATE TABLE `customer_portal_users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `customer_id` bigint NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` text NOT NULL,
  `role` enum('owner','staff','viewer') DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `status` enum('active','blocked') DEFAULT 'active',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_customer_user` (`tenant_id`,`username`),
  KEY `idx_cpu_tenant` (`tenant_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customer_portal_users_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: customers
--------------------------------------------------------------------------------
CREATE TABLE `customers` (
  `customer_id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `customer_code` varchar(50) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_type` enum('individual','company') DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobile_no` varchar(20) DEFAULT NULL,
  `ledger_id` bigint NOT NULL,
  `credit_limit` decimal(15,2) DEFAULT NULL,
  `credit_days` int DEFAULT NULL,
  `opening_balance` decimal(15,2) DEFAULT NULL,
  `opening_balance_type` enum('debit','credit') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `uq_customer_tenant_code` (`tenant_id`,`customer_code`),
  KEY `idx_customer_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;














-- Table: master_hierarchy_raw
--------------------------------------------------------------------------------
CREATE TABLE `master_hierarchy_raw` (
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
) ENGINE=InnoDB AUTO_INCREMENT=597 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: master_ledgers
--------------------------------------------------------------------------------
CREATE TABLE `master_ledgers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Custom ledger name',
  `category` varchar(255) NOT NULL COMMENT 'From hierarchy: major_group_1',
  `group` varchar(255) DEFAULT NULL,
  `sub_group_1` varchar(255) DEFAULT NULL COMMENT 'From hierarchy: sub_group_1_1',
  `sub_group_2` varchar(255) DEFAULT NULL COMMENT 'From hierarchy: sub_group_2_1',
  `sub_group_3` varchar(255) DEFAULT NULL COMMENT 'From hierarchy: sub_group_3_1',
  `ledger_type` varchar(255) DEFAULT NULL COMMENT 'From hierarchy: ledger_1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `gstin` varchar(15) DEFAULT NULL,
  `registration_type` varchar(20) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `extended_data` json DEFAULT NULL,
  `parent_ledger_id` int DEFAULT NULL,
  `ledger_code` varchar(50) DEFAULT NULL,
  `type_of_business` varchar(255) DEFAULT NULL,
  `financial_reporting` varchar(255) DEFAULT NULL,
  `major_group` varchar(255) DEFAULT NULL,
  `ledger` varchar(255) DEFAULT NULL,
  `additional_data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `master_ledgers_name_tenant_unique` (`name`,`tenant_id`),
  UNIQUE KEY `master_ledgers_ledger_code_tenant_id_ef0135d0_uniq` (`ledger_code`,`tenant_id`),
  KEY `master_ledgers_tenant_id_idx` (`tenant_id`),
  KEY `master_ledgers_category_idx` (`category`),
  KEY `master_ledgers_group_idx` (`group`),
  CONSTRAINT `master_ledgers_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1004 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: payment_voucher_entries
--------------------------------------------------------------------------------
CREATE TABLE `payment_voucher_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `payment_voucher_id` bigint NOT NULL,
  `ledger_id` bigint NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `narration` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payment_voucher_id` (`payment_voucher_id`),
  KEY `idx_payment_entries_tenant` (`tenant_id`),
  CONSTRAINT `payment_voucher_entries_ibfk_1` FOREIGN KEY (`payment_voucher_id`) REFERENCES `payment_voucher_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: payment_voucher_master
--------------------------------------------------------------------------------
CREATE TABLE `payment_voucher_master` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `voucher_no` varchar(50) NOT NULL,
  `voucher_date` date NOT NULL,
  `paid_to_ledger_id` bigint NOT NULL,
  `cash_bank_ledger_id` bigint NOT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `reference_date` date DEFAULT NULL,
  `narration` text,
  `total_amount` decimal(15,2) NOT NULL,
  `created_by` bigint DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payment_voucher` (`tenant_id`,`voucher_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: purchase_items
--------------------------------------------------------------------------------
CREATE TABLE `purchase_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `purchase_id` bigint NOT NULL,
  `product_id` bigint DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `hsn_code` varchar(20) DEFAULT NULL,
  `batch_no` varchar(50) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `uom` varchar(50) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(15,2) DEFAULT '0.00',
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `discount_amount` decimal(15,2) DEFAULT '0.00',
  `taxable_value` decimal(15,2) DEFAULT '0.00',
  `cgst_percent` decimal(5,2) DEFAULT '0.00',
  `cgst_amount` decimal(15,2) DEFAULT '0.00',
  `sgst_percent` decimal(5,2) DEFAULT '0.00',
  `sgst_amount` decimal(15,2) DEFAULT '0.00',
  `igst_percent` decimal(5,2) DEFAULT '0.00',
  `igst_amount` decimal(15,2) DEFAULT '0.00',
  `cess_percent` decimal(5,2) DEFAULT '0.00',
  `cess_amount` decimal(15,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `purchase_id` (`purchase_id`),
  CONSTRAINT `purchase_items_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchase_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: purchase_master
--------------------------------------------------------------------------------
CREATE TABLE `purchase_master` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `purchase_invoice_no` varchar(50) NOT NULL,
  `purchase_date` date NOT NULL,
  `supplier_id` bigint DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `supplier_gstin` varchar(20) DEFAULT NULL,
  `ledger_name` varchar(255) DEFAULT NULL,
  `ledger_code` varchar(50) DEFAULT NULL,
  `billing_address` text,
  `place_of_supply` varchar(100) DEFAULT NULL,
  `state_code` varchar(10) DEFAULT NULL,
  `purchase_type` enum('LOCAL','INTERSTATE','IMPORT') DEFAULT 'LOCAL',
  `reverse_charge` tinyint(1) DEFAULT '0',
  `payment_terms` varchar(100) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `subtotal_amount` decimal(15,2) DEFAULT '0.00',
  `discount_amount` decimal(15,2) DEFAULT '0.00',
  `taxable_amount` decimal(15,2) DEFAULT '0.00',
  `cgst_amount` decimal(15,2) DEFAULT '0.00',
  `sgst_amount` decimal(15,2) DEFAULT '0.00',
  `igst_amount` decimal(15,2) DEFAULT '0.00',
  `cess_amount` decimal(15,2) DEFAULT '0.00',
  `total_tax_amount` decimal(15,2) DEFAULT '0.00',
  `round_off` decimal(15,2) DEFAULT '0.00',
  `grand_total` decimal(15,2) DEFAULT '0.00',
  `payment_status` enum('PENDING','PARTIAL','PAID') DEFAULT 'PENDING',
  `created_by` bigint DEFAULT NULL,
  `approved_by` bigint DEFAULT NULL,
  `status` enum('DRAFT','APPROVED','CANCELLED') DEFAULT 'DRAFT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_purchase_invoice` (`tenant_id`,`purchase_invoice_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: purchase_payment
--------------------------------------------------------------------------------
CREATE TABLE `purchase_payment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `purchase_id` bigint NOT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_mode` enum('CASH','BANK','UPI','CHEQUE','CARD') DEFAULT 'CASH',
  `reference_no` varchar(100) DEFAULT NULL,
  `paid_amount` decimal(15,2) DEFAULT '0.00',
  `balance_amount` decimal(15,2) DEFAULT '0.00',
  `bank_id` bigint DEFAULT NULL,
  `status` enum('PAID','CANCELLED') DEFAULT 'PAID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `purchase_id` (`purchase_id`),
  CONSTRAINT `purchase_payment_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchase_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: purchase_return_items
--------------------------------------------------------------------------------
CREATE TABLE `purchase_return_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `purchase_return_id` bigint NOT NULL,
  `product_id` bigint DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(15,2) DEFAULT '0.00',
  `taxable_value` decimal(15,2) DEFAULT '0.00',
  `tax_amount` decimal(15,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `purchase_return_id` (`purchase_return_id`),
  CONSTRAINT `purchase_return_items_ibfk_1` FOREIGN KEY (`purchase_return_id`) REFERENCES `purchase_returns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: purchase_returns
--------------------------------------------------------------------------------
CREATE TABLE `purchase_returns` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `original_purchase_id` bigint NOT NULL,
  `return_invoice_no` varchar(50) NOT NULL,
  `return_date` date DEFAULT NULL,
  `supplier_id` bigint DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `subtotal_amount` decimal(15,2) DEFAULT '0.00',
  `tax_amount` decimal(15,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) DEFAULT '0.00',
  `status` enum('DRAFT','APPROVED','CANCELLED') DEFAULT 'DRAFT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `original_purchase_id` (`original_purchase_id`),
  CONSTRAINT `purchase_returns_ibfk_1` FOREIGN KEY (`original_purchase_id`) REFERENCES `purchase_master` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: questions
--------------------------------------------------------------------------------
CREATE TABLE `questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sub_group_1_2` varchar(50) DEFAULT NULL,
  `sub_group_1_1` varchar(255) DEFAULT NULL,
  `question` varchar(500) NOT NULL,
  `condition_rule` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sg1_question` (`sub_group_1_2`,`question`)
) ENGINE=InnoDB AUTO_INCREMENT=1071 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: receipt_voucher_entries
--------------------------------------------------------------------------------
CREATE TABLE `receipt_voucher_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `receipt_voucher_id` bigint NOT NULL,
  `ledger_id` bigint NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `narration` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `receipt_voucher_id` (`receipt_voucher_id`),
  KEY `idx_receipt_entries_tenant` (`tenant_id`),
  CONSTRAINT `receipt_voucher_entries_ibfk_1` FOREIGN KEY (`receipt_voucher_id`) REFERENCES `receipt_voucher_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: receipt_voucher_master
--------------------------------------------------------------------------------
CREATE TABLE `receipt_voucher_master` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `voucher_no` varchar(50) NOT NULL,
  `voucher_date` date NOT NULL,
  `received_from_ledger_id` bigint NOT NULL,
  `cash_bank_ledger_id` bigint NOT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `reference_date` date DEFAULT NULL,
  `narration` text,
  `total_amount` decimal(15,2) NOT NULL,
  `created_by` bigint DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_receipt_voucher` (`tenant_id`,`voucher_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: sales_items
--------------------------------------------------------------------------------
CREATE TABLE `sales_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `sales_id` bigint NOT NULL,
  `product_id` bigint DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `hsn_code` varchar(20) DEFAULT NULL,
  `batch_no` varchar(50) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `uom` varchar(50) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(15,2) DEFAULT '0.00',
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `discount_amount` decimal(15,2) DEFAULT '0.00',
  `taxable_value` decimal(15,2) DEFAULT '0.00',
  `cgst_percent` decimal(5,2) DEFAULT '0.00',
  `cgst_amount` decimal(15,2) DEFAULT '0.00',
  `sgst_percent` decimal(5,2) DEFAULT '0.00',
  `sgst_amount` decimal(15,2) DEFAULT '0.00',
  `igst_percent` decimal(5,2) DEFAULT '0.00',
  `igst_amount` decimal(15,2) DEFAULT '0.00',
  `cess_percent` decimal(5,2) DEFAULT '0.00',
  `cess_amount` decimal(15,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `sales_id` (`sales_id`),
  CONSTRAINT `sales_items_ibfk_1` FOREIGN KEY (`sales_id`) REFERENCES `sales_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: sales_master
--------------------------------------------------------------------------------
CREATE TABLE `sales_master` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `invoice_date` date NOT NULL,
  `customer_id` bigint DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_gstin` varchar(20) DEFAULT NULL,
  `ledger_name` varchar(255) DEFAULT NULL,
  `ledger_code` varchar(50) DEFAULT NULL,
  `billing_address` text,
  `shipping_address` text,
  `place_of_supply` varchar(100) DEFAULT NULL,
  `state_code` varchar(10) DEFAULT NULL,
  `sales_type` enum('LOCAL','INTERSTATE','EXPORT') DEFAULT 'LOCAL',
  `reverse_charge` tinyint(1) DEFAULT '0',
  `payment_terms` varchar(100) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `subtotal_amount` decimal(15,2) DEFAULT '0.00',
  `discount_amount` decimal(15,2) DEFAULT '0.00',
  `taxable_amount` decimal(15,2) DEFAULT '0.00',
  `cgst_amount` decimal(15,2) DEFAULT '0.00',
  `sgst_amount` decimal(15,2) DEFAULT '0.00',
  `igst_amount` decimal(15,2) DEFAULT '0.00',
  `cess_amount` decimal(15,2) DEFAULT '0.00',
  `total_tax_amount` decimal(15,2) DEFAULT '0.00',
  `round_off` decimal(15,2) DEFAULT '0.00',
  `grand_total` decimal(15,2) DEFAULT '0.00',
  `payment_status` enum('PENDING','PARTIAL','PAID') DEFAULT 'PENDING',
  `created_by` bigint DEFAULT NULL,
  `approved_by` bigint DEFAULT NULL,
  `status` enum('DRAFT','APPROVED','CANCELLED') DEFAULT 'DRAFT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_sales_invoice` (`tenant_id`,`invoice_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: sales_payment
--------------------------------------------------------------------------------
CREATE TABLE `sales_payment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `sales_id` bigint NOT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_mode` enum('CASH','BANK','UPI','CHEQUE','CARD') DEFAULT 'CASH',
  `reference_no` varchar(100) DEFAULT NULL,
  `paid_amount` decimal(15,2) DEFAULT '0.00',
  `balance_amount` decimal(15,2) DEFAULT '0.00',
  `bank_id` bigint DEFAULT NULL,
  `status` enum('RECEIVED','BOUNCED','CANCELLED') DEFAULT 'RECEIVED',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sales_id` (`sales_id`),
  CONSTRAINT `sales_payment_ibfk_1` FOREIGN KEY (`sales_id`) REFERENCES `sales_master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: sales_return_items
--------------------------------------------------------------------------------
CREATE TABLE `sales_return_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `sales_return_id` bigint NOT NULL,
  `product_id` bigint DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT '0.00',
  `rate` decimal(15,2) DEFAULT '0.00',
  `taxable_value` decimal(15,2) DEFAULT '0.00',
  `tax_amount` decimal(15,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `sales_return_id` (`sales_return_id`),
  CONSTRAINT `sales_return_items_ibfk_1` FOREIGN KEY (`sales_return_id`) REFERENCES `sales_returns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: sales_returns
--------------------------------------------------------------------------------
CREATE TABLE `sales_returns` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `original_sales_id` bigint NOT NULL,
  `return_invoice_no` varchar(50) NOT NULL,
  `return_date` date DEFAULT NULL,
  `customer_id` bigint DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `subtotal_amount` decimal(15,2) DEFAULT '0.00',
  `tax_amount` decimal(15,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) DEFAULT '0.00',
  `status` enum('DRAFT','APPROVED','CANCELLED') DEFAULT 'DRAFT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `original_sales_id` (`original_sales_id`),
  CONSTRAINT `sales_returns_ibfk_1` FOREIGN KEY (`original_sales_id`) REFERENCES `sales_master` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



-- Table: tenants
--------------------------------------------------------------------------------
CREATE TABLE `tenants` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: transcaction_file
--------------------------------------------------------------------------------
CREATE TABLE `transcaction_file` (
  `id` bigint NOT NULL,
  `tenant_id` bigint NOT NULL,
  `financial_year_id` bigint NOT NULL,
  `ledger_code` varchar(50) DEFAULT NULL,
  `ledger_name` varchar(255) NOT NULL,
  `alias_name` varchar(255) DEFAULT NULL,
  `group_id` bigint DEFAULT NULL,
  `nature` varchar(20) DEFAULT NULL,
  `ledger_type` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `opening_balance` decimal(18,2) DEFAULT '0.00',
  `opening_balance_type` varchar(10) DEFAULT NULL,
  `current_balance` decimal(18,2) DEFAULT '0.00',
  `current_balance_type` varchar(10) DEFAULT NULL,
  `closing_balance` decimal(18,2) DEFAULT '0.00',
  `closing_balance_type` varchar(10) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `branch_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `micr_code` varchar(20) DEFAULT NULL,
  `upi_id` varchar(100) DEFAULT NULL,
  `gst_applicable` tinyint(1) DEFAULT '0',
  `gst_registration_type` varchar(50) DEFAULT NULL,
  `gstin` varchar(20) DEFAULT NULL,
  `hsn_sac_code` varchar(20) DEFAULT NULL,
  `gst_rate` decimal(5,2) DEFAULT NULL,
  `cgst_rate` decimal(5,2) DEFAULT NULL,
  `sgst_rate` decimal(5,2) DEFAULT NULL,
  `igst_rate` decimal(5,2) DEFAULT NULL,
  `is_tds_applicable` tinyint(1) DEFAULT '0',
  `tds_section` varchar(20) DEFAULT NULL,
  `tds_rate` decimal(5,2) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `allow_bill_wise` tinyint(1) DEFAULT '0',
  `credit_limit` decimal(18,2) DEFAULT NULL,
  `credit_days` int DEFAULT NULL,
  `is_cost_center_required` tinyint(1) DEFAULT '0',
  `is_inventory_linked` tinyint(1) DEFAULT '0',
  `is_system_ledger` tinyint(1) DEFAULT '0',
  `lock_editing` tinyint(1) DEFAULT '0',
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ledger_code` (`ledger_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: users
--------------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL DEFAULT '0',
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) DEFAULT NULL,
  `last_name` varchar(150) DEFAULT NULL,
  `email` varchar(254) DEFAULT NULL,
  `is_staff` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `date_joined` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `phone` varchar(15) DEFAULT NULL,
  `phone_verified` tinyint(1) NOT NULL DEFAULT '0',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `tenant_id` char(36) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `selected_plan` varchar(50) DEFAULT NULL,
  `logo_path` varchar(500) DEFAULT NULL,
  `login_status` varchar(20) DEFAULT 'Offline',
  `last_activity` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `users_tenant_id_idx` (`tenant_id`),
  CONSTRAINT `users_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;





-- Table: inventory_master_category
--------------------------------------------------------------------------------
CREATE TABLE `inventory_master_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `category` varchar(255) NOT NULL,
  `group` varchar(255) DEFAULT NULL,
  `subgroup` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_master_category_uniq` (`tenant_id`,`category`,`group`,`subgroup`),
  KEY `inventory_master_category_tenant_id_idx` (`tenant_id`),
  KEY `inventory_master_category_is_active_idx` (`tenant_id`, `is_active`),
  KEY `inventory_master_category_category_idx` (`category`),
  CONSTRAINT `inventory_master_category_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: vendor_master_category
--------------------------------------------------------------------------------
CREATE TABLE `vendor_master_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `category` varchar(255) NOT NULL COMMENT 'Top-level category (e.g., RAW MATERIAL, Stores and Spares, Packing Material)',
  `group` varchar(255) DEFAULT NULL COMMENT 'Group under category (optional)',
  `subgroup` varchar(255) DEFAULT NULL COMMENT 'Subgroup under group (optional)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this category is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_category_tenant_unique` (`tenant_id`,`category`,`group`,`subgroup`),
  KEY `vendor_category_tenant_id_idx` (`tenant_id`),
  KEY `vendor_category_is_active_idx` (`tenant_id`, `is_active`),
  KEY `vendor_category_category_idx` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Master Category - Stores vendor category hierarchy';


-- Table: vendor_master_posettings
--------------------------------------------------------------------------------
CREATE TABLE `vendor_master_posettings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `name` varchar(200) NOT NULL COMMENT 'Name of PO Series',
  `category_id` bigint DEFAULT NULL COMMENT 'Foreign key to inventory_master_category',
  `prefix` varchar(50) DEFAULT NULL COMMENT 'Prefix for PO number (e.g., PO/)',
  `suffix` varchar(50) DEFAULT NULL COMMENT 'Suffix for PO number (e.g., /26)',
  `digits` int NOT NULL DEFAULT '4' COMMENT 'Number of digits for sequence padding',
  `auto_year` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Auto-include financial year in PO number',
  `current_number` int NOT NULL DEFAULT '1' COMMENT 'Current/next number in the sequence',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this PO setting is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_posettings_tenant_name_unique` (`tenant_id`,`name`),
  KEY `vendor_posettings_tenant_id_idx` (`tenant_id`),
  KEY `vendor_posettings_category_id_idx` (`category_id`),
  KEY `vendor_posettings_is_active_idx` (`is_active`),
  CONSTRAINT `vendor_posettings_category_fk` FOREIGN KEY (`category_id`) REFERENCES `inventory_master_category` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor PO Settings for purchase order numbering configuration';


-- Table: vendor_master_basicdetail
--------------------------------------------------------------------------------
CREATE TABLE `vendor_master_basicdetail` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `vendor_code` varchar(50) DEFAULT NULL COMMENT 'Vendor code (auto-generated or manual)',
  `vendor_name` varchar(200) NOT NULL COMMENT 'Vendor name',
  `pan_no` varchar(10) DEFAULT NULL COMMENT 'PAN number',
  `contact_person` varchar(100) DEFAULT NULL COMMENT 'Contact person name',
  `email` varchar(255) NOT NULL COMMENT 'Email address',
  `contact_no` varchar(20) NOT NULL COMMENT 'Contact number',
  `is_also_customer` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Is this vendor also a customer?',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this vendor is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  `updated_by` varchar(100) DEFAULT NULL COMMENT 'Updated by user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_basicdetail_tenant_code_unique` (`tenant_id`,`vendor_code`),
  KEY `vendor_basicdetail_tenant_id_idx` (`tenant_id`),
  KEY `vendor_basicdetail_tenant_name_idx` (`tenant_id`,`vendor_name`),
  KEY `vendor_basicdetail_email_idx` (`email`),
  KEY `vendor_basicdetail_pan_idx` (`pan_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Master Basic Details for vendor creation';


-- Table: vendor_master_gstdetails
--------------------------------------------------------------------------------
CREATE TABLE `vendor_master_gstdetails` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `vendor_basic_detail_id` bigint DEFAULT NULL COMMENT 'Foreign key to vendor_master_basicdetail',
  `gstin` varchar(15) NOT NULL COMMENT 'GSTIN number (15 characters)',
  `gst_registration_type` varchar(50) NOT NULL DEFAULT 'regular' COMMENT 'GST registration type',
  `legal_name` varchar(200) NOT NULL COMMENT 'Legal name as per GST',
  `trade_name` varchar(200) DEFAULT NULL COMMENT 'Trade/Brand name',
  `gst_state` varchar(100) DEFAULT NULL COMMENT 'State of GST registration',
  `gst_state_code` varchar(2) DEFAULT NULL COMMENT 'State code (2 digits)',
  `pan_linked_with_gstin` varchar(10) DEFAULT NULL COMMENT 'PAN linked with GSTIN',
  `date_of_registration` date DEFAULT NULL COMMENT 'Date of GST registration',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this GST detail is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  `updated_by` varchar(100) DEFAULT NULL COMMENT 'Updated by user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_gstdetails_tenant_gstin_unique` (`tenant_id`,`gstin`),
  KEY `vendor_gstdetails_tenant_id_idx` (`tenant_id`),
  KEY `vendor_gstdetails_gstin_idx` (`gstin`),
  KEY `vendor_gstdetails_vendor_basic_detail_id_idx` (`vendor_basic_detail_id`),
  CONSTRAINT `vendor_gstdetails_vendor_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Master GST Details';


-- Table: vendor_master_productservices
--------------------------------------------------------------------------------
CREATE TABLE `vendor_master_productservices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `vendor_basic_detail_id` bigint DEFAULT NULL COMMENT 'Foreign key to vendor_master_basicdetail',
  `hsn_sac_code` varchar(20) DEFAULT NULL COMMENT 'HSN or SAC Code',
  `item_code` varchar(50) DEFAULT NULL COMMENT 'Internal Item Code',
  `item_name` varchar(200) NOT NULL COMMENT 'Internal Item Name',
  `supplier_item_code` varchar(50) DEFAULT NULL COMMENT 'Supplier Item Code',
  `supplier_item_name` varchar(200) DEFAULT NULL COMMENT 'Supplier Item Name',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this item is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  `updated_by` varchar(100) DEFAULT NULL COMMENT 'Updated by user',
  PRIMARY KEY (`id`),
  KEY `vendor_prodserv_tenant_id_idx` (`tenant_id`),
  KEY `vendor_prodserv_vendor_id_idx` (`vendor_basic_detail_id`),
  KEY `vendor_prodserv_item_code_idx` (`item_code`),
  CONSTRAINT `vendor_prodserv_vendor_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Master Products/Services';


-- Table: vendor_master_tds
--------------------------------------------------------------------------------
CREATE TABLE `vendor_master_tds` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `vendor_basic_detail_id` bigint DEFAULT NULL COMMENT 'Foreign key to vendor_master_basicdetail',
  `tds_section_applicable` varchar(100) DEFAULT NULL COMMENT 'TDS Section Applicable',
  `enable_automatic_tds_posting` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Enable automatic TDS posting',
  `msme_udyam_no` varchar(50) DEFAULT NULL COMMENT 'MSME Udyam Registration Number',
  `fssai_license_no` varchar(50) DEFAULT NULL COMMENT 'FSSAI License Number',
  `import_export_code` varchar(50) DEFAULT NULL COMMENT 'Import Export Code (IEC)',
  `eou_status` varchar(100) DEFAULT NULL COMMENT 'Export Oriented Unit Status',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this TDS detail is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  `updated_by` varchar(100) DEFAULT NULL COMMENT 'Updated by user',
  PRIMARY KEY (`id`),
  KEY `vendor_tds_tenant_id_idx` (`tenant_id`),
  KEY `vendor_tds_vendor_basic_detail_id_idx` (`vendor_basic_detail_id`),
  CONSTRAINT `vendor_tds_vendor_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Master TDS & Other Statutory Details';



-- Table: warehouses
--------------------------------------------------------------------------------
CREATE TABLE `warehouses` (
  `warehouse_id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `warehouse_code` varchar(50) NOT NULL,
  `warehouse_name` varchar(255) NOT NULL,
  PRIMARY KEY (`warehouse_id`),
  UNIQUE KEY `uq_wh_tenant_code` (`tenant_id`,`warehouse_code`),
  KEY `idx_wh_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: inventory_master_category
--------------------------------------------------------------------------------
CREATE TABLE `inventory_master_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `category` varchar(255) NOT NULL,
  `group` varchar(255) DEFAULT NULL,
  `subgroup` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventory_master_category_uniq` (`tenant_id`,`category`,`group`,`subgroup`),
  KEY `inventory_master_category_tenant_id_idx` (`tenant_id`),
  KEY `inventory_master_category_is_active_idx` (`tenant_id`, `is_active`),
  KEY `inventory_master_category_category_idx` (`category`),
  CONSTRAINT `inventory_master_category_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `vendor_master_banking`
--

CREATE TABLE IF NOT EXISTS `vendor_master_banking` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `vendor_basic_detail_id` bigint DEFAULT NULL COMMENT 'Foreign key to vendor_master_basicdetail',
  `bank_account_no` varchar(50) NOT NULL COMMENT 'Bank Account Number',
  `bank_name` varchar(200) NOT NULL COMMENT 'Bank Name',
  `ifsc_code` varchar(11) NOT NULL COMMENT 'IFSC Code',
  `branch_name` varchar(200) DEFAULT NULL COMMENT 'Branch Name',
  `swift_code` varchar(11) DEFAULT NULL COMMENT 'SWIFT Code',
  `vendor_branch` varchar(200) DEFAULT NULL COMMENT 'Associate to a vendor branch',
  `account_type` varchar(20) NOT NULL DEFAULT 'current' COMMENT 'Type of bank account',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this banking detail is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  `updated_by` varchar(100) DEFAULT NULL COMMENT 'Updated by user',
  PRIMARY KEY (`id`),
  KEY `vendor_banking_tenant_id_idx` (`tenant_id`),
  KEY `vendor_banking_vendor_basic_detail_id_idx` (`vendor_basic_detail_id`),
  KEY `vendor_banking_bank_account_no_idx` (`bank_account_no`),
  CONSTRAINT `vendor_banking_vendor_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Master Banking Information';  CONSTRAINT `vendor_banking_vendor_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Master Banking Information';


--
-- Table structure for table `vendor_master_terms`
--

CREATE TABLE IF NOT EXISTS `vendor_master_terms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `vendor_basic_detail_id` bigint DEFAULT NULL COMMENT 'Foreign key to vendor_master_basicdetail',
  `credit_limit` decimal(15,2) DEFAULT NULL COMMENT 'Credit limit amount',
  `credit_period` varchar(100) DEFAULT NULL COMMENT 'Credit period (e.g., 30 days, 60 days)',
  `credit_terms` text COMMENT 'Credit terms and conditions',
  `penalty_terms` text COMMENT 'Penalty terms for late payments or breaches',
  `delivery_terms` text COMMENT 'Delivery terms, lead time, shipping conditions',
  `warranty_guarantee_details` text COMMENT 'Warranty and guarantee terms',
  `force_majeure` text COMMENT 'Force majeure clauses',
  `dispute_redressal_terms` text COMMENT 'Dispute resolution and redressal terms',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this terms detail is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  `updated_by` varchar(100) DEFAULT NULL COMMENT 'Updated by user',
  PRIMARY KEY (`id`),
  KEY `vendor_terms_tenant_id_idx` (`tenant_id`),
  KEY `vendor_terms_vendor_basic_detail_id_idx` (`vendor_basic_detail_id`),
  CONSTRAINT `vendor_terms_vendor_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Master Terms and Conditions';
--
-- Table structure for table `vendor_transaction_po`
-- Purchase Order transaction table for vendors
--

CREATE TABLE IF NOT EXISTS `vendor_transaction_po` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `po_number` varchar(50) NOT NULL COMMENT 'Purchase Order Number',
  `po_series_id` bigint DEFAULT NULL COMMENT 'Foreign key to vendor_master_posettings',
  `vendor_basic_detail_id` bigint DEFAULT NULL COMMENT 'Foreign key to vendor_master_basicdetail',
  `vendor_name` varchar(200) DEFAULT NULL COMMENT 'Vendor name (denormalized)',
  `branch` varchar(200) DEFAULT NULL COMMENT 'Vendor branch',
  `address_line1` varchar(255) DEFAULT NULL COMMENT 'Address Line 1',
  `address_line2` varchar(255) DEFAULT NULL COMMENT 'Address Line 2',
  `address_line3` varchar(255) DEFAULT NULL COMMENT 'Address Line 3',
  `city` varchar(100) DEFAULT NULL COMMENT 'City',
  `state` varchar(100) DEFAULT NULL COMMENT 'State',
  `country` varchar(100) DEFAULT NULL COMMENT 'Country',
  `pincode` varchar(20) DEFAULT NULL COMMENT 'Pincode',
  `email_address` varchar(255) DEFAULT NULL COMMENT 'Email Address',
  `contract_no` varchar(100) DEFAULT NULL COMMENT 'Contract Number',
  `receive_by` date DEFAULT NULL COMMENT 'Expected receive date',
  `receive_at` varchar(200) DEFAULT NULL COMMENT 'Receive at location',
  `delivery_terms` text COMMENT 'Delivery terms and conditions',
  `total_taxable_value` decimal(15,2) DEFAULT 0.00 COMMENT 'Total taxable value',
  `total_tax` decimal(15,2) DEFAULT 0.00 COMMENT 'Total tax amount',
  `total_value` decimal(15,2) DEFAULT 0.00 COMMENT 'Total PO value',
  `status` varchar(50) DEFAULT 'Draft' COMMENT 'PO Status: Draft, Pending Approval, Approved, Mailed, Closed',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this PO is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  `updated_by` varchar(100) DEFAULT NULL COMMENT 'Updated by user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendor_po_tenant_number_unique` (`tenant_id`,`po_number`),
  KEY `vendor_po_tenant_id_idx` (`tenant_id`),
  KEY `vendor_po_series_id_idx` (`po_series_id`),
  KEY `vendor_po_vendor_id_idx` (`vendor_basic_detail_id`),
  KEY `vendor_po_status_idx` (`status`),
  CONSTRAINT `vendor_po_series_fk` FOREIGN KEY (`po_series_id`) REFERENCES `vendor_master_posettings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `vendor_po_vendor_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Vendor Purchase Order Transactions';


--
-- Separate Master Tables for Each Voucher Type
-- This replaces the single voucher_configuration table
-- Each table includes "include_from_existing_series" column
--

--
-- Table: master_voucher_sales
--
CREATE TABLE IF NOT EXISTS `master_voucher_sales` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `voucher_name` varchar(100) NOT NULL COMMENT 'Voucher name',
  `prefix` varchar(20) DEFAULT NULL COMMENT 'Prefix for voucher number',
  `suffix` varchar(20) DEFAULT NULL COMMENT 'Suffix for voucher number',
  `start_from` int DEFAULT 1 COMMENT 'Starting number',
  `current_number` int DEFAULT 1 COMMENT 'Current number in sequence',
  `required_digits` int DEFAULT 4 COMMENT 'Number of digits for padding',
  `enable_auto_numbering` tinyint(1) DEFAULT 1 COMMENT 'Enable automatic numbering',
  `update_customer_master` tinyint(1) DEFAULT 0 COMMENT 'Update customer master',
  `include_from_existing_series` varchar(200) DEFAULT NULL COMMENT 'Include from existing series (dropdown selection)',
  `effective_from` date DEFAULT NULL COMMENT 'Effective from date',
  `effective_to` date DEFAULT NULL COMMENT 'Effective to date',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_sales` (`tenant_id`),
  KEY `idx_voucher_name_sales` (`voucher_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Sales Voucher Master';

--
-- Table: master_voucher_creditnote
--
CREATE TABLE IF NOT EXISTS `master_voucher_creditnote` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `voucher_name` varchar(100) NOT NULL COMMENT 'Voucher name',
  `prefix` varchar(20) DEFAULT NULL COMMENT 'Prefix for voucher number',
  `suffix` varchar(20) DEFAULT NULL COMMENT 'Suffix for voucher number',
  `start_from` int DEFAULT 1 COMMENT 'Starting number',
  `current_number` int DEFAULT 1 COMMENT 'Current number in sequence',
  `required_digits` int DEFAULT 4 COMMENT 'Number of digits for padding',
  `enable_auto_numbering` tinyint(1) DEFAULT 1 COMMENT 'Enable automatic numbering',
  `include_from_existing_series` varchar(200) DEFAULT NULL COMMENT 'Include from existing series (dropdown selection)',
  `effective_from` date DEFAULT NULL COMMENT 'Effective from date',
  `effective_to` date DEFAULT NULL COMMENT 'Effective to date',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_creditnote` (`tenant_id`),
  KEY `idx_voucher_name_creditnote` (`voucher_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Credit Note Voucher Master';

--
-- Table: master_voucher_receipts
--
CREATE TABLE IF NOT EXISTS `master_voucher_receipts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `voucher_name` varchar(100) NOT NULL COMMENT 'Voucher name',
  `prefix` varchar(20) DEFAULT NULL COMMENT 'Prefix for voucher number',
  `suffix` varchar(20) DEFAULT NULL COMMENT 'Suffix for voucher number',
  `start_from` int DEFAULT 1 COMMENT 'Starting number',
  `current_number` int DEFAULT 1 COMMENT 'Current number in sequence',
  `required_digits` int DEFAULT 4 COMMENT 'Number of digits for padding',
  `enable_auto_numbering` tinyint(1) DEFAULT 1 COMMENT 'Enable automatic numbering',
  `include_from_existing_series` varchar(200) DEFAULT NULL COMMENT 'Include from existing series (dropdown selection)',
  `effective_from` date DEFAULT NULL COMMENT 'Effective from date',
  `effective_to` date DEFAULT NULL COMMENT 'Effective to date',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_receipts` (`tenant_id`),
  KEY `idx_voucher_name_receipts` (`voucher_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Receipts Voucher Master';

--
-- Table: master_voucher_purchases
--
CREATE TABLE IF NOT EXISTS `master_voucher_purchases` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `voucher_name` varchar(100) NOT NULL COMMENT 'Voucher name',
  `prefix` varchar(20) DEFAULT NULL COMMENT 'Prefix for voucher number',
  `suffix` varchar(20) DEFAULT NULL COMMENT 'Suffix for voucher number',
  `start_from` int DEFAULT 1 COMMENT 'Starting number',
  `current_number` int DEFAULT 1 COMMENT 'Current number in sequence',
  `required_digits` int DEFAULT 4 COMMENT 'Number of digits for padding',
  `enable_auto_numbering` tinyint(1) DEFAULT 1 COMMENT 'Enable automatic numbering',
  `include_from_existing_series` varchar(200) DEFAULT NULL COMMENT 'Include from existing series (dropdown selection)',
  `effective_from` date DEFAULT NULL COMMENT 'Effective from date',
  `effective_to` date DEFAULT NULL COMMENT 'Effective to date',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_purchases` (`tenant_id`),
  KEY `idx_voucher_name_purchases` (`voucher_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Purchases Voucher Master';

--
-- Table: master_voucher_debitnote
--
CREATE TABLE IF NOT EXISTS `master_voucher_debitnote` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `voucher_name` varchar(100) NOT NULL COMMENT 'Voucher name',
  `prefix` varchar(20) DEFAULT NULL COMMENT 'Prefix for voucher number',
  `suffix` varchar(20) DEFAULT NULL COMMENT 'Suffix for voucher number',
  `start_from` int DEFAULT 1 COMMENT 'Starting number',
  `current_number` int DEFAULT 1 COMMENT 'Current number in sequence',
  `required_digits` int DEFAULT 4 COMMENT 'Number of digits for padding',
  `enable_auto_numbering` tinyint(1) DEFAULT 1 COMMENT 'Enable automatic numbering',
  `include_from_existing_series` varchar(200) DEFAULT NULL COMMENT 'Include from existing series (dropdown selection)',
  `effective_from` date DEFAULT NULL COMMENT 'Effective from date',
  `effective_to` date DEFAULT NULL COMMENT 'Effective to date',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_debitnote` (`tenant_id`),
  KEY `idx_voucher_name_debitnote` (`voucher_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Debit Note Voucher Master';

--
-- Table: master_voucher_payments
--
CREATE TABLE IF NOT EXISTS `master_voucher_payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `voucher_name` varchar(100) NOT NULL COMMENT 'Voucher name',
  `prefix` varchar(20) DEFAULT NULL COMMENT 'Prefix for voucher number',
  `suffix` varchar(20) DEFAULT NULL COMMENT 'Suffix for voucher number',
  `start_from` int DEFAULT 1 COMMENT 'Starting number',
  `current_number` int DEFAULT 1 COMMENT 'Current number in sequence',
  `required_digits` int DEFAULT 4 COMMENT 'Number of digits for padding',
  `enable_auto_numbering` tinyint(1) DEFAULT 1 COMMENT 'Enable automatic numbering',
  `include_from_existing_series` varchar(200) DEFAULT NULL COMMENT 'Include from existing series (dropdown selection)',
  `effective_from` date DEFAULT NULL COMMENT 'Effective from date',
  `effective_to` date DEFAULT NULL COMMENT 'Effective to date',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_payments` (`tenant_id`),
  KEY `idx_voucher_name_payments` (`voucher_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Payments Voucher Master';

--
-- Table: master_voucher_expenses
--
CREATE TABLE IF NOT EXISTS `master_voucher_expenses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `voucher_name` varchar(100) NOT NULL COMMENT 'Voucher name',
  `prefix` varchar(20) DEFAULT NULL COMMENT 'Prefix for voucher number',
  `suffix` varchar(20) DEFAULT NULL COMMENT 'Suffix for voucher number',
  `start_from` int DEFAULT 1 COMMENT 'Starting number',
  `current_number` int DEFAULT 1 COMMENT 'Current number in sequence',
  `required_digits` int DEFAULT 4 COMMENT 'Number of digits for padding',
  `enable_auto_numbering` tinyint(1) DEFAULT 1 COMMENT 'Enable automatic numbering',
  `include_from_existing_series` varchar(200) DEFAULT NULL COMMENT 'Include from existing series (dropdown selection)',
  `effective_from` date DEFAULT NULL COMMENT 'Effective from date',
  `effective_to` date DEFAULT NULL COMMENT 'Effective to date',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_expenses` (`tenant_id`),
  KEY `idx_voucher_name_expenses` (`voucher_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Expenses Voucher Master';

--
-- Table: master_voucher_journal
--
CREATE TABLE IF NOT EXISTS `master_voucher_journal` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `voucher_name` varchar(100) NOT NULL COMMENT 'Voucher name',
  `prefix` varchar(20) DEFAULT NULL COMMENT 'Prefix for voucher number',
  `suffix` varchar(20) DEFAULT NULL COMMENT 'Suffix for voucher number',
  `start_from` int DEFAULT 1 COMMENT 'Starting number',
  `current_number` int DEFAULT 1 COMMENT 'Current number in sequence',
  `required_digits` int DEFAULT 4 COMMENT 'Number of digits for padding',
  `enable_auto_numbering` tinyint(1) DEFAULT 1 COMMENT 'Enable automatic numbering',
  `include_from_existing_series` varchar(200) DEFAULT NULL COMMENT 'Include from existing series (dropdown selection)',
  `effective_from` date DEFAULT NULL COMMENT 'Effective from date',
  `effective_to` date DEFAULT NULL COMMENT 'Effective to date',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_journal` (`tenant_id`),
  KEY `idx_voucher_name_journal` (`voucher_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Journal Voucher Master';

--
-- Table: master_voucher_contra
--
CREATE TABLE IF NOT EXISTS `master_voucher_contra` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `voucher_name` varchar(100) NOT NULL COMMENT 'Voucher name',
  `prefix` varchar(20) DEFAULT NULL COMMENT 'Prefix for voucher number',
  `suffix` varchar(20) DEFAULT NULL COMMENT 'Suffix for voucher number',
  `start_from` int DEFAULT 1 COMMENT 'Starting number',
  `current_number` int DEFAULT 1 COMMENT 'Current number in sequence',
  `required_digits` int DEFAULT 4 COMMENT 'Number of digits for padding',
  `enable_auto_numbering` tinyint(1) DEFAULT 1 COMMENT 'Enable automatic numbering',
  `include_from_existing_series` varchar(200) DEFAULT NULL COMMENT 'Include from existing series (dropdown selection)',
  `effective_from` date DEFAULT NULL COMMENT 'Effective from date',
  `effective_to` date DEFAULT NULL COMMENT 'Effective to date',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_contra` (`tenant_id`),
  KEY `idx_voucher_name_contra` (`voucher_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Contra Voucher Master';


--
-- Table: customer_masters_salesquotation
--
CREATE TABLE IF NOT EXISTS `customer_masters_salesquotation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `series_name` varchar(100) NOT NULL COMMENT 'Name of the sales quotation series',
  `customer_category` varchar(100) DEFAULT NULL COMMENT 'Customer category (Retail, Wholesale, Corporate, etc.)',
  `prefix` varchar(20) DEFAULT 'SQ/' COMMENT 'Prefix for quotation number (e.g., SQ/)',
  `suffix` varchar(20) DEFAULT '/24-25' COMMENT 'Suffix for quotation number (e.g., /24-25)',
  `required_digits` int DEFAULT 4 COMMENT 'Number of digits for sequence padding',
  `current_number` int DEFAULT 0 COMMENT 'Current number in the sequence',
  `auto_year` tinyint(1) DEFAULT 0 COMMENT 'Auto-include year in quotation number',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Whether this series is active',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_sq_tenant_series_unique` (`tenant_id`,`series_name`),
  KEY `customer_sq_tenant_id_idx` (`tenant_id`),
  KEY `customer_sq_category_idx` (`customer_category`),
  KEY `customer_sq_is_active_idx` (`is_active`),
  KEY `customer_sq_is_deleted_idx` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Portal - Sales Quotation Series Configuration';


-- Table: customer_master_category
--------------------------------------------------------------------------------
CREATE TABLE `customer_master_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `category` varchar(255) NOT NULL COMMENT 'Top-level category',
  `group` varchar(255) DEFAULT NULL COMMENT 'Group under category',
  `subgroup` varchar(255) DEFAULT NULL COMMENT 'Subgroup under group',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this category is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_category_tenant_unique` (`tenant_id`,`category`,`group`,`subgroup`),
  KEY `customer_category_tenant_id_idx` (`tenant_id`),
  KEY `customer_category_is_active_idx` (`tenant_id`, `is_active`),
  KEY `customer_category_category_idx` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Master Category Hierarchy';


-- Table: customer_master_customer_basicdetail
--------------------------------------------------------------------------------
CREATE TABLE `customer_master_customer_basicdetail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID',
  `customer_name` varchar(255) NOT NULL,
  `customer_code` varchar(50) NOT NULL COMMENT 'Customer code',
  `customer_category` bigint DEFAULT NULL COMMENT 'Link to CustomerMasterCategory',
  `pan_number` varchar(10) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `is_also_vendor` tinyint(1) NOT NULL DEFAULT 0,
  `gst_details` json DEFAULT NULL,
  `products_services` json DEFAULT NULL,
  `msme_no` varchar(50) DEFAULT NULL,
  `fssai_no` varchar(50) DEFAULT NULL,
  `iec_code` varchar(50) DEFAULT NULL,
  `eou_status` varchar(100) DEFAULT NULL,
  `tcs_section` varchar(50) DEFAULT NULL,
  `tcs_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `tds_section` varchar(50) DEFAULT NULL,
  `tds_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `banking_info` json DEFAULT NULL,
  `credit_period` int DEFAULT NULL,
  `credit_terms` longtext DEFAULT NULL,
  `penalty_terms` longtext DEFAULT NULL,
  `delivery_terms` longtext DEFAULT NULL,
  `warranty_details` longtext DEFAULT NULL,
  `force_majeure` longtext DEFAULT NULL,
  `dispute_terms` longtext DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_basicdetail_tenant_code_unique` (`tenant_id`,`customer_code`),
  KEY `customer_basicdetail_tenant_id_idx` (`tenant_id`),
  KEY `customer_basicdetail_customer_category_idx` (`customer_category`),
  KEY `customer_basicdetail_is_deleted_idx` (`tenant_id`, `is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Master Basic Details';

-- Table: customer_master_customer_productservice
--------------------------------------------------------------------------------
CREATE TABLE `customer_master_customer_productservice` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `customer_basic_detail_id` bigint DEFAULT NULL COMMENT 'Foreign key to customer_master_customer_basicdetail',
  `item_code` varchar(50) DEFAULT NULL COMMENT 'Item Code',
  `item_name` varchar(200) DEFAULT NULL COMMENT 'Item Name',
  `customer_item_code` varchar(50) DEFAULT NULL COMMENT 'Customer Item Code',
  `customer_item_name` varchar(200) DEFAULT NULL COMMENT 'Customer Item Name',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cust_prodserv_tenant_id_idx` (`tenant_id`),
  KEY `cust_prodserv_cust_id_idx` (`customer_basic_detail_id`),
  CONSTRAINT `cust_prodserv_cust_fk` FOREIGN KEY (`customer_basic_detail_id`) REFERENCES `customer_master_customer_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Master Products/Services';


-- Table: customer_master_longtermcontracts_basicdetails
--------------------------------------------------------------------------------
CREATE TABLE `customer_master_longtermcontracts_basicdetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `contract_number` varchar(50) NOT NULL,
  `customer_id` int NOT NULL COMMENT 'Reference to customer',
  `customer_name` varchar(255) NOT NULL COMMENT 'Customer name for display',
  `branch_id` int DEFAULT NULL COMMENT 'Reference to branch',
  `contract_type` varchar(50) NOT NULL,
  `contract_validity_from` date NOT NULL,
  `contract_validity_to` date NOT NULL,
  `contract_document` varchar(500) DEFAULT NULL COMMENT 'File path to uploaded contract document',
  `automate_billing` tinyint(1) NOT NULL DEFAULT 0,
  `bill_start_date` date DEFAULT NULL,
  `billing_frequency` varchar(20) DEFAULT NULL,
  `voucher_name` varchar(100) DEFAULT NULL,
  `bill_period_from` date DEFAULT NULL,
  `bill_period_to` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cust_ltc_basic_tenant_contract_unique` (`tenant_id`,`contract_number`),
  KEY `cust_ltc_basic_tenant_id_idx` (`tenant_id`),
  KEY `cust_ltc_basic_customer_id_idx` (`tenant_id`, `customer_id`),
  KEY `cust_ltc_basic_validity_idx` (`contract_validity_from`, `contract_validity_to`),
  KEY `cust_ltc_basic_is_deleted_idx` (`tenant_id`, `is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Master Long-term Contract Basic Details';


-- Table: customer_master_longtermcontracts_productservices
--------------------------------------------------------------------------------
CREATE TABLE `customer_master_longtermcontracts_productservices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `contract_basic_detail_id` int NOT NULL COMMENT 'Foreign key to customer_master_longtermcontracts_basicdetails',
  `item_code` varchar(50) NOT NULL COMMENT 'Our item code',
  `item_name` varchar(200) NOT NULL COMMENT 'Our item name',
  `customer_item_name` varchar(200) DEFAULT NULL COMMENT 'Customer''s item name',
  `qty_min` decimal(15,2) DEFAULT NULL COMMENT 'Minimum quantity',
  `qty_max` decimal(15,2) DEFAULT NULL COMMENT 'Maximum quantity',
  `price_min` decimal(15,2) DEFAULT NULL COMMENT 'Minimum price',
  `price_max` decimal(15,2) DEFAULT NULL COMMENT 'Maximum price',
  `acceptable_price_deviation` varchar(50) DEFAULT NULL COMMENT 'e.g., ±5%',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cust_ltc_prod_tenant_item_idx` (`tenant_id`, `item_code`),
  KEY `cust_ltc_prod_contract_idx` (`contract_basic_detail_id`),
  CONSTRAINT `cust_ltc_prod_contract_fk` FOREIGN KEY (`contract_basic_detail_id`) REFERENCES `customer_master_longtermcontracts_basicdetails` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Master Long-term Contract Products/Services';


-- Table: customer_master_longtermcontracts_termscondition
--------------------------------------------------------------------------------
CREATE TABLE `customer_master_longtermcontracts_termscondition` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `contract_basic_detail_id` int NOT NULL COMMENT 'Foreign key to customer_master_longtermcontracts_basicdetails',
  `payment_terms` longtext DEFAULT NULL,
  `penalty_terms` longtext DEFAULT NULL,
  `force_majeure` longtext DEFAULT NULL,
  `termination_clause` longtext DEFAULT NULL,
  `dispute_terms` longtext DEFAULT NULL COMMENT 'Dispute & Redressal Terms',
  `others` longtext DEFAULT NULL COMMENT 'Other terms',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cust_ltc_terms_contract_unique` (`contract_basic_detail_id`),
  KEY `cust_ltc_terms_tenant_idx` (`tenant_id`),
  CONSTRAINT `cust_ltc_terms_contract_fk` FOREIGN KEY (`contract_basic_detail_id`) REFERENCES `customer_master_longtermcontracts_basicdetails` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Master Long-term Contract Terms & Conditions';



--
-- Table: customer_masters_salesquotation
--
CREATE TABLE IF NOT EXISTS `customer_masters_salesquotation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `series_name` varchar(100) NOT NULL COMMENT 'Name of the sales quotation series',
  `customer_category` varchar(100) DEFAULT NULL COMMENT 'Customer category (Retail, Wholesale, Corporate, etc.)',
  `prefix` varchar(20) DEFAULT 'SQ/' COMMENT 'Prefix for quotation number (e.g., SQ/)',
  `suffix` varchar(20) DEFAULT '/24-25' COMMENT 'Suffix for quotation number (e.g., /24-25)',
  `required_digits` int DEFAULT 4 COMMENT 'Number of digits for sequence padding',
  `current_number` int DEFAULT 0 COMMENT 'Current number in the sequence',
  `auto_year` tinyint(1) DEFAULT 0 COMMENT 'Auto-include year in quotation number',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Whether this series is active',
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Soft delete flag',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_sq_tenant_series_unique` (`tenant_id`,`series_name`),
  KEY `customer_sq_tenant_id_idx` (`tenant_id`),
  KEY `customer_sq_category_idx` (`customer_category`),
  KEY `customer_sq_is_active_idx` (`is_active`),
  KEY `customer_sq_is_deleted_idx` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Portal - Sales Quotation Series Configuration';


-- Table: customer_master_category
--------------------------------------------------------------------------------
CREATE TABLE `customer_master_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `category` varchar(255) NOT NULL COMMENT 'Top-level category',
  `group` varchar(255) DEFAULT NULL COMMENT 'Group under category',
  `subgroup` varchar(255) DEFAULT NULL COMMENT 'Subgroup under group',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this category is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_category_tenant_unique` (`tenant_id`,`category`,`group`,`subgroup`),
  KEY `customer_category_tenant_id_idx` (`tenant_id`),
  KEY `customer_category_is_active_idx` (`tenant_id`, `is_active`),
  KEY `customer_category_category_idx` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Master Category Hierarchy';


-- Table: customer_master_customer_basicdetail
--------------------------------------------------------------------------------
CREATE TABLE `customer_master_customer_basicdetail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID',
  `customer_name` varchar(255) NOT NULL,
  `customer_code` varchar(50) NOT NULL COMMENT 'Customer code',
  `customer_category` bigint DEFAULT NULL COMMENT 'Link to CustomerMasterCategory',
  `pan_number` varchar(10) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `is_also_vendor` tinyint(1) NOT NULL DEFAULT 0,
  `gst_details` json DEFAULT NULL,
  `products_services` json DEFAULT NULL,
  `msme_no` varchar(50) DEFAULT NULL,
  `fssai_no` varchar(50) DEFAULT NULL,
  `iec_code` varchar(50) DEFAULT NULL,
  `eou_status` varchar(100) DEFAULT NULL,
  `tcs_section` varchar(50) DEFAULT NULL,
  `tcs_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `tds_section` varchar(50) DEFAULT NULL,
  `tds_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `banking_info` json DEFAULT NULL,
  `credit_period` int DEFAULT NULL,
  `credit_terms` longtext DEFAULT NULL,
  `penalty_terms` longtext DEFAULT NULL,
  `delivery_terms` longtext DEFAULT NULL,
  `warranty_details` longtext DEFAULT NULL,
  `force_majeure` longtext DEFAULT NULL,
  `dispute_terms` longtext DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_basic_detail_tenant_code_unique` (`tenant_id`,`customer_code`),
  KEY `customer_basic_detail_tenant_id_idx` (`tenant_id`),
  KEY `customer_basic_detail_customer_category_idx` (`customer_category`),
  KEY `customer_basic_detail_is_deleted_idx` (`tenant_id`, `is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Master Basic Details';

-- Table: customer_master_customer_productservice
--------------------------------------------------------------------------------
CREATE TABLE `customer_master_customer_productservice` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `customer_basic_detail_id` bigint DEFAULT NULL COMMENT 'Foreign key to customer_master_customer_basicdetail',
  `item_code` varchar(50) DEFAULT NULL COMMENT 'Item Code',
  `item_name` varchar(200) DEFAULT NULL COMMENT 'Item Name',
  `customer_item_code` varchar(50) DEFAULT NULL COMMENT 'Customer Item Code',
  `customer_item_name` varchar(200) DEFAULT NULL COMMENT 'Customer Item Name',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cust_prodserv_tenant_id_idx` (`tenant_id`),
  KEY `cust_prodserv_cust_id_idx` (`customer_basic_detail_id`),
  CONSTRAINT `cust_prodserv_cust_fk` FOREIGN KEY (`customer_basic_detail_id`) REFERENCES `customer_master_customer_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Master Products/Services';


-- Table: customer_master_longtermcontracts_basicdetails
--------------------------------------------------------------------------------
CREATE TABLE `customer_master_longtermcontracts_basicdetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `contract_number` varchar(50) NOT NULL,
  `customer_id` int NOT NULL COMMENT 'Reference to customer',
  `customer_name` varchar(255) NOT NULL COMMENT 'Customer name for display',
  `branch_id` int DEFAULT NULL COMMENT 'Reference to branch',
  `contract_type` varchar(50) NOT NULL,
  `contract_validity_from` date NOT NULL,
  `contract_validity_to` date NOT NULL,
  `contract_document` varchar(500) DEFAULT NULL COMMENT 'File path to uploaded contract document',
  `automate_billing` tinyint(1) NOT NULL DEFAULT 0,
  `bill_start_date` date DEFAULT NULL,
  `billing_frequency` varchar(20) DEFAULT NULL,
  `voucher_name` varchar(100) DEFAULT NULL,
  `bill_period_from` date DEFAULT NULL,
  `bill_period_to` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cust_ltc_basic_tenant_contract_unique` (`tenant_id`,`contract_number`),
  KEY `cust_ltc_basic_tenant_id_idx` (`tenant_id`),
  KEY `cust_ltc_basic_customer_id_idx` (`tenant_id`, `customer_id`),
  KEY `cust_ltc_basic_validity_idx` (`contract_validity_from`, `contract_validity_to`),
  KEY `cust_ltc_basic_is_deleted_idx` (`tenant_id`, `is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Master Long-term Contract Basic Details';


-- Table: customer_master_longtermcontracts_productservices
--------------------------------------------------------------------------------
CREATE TABLE `customer_master_longtermcontracts_productservices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `contract_basic_detail_id` int NOT NULL COMMENT 'Foreign key to customer_master_longtermcontracts_basicdetails',
  `item_code` varchar(50) NOT NULL COMMENT 'Our item code',
  `item_name` varchar(200) NOT NULL COMMENT 'Our item name',
  `customer_item_name` varchar(200) DEFAULT NULL COMMENT 'Customer''s item name',
  `qty_min` decimal(15,2) DEFAULT NULL COMMENT 'Minimum quantity',
  `qty_max` decimal(15,2) DEFAULT NULL COMMENT 'Maximum quantity',
  `price_min` decimal(15,2) DEFAULT NULL COMMENT 'Minimum price',
  `price_max` decimal(15,2) DEFAULT NULL COMMENT 'Maximum price',
  `acceptable_price_deviation` varchar(50) DEFAULT NULL COMMENT 'e.g., ±5%',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cust_ltc_prod_tenant_item_idx` (`tenant_id`, `item_code`),
  KEY `cust_ltc_prod_contract_idx` (`contract_basic_detail_id`),
  CONSTRAINT `cust_ltc_prod_contract_fk` FOREIGN KEY (`contract_basic_detail_id`) REFERENCES `customer_master_longtermcontracts_basicdetails` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Master Long-term Contract Products/Services';


-- Table: customer_master_longtermcontracts_termscondition
--------------------------------------------------------------------------------
CREATE TABLE `customer_master_longtermcontracts_termscondition` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `contract_basic_detail_id` int NOT NULL COMMENT 'Foreign key to customer_master_longtermcontracts_basicdetails',
  `payment_terms` longtext DEFAULT NULL,
  `penalty_terms` longtext DEFAULT NULL,
  `force_majeure` longtext DEFAULT NULL,
  `termination_clause` longtext DEFAULT NULL,
  `dispute_terms` longtext DEFAULT NULL COMMENT 'Dispute & Redressal Terms',
  `others` longtext DEFAULT NULL COMMENT 'Other terms',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cust_ltc_terms_contract_unique` (`contract_basic_detail_id`),
  KEY `cust_ltc_terms_tenant_idx` (`tenant_id`),
  CONSTRAINT `cust_ltc_terms_contract_fk` FOREIGN KEY (`contract_basic_detail_id`) REFERENCES `customer_master_longtermcontracts_basicdetails` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Master Long-term Contract Terms & Conditions';




-- Table: customer_master_customer_basicdetails
CREATE TABLE `customer_master_customer_basicdetails` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `customer_code` varchar(50) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_category_id` bigint DEFAULT NULL,
  `pan_number` varchar(10) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email_address` varchar(254) DEFAULT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `is_also_vendor` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_basic_tenant_code_uniq` (`tenant_id`,`customer_code`),
  KEY `customer_basic_tenant_id_idx` (`tenant_id`),
  KEY `customer_basic_category_idx` (`customer_category_id`),
  CONSTRAINT `customer_basic_category_fk` FOREIGN KEY (`customer_category_id`) REFERENCES `customer_master_category` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: customer_master_customer_gstdetails
CREATE TABLE `customer_master_customer_gstdetails` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `customer_basic_detail_id` bigint NOT NULL,
  `gstin` varchar(15) DEFAULT NULL,
  `is_unregistered` tinyint(1) NOT NULL DEFAULT '0',
  `branch_reference_name` varchar(255) DEFAULT NULL,
  `branch_address` longtext,
  `branch_contact_person` varchar(255) DEFAULT NULL,
  `branch_email` varchar(254) DEFAULT NULL,
  `branch_contact_number` varchar(15) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_gst_tenant_gstin_idx` (`tenant_id`,`gstin`),
  KEY `customer_gst_basic_detail_idx` (`customer_basic_detail_id`),
  CONSTRAINT `customer_gst_basic_detail_fk` FOREIGN KEY (`customer_basic_detail_id`) REFERENCES `customer_master_customer_basicdetails` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: customer_master_customer_tds
CREATE TABLE `customer_master_customer_tds` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `customer_basic_detail_id` bigint NOT NULL,
  `msme_no` varchar(50) DEFAULT NULL,
  `fssai_no` varchar(50) DEFAULT NULL,
  `iec_code` varchar(50) DEFAULT NULL,
  `eou_status` varchar(100) DEFAULT NULL,
  `tcs_section` varchar(50) DEFAULT NULL,
  `tcs_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `tds_section` varchar(50) DEFAULT NULL,
  `tds_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_tds_basic_detail_uniq` (`customer_basic_detail_id`),
  KEY `customer_tds_tenant_idx` (`tenant_id`),
  CONSTRAINT `customer_tds_basic_detail_fk` FOREIGN KEY (`customer_basic_detail_id`) REFERENCES `customer_master_customer_basicdetails` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: customer_master_customer_banking
CREATE TABLE `customer_master_customer_banking` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL,
  `customer_basic_detail_id` bigint NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  `ifsc_code` varchar(11) NOT NULL,
  `branch_name` varchar(255) DEFAULT NULL,
  `swift_code` varchar(11) DEFAULT NULL,
  `associated_branches` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_bank_tenant_acc_idx` (`tenant_id`,`account_number`),
  KEY `customer_bank_basic_detail_idx` (`customer_basic_detail_id`),
  CONSTRAINT `customer_bank_basic_detail_fk` FOREIGN KEY (`customer_basic_detail_id`) REFERENCES `customer_master_customer_basicdetails` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: customer_master_customer_productservice
CREATE TABLE `customer_master_customer_productservice` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) DEFAULT NULL,
  `customer_basic_detail_id` bigint DEFAULT NULL,
  `item_code` varchar(50) DEFAULT NULL,
  `item_name` varchar(200) DEFAULT NULL,
  `customer_item_code` varchar(50) DEFAULT NULL,
  `customer_item_name` varchar(200) DEFAULT NULL,
  `uom` varchar(50) DEFAULT NULL,
  `customer_uom` varchar(50) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_prod_tenant_item_idx` (`tenant_id`,`item_code`),
  KEY `customer_prod_basic_detail_idx` (`customer_basic_detail_id`),
  CONSTRAINT `customer_prod_basic_detail_fk` FOREIGN KEY (`customer_basic_detail_id`) REFERENCES `customer_master_customer_basicdetails` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: customer_master_customer_termscondition
CREATE TABLE `customer_master_customer_termscondition` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) DEFAULT NULL,
  `customer_basic_detail_id` bigint DEFAULT NULL,
  `credit_period` varchar(50) DEFAULT NULL,
  `credit_terms` longtext,
  `penalty_terms` longtext,
  `delivery_terms` longtext,
  `warranty_details` longtext,
  `force_majeure` longtext,
  `dispute_terms` longtext,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_terms_basic_detail_uniq` (`customer_basic_detail_id`),
  KEY `customer_terms_tenant_idx` (`tenant_id`),
  CONSTRAINT `customer_terms_basic_detail_fk` FOREIGN KEY (`customer_basic_detail_id`) REFERENCES `customer_master_customer_basicdetails` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
