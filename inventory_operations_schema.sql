-- ============================================================================
-- INVENTORY OPERATIONS SCHEMA
-- Stores various inventory operations like Job Work, Inter-Unit,
-- Location Change, Production, Consumption, Scrap, GRN, and Outward
-- Uses JSON 'items' column for detailed line items
-- ============================================================================

-- 1. JOB WORK ----------------------------------------------------------------
-- Handles both "Goods sent for Jobwork" (Outward) and "Receipt of goods sent for Jobwork" (Receipt)

CREATE TABLE IF NOT EXISTS `inventory_operation_jobwork` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` CHAR(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  
  -- Operation Type
  `operation_type` ENUM('outward', 'receipt') NOT NULL COMMENT 'outward: Goods sent, receipt: Goods received back',
  
  -- Common Fields
  `transaction_date` DATE DEFAULT NULL COMMENT 'Date of operation (issueSlipDate)',
  `transaction_time` TIME DEFAULT NULL COMMENT 'Time of operation (issueSlipTime)',
  `location_id` BIGINT DEFAULT NULL COMMENT 'Issued From / Received At Location (goodsFromLocation)',
  
  -- Jobwork Outward Specific Fields
  `job_work_outward_no` VARCHAR(50) DEFAULT NULL COMMENT 'Jobwork Outward No (issueSlipNumber)',
  `po_reference_no` VARCHAR(50) DEFAULT NULL COMMENT 'Purchase Order Reference No (jobWorkOrderNo)',
  
  -- Jobwork Receipt Specific Fields
  `job_work_receipt_no` VARCHAR(50) DEFAULT NULL COMMENT 'Job work Receipt No (jobWorkReceiptNo)',
  `related_outward_no` VARCHAR(50) DEFAULT NULL COMMENT 'Reference to Job Work Outward No (jobWorkOutwardRefNo)',
  `vendor_delivery_challan_no` VARCHAR(50) DEFAULT NULL COMMENT 'Vendor Return Delivery Challan No (vendorDeliveryChallan)',
  `supplier_invoice_no` VARCHAR(50) DEFAULT NULL COMMENT 'Supplier Invoice No (outwardSupplierInvoice)',
  
  -- Vendor / Job Worker Details
  `vendor_id` BIGINT DEFAULT NULL COMMENT 'Vendor ID',
  `vendor_name` VARCHAR(255) DEFAULT NULL COMMENT 'Vendor Name',
  `vendor_branch` VARCHAR(255) DEFAULT NULL COMMENT 'Vendor Branch',
  `vendor_address` TEXT DEFAULT NULL COMMENT 'Vendor Address',
  `vendor_gstin` VARCHAR(20) DEFAULT NULL COMMENT 'Vendor GSTIN',
  
  -- Items stored as JSON
  `items` JSON DEFAULT NULL COMMENT 'List of items: item_id, item_code, item_name, uom, quantity, rate, taxable_value, consumed_qty, etc.',
  
  -- Additional Info
  `posting_note` TEXT DEFAULT NULL COMMENT 'Posting Note',
  
  -- System Fields
  `status` VARCHAR(50) DEFAULT 'Draft' COMMENT 'Status: Draft, Posted, Cancelled',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(100) DEFAULT NULL,
  `updated_by` VARCHAR(100) DEFAULT NULL,

  -- E-way Bill / Delivery Challan
  `dispatch_address` TEXT DEFAULT NULL,
  `dispatch_date` DATE DEFAULT NULL,
  `vehicle_number` VARCHAR(50) DEFAULT NULL,
  `valid_till` DATE DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  KEY `idx_jobwork_tenant` (`tenant_id`),
  KEY `idx_jobwork_operation_type` (`operation_type`),
  KEY `idx_jobwork_outward_no` (`job_work_outward_no`),
  KEY `idx_jobwork_receipt_no` (`job_work_receipt_no`),
  KEY `idx_jobwork_vendor` (`vendor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Inventory Jobwork Operations';


