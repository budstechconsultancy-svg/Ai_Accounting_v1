# Long-term Contracts Implementation Summary

## Overview
Successfully created three separate database tables for managing Customer Long-term Contracts with full backend API support.

## Database Tables Created

### 1. `customer_master_longtermcontracts_basicdetails`
**Purpose**: Stores basic contract information

**Fields**:
- `id` - Primary key (Auto-increment)
- `tenant_id` - Tenant identifier (VARCHAR(36), indexed)
- `contract_number` - Contract number (VARCHAR(50))
- `customer_id` - Reference to customer (INTEGER, indexed)
- `customer_name` - Customer display name (VARCHAR(255))
- `branch_id` - Reference to branch (INTEGER, nullable)
- `contract_type` - Type of contract (VARCHAR(50): Rate Contract, Service Contract, AMC)
- `contract_validity_from` - Contract start date (DATE)
- `contract_validity_to` - Contract end date (DATE)
- `contract_document` - File path to uploaded document (VARCHAR(500), nullable)
- `automate_billing` - Enable automated billing (BOOLEAN, default: FALSE)
- `bill_start_date` - Billing start date (DATE, nullable)
- `billing_frequency` - Frequency of billing (VARCHAR(20): Weekly, Monthly, Quarterly, Half-Yearly, Yearly)
- `voucher_name` - Voucher type for automated billing (VARCHAR(100), nullable)
- `bill_period_from` - Billing period start (DATE, nullable)
- `bill_period_to` - Billing period end (DATE, nullable)
- `is_active` - Active status (BOOLEAN, default: TRUE)
- `is_deleted` - Soft delete flag (BOOLEAN, default: FALSE)
- `created_at` - Creation timestamp (DATETIME, auto)
- `updated_at` - Update timestamp (DATETIME, auto)
- `created_by` - Creator username (VARCHAR(100), nullable)

**Indexes**:
- `tenant_id`, `contract_number` (unique together)
- `tenant_id`, `customer_id`
- `tenant_id`, `is_deleted`
- `contract_validity_from`, `contract_validity_to`

### 2. `customer_master_longtermcontracts_productservices`
**Purpose**: Stores products/services associated with each contract

**Fields**:
- `id` - Primary key (Auto-increment)
- `tenant_id` - Tenant identifier (VARCHAR(36), indexed)
- `contract_basic_detail_id` - Foreign key to basic details (INTEGER, CASCADE delete)
- `item_code` - Our item code (VARCHAR(50))
- `item_name` - Our item name (VARCHAR(200))
- `customer_item_name` - Customer's item name (VARCHAR(200), nullable)
- `qty_min` - Minimum quantity (DECIMAL(15,2), nullable)
- `qty_max` - Maximum quantity (DECIMAL(15,2), nullable)
- `price_min` - Minimum price (DECIMAL(15,2), nullable)
- `price_max` - Maximum price (DECIMAL(15,2), nullable)
- `acceptable_price_deviation` - Price deviation (VARCHAR(50), nullable, e.g., "±5%")
- `created_at` - Creation timestamp (DATETIME, auto)
- `updated_at` - Update timestamp (DATETIME, auto)
- `created_by` - Creator username (VARCHAR(100), nullable)

**Indexes**:
- `tenant_id`, `item_code`
- `contract_basic_detail_id`

### 3. `customer_master_longtermcontracts_termscondition`
**Purpose**: Stores terms and conditions for each contract

**Fields**:
- `id` - Primary key (Auto-increment)
- `tenant_id` - Tenant identifier (VARCHAR(36), indexed)
- `contract_basic_detail_id` - Foreign key to basic details (INTEGER, CASCADE delete, ONE-TO-ONE)
- `payment_terms` - Payment terms (TEXT, nullable)
- `penalty_terms` - Penalty terms (TEXT, nullable)
- `force_majeure` - Force majeure clause (TEXT, nullable)
- `termination_clause` - Termination clause (TEXT, nullable)
- `dispute_terms` - Dispute & redressal terms (TEXT, nullable)
- `others` - Other terms (TEXT, nullable)
- `created_at` - Creation timestamp (DATETIME, auto)
- `updated_at` - Update timestamp (DATETIME, auto)
- `created_by` - Creator username (VARCHAR(100), nullable)

