# Customer Master Separate Tables - Implementation Summary

## Overview
Created separate normalized tables for customer master data instead of using a single monolithic table with JSON fields.

## Tables Created

### 1. customer_master_customer_basicdetails
**Purpose**: Stores basic customer information from the 'Basic Details' tab

**Columns**:
- `id` (AutoField, Primary Key)
- `tenant_id` (CharField, indexed)
- `customer_name` (CharField, required)
- `customer_code` (CharField, required, unique per tenant)
- `customer_category_id` (ForeignKey to CustomerMasterCategory)
- `pan_number` (CharField, optional)
- `contact_person` (CharField, optional)
- `email_address` (EmailField, optional)
- `contact_number` (CharField, optional)
- `is_also_vendor` (BooleanField, default=False)
- `is_active` (BooleanField, default=True)
- `is_deleted` (BooleanField, default=False)
- `created_at` (DateTimeField, auto)
- `updated_at` (DateTimeField, auto)
- `created_by` (CharField, optional)
- `updated_by` (CharField, optional)

**Indexes**:
- (tenant_id, customer_code)
- (tenant_id, is_deleted)
- (customer_category)

**Unique Constraint**: (tenant_id, customer_code)

---

### 2. customer_master_customer_gstdetails
**Purpose**: Stores GST registration details and branch information

**Columns**:
- `id` (AutoField, Primary Key)
- `tenant_id` (CharField, indexed)
- `customer_basic_detail_id` (ForeignKey to CustomerMasterCustomerBasicDetails, CASCADE)
- `gstin` (CharField, optional) - GST Identification Number
- `is_unregistered` (BooleanField, default=False)
- `branch_reference_name` (CharField, optional)
- `branch_address` (TextField, optional)
- `branch_contact_person` (CharField, optional)
- `branch_email` (EmailField, optional)
- `branch_contact_number` (CharField, optional)
- `created_at` (DateTimeField, auto)
- `updated_at` (DateTimeField, auto)
- `created_by` (CharField, optional)
- `updated_by` (CharField, optional)

**Indexes**:
- (tenant_id, gstin)
- (customer_basic_detail_id)

**Relationship**: One customer can have multiple GST details (multiple branches)

---

### 3. customer_master_customer_productservice
**Purpose**: Stores products/services associated with a customer (already existed, updated foreign key)

**Columns**:
- `id` (AutoField, Primary Key)
- `tenant_id` (CharField, indexed)
- `customer_basic_detail_id` (ForeignKey to CustomerMasterCustomerBasicDetails, CASCADE)
- `item_code` (CharField, optional)
- `item_name` (CharField, optional)
- `customer_item_code` (CharField, optional)
- `customer_item_name` (CharField, optional)
- `uom` (CharField, optional)
- `customer_uom` (CharField, optional)
- `created_at` (DateTimeField, auto)
- `updated_at` (DateTimeField, auto)
- `created_by` (CharField, optional)
- `updated_by` (CharField, optional)

**Indexes**:
- (tenant_id, item_code)
- (customer_basic_detail_id)

**Relationship**: One customer can have multiple product/service mappings

---

### 4. customer_master_customer_tds
**Purpose**: Stores TDS and other statutory information

**Columns**:
- `id` (AutoField, Primary Key)
- `tenant_id` (CharField, indexed)
- `customer_basic_detail_id` (OneToOneField to CustomerMasterCustomerBasicDetails, CASCADE)
- `msme_no` (CharField, optional) - MSME Registration Number
- `fssai_no` (CharField, optional) - FSSAI License Number
- `iec_code` (CharField, optional) - Import Export Code
- `eou_status` (CharField, optional) - Export Oriented Unit Status
- `tcs_section` (CharField, optional) - TCS Section
- `tcs_enabled` (BooleanField, default=False)
- `tds_section` (CharField, optional) - TDS Section
- `tds_enabled` (BooleanField, default=False)
- `created_at` (DateTimeField, auto)
- `updated_at` (DateTimeField, auto)
- `created_by` (CharField, optional)
- `updated_by` (CharField, optional)

**Indexes**:
- (tenant_id)
- (customer_basic_detail_id)

**Relationship**: One-to-One with customer basic details

---

### 5. customer_master_customer_banking
**Purpose**: Stores bank account details for customers

**Columns**:
- `id` (AutoField, Primary Key)
- `tenant_id` (CharField, indexed)
- `customer_basic_detail_id` (ForeignKey to CustomerMasterCustomerBasicDetails, CASCADE)
- `account_number` (CharField, required)
- `bank_name` (CharField, required)
- `ifsc_code` (CharField, required)
- `branch_name` (CharField, optional)
- `swift_code` (CharField, optional) - for international transfers
- `associated_branches` (JSONField, optional) - list of branch references
- `created_at` (DateTimeField, auto)
- `updated_at` (DateTimeField, auto)
- `created_by` (CharField, optional)
- `updated_by` (CharField, optional)

**Indexes**:
- (tenant_id, account_number)
- (customer_basic_detail_id)

**Relationship**: One customer can have multiple bank accounts

---

### 6. customer_master_customer_termscondition
**Purpose**: Stores terms and conditions associated with a customer (already existed, updated foreign key)

**Columns**:
- `id` (AutoField, Primary Key)
- `tenant_id` (CharField, indexed)
- `customer_basic_detail_id` (OneToOneField to CustomerMasterCustomerBasicDetails, CASCADE)
- `credit_period` (CharField, optional)
- `credit_terms` (TextField, optional)
- `penalty_terms` (TextField, optional)
- `delivery_terms` (TextField, optional)
- `warranty_details` (TextField, optional)
- `force_majeure` (TextField, optional)
- `dispute_terms` (TextField, optional)
- `created_at` (DateTimeField, auto)
- `updated_at` (DateTimeField, auto)
- `created_by` (CharField, optional)
- `updated_by` (CharField, optional)

**Indexes**:
- (tenant_id)
- (customer_basic_detail_id)

**Relationship**: One-to-One with customer basic details

---

## Data Flow

When a user clicks "Onboard Customer" button:

1. **Basic Details Tab** → Saves to `customer_master_customer_basicdetails`
2. **GST Details Tab** → Saves to `customer_master_customer_gstdetails` (multiple rows for multiple GSTINs/branches)
3. **Products/Services Tab** → Saves to `customer_master_customer_productservice` (multiple rows)
4. **TDS & Other Statutory Details Tab** → Saves to `customer_master_customer_tds` (one row)
5. **Banking Info Tab** → Saves to `customer_master_customer_banking` (multiple rows for multiple accounts)
6. **Terms & Conditions Tab** → Saves to `customer_master_customer_termscondition` (one row)

## Models Available

All models are exported from `customerportal.models`:
- `CustomerMasterCustomerBasicDetails`
- `CustomerMasterCustomerGSTDetails`
- `CustomerMasterCustomerTDS`
- `CustomerMasterCustomerBanking`
- `CustomerMasterCustomerProductService`
- `CustomerMasterCustomerTermsCondition`

**Backward Compatibility**: `CustomerMasterCustomer` is aliased to `CustomerMasterCustomerBasicDetails`

## Migration Status

Migration file: `0013_create_customer_separate_tables.py`
Status: Applied (faked due to existing tables)

## Next Steps

1. Update API serializers to work with the new separate tables
2. Update frontend to save data to respective tables when "Onboard Customer" is clicked
3. Implement progressive saving (save basic details first, then other tabs)
