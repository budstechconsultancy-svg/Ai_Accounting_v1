# ✅ Customer Master Tables - Successfully Created

## Database Tables Created

The following **6 separate tables** have been successfully created in the database:

### 1. **customer_master_customer_basicdetails**
- **Purpose**: Stores basic customer information
- **When to save**: When user clicks "Onboard Customer" button
- **Fields**: customer_name, customer_code, customer_category_id, pan_number, contact_person, email_address, contact_number, is_also_vendor

### 2. **customer_master_customer_gstdetails**
- **Purpose**: Stores GST registration and branch details
- **When to save**: When user clicks "Onboard Customer" button
- **Relationship**: Multiple GST details per customer (one-to-many)
- **Fields**: gstin, is_unregistered, branch_reference_name, branch_address, branch_contact_person, branch_email, branch_contact_number

### 3. **customer_master_customer_productservice**
- **Purpose**: Stores product/service mappings
- **When to save**: When user clicks "Onboard Customer" button
- **Relationship**: Multiple products per customer (one-to-many)
- **Fields**: item_code, item_name, customer_item_code, customer_item_name, uom, customer_uom

### 4. **customer_master_customer_tds**
- **Purpose**: Stores TDS and statutory details
- **When to save**: When user clicks "Onboard Customer" button
- **Relationship**: One TDS record per customer (one-to-one)
- **Fields**: msme_no, fssai_no, iec_code, eou_status, tcs_section, tcs_enabled, tds_section, tds_enabled

### 5. **customer_master_customer_banking**
- **Purpose**: Stores bank account information
- **When to save**: When user clicks "Onboard Customer" button
- **Relationship**: Multiple bank accounts per customer (one-to-many)
- **Fields**: account_number, bank_name, ifsc_code, branch_name, swift_code, associated_branches

### 6. **customer_master_customer_termscondition**
- **Purpose**: Stores terms and conditions
- **When to save**: When user clicks "Onboard Customer" button
- **Relationship**: One terms record per customer (one-to-one)
- **Fields**: credit_period, credit_terms, penalty_terms, delivery_terms, warranty_details, force_majeure, dispute_terms

---

## Important: Save Behavior

### ⚠️ Data is ONLY saved when "Onboard Customer" button is clicked

The user can:
1. Navigate between tabs (Basic Details, GST Details, Products/Services, etc.)
2. Fill in form data
3. Switch tabs without losing data (stored in frontend state)

**BUT** the data is **NOT saved to the database** until the user clicks the **"Onboard Customer"** button.

### Save Flow

```
User fills form → Switches tabs → Data stays in frontend state
                                          ↓
                            User clicks "Onboard Customer"
                                          ↓
                        API endpoint receives all data
                                          ↓
                    Saves to respective tables in one transaction:
                    
1. Save to customer_master_customer_basicdetails (get customer_id)
2. Save to customer_master_customer_gstdetails (multiple rows)
3. Save to customer_master_customer_productservice (multiple rows)
4. Save to customer_master_customer_tds (one row)
5. Save to customer_master_customer_banking (multiple rows)
6. Save to customer_master_customer_termscondition (one row)
```

---

## Next Steps

### Backend (API Endpoint)
Create an API endpoint that:
- Accepts all form data from all tabs
- Validates the data
- Saves to all 6 tables in a single database transaction
- Returns success/error response

### Frontend
Update the "Onboard Customer" button handler to:
- Collect data from all tabs
- Send to the API endpoint
- Handle success/error responses
- Clear form and return to list view on success

---

## Database Verification

Total customer master tables in database: **7 tables**
- 6 new separate tables
- 1 old table (customer_master_customer_basicdetail) - kept for backward compatibility

All tables are ready to receive data when the "Onboard Customer" button is clicked! ✅
