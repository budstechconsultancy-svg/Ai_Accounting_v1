# Fix Summary: Tenant ID, Inventory Saving (GRN/Issue Slip)

I have resolved the issues preventing you from saving the Purchase Voucher and enabled Inventory Saving for GRN and Issue Slip.

## 1. Inventory Saving Fix (New)
- **Issue**: "Create GRN" and "Create Outward Slip" buttons were not saving data to the backend Inventory tables.
- **Fix**:
    - **Backend**: Created new `InventoryOperationGRN` transaction table and API endpoints. Existing `InventoryOperationOutward` was leveraged.
    - **Frontend**: 
        - Transformed `CreateGRNModal` from a Series Configurator into a proper **GRN Transaction Form** (Items, Qty, Warehouse).
        - Connected `CreateGRNModal` (Purchase Voucher) and `CreateIssueSlipModal` (Sales Voucher) to call the backend API and save data immediately.
- **Result**: Clicking "Save" in these modals now creates records in the Inventory module and populates the reference number in the Voucher.

## 2. Authentication Fix
- **Issue**: Infinite loop of "Refreshing token..." -> "401 Unauthorized".
- **Fix**: 
    - **Backend**: Updated `TokenRefreshView` to return the new `access` token.
    - **Frontend**: Updated `httpClient.ts` to send refresh token in body as fallback.
- **Result**: Authentication refreshes correctly.

## 3. Tenant ID Injection Fix
- **Issue**: `tenant_id` was missing in Purchase tables.
- **Fix**: 
    - **Backend**: Updated `VoucherPurchaseViewSet` and `Serializer` to inject `tenant_id` into all nested records.
- **Result**: All tables now correctly store the `tenant_id`.

## 4. Data Saving Fixes.
- **Issue**: Serializer validation drops, Frontend field mismatches.
- **Fix**: Implemented fallback validation, verified serialized fields.

## Result
You can now:
1.  **Login/Refresh** without errors.
2.  **Purchase Voucher**: Click "Create GRN", fill details, and Save. It will save to Inventory. Then Save Voucher.
3.  **Sales Voucher**: Click "Create Outward Slip", fill details, and Save. It will save to Inventory.
4.  **Verify Database**: Data will be present in `inventory_operation_grn`, `inventory_operation_outward`, and Voucher tables.
