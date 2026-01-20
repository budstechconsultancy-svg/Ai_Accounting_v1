# Sales Order Auth - 401 Error Fixed ✅

## Problem
The frontend was getting a **401 Unauthorized** error when trying to save sales orders.

**Error Message:**
```
Error saving sales order: Authentication credentials were not provided.
```

## Root Cause
The `fetch` API was being used directly without including authentication credentials (cookies). The backend requires an HttpOnly cookie containing the access token to authenticate the request.

## Solution Applied

### Updated CreateSalesOrder.tsx to use httpClient

**File**: `frontend/src/pages/CustomerPortal/CreateSalesOrder.tsx`

1. **Imported httpClient service**:
   ```typescript
   import { httpClient } from '../../services/httpClient';
   ```

2. **Replaced raw `fetch` with `httpClient.post`**:
   
   **Before:**
   ```typescript
   const response = await fetch('http://localhost:8000/api/customerportal/sales-orders/', { ... });
   ```

   **After:**
   ```typescript
   const result = await httpClient.post('/api/customerportal/sales-orders/', salesOrderData);
   ```

**Why this fixes it:**
The `httpClient` service is configured to:
1. Automatically include `credentials: 'include'` in requests, which sends the HttpOnly cookies.
2. Handle token refresh if the access token is expired.
3. Parse the response and error handling automatically.

## Testing

Now you can test the Sales Order functionality again:

1. **Navigate to Sales Order page** in the frontend
2. **Fill out the form** with required fields
3. **Click Save** button
4. **Result**: The request will now be authenticated and should succeed (200 OK/201 Created).

## Verification

If successful, you will see a success alert and the data will be saved in the database.

## Status: ✅ FIXED

Authentication is now handled correctly for the Sales Order save operation.

---
**Fixed**: 2026-01-20 17:16 IST
**Issue**: 401 Unauthorized
**Resolution**: Switched to `httpClient` service