**Indexes**:
- `tenant_id`
- `contract_basic_detail_id`

## API Endpoints

### Base URL: `/api/customerportal/long-term-contracts/`

**Available Endpoints**:
- `GET /api/customerportal/long-term-contracts/` - List all contracts (filtered by tenant)
- `POST /api/customerportal/long-term-contracts/` - Create new contract
- `GET /api/customerportal/long-term-contracts/{id}/` - Retrieve specific contract
- `PUT /api/customerportal/long-term-contracts/{id}/` - Update contract
- `PATCH /api/customerportal/long-term-contracts/{id}/` - Partial update
- `DELETE /api/customerportal/long-term-contracts/{id}/` - Delete contract
- `POST /api/customerportal/long-term-contracts/{id}/deactivate/` - Soft delete contract

## Data Flow

### Creating a Contract (POST Request)

**Request Format**:
```json
{
  "contract_number": "CT-2026-001",
  "customer_id": 123,
  "customer_name": "Acme Corporation",
  "branch_id": 1,
  "contract_type": "Rate Contract",
  "contract_validity_from": "2026-01-01",
  "contract_validity_to": "2026-12-31",
  "contract_document": "/uploads/contracts/ct-2026-001.pdf",
  "automate_billing": true,
  "bill_start_date": "2026-01-01",
  "billing_frequency": "Monthly",
  "voucher_name": "Sales Invoice",
  "bill_period_from": "2026-01-01",
  "bill_period_to": "2026-01-31",
  "products_services": [
    {
      "item_code": "ITEM-001",
      "item_name": "Product A",
      "customer_item_name": "Custom Product A",
      "qty_min": 100,
      "qty_max": 1000,
      "price_min": 50.00,
      "price_max": 100.00,
      "acceptable_price_deviation": "±5%"
    }
  ],
  "terms_conditions": {
    "payment_terms": "Net 30 days",
    "penalty_terms": "2% per month on late payments",
    "force_majeure": "Standard force majeure clause",
    "termination_clause": "30 days notice required",
    "dispute_terms": "Arbitration in Mumbai",
    "others": "Additional terms here"
  }
}
```

**Backend Processing**:
1. **Basic Details**: Saved to `customer_master_longtermcontracts_basicdetails`
2. **Products/Services**: Each item in `products_services` array is saved to `customer_master_longtermcontracts_productservices`
3. **Terms & Conditions**: Saved to `customer_master_longtermcontracts_termscondition`

All three operations are performed in the `perform_create` method of the ViewSet, ensuring data consistency.

## Frontend Integration

### Save Button Behavior
When the user clicks the **Save** button in the "Terms & Conditions" tab:
1. Frontend collects data from all three tabs:
   - Basic Details
   - Products / Services
   - Terms & Conditions
2. Sends a single POST request to `/api/customerportal/long-term-contracts/`
3. Backend automatically saves to all three tables
4. Returns the complete contract data with all relationships

### Response Format
```json
{
  "id": 1,
  "tenant_id": "tenant-uuid",
  "contract_number": "CT-2026-001",
  "customer_id": 123,
  "customer_name": "Acme Corporation",
  "branch_id": 1,
  "contract_type": "Rate Contract",
  "contract_validity_from": "2026-01-01",
  "contract_validity_to": "2026-12-31",
  "automate_billing": true,
  "bill_start_date": "2026-01-01",
  "billing_frequency": "Monthly",
  "voucher_name": "Sales Invoice",
  "bill_period_from": "2026-01-01",
  "bill_period_to": "2026-01-31",
  "is_active": true,
  "is_deleted": false,
  "created_at": "2026-01-19T17:30:00Z",
  "updated_at": "2026-01-19T17:30:00Z",
  "created_by": "admin",
  "products_services": [
    {
      "id": 1,
      "item_code": "ITEM-001",
      "item_name": "Product A",
      "customer_item_name": "Custom Product A",
      "qty_min": "100.00",
      "qty_max": "1000.00",
      "price_min": "50.00",
      "price_max": "100.00",
      "acceptable_price_deviation": "±5%",
      "created_at": "2026-01-19T17:30:00Z"
    }
  ],
  "terms_conditions": {
    "id": 1,
    "payment_terms": "Net 30 days",
    "penalty_terms": "2% per month on late payments",
    "force_majeure": "Standard force majeure clause",
    "termination_clause": "30 days notice required",
    "dispute_terms": "Arbitration in Mumbai",
    "others": "Additional terms here",
    "created_at": "2026-01-19T17:30:00Z"
  }
}
```

