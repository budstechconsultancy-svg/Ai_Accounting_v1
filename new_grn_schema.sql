-- Create Table: inventory_operation_new_grn
CREATE TABLE `inventory_operation_new_grn` (
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
  
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create Table: inventory_operation_new_grn_items
CREATE TABLE `inventory_operation_new_grn_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tenant_id` VARCHAR(36) NOT NULL,
  `parent_id` BIGINT NOT NULL,
  
  `item_code` VARCHAR(100) DEFAULT NULL,
  `item_name` VARCHAR(255) DEFAULT NULL,
  `uom` VARCHAR(50) DEFAULT NULL,
  
  -- Quantities
  `ref_qty` DECIMAL(15, 4) DEFAULT 0.0000 COMMENT 'PO Qty or Sales Voucher Qty',
  `secondary_qty` DECIMAL(15, 4) DEFAULT 0.0000 COMMENT 'Inv Qty or Debit Note Qty',
  `received_qty` DECIMAL(15, 4) DEFAULT 0.0000,
  `accepted_qty` DECIMAL(15, 4) DEFAULT 0.0000,
  `rejected_qty` DECIMAL(15, 4) DEFAULT 0.0000,
  `short_excess_qty` DECIMAL(15, 4) DEFAULT 0.0000,
  
  `remarks` TEXT DEFAULT NULL,
  
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  
  PRIMARY KEY (`id`),
  FOREIGN KEY (`parent_id`) REFERENCES `inventory_operation_new_grn` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
