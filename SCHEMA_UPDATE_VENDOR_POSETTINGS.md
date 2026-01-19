# ✅ Schema Updated: vendor_master_posettings Table Added

## Changes Made to schema.sql

### 1. Added New Table: `vendor_master_posettings`

**Location:** After `vendors` table (line 737)

**Table Structure:**
```sql
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
```

### 2. Updated Table Count

**Changed:** Total Tables: 36 → **37**

## Table Details

### Columns

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | bigint | NO | AUTO_INCREMENT | Primary key |
| `tenant_id` | varchar(36) | NO | - | Tenant ID for multi-tenancy |
| `name` | varchar(200) | NO | - | Name of PO Series |
| `category_id` | bigint | YES | NULL | FK to inventory_master_category |
| `prefix` | varchar(50) | YES | NULL | Prefix for PO number (e.g., "PO/") |
| `suffix` | varchar(50) | YES | NULL | Suffix for PO number (e.g., "/26") |
| `digits` | int | NO | 4 | Number of digits for padding |
| `auto_year` | tinyint(1) | NO | 0 | Auto-include financial year |
| `current_number` | int | NO | 1 | Current/next number in sequence |
| `is_active` | tinyint(1) | NO | 1 | Whether this setting is active |
| `created_at` | datetime(6) | NO | CURRENT_TIMESTAMP(6) | Creation timestamp |
| `updated_at` | datetime(6) | NO | CURRENT_TIMESTAMP(6) | Last update timestamp |

### Indexes

1. **PRIMARY KEY** - `id`
2. **UNIQUE KEY** - `vendor_posettings_tenant_name_unique` (`tenant_id`, `name`)
   - Ensures unique PO series names per tenant
3. **INDEX** - `vendor_posettings_tenant_id_idx` (`tenant_id`)
   - For tenant-based queries
4. **INDEX** - `vendor_posettings_category_id_idx` (`category_id`)
   - For category filtering
5. **INDEX** - `vendor_posettings_is_active_idx` (`is_active`)
   - For active/inactive filtering

### Foreign Keys

1. **`vendor_posettings_category_fk`**
   - References: `inventory_master_category(id)`
   - On Delete: SET NULL
   - Allows PO settings to be linked to inventory categories

## Matching Django Model

The schema matches the Django model defined in `backend/vendors/models.py`:

```python
class VendorMasterPOSettings(models.Model):
    tenant_id = models.CharField(max_length=36)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(InventoryMasterCategory, ...)
    prefix = models.CharField(max_length=50, blank=True, null=True)
    suffix = models.CharField(max_length=50, blank=True, null=True)
    digits = models.IntegerField(default=4)
    auto_year = models.BooleanField(default=False)
    current_number = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## Example Data

```sql
-- Example PO Setting
INSERT INTO vendor_master_posettings 
  (tenant_id, name, category_id, prefix, suffix, digits, auto_year, current_number, is_active)
VALUES
  ('tenant_001', 'Standard PO', 5, 'PO/', '/26', 4, 0, 1, 1);

-- This would generate PO numbers like: PO//26/0001, PO//26/0002, etc.
```

## Usage in Application

### API Endpoint
- **Base:** `/api/vendors/po-settings/`
- **Methods:** GET, POST, PUT, DELETE

### Sample API Response
```json
{
  "id": 1,
  "tenant_id": "tenant_001",
  "name": "Standard PO",
  "category": 5,
  "category_name": "Raw Materials",
  "prefix": "PO/",
  "suffix": "/26",
  "digits": 4,
  "auto_year": false,
  "current_number": 1,
  "is_active": true,
  "created_at": "2026-01-17T12:00:00",
  "updated_at": "2026-01-17T12:00:00",
  "preview_po_number": "PO//26/0001"
}
```

## Migration Status

- ✅ Django migration created: `0003_vendormasterposettings.py`
- ✅ Migration applied to database
- ✅ Table exists in database
- ✅ Schema.sql updated

## Related Tables

1. **`inventory_master_category`** - Referenced by `category_id`
2. **`vendors`** - Related vendor master table
3. **`tenants`** - Multi-tenancy support

## Notes

- The table uses `category_id` as the foreign key column name (Django convention)
- The Django model field is named `category` (ForeignKey)
- This is standard Django behavior - no mismatch
- Unique constraint ensures no duplicate PO series names per tenant
- Soft delete implemented via `is_active` flag
- Timestamps auto-update on modification

---

**Status:** Schema successfully updated with vendor_master_posettings table definition! ✅
