# Customer Onboarding Troubleshooting Guide

## Issue: Data Not Saving to Database Tables

### What We've Done

1. ✅ **Added Debug Logging to Backend** (`customerportal/api.py`)
   - Logs all incoming request data
   - Specifically tracks Terms & Conditions fields
   - Shows errors if save fails

2. ✅ **Added Debug Logging to Frontend** (`CustomerPortal.tsx`)
   - Logs the complete payload before sending
   - Shows Terms & Conditions data separately
   - Tracks the save process

3. ✅ **Created Test Script** (`backend/test_customer_save.py`)
   - Tests customer creation directly
   - Verifies all 6 tables are being populated

## How to Debug

### Step 1: Open Browser Developer Tools
1. Open your application in the browser
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab

### Step 2: Fill in the Customer Form
1. Navigate to Customer Portal → Masters → Customer
2. Click "Create New Customer"
3. Fill in ALL tabs with test data:
   - **Basic Details**: Name, Code, etc.
   - **GST Details**: Add at least one GSTIN
   - **Products/Services**: Add at least one product
   - **TDS & Other Statutory Details**: Fill in some fields
   - **Banking Info**: Add at least one bank account
   - **Terms & Conditions**: Fill in at least one field (e.g., "Credit Period" = "30 Days")

### Step 3: Click "Onboard Customer"
Watch the browser console. You should see:

```
================================================================================
CUSTOMER SAVE - FRONTEND
================================================================================
Full Payload: {customer_name: "...", ...}
Terms & Conditions: {
  credit_period: "30 Days",
  credit_terms: "...",
  ...
}
================================================================================
Creating new customer...
Customer created! Response: {id: 123, ...}
```

### Step 4: Check Backend Logs
Look at the terminal where `python manage.py runserver` is running. You should see:

```
================================================================================
CUSTOMER CREATE REQUEST RECEIVED
================================================================================
User: your_username
Tenant ID: your-tenant-id
Request Data Keys: ['customer_name', 'customer_code', ...]
Full Request Data: {...}
Terms & Conditions Data: {'credit_period': '30 Days', ...}
✅ Customer created successfully!
```

### Step 5: Verify Database
Run the SQL query to check if data was saved:

```sql
SELECT 
    cbd.customer_code,
    cbd.customer_name,
    tc.credit_period,
    tc.credit_terms,
    tc.created_at
FROM customer_master_customer_basicdetails cbd
LEFT JOIN customer_master_customer_termscondition tc 
    ON tc.customer_basic_detail_id = cbd.id
WHERE cbd.is_deleted = 0
ORDER BY cbd.created_at DESC
LIMIT 5;
```

## Common Issues and Solutions

### Issue 1: "Customer created successfully!" but no data in tables

**Symptoms:**
- Alert shows "Customer created successfully!"
- Basic details table has the customer
- But related tables (GST, Products, TDS, Banking, Terms) are empty

**Possible Causes:**
1. **Transaction Rollback**: An error occurred after basic details were saved, causing a rollback
2. **Silent Failure**: The related table creation failed but didn't throw an error

**Solution:**
Check the backend logs for errors. Look for:
```
❌ Error creating customer: ...
```

### Issue 2: Terms & Conditions fields are empty in payload

**Symptoms:**
- Browser console shows: `Terms & Conditions: {credit_period: null, credit_terms: null, ...}`
- Even though you filled in the form

**Possible Causes:**
1. **State not updating**: The `termsDetails` state is not being updated when you type
2. **Wrong field names**: The form inputs are not connected to the state

**Solution:**
1. Check that the form inputs have `onChange` handlers:
   ```typescript
   onChange={(e) => setTermsDetails({ ...termsDetails, creditPeriod: e.target.value })}
   ```

2. Add console logging to verify state:
   ```typescript
   console.log('Current termsDetails:', termsDetails);
   ```

### Issue 3: 401 Unauthorized Error

**Symptoms:**
- Browser console shows: `POST /api/customerportal/customer-master/ 401 (Unauthorized)`

**Possible Causes:**
- User is not logged in
- Session expired
- Missing authentication token

**Solution:**
1. Check if you're logged in
2. Refresh the page and try again
3. Check browser cookies for authentication token

### Issue 4: 500 Internal Server Error

**Symptoms:**
- Browser console shows: `POST /api/customerportal/customer-master/ 500 (Internal Server Error)`

**Possible Causes:**
- Database constraint violation
- Missing required field
- Invalid data type

**Solution:**
1. Check backend logs for the full error traceback
2. Look for database errors like:
   - `IntegrityError`
   - `OperationalError`
   - `ProgrammingError`

### Issue 5: Duplicate Entry Error

**Symptoms:**
- Error message: "This customer code already exists"

**Possible Causes:**
- The auto-generated customer code already exists in the database

**Solution:**
- The system will automatically generate a new code
- Try clicking "Onboard Customer" again

## Manual Testing Checklist

Use this checklist to verify everything is working:

- [ ] Fill in Basic Details tab
- [ ] Fill in at least one field in Terms & Conditions tab
- [ ] Open Browser Developer Tools (F12)
- [ ] Click "Onboard Customer"
- [ ] Check browser console for payload
- [ ] Verify Terms & Conditions data is in payload
- [ ] Check for "Customer created successfully!" alert
- [ ] Check backend terminal for logs
- [ ] Run SQL query to verify data in database
- [ ] Confirm Terms & Conditions record exists

## Quick Test Commands

### Test Backend Directly
```bash
cd c:\108\muthu\Ai_Accounting_v1-7\backend
python test_customer_save.py
```

### Check Latest Customer in Database
```sql
SELECT * FROM customer_master_customer_basicdetails 
WHERE is_deleted = 0 
ORDER BY created_at DESC 
LIMIT 1;
```

### Check Terms & Conditions for Latest Customer
```sql
SELECT tc.* 
FROM customer_master_customer_termscondition tc
INNER JOIN customer_master_customer_basicdetails cbd 
    ON tc.customer_basic_detail_id = cbd.id
WHERE cbd.is_deleted = 0
ORDER BY tc.created_at DESC
LIMIT 1;
```

## What to Report

If the issue persists, please provide:

1. **Browser Console Output**:
   - Copy the entire console output after clicking "Onboard Customer"
   - Include any errors (red text)

2. **Backend Logs**:
   - Copy the logs from the terminal running `python manage.py runserver`
   - Include the full traceback if there's an error

3. **Database Query Results**:
   - Run the SQL queries above
   - Share the results (or screenshot)

4. **Form Data**:
   - What data did you enter in each tab?
   - Did you fill in Terms & Conditions?

## Next Steps

Now that we've added logging:

1. **Try creating a customer** with the form
2. **Watch the console and logs** to see what's happening
3. **Share the output** if you see any errors

The logging will help us identify exactly where the data flow is breaking!
