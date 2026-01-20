-- ============================================================================
-- CUSTOMER TRANSACTION: SALES ORDER TABLES
-- ============================================================================

-- Table 1: customer_transaction_salesorder_basicdetails
-- Stores basic details of sales orders
CREATE TABLE `customer_transaction_salesorder_basicdetails` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `so_series_name` varchar(100) DEFAULT NULL COMMENT 'SO Series Name',
  `so_number` varchar(50) NOT NULL COMMENT 'Sales Order Number (auto-generated)',
  `date` date NOT NULL COMMENT 'Sales Order Date',
  `customer_po_number` varchar(100) DEFAULT NULL COMMENT 'Customer PO Number',
  `customer_name` varchar(255) NOT NULL COMMENT 'Customer Name',
  `branch` varchar(255) DEFAULT NULL COMMENT 'Branch',
  `address` longtext COMMENT 'Address',
  `email` varchar(254) DEFAULT NULL COMMENT 'Email Address',
  `contact_number` varchar(20) DEFAULT NULL COMMENT 'Contact Number',
  `quotation_type` varchar(50) DEFAULT NULL COMMENT 'Type: Sales Quotation or Contract',
  `quotation_number` varchar(100) DEFAULT NULL COMMENT 'Sales Quotation # / Contract #',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cust_trans_so_basic_so_number_uniq` (`tenant_id`, `so_number`),
  KEY `cust_trans_so_basic_tenant_idx` (`tenant_id`),
  KEY `cust_trans_so_basic_customer_idx` (`customer_name`),
  KEY `cust_trans_so_basic_date_idx` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Transaction - Sales Order Basic Details';


-- Table 2: customer_transaction_salesorder_items
-- Stores item details for each sales order
CREATE TABLE `customer_transaction_salesorder_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `so_basic_detail_id` bigint NOT NULL COMMENT 'Foreign key to customer_transaction_salesorder_basicdetails',
  `item_code` varchar(50) DEFAULT NULL COMMENT 'Item Code',
  `item_name` varchar(255) DEFAULT NULL COMMENT 'Item Name',
  `quantity` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Quantity',
  `price` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Price per unit',
  `taxable_value` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Taxable Value (Qty * Price)',
  `gst` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'GST Amount',
  `net_value` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT 'Net Value (Taxable + GST)',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `cust_trans_so_items_tenant_idx` (`tenant_id`),
  KEY `cust_trans_so_items_basic_detail_idx` (`so_basic_detail_id`),
  CONSTRAINT `cust_trans_so_items_basic_detail_fk` FOREIGN KEY (`so_basic_detail_id`) REFERENCES `customer_transaction_salesorder_basicdetails` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Transaction - Sales Order Items';


-- Table 3: customer_transaction_salesorder_deliveryterms
-- Stores delivery terms for each sales order
CREATE TABLE `customer_transaction_salesorder_deliveryterms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `so_basic_detail_id` bigint NOT NULL COMMENT 'Foreign key to customer_transaction_salesorder_basicdetails',
  `deliver_at` varchar(500) DEFAULT NULL COMMENT 'Delivery Address',
  `delivery_date` date DEFAULT NULL COMMENT 'Delivery Date',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cust_trans_so_delivery_basic_detail_uniq` (`so_basic_detail_id`),
  KEY `cust_trans_so_delivery_tenant_idx` (`tenant_id`),
  CONSTRAINT `cust_trans_so_delivery_basic_detail_fk` FOREIGN KEY (`so_basic_detail_id`) REFERENCES `customer_transaction_salesorder_basicdetails` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Transaction - Sales Order Delivery Terms';


-- Table 4: customer_transaction_salesorder_paymentterms
-- Stores payment terms for each sales order
CREATE TABLE `customer_transaction_salesorder_paymentterms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `so_basic_detail_id` bigint NOT NULL COMMENT 'Foreign key to customer_transaction_salesorder_basicdetails',
  `credit_period` varchar(100) DEFAULT NULL COMMENT 'Credit Period',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cust_trans_so_payment_basic_detail_uniq` (`so_basic_detail_id`),
  KEY `cust_trans_so_payment_tenant_idx` (`tenant_id`),
  CONSTRAINT `cust_trans_so_payment_basic_detail_fk` FOREIGN KEY (`so_basic_detail_id`) REFERENCES `customer_transaction_salesorder_basicdetails` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Transaction - Sales Order Payment Terms';


-- Table 5: customer_transaction_salesorder_salesperson
-- Stores salesperson details for each sales order
CREATE TABLE `customer_transaction_salesorder_salesperson` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `so_basic_detail_id` bigint NOT NULL COMMENT 'Foreign key to customer_transaction_salesorder_basicdetails',
  `salesperson_in_charge` varchar(255) DEFAULT NULL COMMENT 'Salesperson In Charge',
  `employee_id` varchar(50) DEFAULT NULL COMMENT 'Employee ID / Agent ID',
  `employee_name` varchar(255) DEFAULT NULL COMMENT 'Employee Name / Agent Name',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cust_trans_so_salesperson_basic_detail_uniq` (`so_basic_detail_id`),
  KEY `cust_trans_so_salesperson_tenant_idx` (`tenant_id`),
  CONSTRAINT `cust_trans_so_salesperson_basic_detail_fk` FOREIGN KEY (`so_basic_detail_id`) REFERENCES `customer_transaction_salesorder_basicdetails` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Customer Transaction - Sales Order Salesperson';
