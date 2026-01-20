# How to Fill Customer Onboarding Form - Step by Step

## Important: You MUST fill in data in each tab for it to be saved!

The system only saves data that you actually enter. Empty fields are not saved.

## Step-by-Step Guide

### Tab 1: Basic Details ✅ (REQUIRED)
**What to fill:**
- Customer Name: `Test Customer` (REQUIRED)
- Customer Code: Auto-generated (don't change)
- Customer Category: Select from dropdown (optional)
- PAN Number: `ABCDE1234F` (optional)
- Contact Person: `John Doe` (optional)
- Email: `john@example.com` (optional)
- Contact Number: `9876543210` (optional)

**Click "Next" to go to GST Details**

---

### Tab 2: GST Details (OPTIONAL but must fill if you want it saved)
**What to fill:**
- **Option 1: Registered Customer**
  - Add GSTIN: Type `27ABCDE1234F1Z5` and click Add
  - You should see the GSTIN appear in a list/chip
  
- **Option 2: Unregistered Customer**
  - Check "Unregistered" checkbox
  - Fill in branch details if needed

**⚠️ IMPORTANT:** If you don't add any GSTIN, this section will NOT be saved!

**Click "Next" to go to Products/Services**

---

### Tab 3: Products/Services (OPTIONAL but must fill if you want it saved)
**What to fill:**
- Item Code: Select from dropdown or type `ITEM001` (REQUIRED for this row to save)
- Item Name: Auto-fetched or type `Test Item`
- Customer Item Code: `CUST-ITEM001` (optional)
- Customer Item Name: `Customer Test Item` (optional)
- UOM: `PCS` (optional)
- Customer UOM: `PIECES` (optional)

**⚠️ IMPORTANT:** If Item Code is empty, this row will NOT be saved!

**Click "+ Add Row" if you want to add more products**

**Click "Next" to go to TDS & Other Statutory Details**

---

### Tab 4: TDS & Other Statutory Details (OPTIONAL but must fill if you want it saved)
**What to fill:**
- MSME (Udyam) Registration Number: `UDYAM-XX-00-0000001` (optional)
- FSSAI License Number: `12345678901234` (optional)
- Import Export Code (IEC): `0123456789` (optional)
- EOU Status: Select from dropdown (optional)
- TCS Section: Select from dropdown (optional)
- TCS Enabled: Check if applicable (optional)
- TDS Section: Select from dropdown (optional)
- TDS Enabled: Check if applicable (optional)

**⚠️ IMPORTANT:** If ALL fields are empty, this section will NOT be saved!

**Click "Next" to go to Banking Info**

---

### Tab 5: Banking Info (OPTIONAL but must fill if you want it saved)
**What to fill:**
- Click "+ Add Bank Account"
- Bank Account Number: `1234567890` (REQUIRED for this account to save)
- Bank Name: `Test Bank` (REQUIRED)
- IFSC Code: `TEST0001234` (REQUIRED)
- Branch Name: `Test Branch` (optional)
- SWIFT Code: `TESTINBB` (optional)
- Associate to Vendor Branch: Select from dropdown (optional)

**⚠️ IMPORTANT:** If Account Number is empty, this account will NOT be saved!

**Click "+ Add Another Bank" if you want to add more accounts**

**Click "Next" to go to Terms & Conditions**

---

### Tab 6: Terms & Conditions ✅ (OPTIONAL but must fill if you want it saved)
**What to fill:**
- Credit Period: `30 Days` (optional)
- Credit Terms: `Payment within 30 days of invoice date` (optional)
- Penalty Terms: `2% penalty per month on delayed payments` (optional)
- Delivery Terms: `FOB Destination` (optional)
- Warranty / Guarantee Details: `1 year warranty on all products` (optional)
- Force Majeure: `Standard force majeure clause applies` (optional)
- Dispute and Redressal Terms: `Disputes to be resolved in Mumbai jurisdiction` (optional)

**⚠️ IMPORTANT:** If ALL fields are empty, this section will NOT be saved!

**Click "Onboard Customer" to save**

---

## What Gets Saved

After clicking "Onboard Customer", the system will save:

1. ✅ **Basic Details** - ALWAYS saved (required)
2. ✅ **GST Details** - ONLY if you added at least one GSTIN
3. ✅ **Products/Services** - ONLY if you added at least one product with Item Code
4. ✅ **TDS Details** - ONLY if you filled in at least one TDS field
5. ✅ **Banking Info** - ONLY if you added at least one bank account with Account Number
6. ✅ **Terms & Conditions** - ONLY if you filled in at least one T&C field

---

## Common Mistakes

### ❌ Mistake 1: Not adding GSTIN
**Problem:** You type a GSTIN but don't click "Add" button
**Solution:** After typing GSTIN, click the "Add" or "+" button to add it to the list

### ❌ Mistake 2: Empty Item Code
**Problem:** You add a product row but leave Item Code empty
**Solution:** Select an Item Code from the dropdown or type one

### ❌ Mistake 3: Empty Bank Account Number
**Problem:** You click "Add Bank Account" but leave Account Number empty
**Solution:** Fill in at least Account Number, Bank Name, and IFSC Code

### ❌ Mistake 4: Not filling any fields in a tab
**Problem:** You navigate through tabs but don't fill anything
**Solution:** Fill at least one field in each tab you want to save

---

## How to Verify Data Was Saved

After clicking "Onboard Customer", you should see:
1. Success message: "Customer created successfully!"
2. You'll be taken back to the customer list

To verify all data was saved:

### Method 1: Check Backend Logs
Look at the terminal running `python manage.py runserver`. You should see:
```
✅ Basic Details created: ID=123
✅ GST Detail created: ID=456, GSTIN=27ABCDE1234F1Z5
✅ Product/Service created: ID=789, Code=ITEM001
✅ TDS Details created: ID=101
✅ Banking Info created: ID=102, Account=1234567890
✅ Terms & Conditions created: ID=103
```

### Method 2: Check Database
Run this SQL query:
```sql
SELECT 
    cbd.customer_code,
    cbd.customer_name,
    COUNT(DISTINCT gst.id) as gst_count,
    COUNT(DISTINCT ps.id) as product_count,
    COUNT(DISTINCT tds.id) as tds_count,
    COUNT(DISTINCT bank.id) as bank_count,
    COUNT(DISTINCT tc.id) as terms_count
FROM customer_master_customer_basicdetails cbd
LEFT JOIN customer_master_customer_gstdetails gst ON gst.customer_basic_detail_id = cbd.id
LEFT JOIN customer_master_customer_productservice ps ON ps.customer_basic_detail_id = cbd.id
LEFT JOIN customer_master_customer_tds tds ON tds.customer_basic_detail_id = cbd.id
LEFT JOIN customer_master_customer_banking bank ON bank.customer_basic_detail_id = cbd.id
LEFT JOIN customer_master_customer_termscondition tc ON tc.customer_basic_detail_id = cbd.id
WHERE cbd.is_deleted = 0
GROUP BY cbd.id
ORDER BY cbd.created_at DESC
LIMIT 1;
```

You should see counts > 0 for each section you filled in.

---

## Quick Test Data

Copy and paste these values to quickly test:

**Basic Details:**
- Customer Name: `Test Customer ABC`
- PAN: `ABCDE1234F`
- Contact Person: `John Doe`
- Email: `john@test.com`
- Phone: `9876543210`

**GST Details:**
- GSTIN: `27ABCDE1234F1Z5` (type this and click Add)

**Products/Services:**
- Item Code: `ITEM001` (or select from dropdown)
- Customer Item Code: `CUST-ITEM001`
- UOM: `PCS`

**TDS Details:**
- MSME No: `UDYAM-XX-00-0000001`
- TCS Enabled: ✓ (check the box)

**Banking:**
- Account Number: `1234567890`
- Bank Name: `State Bank of India`
- IFSC: `SBIN0001234`

**Terms & Conditions:**
- Credit Period: `30 Days`
- Credit Terms: `Payment within 30 days`

---

## Summary

**The key point:** The system only saves what you fill in!

If you want all 6 tables to have data, you must:
1. ✅ Fill in Basic Details (required)
2. ✅ Add at least one GSTIN in GST Details
3. ✅ Add at least one product with Item Code in Products/Services
4. ✅ Fill in at least one field in TDS Details
5. ✅ Add at least one bank account in Banking Info
6. ✅ Fill in at least one field in Terms & Conditions

Then click "Onboard Customer" and all data will be saved!