## Files Modified/Created

### Models
- ✅ `backend/customerportal/database.py` - Added 3 new models
- ✅ `backend/customerportal/models.py` - Exported new models

### Serializers
- ✅ `backend/customerportal/serializers.py` - Added 3 new serializers

### API Views
- ✅ `backend/customerportal/api.py` - Added ViewSet with custom create logic

### URL Routing
- ✅ `backend/customerportal/urls.py` - Registered new endpoint

### Migrations
- ✅ Created and applied migration for the three new tables

## Testing the API

### Using cURL:
```bash
# Create a new contract
curl -X POST http://localhost:8000/api/customerportal/long-term-contracts/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "contract_number": "CT-2026-001",
    "customer_id": 1,
    "customer_name": "Test Customer",
    "contract_type": "Rate Contract",
    "contract_validity_from": "2026-01-01",
    "contract_validity_to": "2026-12-31",
    "products_services": [...],
    "terms_conditions": {...}
  }'

# List all contracts
curl -X GET http://localhost:8000/api/customerportal/long-term-contracts/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps for Frontend

1. **Update the Save Button Handler** in `CustomerPortal.tsx`:
   ```typescript
   const handleSaveContract = async () => {
     const contractData = {
       contract_number: basicDetails.contractNumber,
       customer_id: basicDetails.customerId,
       customer_name: basicDetails.customerName,
       branch_id: basicDetails.branchId,
       contract_type: basicDetails.contractType,
       contract_validity_from: basicDetails.validityFrom,
       contract_validity_to: basicDetails.validityTo,
       contract_document: basicDetails.contractDocument,
       automate_billing: basicDetails.automateBilling,
       bill_start_date: basicDetails.billStartDate,
       billing_frequency: basicDetails.billingFrequency,
       voucher_name: basicDetails.voucherName,
       bill_period_from: basicDetails.billPeriodFrom,
       bill_period_to: basicDetails.billPeriodTo,
       products_services: contractProducts.map(p => ({
         item_code: p.itemCode,
         item_name: p.itemName,
         customer_item_name: p.customerItemName,
         qty_min: p.qtyMin,
         qty_max: p.qtyMax,
         price_min: p.priceMin,
         price_max: p.priceMax,
         acceptable_price_deviation: p.deviation
       })),
       terms_conditions: {
         payment_terms: terms.paymentTerms,
         penalty_terms: terms.penaltyTerms,
         force_majeure: terms.forceMajeure,
         termination_clause: terms.terminationClause,
         dispute_terms: terms.disputeTerms,
         others: terms.others
       }
     };

     try {
       const response = await apiService.post('/api/customerportal/long-term-contracts/', contractData);
       alert('Contract Created Successfully!');
       setView('list');
     } catch (error) {
       console.error('Error creating contract:', error);
       alert('Failed to create contract');
     }
   };
   ```

2. **Fetch Contracts** for the list view:
   ```typescript
   const fetchContracts = async () => {
     try {
       const response = await apiService.get('/api/customerportal/long-term-contracts/');
       setContracts(response.data);
     } catch (error) {
       console.error('Error fetching contracts:', error);
     }
   };
   ```

## Summary

✅ **Three separate tables created** as requested
✅ **All frontend fields mapped** to database columns
✅ **Single Save button** saves to all three tables atomically
✅ **Full CRUD API** available for frontend integration
✅ **Tenant isolation** implemented
✅ **Soft delete** support included
✅ **Migrations applied** successfully

The backend is now ready for frontend integration!
