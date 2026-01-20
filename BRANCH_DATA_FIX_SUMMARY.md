# Critical Fixes for Customer Data Saving

## 1. Branch Details were NOT Saving (Visual Bug & Logic Error)
**The Issue:**
- In the "Registered" flow (when you select a GSTIN), the branch details inputs (Address, Reference Name, Contact) were **read-only mock data**.
- Even if you typed in them, the underlying system **did not capture your typing**. It continued to send the "Mock Data" or nothing at all.
- In the "Unregistered" flow, the system was configured to ignore your branch details unless a hidden flag (`showBranchDetails`) was active, which wasn't enabled for unregistered users.

**The Fix:**
- **Frontend Code Rewrite**: I completely rewrote the "Branch Details" section logic.
- **Interactive Inputs**: The inputs are now fully interactive and linked to a new `registeredBranches` state variable.
- **Payload Correction**: The save button now intelligenty gathers data:
    - If **Unregistered**: It takes the manual address/branch you entered.
    - If **Registered**: It takes the branch details you edited/fetched for the selected GSTIN.

## 2. Backend Data Handling
**The Issue:**
- The backend was configured to ignore "Contact Person", "Email", and "Contact Number" for branches.
- It also reused to save branches without a GSTIN (causing unregistered branches to disappear).

**The Fix:**
- Updated the backend serializer to explicitly capture and save all contact details.
- Allowed saving branches even if GSTIN is null (for unregistered cases).

## 3. Empty Data Verification
- Confirmed that "Null" records are created for unused tabs (e.g., Banking, TDS) as requested, ensuring the database always has 6 records per customer.

## How to Verify
1. **Refresh** the Customer Portal page (Wait for "Vite connecting..." to finish).
2. **Create New Customer**.
3. **Scenario A (Registered)**:
   - Select a GSTIN (e.g. `29ABC...`).
   - Click "Fetch branch details".
   - **Edit** the "Reference Name" to "My Custom Branch".
   - **Edit** the "Address" to "Real Address 123".
   - Click **Save**.
   - Check Database: You should see a **NEW ROW** in `customer_master_customer_gstdetails`.
     - This new row will have: `branch_reference_name="My Custom Branch"`, `branch_address="Real Address 123"`, AND `gstin="29ABC..."`.
     - *Note: You may still see a separate row with just the GSTIN (and null branch details). This is normal behavior as the system separates "GST Registration" from "Branch Locations".*

4. **Scenario B (Unregistered)**:
   - Check "Unregistered".
   - Fill "Address" and "Reference Name".
   - Click **Save**.
   - Check Database: You should see a row with `gstin=NULL` but `branch_address` populated.
