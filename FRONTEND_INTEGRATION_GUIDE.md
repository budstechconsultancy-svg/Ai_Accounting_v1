# Frontend Integration Guide for Long-term Contracts

## Current Status
✅ Backend API is fully functional and ready
✅ State management has been added to the frontend
❌ Form inputs need to be connected to state (partially done)
❌ Save button needs final update

## What's Already Done

1. **State Management Added** (Line 2292-2442):
   - `basicDetails` state for contract information
   - `billingConfig` state for billing automation
   - `contractProducts` state for products/services
   - `terms` state for terms & conditions
   - `loading` state for save operation
   - `contracts` state for list view

2. **API Functions Created**:
   - `fetchContracts()` - Fetches contracts from database
   - `handleSaveContract()` - Saves contract to all 3 tables
   - `resetForm()` - Resets all form fields

## What Needs to Be Done

### Step 1: Update the Save Button (Line ~2848)

**Find this code:**
```typescript
else if (activeTab === 'Terms & Conditions') {
    alert('Contract Created Successfully!');
    setView('list');
}
```

**Replace with:**
```typescript
else if (activeTab === 'Terms & Conditions') {
    handleSaveContract();
}
```

**Also update the button to show loading state (Line ~2852):**
```typescript
<button
    onClick={() => {
        if (activeTab === 'Basic Details') setActiveTab('Products / Services');
        else if (activeTab === 'Products / Services') setActiveTab('Terms & Conditions');
        else if (activeTab === 'Terms & Conditions') {
            handleSaveContract();
        }
    }}
    disabled={loading}
    className={`px-8 py-2 text-white rounded-md text-sm font-medium transition-colors ${
        activeTab === 'Terms & Conditions' 
            ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400' 
            : 'bg-indigo-600 hover:bg-indigo-700'
    }`}
>
    {loading ? 'Saving...' : (activeTab === 'Terms & Conditions' ? 'Save' : 'Next')}
</button>
```

### Step 2: Connect Form Inputs to State

The form inputs need `value` and `onChange` props. Here are the key ones:

#### Contract Type (Line ~2396):
```typescript
<select 
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
    value={basicDetails.contractType}
    onChange={(e) => setBasicDetails({...basicDetails, contractType: e.target.value})}
>
```

#### Customer Name (Line ~2413):
```typescript
<select 
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
    value={basicDetails.customerId}
    onChange={(e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        setBasicDetails({
            ...basicDetails, 
            customerId: e.target.value,
            customerName: selectedOption.text
        });
    }}
>
```

#### Branch (Line ~2421):
```typescript
<select 
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
    value={basicDetails.branchId}
    onChange={(e) => setBasicDetails({...basicDetails, branchId: e.target.value})}
>
```

#### Validity From (Line ~2405):
```typescript
<input 
    type="date" 
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
    value={basicDetails.validityFrom}
    onChange={(e) => setBasicDetails({...basicDetails, validityFrom: e.target.value})}
/>
```

#### Validity To (Line ~2429):
```typescript
<input 
    type="date" 
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
    value={basicDetails.validityTo}
    onChange={(e) => setBasicDetails({...basicDetails, validityTo: e.target.value})}
/>
```

#### Billing Configuration Fields (when automateBilling is true):

**Bill Start Date:**
```typescript
<input 
    type="date" 
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
    value={billingConfig.billStartDate}
    onChange={(e) => setBillingConfig({...billingConfig, billStartDate: e.target.value})}
/>
```

**Billing Frequency:**
```typescript
<select 
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
    value={billingConfig.billingFrequency}
    onChange={(e) => setBillingConfig({...billingConfig, billingFrequency: e.target.value})}
>
```

**Voucher Name:**
```typescript
<select 
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
    value={billingConfig.voucherName}
    onChange={(e) => setBillingConfig({...billingConfig, voucherName: e.target.value})}
>
```

**Bill Period From:**
```typescript
<input 
    type="date" 
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
    value={billingConfig.billPeriodFrom}
    onChange={(e) => setBillingConfig({...billingConfig, billPeriodFrom: e.target.value})}
/>
```

**Bill Period To:**
```typescript
<input 
    type="date" 
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
    value={billingConfig.billPeriodTo}
    onChange={(e) => setBillingConfig({...billingConfig, billPeriodTo: e.target.value})}
/>
```

## Testing the Integration

1. **Fill out the form** with all required fields
2. **Click Save** on the Terms & Conditions tab
3. **Check the browser console** for:
   - "Saving contract:" log with the data being sent
   - "Contract saved successfully:" log with the response
4. **Check the database** to verify data was saved to all 3 tables:
   - `customer_master_longtermcontracts_basicdetails`
   - `customer_master_longtermcontracts_productservices`
   - `customer_master_longtermcontracts_termscondition`

## API Endpoint

**POST** `/api/customerportal/long-term-contracts/`

**Request Body:**
```json
{
  "contract_number": "CT-2026-224",
  "customer_id": 1,
  "customer_name": "Acme Corporation",
  "branch_id": 1,
  "contract_type": "Rate Contract",
  "contract_validity_from": "2026-01-01",
  "contract_validity_to": "2026-12-31",
  "automate_billing": true,
  "bill_start_date": "2026-01-01",
  "billing_frequency": "Monthly",
  "voucher_name": "sales",
  "bill_period_from": "2026-01-01",
  "bill_period_to": "2026-01-31",
  "products_services": [
    {
      "item_code": "ITEM-001",
      "item_name": "Product A",
      "customer_item_name": "Custom Product A",
      "qty_min": 100,
      "qty_max": 1000,
      "price_min": 50.00,
      "price_max": 100.00,
      "acceptable_price_deviation": "±5%"
    }
  ],
  "terms_conditions": {
    "payment_terms": "Net 30 days",
    "penalty_terms": "2% per month",
    "force_majeure": "Standard clause",
    "termination_clause": "30 days notice",
    "dispute_terms": "Arbitration",
    "others": "Additional terms"
  }
}
```

## Quick Fix Summary

**Minimum changes needed to make it work:**

1. Line ~2848: Change `alert('Contract Created Successfully!');` to `handleSaveContract();`
2. Line ~2852: Add `disabled={loading}` to the button
3. Line ~2855: Change button text to show loading state

That's it! The backend will handle saving to all 3 tables automatically.
