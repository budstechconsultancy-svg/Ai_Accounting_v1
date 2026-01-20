# Customer Onboarding Data Flow Documentation

## Overview
When you click the "Onboard Customer" button after filling in the form, the data from all tabs is automatically saved to the respective database tables.

## Database Tables Structure

The customer onboarding form saves data to **6 separate tables**:

### 1. `customer_master_customer_basicdetails` (Parent Table)
**Stores:** Basic customer information from the "Basic Details" tab
- `customer_name`
- `customer_code`
- `customer_category_id` (Foreign Key)
- `pan_number`
- `contact_person`
- `email_address`
- `contact_number`
- `is_also_vendor`

### 2. `customer_master_customer_gstdetails`
**Stores:** GST registration and branch information from the "GST Details" tab
- `customer_basic_detail_id` (Foreign Key → BasicDetails)
- `gstin`
- `is_unregistered`
- `branch_reference_name`
- `branch_address`
- `branch_contact_person`
- `branch_email`
- `branch_contact_number`

### 3. `customer_master_customer_productservice`
**Stores:** Product/Service mappings from the "Products/Services" tab
- `customer_basic_detail_id` (Foreign Key → BasicDetails)
- `item_code`
- `item_name`
- `customer_item_code`
- `customer_item_name`
- `uom`
- `customer_uom`

### 4. `customer_master_customer_tds`
**Stores:** TDS and statutory information from the "TDS & Other Statutory Details" tab
- `customer_basic_detail_id` (Foreign Key → BasicDetails, OneToOne)
- `msme_no`
- `fssai_no`
- `iec_code`
- `eou_status`
- `tcs_section`
- `tcs_enabled`
- `tds_section`
- `tds_enabled`

### 5. `customer_master_customer_banking`
**Stores:** Banking information from the "Banking Info" tab
- `customer_basic_detail_id` (Foreign Key → BasicDetails)
- `account_number`
- `bank_name`
- `ifsc_code`
- `branch_name`
- `swift_code`
- `associated_branches` (JSON field)

### 6. `customer_master_customer_termscondition`
**Stores:** Terms & Conditions from the "Terms & Conditions" tab
- `customer_basic_detail_id` (Foreign Key → BasicDetails, OneToOne)
- `credit_period`
- `credit_terms`
- `penalty_terms`
- `delivery_terms`
- `warranty_details`
- `force_majeure`
- `dispute_terms`

## Data Flow Process

### Frontend (CustomerPortal.tsx)

1. **User fills in the form** across all 6 tabs:
   - Basic Details
   - GST Details
   - Products/Services
   - TDS & Other Statutory Details
   - Banking Info
   - Terms & Conditions

2. **Data is stored in React state**:
   ```typescript
   const [customerFormData, setCustomerFormData] = useState({...});
   const [selectedGSTINs, setSelectedGSTINs] = useState([]);
   const [productRows, setProductRows] = useState([]);
   const [statutoryDetails, setStatutoryDetails] = useState({...});
   const [bankAccounts, setBankAccounts] = useState([]);
   const [termsDetails, setTermsDetails] = useState({...});  // ← Terms & Conditions
   ```

3. **When "Onboard Customer" button is clicked**, the `handleSaveCustomer` function (line 540-644) is called:
   ```typescript
   const payload = {
     // Basic Details
     customer_name: customerFormData.customer_name,
     customer_code: customerFormData.customer_code,
     customer_category: customerFormData.customer_category,
     pan_number: customerFormData.pan_number,
     contact_person: customerFormData.contact_person,
     email_address: customerFormData.email_address,
     contact_number: customerFormData.contact_number,
     is_also_vendor: isVendor,
     
     // GST Details
     gst_details: {
       gstins: selectedGSTINs,
       branches: showBranchDetails ? mockBranches : []
     },
     
     // Products/Services
     products_services: {
       items: productRows
     },
     
     // TDS & Statutory Details
     msme_no: statutoryDetails.msmeNo,
     fssai_no: statutoryDetails.fssaiNo,
     iec_code: statutoryDetails.iecCode,
     eou_status: statutoryDetails.eouStatus,
     tcs_section: statutoryDetails.tcsSection,
     tcs_enabled: statutoryDetails.tcsEnabled,
     tds_section: statutoryDetails.tdsSection,
     tds_enabled: statutoryDetails.tdsEnabled,
     
     // Banking Info
     banking_info: {
       accounts: bankAccounts
     },
     
     // Terms & Conditions ← THIS IS WHERE YOUR DATA IS SENT
     credit_period: termsDetails.creditPeriod,
     credit_terms: termsDetails.creditTerms,
     penalty_terms: termsDetails.penaltyTerms,
     delivery_terms: termsDetails.deliveryTerms,
     warranty_details: termsDetails.warrantyDetails,
     force_majeure: termsDetails.forceMajeure,
     dispute_terms: termsDetails.disputeTerms
   };
   
   // POST to backend
   await httpClient.post('/api/customerportal/customer-master/', payload);
   ```

