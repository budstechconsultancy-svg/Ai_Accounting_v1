# Product Data Saving Fix

## The Issue
You reported that "Products/Services" data was not saving. The screenshot showed you had entered a **Customer Item Code** (`2424...`) but the **Item Code** dropdown was left as "Select Item" (Empty).

**Root Cause:**
- The backend system had a strict rule: "If `Item Code` is empty, ignore this row."
- Because you hadn't selected an internal Item Code from the dropdown, the system completely skipped saving your Customer Item Code and other details in that row.

## The Fix
- **Rule Relaxation**: I have updated the backend logic to **save every row you see in the table**, regardless of whether you selected an internal Item Code or not.
- Now, if you enter a "Customer Item Code" but leave "Item Code" empty, it **WILL be saved** to the database.

## How to Verify
1. **Refresh** the Customer Portal page.
2. **Create New Customer**.
3. Go to **Products/Services** tab.
4. Leave "Item Code" as "Select Item".
5. Enter `TEST-999` in "Customer Item Code".
6. Click **Save**.
7. Check Database (`customer_master_customer_productservice` table).
   - You will see a new record with `customer_item_code="TEST-999"` (and `item_code` as blank).
