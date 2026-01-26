-- Update Inventory Production Tables to support detailed production types and item classifications

-- 1. Update Operation Table
ALTER TABLE `inventory_operation_production`
ADD COLUMN `production_type` VARCHAR(50) DEFAULT 'materials_issued' COMMENT 'materials_issued, inter_process, finished_goods',
ADD COLUMN `material_issue_slip_no` VARCHAR(100) DEFAULT NULL,
ADD COLUMN `process_transfer_slip_no` VARCHAR(100) DEFAULT NULL,
ADD COLUMN `finished_goods_production_no` VARCHAR(100) DEFAULT NULL,
ADD COLUMN `batch_no` VARCHAR(50) DEFAULT NULL,
ADD COLUMN `expiry_date` DATE DEFAULT NULL;

-- 2. Update Items Table
ALTER TABLE `inventory_operation_production_items`
ADD COLUMN `item_type` VARCHAR(50) DEFAULT 'input' COMMENT 'input, output, raw_material, wip, finished_good',
ADD COLUMN `qty_issued` DECIMAL(15, 4) DEFAULT 0.0000,
ADD COLUMN `qty_available` DECIMAL(15, 4) DEFAULT 0.0000,
ADD COLUMN `amount` DECIMAL(15, 2) DEFAULT 0.00;
