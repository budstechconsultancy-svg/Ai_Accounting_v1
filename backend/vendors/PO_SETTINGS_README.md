# Vendor Master PO Settings Module

## Overview
This module manages Purchase Order (PO) settings for the vendor portal. It allows users to configure PO series with customizable prefixes, suffixes, and numbering schemes.

## Database Table
**Table Name:** `vendor_master_posettings`

### Schema
| Column | Type | Description |
|--------|------|-------------|
| id | BigAutoField | Primary key |
| tenant_id | CharField(36) | Tenant identifier for multi-tenancy |
| name | CharField(200) | Name of the PO series |
| category_id | ForeignKey | Optional reference to InventoryMasterCategory |
| prefix | CharField(50) | Prefix for PO number (e.g., "PO/") |
| suffix | CharField(50) | Suffix for PO number (e.g., "/24-25") |
| digits | Integer | Number of digits for sequence (default: 4) |
| auto_year | Boolean | Auto-include year in PO number (default: False) |
| current_number | Integer | Current sequence number (default: 1) |
| is_active | Boolean | Active status (default: True) |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

### Indexes
- `tenant_id`
- `tenant_id, name` (composite)

## File Structure

```
backend/vendors/
├── models.py                      # Contains VendorMasterPOSettings model
├── posettings_api.py             # API ViewSet for PO settings
├── posettings_database.py        # Database operations layer
├── posettings_serializers.py     # DRF serializers
├── posettings_flow.py            # Business logic (placeholder)
├── urls.py                       # URL routing
└── migrations/
    └── 0003_vendormasterposettings.py
```

## API Endpoints

Base URL: `/api/vendors/po-settings/`

### 1. List PO Settings
**GET** `/api/vendors/po-settings/`

Returns all PO settings for the authenticated user's tenant.

**Response:**
```json
[
  {
    "id": 1,
    "tenant_id": "tenant-123",
    "name": "Standard PO",
    "category": 5,
    "category_name": "Electronics",
    "category_full_path": "Inventory > Electronics",
    "prefix": "PO/",
    "suffix": "/24-25",
    "digits": 4,
    "auto_year": false,
    "current_number": 1,
    "preview_po_number": "PO/0001/24-25",
    "is_active": true,
    "created_at": "2026-01-17T12:00:00Z",
    "updated_at": "2026-01-17T12:00:00Z"
  }
]
```

### 2. Create PO Setting
**POST** `/api/vendors/po-settings/`

**Request Body:**
```json
{
  "name": "Standard PO",
  "category": 5,
  "prefix": "PO/",
  "suffix": "/24-25",
  "digits": 4,
  "auto_year": false
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "tenant_id": "tenant-123",
  "name": "Standard PO",
  "category": 5,
  "category_name": "Electronics",
  "category_full_path": "Inventory > Electronics",
  "prefix": "PO/",
  "suffix": "/24-25",
  "digits": 4,
  "auto_year": false,
  "current_number": 1,
  "preview_po_number": "PO/0001/24-25",
  "is_active": true,
  "created_at": "2026-01-17T12:00:00Z",
  "updated_at": "2026-01-17T12:00:00Z"
}
```

### 3. Retrieve Single PO Setting
**GET** `/api/vendors/po-settings/{id}/`

Returns details of a specific PO setting.

### 4. Update PO Setting
**PUT/PATCH** `/api/vendors/po-settings/{id}/`

**Request Body:**
```json
{
  "name": "Updated PO Series",
  "prefix": "PO-",
  "digits": 5
}
```

### 5. Delete PO Setting (Soft Delete)
**DELETE** `/api/vendors/po-settings/{id}/`

Sets `is_active` to `False` instead of deleting the record.

**Response:** `204 No Content`

### 6. Generate PO Number
**POST** `/api/vendors/po-settings/{id}/generate_po_number/`

Generates the next PO number and increments the counter.

**Response:**
```json
{
  "po_number": "PO/0001/24-25",
  "message": "PO number generated successfully"
}
```

### 7. Preview PO Number
**GET** `/api/vendors/po-settings/{id}/preview_po_number/`

Preview the next PO number without incrementing.

**Response:**
```json
{
  "preview": "PO/0001/24-25",
  "current_number": 1
}
```

### 8. Filter by Category
**GET** `/api/vendors/po-settings/by_category/?category_id={id}`

Returns PO settings filtered by category.

## Frontend Integration

The frontend form in `VendorPortal` should send data to:
- **Create:** `POST /api/vendors/po-settings/`
- **List:** `GET /api/vendors/po-settings/`

### Example Frontend Request
```javascript
// Create PO Setting
const createPOSetting = async (data) => {
  const response = await fetch('/api/vendors/po-settings/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: data.name,
      category: data.categoryId,
      prefix: data.prefix,
      suffix: data.suffix,
      digits: parseInt(data.digits),
      auto_year: data.autoYear
    })
  });
  return await response.json();
};
```

## Business Logic (Future Implementation)

The `posettings_flow.py` file contains placeholder methods for:
- Advanced validation
- PO number assignment to purchase orders
- Usage tracking before deletion
- Bulk operations

These will be implemented as business requirements are defined.

## Testing

### Manual API Test
```bash
# List PO Settings
curl -X GET http://localhost:8000/api/vendors/po-settings/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create PO Setting
curl -X POST http://localhost:8000/api/vendors/po-settings/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test PO",
    "prefix": "PO/",
    "suffix": "/25",
    "digits": 4,
    "auto_year": false
  }'
```

## Migration

The migration file `0003_vendormasterposettings.py` has been created and applied.

To apply in other environments:
```bash
python manage.py migrate vendors
```

## Notes

1. **Tenant Isolation:** All queries are automatically filtered by the authenticated user's tenant_id
2. **Soft Delete:** Deletion sets `is_active=False` to preserve historical data
3. **Auto Year:** When enabled, automatically appends the current year (last 2 digits) to the suffix
4. **Duplicate Prevention:** The API prevents duplicate PO setting names within the same tenant
5. **Category Integration:** Integrates with the existing `InventoryMasterCategory` model

## Future Enhancements

- [ ] Integration with Purchase Order creation
- [ ] PO number history tracking
- [ ] Advanced numbering schemes (fiscal year, month-based, etc.)
- [ ] Bulk import/export of PO settings
- [ ] Usage analytics and reporting
