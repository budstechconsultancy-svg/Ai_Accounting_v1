# Vendor Master TDS & Other Statutory Details

## Overview

This module provides functionality for managing TDS (Tax Deducted at Source) and other statutory details for vendors in the AI Accounting system.

## Table: `vendor_master_tds`

### Schema

```sql
CREATE TABLE `vendor_master_tds` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(36) NOT NULL COMMENT 'Tenant ID for multi-tenancy',
  `vendor_basic_detail_id` bigint DEFAULT NULL COMMENT 'Foreign key to vendor_master_basicdetail',
  `pan_number` varchar(10) DEFAULT NULL COMMENT 'PAN Number',
  `tan_number` varchar(10) DEFAULT NULL COMMENT 'TAN Number',
  `tds_section` varchar(50) DEFAULT NULL COMMENT 'TDS Section (e.g., 194C, 194J)',
  `tds_rate` decimal(5,2) DEFAULT NULL COMMENT 'TDS Rate in percentage',
  `tds_section_applicable` varchar(100) DEFAULT NULL COMMENT 'TDS Section Applicable',
  `enable_automatic_tds_posting` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Enable automatic TDS posting',
  `msme_udyam_no` varchar(50) DEFAULT NULL COMMENT 'MSME Udyam Registration Number',
  `fssai_license_no` varchar(50) DEFAULT NULL COMMENT 'FSSAI License Number',
  `import_export_code` varchar(50) DEFAULT NULL COMMENT 'Import Export Code (IEC)',
  `eou_status` varchar(100) DEFAULT NULL COMMENT 'Export Oriented Unit Status',
  `cin_number` varchar(21) DEFAULT NULL COMMENT 'Corporate Identification Number',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether this TDS detail is active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `created_by` varchar(100) DEFAULT NULL COMMENT 'Created by user',
  `updated_by` varchar(100) DEFAULT NULL COMMENT 'Updated by user',
  PRIMARY KEY (`id`),
  KEY `vendor_tds_tenant_id_idx` (`tenant_id`),
  KEY `vendor_tds_vendor_basic_detail_id_idx` (`vendor_basic_detail_id`),
  KEY `vendor_tds_pan_number_idx` (`pan_number`),
  CONSTRAINT `vendor_tds_vendor_fk` FOREIGN KEY (`vendor_basic_detail_id`) REFERENCES `vendor_master_basicdetail` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | bigint | Primary key, auto-increment |
| `tenant_id` | varchar(36) | Tenant identifier for multi-tenancy |
| `vendor_basic_detail_id` | bigint | Foreign key to vendor_master_basicdetail |
| `pan_number` | varchar(10) | Permanent Account Number |
| `tan_number` | varchar(10) | Tax Deduction Account Number |
| `tds_section` | varchar(50) | TDS Section (e.g., 194C, 194J) |
| `tds_rate` | decimal(5,2) | TDS rate in percentage (0.00 to 100.00) |
| `tds_section_applicable` | varchar(100) | Applicable TDS section description |
| `enable_automatic_tds_posting` | tinyint(1) | Flag to enable automatic TDS posting |
| `msme_udyam_no` | varchar(50) | MSME Udyam Registration Number |
| `fssai_license_no` | varchar(50) | FSSAI License Number |
| `import_export_code` | varchar(50) | Import Export Code (IEC) |
| `eou_status` | varchar(100) | Export Oriented Unit Status |
| `cin_number` | varchar(21) | Corporate Identification Number |
| `is_active` | tinyint(1) | Active status flag |
| `created_at` | datetime(6) | Record creation timestamp |
| `updated_at` | datetime(6) | Record update timestamp |
| `created_by` | varchar(100) | Username of creator |
| `updated_by` | varchar(100) | Username of last updater |

## API Endpoints

### Base URL
```
/api/vendors/tds-details/
```

### Available Endpoints

#### 1. List All TDS Records
**GET** `/api/vendors/tds-details/`

Returns all TDS records for the authenticated user's tenant.

**Response:**
```json
[
  {
    "id": 1,
    "tenant_id": "tenant-uuid",
    "vendor_basic_detail_id": 1,
    "pan_number": "ABCDE1234F",
    "tan_number": "TANA12345B",
    "tds_section": "194C",
    "tds_rate": 2.00,
    "tds_section_applicable": "Payment to contractors",
    "enable_automatic_tds_posting": true,
    "msme_udyam_no": "UDYAM-XX-00-0000000",
    "fssai_license_no": "12345678901234",
    "import_export_code": "IEC1234567890",
    "eou_status": "Active",
    "cin_number": "U12345AB1234PLC123456",
    "is_active": true,
    "created_at": "2026-01-17T14:30:00.000000",
    "updated_at": "2026-01-17T14:30:00.000000",
    "created_by": "admin",
    "updated_by": "admin"
  }
]
```

#### 2. Create TDS Record
**POST** `/api/vendors/tds-details/`

Creates a new TDS record.

**Request Body:**
```json
{
  "vendor_basic_detail_id": 1,
  "pan_number": "ABCDE1234F",
  "tan_number": "TANA12345B",
  "tds_section": "194C",
  "tds_rate": 2.00,
  "tds_section_applicable": "Payment to contractors",
  "enable_automatic_tds_posting": true,
  "msme_udyam_no": "UDYAM-XX-00-0000000",
  "fssai_license_no": "12345678901234",
  "import_export_code": "IEC1234567890",
  "eou_status": "Active",
  "cin_number": "U12345AB1234PLC123456"
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "tenant_id": "tenant-uuid",
  "vendor_basic_detail_id": 1,
  ...
}
```

#### 3. Retrieve TDS Record
**GET** `/api/vendors/tds-details/{id}/`

Retrieves a specific TDS record by ID.

**Response:**
```json
{
  "id": 1,
  "tenant_id": "tenant-uuid",
  "vendor_basic_detail_id": 1,
  ...
}
```

#### 4. Update TDS Record
**PUT/PATCH** `/api/vendors/tds-details/{id}/`

Updates an existing TDS record.

**Request Body:**
```json
{
  "tds_rate": 3.00,
  "enable_automatic_tds_posting": false
}
```

**Response:** (200 OK)
```json
{
  "id": 1,
  "tenant_id": "tenant-uuid",
  "tds_rate": 3.00,
  "enable_automatic_tds_posting": false,
  ...
}
```

#### 5. Delete TDS Record
**DELETE** `/api/vendors/tds-details/{id}/`

Soft deletes a TDS record (sets is_active to false).

**Response:** (204 No Content)

#### 6. Get TDS by Vendor
**GET** `/api/vendors/tds-details/by-vendor/{vendor_basic_detail_id}/`

Retrieves TDS record for a specific vendor.

**Response:**
```json
{
  "id": 1,
  "tenant_id": "tenant-uuid",
  "vendor_basic_detail_id": 1,
  ...
}
```

## Validation Rules

### PAN Number
- Must be exactly 10 characters
- Format: AAAAA9999A (5 letters, 4 digits, 1 letter)

### TAN Number
- Must be exactly 10 characters
- Format: AAAA99999A (4 letters, 5 digits, 1 letter)

### CIN Number
- Must be exactly 21 characters
- Format: U12345AB1234PLC123456

### TDS Rate
- Must be between 0 and 100
- Decimal precision: 2 places

## Usage Examples

### Python (Django)

```python
from vendors.models import VendorMasterTDS, VendorMasterBasicDetail