-- 2. INTER-UNIT TRANSFER -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `inventory_operation_interunit` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `issue_slip_no` VARCHAR(100) NOT NULL,
  `date` DATE NULL,
  `time` TIME NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Draft',
  `goods_from_location` VARCHAR(255) NULL,
  `goods_to_location` VARCHAR(255) NULL,
  `posting_note` TEXT NULL,
  
  `items` JSON DEFAULT NULL COMMENT 'List of items: item_code, quantity, rate, value, etc.',
  
  -- E-way Bill / Delivery Challan
  `dispatch_address` TEXT DEFAULT NULL,
  `dispatch_date` DATE DEFAULT NULL,
  `vehicle_number` VARCHAR(50) DEFAULT NULL,
  `valid_till` DATE DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `idx_ioi_tenant` (`tenant_id`),
  KEY `idx_ioi_issue_slip` (`issue_slip_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 3. LOCATION CHANGE ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS `inventory_operation_locationchange` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `issue_slip_no` VARCHAR(100) NOT NULL,
  `date` DATE NULL,
  `time` TIME NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Draft',
  `goods_from_location` VARCHAR(255) NULL,
  `goods_to_location` VARCHAR(255) NULL,
  `posting_note` TEXT NULL,
  
  `items` JSON DEFAULT NULL COMMENT 'List of items: item_code, quantity, rate, value, etc.',
  
  -- E-way Bill / Delivery Challan
  `dispatch_address` TEXT DEFAULT NULL,
  `dispatch_date` DATE DEFAULT NULL,
  `vehicle_number` VARCHAR(50) DEFAULT NULL,
  `valid_till` DATE DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `idx_iolc_tenant` (`tenant_id`),
  KEY `idx_iolc_issue_slip` (`issue_slip_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 4. PRODUCTION --------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `inventory_operation_production` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `issue_slip_no` VARCHAR(100) NOT NULL,
  `date` DATE NULL,
  `time` TIME NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Draft',
  `goods_from_location` VARCHAR(255) NULL,
  `goods_to_location` VARCHAR(255) NULL,
  `posting_note` TEXT NULL,
  
  -- Production Specifics
  `production_type` VARCHAR(50) DEFAULT 'materials_issued' COMMENT 'materials_issued, inter_process, finished_goods',
  `material_issue_slip_no` VARCHAR(100) DEFAULT NULL,
  `process_transfer_slip_no` VARCHAR(100) DEFAULT NULL,
  `finished_goods_production_no` VARCHAR(100) DEFAULT NULL,
  `batch_no` VARCHAR(50) DEFAULT NULL,
  `expiry_date` DATE DEFAULT NULL,

  `items` JSON DEFAULT NULL COMMENT 'List of items with type (input/output/waste), quantity, rate, etc.',

  -- E-way Bill / Delivery Challan
  `dispatch_address` TEXT DEFAULT NULL,
  `dispatch_date` DATE DEFAULT NULL,
  `vehicle_number` VARCHAR(50) DEFAULT NULL,
  `valid_till` DATE DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `idx_iop_tenant` (`tenant_id`),
  KEY `idx_iop_issue_slip` (`issue_slip_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 5. CONSUMPTION -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `inventory_operation_consumption` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `issue_slip_no` VARCHAR(100) NOT NULL,
  `date` DATE NULL,
  `time` TIME NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Draft',
  `goods_from_location` VARCHAR(255) NULL,
  `goods_to_location` VARCHAR(255) NULL,
  `posting_note` TEXT NULL,
  
  `items` JSON DEFAULT NULL COMMENT 'List of items: item_code, quantity, rate, etc.',
  
  -- E-way Bill / Delivery Challan
  `dispatch_address` TEXT DEFAULT NULL,
  `dispatch_date` DATE DEFAULT NULL,
  `vehicle_number` VARCHAR(50) DEFAULT NULL,
  `valid_till` DATE DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `idx_ioc_tenant` (`tenant_id`),
  KEY `idx_ioc_issue_slip` (`issue_slip_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 6. SCRAP -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `inventory_operation_scrap` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `issue_slip_no` VARCHAR(100) NOT NULL,
  `date` DATE NULL,
  `time` TIME NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Draft',
  `goods_from_location` VARCHAR(255) NULL,
  `goods_to_location` VARCHAR(255) NULL,
  `posting_note` TEXT NULL,
  
  `items` JSON DEFAULT NULL COMMENT 'List of items: item_code, quantity, value, etc.',
  
  -- E-way Bill / Delivery Challan
  `dispatch_address` TEXT DEFAULT NULL,
  `dispatch_date` DATE DEFAULT NULL,
  `vehicle_number` VARCHAR(50) DEFAULT NULL,
  `valid_till` DATE DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `idx_ios_tenant` (`tenant_id`),
  KEY `idx_ios_issue_slip` (`issue_slip_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 7. NEW GRN (Goods Receipt Note) --------------------------------------------

CREATE TABLE IF NOT EXISTS `inventory_operation_new_grn` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` VARCHAR(36) NOT NULL,
  
  `grn_type` VARCHAR(50) DEFAULT 'purchases' COMMENT 'purchases, sales_return',
  `grn_no` VARCHAR(100) DEFAULT NULL,
  `date` DATE DEFAULT NULL,
  `time` TIME DEFAULT NULL,
  
  `location_id` BIGINT DEFAULT NULL, 
  
  -- Party Details (Vendor or Customer)
  `vendor_name` VARCHAR(255) DEFAULT NULL,
  `customer_name` VARCHAR(255) DEFAULT NULL,
  `branch` VARCHAR(255) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `gstin` VARCHAR(50) DEFAULT NULL,
  
  -- References
  `reference_no` VARCHAR(100) DEFAULT NULL COMMENT 'PO No or Sales Voucher No',
  `secondary_ref_no` VARCHAR(100) DEFAULT NULL COMMENT 'Supplier Inv No or Debit Note No',
  
  -- Sales Return Specific
  `return_reason` TEXT DEFAULT NULL,
  
  -- Common
  `posting_note` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Posted',
  
  `items` JSON DEFAULT NULL COMMENT 'List of items: item_code, uom, received_qty, accepted_qty, etc.',
  
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 8. OUTWARD -----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `inventory_operation_outward` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `outward_slip_no` VARCHAR(100) NOT NULL,
  `date` DATE NULL,
  `time` TIME NULL,
  `outward_type` VARCHAR(50) NOT NULL DEFAULT 'sales' COMMENT 'sales or purchase_return',
  `location_id` BIGINT NULL,
  `sales_order_no` VARCHAR(100) NULL,
  `customer_name` VARCHAR(255) NULL,
  `supplier_invoice_no` VARCHAR(100) NULL,
  `vendor_name` VARCHAR(255) NULL,
  `branch` VARCHAR(100) NULL,
  `address` TEXT NULL,
  `gstin` VARCHAR(20) NULL,
  `total_boxes` VARCHAR(50) NULL,
  `posting_note` TEXT NULL,
  
  `items` JSON DEFAULT NULL COMMENT 'List of items: item_code, quantity, hsn, etc.',

  -- E-way Bill / Delivery Challan
  `dispatch_address` TEXT DEFAULT NULL,
  `dispatch_date` DATE DEFAULT NULL,
  `vehicle_number` VARCHAR(50) DEFAULT NULL,
  `valid_till` DATE DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `idx_ioo_tenant` (`tenant_id`),
  KEY `idx_ioo_outward_slip` (`outward_slip_no`),
  KEY `idx_ioo_location` (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 9. (LEGACY) GRN ------------------------------------------------------------
-- Kept for backward compatibility if needed, using JSON items now

CREATE TABLE IF NOT EXISTS `inventory_operation_grn` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `grn_no` VARCHAR(100) NOT NULL COMMENT 'GRN number',
  `date` DATE NULL,
  `time` TIME NULL,
  `grn_type` VARCHAR(50) NOT NULL DEFAULT 'purchase' COMMENT 'purchase or sales_return',
  `location_id` BIGINT NULL COMMENT 'Foreign key to inventory_master_location',
  `purchase_order_no` VARCHAR(100) NULL,
  `vendor_name` VARCHAR(255) NULL,
  `supplier_invoice_no` VARCHAR(100) NULL,
  `customer_name` VARCHAR(255) NULL,
  `sales_invoice_no` VARCHAR(100) NULL,
  `branch` VARCHAR(100) NULL,
  `address` TEXT NULL,
  `gstin` VARCHAR(20) NULL,
  `total_boxes` VARCHAR(50) NULL,
  `posting_note` TEXT NULL,
  `items` JSON DEFAULT NULL COMMENT 'List of items',
  PRIMARY KEY (`id`),
  KEY `idx_iog_tenant` (`tenant_id`),
  KEY `idx_iog_grn_no` (`grn_no`),
  KEY `idx_iog_location` (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
