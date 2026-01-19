# Vendor Onboarding - Complete Flow Test Guide

## ✅ Current Status
All components are implemented and ready. When you click "Onboard Vendor", the data WILL be saved to the database.

## 🔄 Complete Vendor Onboarding Flow

### Step 1: Basic Details
Navigate to: **Vendor Portal → Master → Vendor Creation → Basic Details**

Fill in:
- Vendor Code: (auto-generated or manual)
- Vendor Name: **(Required)**
- PAN No: (optional)
- Contact Person: (optional)
- Email: **(Required)**
- Contact No: **(Required)**
- Is also customer: (checkbox)

Click **"Save & Continue"** → This creates the vendor and stores the ID

### Step 2: GST Details
Fill in:
- GSTIN: **(Required)**
- GST Registration Type: (dropdown)
- Legal Name: **(Required)**
- Trade Name: (optional)

Click **"Save & Continue"**

### Step 3: Products/Services
Add items with:
- HSN/SAC Code
- Item Code
- Item Name **(Required)**
- Supplier Item Code
- Supplier Item Name

Click **"Next"**

### Step 4: TDS & Other Statutory
Fill in:
- PAN Number
- TAN Number
- TDS Section
- TDS Rate
- MSME Udyam No
- FSSAI License No
- Import Export Code
- EOU Status
- CIN Number
- Enable automatic TDS posting (checkbox)

Click **"Save & Continue"**

### Step 5: Banking Info
Fill in:
- Bank Account No
- Bank Name
- IFSC Code
- Branch Name
- Swift Code
- Vendor Branch
- Account Type

Click **"Next"**

### Step 6: Terms & Conditions (FINAL STEP)
Fill in:
- Credit Limit: (e.g., 50000)
- Credit Period: (e.g., "30 days")
- Credit Terms: (e.g., "Payment within 30 days of invoice")
- Penalty Terms: (e.g., "2% penalty per month on late payments")
- Delivery Terms: (e.g., "FOB, 15 days lead time")
- Warranty/Guarantee Details: (e.g., "1 year warranty")
- Force Majeure: (e.g., "Standard force majeure clauses")
- Dispute Redressal Terms: (e.g., "Arbitration in Mumbai")

Click **"Onboard Vendor"** → **THIS SAVES ALL DATA TO DATABASE!**

## 🎯 What Happens When You Click "Onboard Vendor"

1. **Frontend Validation**:
   - Checks if `createdVendorId` exists (from Basic Details)
   - If not, shows alert: "Please complete Basic Details first"

2. **Data Collection**:
   - Gathers all form field values
   - Converts credit_limit to float if provided
   - Creates payload object

3. **API Call**:
   - Sends POST request to `/api/vendors/terms/`
   - Includes vendor_basic_detail ID
   - Includes all terms fields

4. **Backend Processing**:
   - Receives request at `VendorMasterTermsViewSet.create()`
   - Validates tenant_id from authenticated user
   - Calls `db.create_vendor_terms()` function
   - Inserts data into `vendor_master_terms` table

5. **Database Insert**:
   ```sql
   INSERT INTO vendor_master_terms (
       tenant_id,
       vendor_basic_detail_id,
       credit_limit,
       credit_period,
       credit_terms,
       penalty_terms,
       delivery_terms,
       warranty_guarantee_details,
       force_majeure,
       dispute_redressal_terms,
       created_by,
       created_at,
       updated_at
   ) VALUES (...)
   ```

6. **Success Response**:
   - Returns created record with ID
   - Frontend shows: "Vendor onboarded successfully! All details have been saved."
   - Resets form fields
   - Clears vendor ID from localStorage
   - Redirects to Basic Details tab

## 🔍 Verify Data Was Saved

### Option 1: MySQL Command Line
```sql
-- Connect to database
mysql -u root -p ai_accounting

-- View all vendor terms
SELECT * FROM vendor_master_terms;

-- View specific vendor terms
SELECT 
    vt.*,
    vbd.vendor_name,
    vbd.vendor_code
FROM vendor_master_terms vt
LEFT JOIN vendor_master_basicdetail vbd ON vt.vendor_basic_detail_id = vbd.id
ORDER BY vt.created_at DESC;
```

### Option 2: Django Shell
```python
python manage.py shell

from vendors.models import VendorMasterTerms, VendorMasterBasicDetail

# Get all terms
terms = VendorMasterTerms.objects.all()
for t in terms:
    print(f"Vendor: {t.vendor_basic_detail.vendor_name}")
    print(f"Credit Limit: {t.credit_limit}")
    print(f"Credit Period: {t.credit_period}")
    print("---")

# Get latest term
latest = VendorMasterTerms.objects.latest('created_at')
print(f"Latest vendor: {latest.vendor_basic_detail.vendor_name}")
print(f"Terms: {latest.credit_terms}")
```

### Option 3: API Call
```bash
# Get all terms (requires authentication)
curl -X GET http://localhost:8000/api/vendors/terms/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get terms for specific vendor
curl -X GET http://localhost:8000/api/vendors/terms/by_vendor/1/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Troubleshooting

### Issue: "Please complete Basic Details first"
**Solution**: You must fill and save Basic Details first to get the vendor_basic_detail_id

### Issue: 403 Forbidden Error
**Solution**: Make sure you're logged in. The API requires authentication.

### Issue: 500 Internal Server Error
**Check**:
1. Server logs in terminal running `python manage.py runserver`
2. Database connection is working
3. Table `vendor_master_terms` exists

### Issue: Data not appearing in database
**Verify**:
1. Check browser console for errors (F12)
2. Check network tab to see if API call was made
3. Check server terminal for any errors
4. Verify table exists: `SHOW TABLES LIKE 'vendor_master_terms';`

## ✅ Success Indicators

When everything works correctly, you'll see:

1. **In Browser**:
   - Success alert: "Vendor onboarded successfully! All details have been saved."
   - Form fields reset to empty
   - Redirected to Basic Details tab

2. **In Database**:
   ```sql
   mysql> SELECT COUNT(*) FROM vendor_master_terms;
   +----------+
   | COUNT(*) |
   +----------+
   |        1 |  <-- Your data is here!
   +----------+
   ```

3. **In Server Logs**:
   ```
   [17/Jan/2026 15:23:00] "POST /api/vendors/terms/ HTTP/1.1" 201 ...
   ```

## 📊 Expected Data Structure

After saving, your data in `vendor_master_terms` will look like:

| Field | Example Value |
|-------|---------------|
| id | 1 |
| tenant_id | abc-123-def-456 |
| vendor_basic_detail_id | 1 |
| credit_limit | 50000.00 |
| credit_period | 30 days |
| credit_terms | Payment within 30 days... |
| penalty_terms | 2% penalty per month... |
| delivery_terms | FOB, 15 days lead time |
| warranty_guarantee_details | 1 year warranty |
| force_majeure | Standard clauses |
| dispute_redressal_terms | Arbitration in Mumbai |
| is_active | 1 |
| created_at | 2026-01-17 15:23:00 |
| updated_at | 2026-01-17 15:23:00 |
| created_by | username |
| updated_by | NULL |

## 🎉 Ready to Test!

Everything is implemented and ready. Just:
1. Go through the vendor onboarding steps
2. Fill in the Terms & Conditions form
3. Click "Onboard Vendor"
4. Data will be saved! ✅

---
**Status**: ✅ READY TO USE
**Last Updated**: 2026-01-17 15:23