# Create TDS record
vendor = VendorMasterBasicDetail.objects.get(id=1)
tds = VendorMasterTDS.objects.create(
    tenant_id=vendor.tenant_id,
    vendor_basic_detail=vendor,
    pan_number="ABCDE1234F",
    tan_number="TANA12345B",
    tds_section="194C",
    tds_rate=2.00,
    enable_automatic_tds_posting=True
)

# Query TDS records
tds_records = VendorMasterTDS.objects.filter(
    tenant_id=tenant_id,
    is_active=True
)

# Get TDS for specific vendor
vendor_tds = VendorMasterTDS.objects.filter(
    vendor_basic_detail=vendor,
    is_active=True
).first()
```

### JavaScript (Frontend)

```javascript
// Create TDS record
const response = await fetch('/api/vendors/tds-details/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    vendor_basic_detail_id: 1,
    pan_number: 'ABCDE1234F',
    tan_number: 'TANA12345B',
    tds_section: '194C',
    tds_rate: 2.00,
    enable_automatic_tds_posting: true
  })
});

const tdsRecord = await response.json();

// Get TDS by vendor
const vendorTds = await fetch(
  `/api/vendors/tds-details/by-vendor/1/`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

## Files Created

1. **Model**: `backend/vendors/models.py` - VendorMasterTDS class
2. **Serializer**: `backend/vendors/vendortds_serializers.py`
3. **Database Functions**: `backend/vendors/vendortds_database.py`
4. **API Views**: `backend/vendors/vendortds_api.py`
5. **URL Configuration**: `backend/vendors/urls.py` (updated)
6. **Migration**: `backend/vendors/migrations/0007_vendormastergstdetails_vendormasterproductservice_and_more.py`
7. **Schema**: `schema.sql` (updated)

## Testing

Run the test script to verify the implementation:

```bash
cd backend
python test_vendor_tds.py
```

This will:
- Verify table existence
- Test model functionality
- Create and delete a sample record

## Integration with Vendor Creation Flow

The TDS details are linked to vendor basic details via the `vendor_basic_detail_id` foreign key. When creating a vendor:

1. Create vendor basic details first
2. Create TDS details with reference to the vendor basic detail ID
3. The relationship is automatically maintained via foreign key constraint

## Security

- All endpoints require authentication (`IsAuthenticated` permission)
- Data is filtered by tenant_id automatically
- Soft delete preserves data integrity
- Foreign key constraints ensure referential integrity

## Notes

- The table uses InnoDB engine for transaction support
- Timestamps are automatically managed by Django
- Indexes are created on frequently queried fields (tenant_id, vendor_basic_detail_id, pan_number)
- The table supports multi-tenancy through tenant_id field
