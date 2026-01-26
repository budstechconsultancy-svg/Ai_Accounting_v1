-- Add Delivery Challan and E-Way Bill columns to all inventory operation tables directly.
-- This removes the need for separate linked tables 'inventory_operation_deliverychallan' and 'inventory_operation_ewaybill'
-- for simple per-operation saving.

-- 1. Job Work (Already has some, but ensuring consistency if needed, though Job Work has its own specific fields)
-- Job Work logic is slightly different (Outward/Receipt), but we can add these for uniformity if the user wants them standard.
-- However, Job Work Receipts uses "Vendor Delivery Challan". Let's focus on the others first as per request "location, consumption etc".

-- 2. Inter Unit
ALTER TABLE `inventory_operation_interunit`
ADD COLUMN `dispatch_address` TEXT DEFAULT NULL COMMENT 'Delivery Challan Address',
ADD COLUMN `dispatch_date` DATE DEFAULT NULL COMMENT 'Delivery Challan Date',
ADD COLUMN `vehicle_number` VARCHAR(50) DEFAULT NULL COMMENT 'E-Way Bill Vehicle No',
ADD COLUMN `valid_till` DATE DEFAULT NULL COMMENT 'E-Way Bill Valid Till';

-- 3. Location Change
ALTER TABLE `inventory_operation_locationchange`
ADD COLUMN `dispatch_address` TEXT DEFAULT NULL COMMENT 'Delivery Challan Address',
ADD COLUMN `dispatch_date` DATE DEFAULT NULL COMMENT 'Delivery Challan Date',
ADD COLUMN `vehicle_number` VARCHAR(50) DEFAULT NULL COMMENT 'E-Way Bill Vehicle No',
ADD COLUMN `valid_till` DATE DEFAULT NULL COMMENT 'E-Way Bill Valid Till';

-- 4. Production
ALTER TABLE `inventory_operation_production`
ADD COLUMN `dispatch_address` TEXT DEFAULT NULL COMMENT 'Delivery Challan Address',
ADD COLUMN `dispatch_date` DATE DEFAULT NULL COMMENT 'Delivery Challan Date',
ADD COLUMN `vehicle_number` VARCHAR(50) DEFAULT NULL COMMENT 'E-Way Bill Vehicle No',
ADD COLUMN `valid_till` DATE DEFAULT NULL COMMENT 'E-Way Bill Valid Till';

-- 5. Consumption
ALTER TABLE `inventory_operation_consumption`
ADD COLUMN `dispatch_address` TEXT DEFAULT NULL COMMENT 'Delivery Challan Address',
ADD COLUMN `dispatch_date` DATE DEFAULT NULL COMMENT 'Delivery Challan Date',
ADD COLUMN `vehicle_number` VARCHAR(50) DEFAULT NULL COMMENT 'E-Way Bill Vehicle No',
ADD COLUMN `valid_till` DATE DEFAULT NULL COMMENT 'E-Way Bill Valid Till';

-- 6. Scrap
ALTER TABLE `inventory_operation_scrap`
ADD COLUMN `dispatch_address` TEXT DEFAULT NULL COMMENT 'Delivery Challan Address',
ADD COLUMN `dispatch_date` DATE DEFAULT NULL COMMENT 'Delivery Challan Date',
ADD COLUMN `vehicle_number` VARCHAR(50) DEFAULT NULL COMMENT 'E-Way Bill Vehicle No',
ADD COLUMN `valid_till` DATE DEFAULT NULL COMMENT 'E-Way Bill Valid Till';

-- 7. Outward (Already has some fields, ensuring standard naming)
-- Outward table usually has these or uses the linked table. Let's add them directly to be safe.
ALTER TABLE `inventory_operation_outward`
ADD COLUMN `dispatch_address` TEXT DEFAULT NULL COMMENT 'Delivery Challan Address',
ADD COLUMN `dispatch_date` DATE DEFAULT NULL COMMENT 'Delivery Challan Date',
ADD COLUMN `vehicle_number` VARCHAR(50) DEFAULT NULL COMMENT 'E-Way Bill Vehicle No',
ADD COLUMN `valid_till` DATE DEFAULT NULL COMMENT 'E-Way Bill Valid Till';

-- 8. Job Work (Adding standard columns too for consistency if they use the generic form section)
ALTER TABLE `inventory_operation_jobwork`
ADD COLUMN `dispatch_address` TEXT DEFAULT NULL COMMENT 'Delivery Challan Address',
ADD COLUMN `dispatch_date` DATE DEFAULT NULL COMMENT 'Delivery Challan Date',
ADD COLUMN `vehicle_number` VARCHAR(50) DEFAULT NULL COMMENT 'E-Way Bill Vehicle No',
ADD COLUMN `valid_till` DATE DEFAULT NULL COMMENT 'E-Way Bill Valid Till';
