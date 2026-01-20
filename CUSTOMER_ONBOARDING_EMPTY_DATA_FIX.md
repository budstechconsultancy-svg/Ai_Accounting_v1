# Customer Onboarding Update: Empty Records Support

## ✅ Update Summary
You requested that **data should be saved in all tables even if the user doesn't fill in the fields**.

I have implemented this change:
1. **Frontend**: No changes needed (it sends what you fill).
2. **Backend**: Modified `serializers.py` to **ALWAYS** create records in all 6 tables.
   - If you don't provide GST details -> It creates an empty GST record.
   - If you don't provide Products -> It creates an empty Product record.
   - If you don't provide Banking info -> It creates an empty Banking record.
   - If you don't provide Terms & Conditions -> It creates an empty T&C record.

## Technical Changes
1. **Database Schema**: Updated `CustomerMasterCustomerBanking` table to allow empty (NULL) values for `account_number`, `bank_name`, and `ifsc_code`.
2. **Migration**: Applied database migration to support these empty values.
3. **Serializer Logic**: Updated logic to check if data is provided; if not, it explicitly creates a record with `None` values.

## How to Verify
1. Open the Customer Portal.
2. Click "Create New Customer".
3. **Fill in ONLY the Basic Details** (Name, etc.). Leave all other tabs EMPTY.
4. Click "Onboard Customer".
5. **Result**: The customer will be saved, and if you check the database, **all 6 tables will have a record** for this customer (some with empty values).

## Verification Script Output
I ran a test script with minimal data (only name), and the result was:
```
Verifying database records...
Basic Details: ✅ Found
GST Details:   ✅ Found (1 records)
Products:      ✅ Found (1 records)
TDS Details:   ✅ Found
Banking:       ✅ Found (1 records)
Terms & Cond:  ✅ Found
```

This confirms that the system now behaves exactly as you requested! 🚀
