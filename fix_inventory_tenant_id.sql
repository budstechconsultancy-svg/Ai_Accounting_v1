-- Fix inventory tables tenant_id column type
-- Change from bigint to varchar(36) to store UUID strings

ALTER TABLE inventory_stock_groups MODIFY COLUMN tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE inventory_units MODIFY COLUMN tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE inventory_stock_items MODIFY COLUMN tenant_id VARCHAR(36) NOT NULL;
ALTER TABLE stock_movements MODIFY COLUMN tenant_id VARCHAR(36) NOT NULL;

-- Add indexes for better performance
CREATE INDEX idx_stock_groups_tenant ON inventory_stock_groups(tenant_id);
CREATE INDEX idx_units_tenant ON inventory_units(tenant_id);
CREATE INDEX idx_stock_items_tenant ON inventory_stock_items(tenant_id);
CREATE INDEX idx_stock_movements_tenant ON stock_movements(tenant_id);