### Backend (serializers.py)

4. **The `CustomerMasterCustomerSerializer`** receives the payload and processes it:

   ```python
   def create(self, validated_data):
       # Extract data for separate tables
       gst_details_data = validated_data.pop('gst_details', None)
       products_services_data = validated_data.pop('products_services', None)
       banking_info_data = validated_data.pop('banking_info', None)
       
       # Extract TDS fields
       tds_data = {
           'msme_no': validated_data.pop('msme_no', None),
           'fssai_no': validated_data.pop('fssai_no', None),
           # ... etc
       }
       
       # Extract Terms & Conditions fields ← YOUR DATA IS EXTRACTED HERE
       terms_data = {
           'credit_period': validated_data.pop('credit_period', None),
           'credit_terms': validated_data.pop('credit_terms', None),
           'penalty_terms': validated_data.pop('penalty_terms', None),
           'delivery_terms': validated_data.pop('delivery_terms', None),
           'warranty_details': validated_data.pop('warranty_details', None),
           'force_majeure': validated_data.pop('force_majeure', None),
           'dispute_terms': validated_data.pop('dispute_terms', None),
       }
       
       # Use transaction to ensure all-or-nothing save
       with transaction.atomic():
           # 1. Create Basic Details (parent table)
           basic_details = super().create(validated_data)
           
           # 2. Create GST Details
           # ... code to save GST details
           
           # 3. Create Product/Service mappings
           # ... code to save products
           
           # 4. Create TDS Details
           # ... code to save TDS details
           
           # 5. Create Banking Information
           # ... code to save banking info
           
           # 6. Create Terms & Conditions ← YOUR DATA IS SAVED HERE
           if any(terms_data.values()):
               CustomerMasterCustomerTermsCondition.objects.update_or_create(
                   customer_basic_detail=basic_details,
                   defaults={
                       'tenant_id': basic_details.tenant_id,
                       'created_by': basic_details.created_by,
                       **terms_data  # ← All Terms & Conditions fields are saved
                   }
               )
       
       return basic_details
   ```

## How to Verify Data is Being Saved

### Method 1: Check the Database Directly
```sql
-- After onboarding a customer, run this query:
SELECT 
    cbd.id,
    cbd.customer_code,
    cbd.customer_name,
    tc.credit_period,
    tc.credit_terms,
    tc.penalty_terms,
    tc.delivery_terms,
    tc.warranty_details,
    tc.force_majeure,
    tc.dispute_terms,
    tc.created_at
FROM customer_master_customer_basicdetails cbd
LEFT JOIN customer_master_customer_termscondition tc 
    ON tc.customer_basic_detail_id = cbd.id
WHERE cbd.is_deleted = 0
ORDER BY cbd.created_at DESC
LIMIT 5;
```

### Method 2: Check Backend Logs
When you save a customer, the Django backend will log the database operations. Check the terminal where `python manage.py runserver` is running.

### Method 3: Use Django Admin (if enabled)
Navigate to `/admin/` and check the `CustomerMasterCustomerTermsCondition` table.

## Important Notes

1. **Atomic Transaction**: All 6 tables are saved in a single database transaction. If any table fails to save, ALL changes are rolled back.

2. **OneToOne Relationship**: The Terms & Conditions table has a OneToOne relationship with BasicDetails, meaning each customer can have only ONE Terms & Conditions record.

3. **Update vs Create**: The serializer uses `update_or_create()` for Terms & Conditions, which means:
   - If a record exists, it will be updated
   - If no record exists, it will be created

4. **Null Values**: If you don't fill in any Terms & Conditions fields, the record won't be created (due to the `if any(terms_data.values())` check).

## Testing the Flow

To test that Terms & Conditions are being saved:

1. Fill in the customer form with all required fields
2. Navigate to the "Terms & Conditions" tab
3. Fill in at least one field (e.g., "Credit Period" = "30 Days")
4. Click "Onboard Customer"
5. Check the database using the SQL query above
6. You should see your Terms & Conditions data in the `customer_master_customer_termscondition` table

## Troubleshooting

If data is not being saved:

1. **Check Browser Console**: Open Developer Tools (F12) and check for JavaScript errors
2. **Check Network Tab**: Look at the POST request to `/api/customerportal/customer-master/` and verify the payload includes Terms & Conditions fields
3. **Check Backend Logs**: Look for Python errors in the terminal running Django
4. **Check Database Constraints**: Ensure the `customer_basic_detail_id` foreign key is being set correctly

## Summary

✅ **The system is already configured correctly!**

When you fill in the Terms & Conditions form and click "Onboard Customer":
- Frontend collects the data from `termsDetails` state
- Frontend sends it in the API payload
- Backend receives it in the serializer
- Backend saves it to `customer_master_customer_termscondition` table

**No code changes are needed** - the data flow is already working as designed!
