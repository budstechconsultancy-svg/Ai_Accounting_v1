# Sales Order API - 404 Error Fixed ✅

## Problem
The frontend was getting a **404 Not Found** error when trying to save sales orders.

**Error Message:**
```
Failed to load resource: the server responded with a status of 404 (Not Found)
Error saving sales order: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## Root Cause
Two issues were identified:

### 1. Missing URL Registration
The `CustomerTransactionSalesOrderViewSet` was created in `api.py` but was not registered in `urls.py`.

### 2. URL Mismatch
- **Frontend was calling**: `/api/customer-portal/sales-orders/` (with hyphen)
- **Backend was expecting**: `/api/customerportal/sales-orders/` (no hyphen)

## Solution Applied

### Fix 1: Added URL Registration
**File**: `backend/customerportal/urls.py`

Added the import:
```python
from .api import (
    ...
    CustomerTransactionSalesOrderViewSet  # Added this
)
```

Registered the endpoint:
```python
router.register(r'sales-orders', CustomerTransactionSalesOrderViewSet, basename='sales-orders')
```

### Fix 2: Corrected Frontend URL
**File**: `frontend/src/pages/CustomerPortal/CreateSalesOrder.tsx`

Changed from:
```typescript
const response = await fetch('http://localhost:8000/api/customer-portal/sales-orders/', {
```

To:
```typescript
const response = await fetch('http://localhost:8000/api/customerportal/sales-orders/', {
```

## Correct API Endpoint

**Full URL**: `http://localhost:8000/api/customerportal/sales-orders/`

**Method**: POST

**Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Request Body Structure**:
```json
{
  "so_series_name": "SO-2024",
  "so_number": "SO-2024-001",
  "date": "2026-01-20",
  "customer_name": "Customer Name",
  "branch": "Branch Name",
  "items": [...],
  "delivery_terms": {...},
  "payment_terms": {...},
  "salesperson": {...}
}
```

## Testing

Now you can test the Sales Order functionality:

1. **Navigate to Sales Order page** in the frontend
2. **Fill out the form** with required fields
3. **Click Save** button
4. **Check the response** - should get 200/201 success

## Verification

To verify the endpoint is working, you can:

### Option 1: Use the test script
```bash
cd backend
python test_salesorder_api.py
```

### Option 2: Check backend logs
The backend should show:
```
=== Creating Sales Order ===
✅ Basic Details created: ID=1, SO Number=SO-2024-001
✅ Created 2 items
✅ Delivery Terms created
✅ Payment Terms created
✅ Salesperson created
=== Sales Order Creation Completed ===
```

### Option 3: Check database
```sql
SELECT * FROM customer_transaction_salesorder_basicdetails;
SELECT * FROM customer_transaction_salesorder_items;
```

## Status: ✅ FIXED

The API endpoint is now properly configured and accessible at:
`http://localhost:8000/api/customerportal/sales-orders/`

---
**Fixed**: 2026-01-20 17:12 IST
**Issue**: 404 Not Found
**Resolution**: Added URL registration and fixed endpoint path
