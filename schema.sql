-- ============================================================================
-- AI Accounting Database Schema - Current Database Structure
-- Total Tables: 36
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





-- Table: inventory_stock
--------------------------------------------------------------------------------
CREATE TABLE `inventory_stock` (
  `stock_id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `item_id` bigint NOT NULL,
  `warehouse_id` bigint NOT NULL,
  `opening_qty` decimal(15,3) DEFAULT NULL,
  `current_qty` decimal(15,3) DEFAULT NULL,
  `reserved_qty` decimal(15,3) DEFAULT NULL,
  PRIMARY KEY (`stock_id`),
  KEY `idx_stock_tenant` (`tenant_id`),
  KEY `item_id` (`item_id`),
  KEY `warehouse_id` (`warehouse_id`),
  CONSTRAINT `inventory_stock_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`),
  CONSTRAINT `inventory_stock_ibfk_2` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: inventory_transactions
--------------------------------------------------------------------------------
CREATE TABLE `inventory_transactions` (
  `txn_id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `item_id` bigint NOT NULL,
  `warehouse_id` bigint NOT NULL,
  `txn_type` enum('purchase','sale','return','adjustment','transfer') DEFAULT NULL,
  `quantity` decimal(15,3) NOT NULL,
  `rate` decimal(15,2) DEFAULT NULL,
  `value` decimal(15,2) DEFAULT NULL,
  `txn_date` date NOT NULL,
  PRIMARY KEY (`txn_id`),
  KEY `idx_inv_txn_tenant` (`tenant_id`),
  KEY `item_id` (`item_id`),
  KEY `warehouse_id` (`warehouse_id`),
  CONSTRAINT `inventory_transactions_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`),
  CONSTRAINT `inventory_transactions_ibfk_2` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: items
--------------------------------------------------------------------------------
CREATE TABLE `items` (
  `item_id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `item_code` varchar(50) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `item_type` enum('goods','service') DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `hsn_code` varchar(20) DEFAULT NULL,
  `gst_rate` decimal(5,2) DEFAULT NULL,
  `inventory_ledger_id` bigint NOT NULL,
  `income_ledger_id` bigint NOT NULL,
  `cogs_ledger_id` bigint NOT NULL,
  `is_stock_item` tinyint(1) DEFAULT '1',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `uq_item_tenant_code` (`tenant_id`,`item_code`),
  KEY `idx_item_tenant` (`tenant_id`)
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


-- Table: tenant_users
--------------------------------------------------------------------------------
CREATE TABLE `tenant_users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `username` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `tenant_id` char(36) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'STAFF',
  `selected_submodule_ids` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `role_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_users_username_tenant_unique` (`username`,`tenant_id`),
  KEY `tenant_users_tenant_id_idx` (`tenant_id`),
  KEY `idx_tenant_user_role` (`role_id`),
  CONSTRAINT `tenant_users_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


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


-- Table: vendor_portal_users
--------------------------------------------------------------------------------
CREATE TABLE `vendor_portal_users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `vendor_id` bigint NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` text NOT NULL,
  `role` enum('owner','staff') DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `status` enum('active','blocked') DEFAULT 'active',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_vendor_user` (`tenant_id`,`username`),
  KEY `idx_vpu_tenant` (`tenant_id`),
  KEY `vendor_id` (`vendor_id`),
  CONSTRAINT `vendor_portal_users_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`vendor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: vendors
--------------------------------------------------------------------------------
CREATE TABLE `vendors` (
  `vendor_id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint NOT NULL,
  `vendor_code` varchar(50) NOT NULL,
  `vendor_name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobile_no` varchar(20) DEFAULT NULL,
  `ledger_id` bigint NOT NULL,
  `credit_days` int DEFAULT NULL,
  `opening_balance` decimal(15,2) DEFAULT NULL,
  `opening_balance_type` enum('debit','credit') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`vendor_id`),
  UNIQUE KEY `uq_vendor_tenant_code` (`tenant_id`,`vendor_code`),
  KEY `idx_vendor_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table: voucher_configurations
--------------------------------------------------------------------------------
CREATE TABLE `voucher_configurations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` char(36) NOT NULL,
  `voucher_type` varchar(50) NOT NULL COMMENT 'sales, credit-note, receipts, purchases, debit-note, payments, expenses, journal, contra',
  `voucher_name` varchar(255) NOT NULL COMMENT 'Custom voucher name',
  `enable_auto_numbering` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Enable automatic numbering series',
  `prefix` varchar(50) DEFAULT NULL COMMENT 'Prefix for voucher number (alphanumeric with / and -)',
  `suffix` varchar(50) DEFAULT NULL COMMENT 'Suffix for voucher number (alphanumeric with / and -)',
  `start_from` bigint unsigned NOT NULL DEFAULT '1' COMMENT 'Starting number for the series',
  `current_number` bigint unsigned NOT NULL DEFAULT '1' COMMENT 'Current/next number in the series',
  `required_digits` int NOT NULL DEFAULT '4' COMMENT 'Number of digits for padding (e.g., 4 = 0001)',
  `effective_from` date NOT NULL COMMENT 'Start date of voucher series validity',
  `effective_to` date NOT NULL COMMENT 'End date of voucher series validity',
  `update_customer_master` tinyint(1) DEFAULT NULL COMMENT 'For sales: whether to update customer master (Yes/No)',
  `include_from_existing_series_id` bigint DEFAULT NULL COMMENT 'For sales: reference to existing series to include from',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this configuration is active',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `voucher_config_unique` (`tenant_id`,`voucher_type`,`voucher_name`,`effective_from`),
  KEY `voucher_config_tenant_id_idx` (`tenant_id`),
  KEY `voucher_config_type_idx` (`voucher_type`),
  KEY `voucher_config_effective_idx` (`effective_from`,`effective_to`),
  CONSTRAINT `voucher_config_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Voucher numbering configuration for all voucher types';


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

