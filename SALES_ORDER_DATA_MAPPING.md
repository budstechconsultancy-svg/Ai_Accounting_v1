# Sales Order Data Mapping

This document details exactly how the frontend form fields are mapped to the backend database tables and columns.

## 1. Basic Details
**Table**: `customer_transaction_salesorder_basicdetails`

| UI Label | Database Column | Type | Notes |
|----------|----------------|------|-------|
| SO Series Name | `so_series_name` | VARCHAR(100) | |
| Sales Order Number | `so_number` | VARCHAR(50) | Unique key |
| Date | `date` | DATE | |
| Customer PO Number | `customer_po_number` | VARCHAR(100) | |
| Customer Name | `customer_name` | VARCHAR(255) | |
| Branch | `branch` | VARCHAR(255) | |
| Address | `address` | TEXT | |
| Email Address | `email` | VARCHAR(254) | |
| Contact Number | `contact_number` | VARCHAR(20) | |

## 2. Sales Quotation / Contract Linking
**Table**: `customer_transaction_salesorder_quotation_details`
*Linked via `so_basic_detail_id`*

| UI Label | Database Column | Type | Notes |
|----------|----------------|------|-------|
| Type | `quotation_type` | VARCHAR(50) | 'quotation' or 'contract' |
| Sales Quotation # / Contract # | `quotation_number` | VARCHAR(100) | |

## 3. Item Details
**Table**: `customer_transaction_salesorder_items`
*Linked via `so_basic_detail_id`*

| UI Label | Database Column | Type | Notes |
|----------|----------------|------|-------|
| Item Code | `item_code` | VARCHAR(50) | |
| Item Name | `item_name` | VARCHAR(255) | |
| Quantity | `quantity` | DECIMAL(15,2) | |
| Price | `price` | DECIMAL(15,2) | |
| Taxable Value | `taxable_value` | DECIMAL(15,2) | Calculated (Qty * Price) |
| GST | `gst` | DECIMAL(15,2) | Calculated (18%) |
| Net Value | `net_value` | DECIMAL(15,2) | Calculated (Taxable + GST) |

## 4. Delivery Terms
**Table**: `customer_transaction_salesorder_deliveryterms`
*Linked via `so_basic_detail_id`*

| UI Label | Database Column | Type | Notes |
|----------|----------------|------|-------|
| Deliver At | `deliver_at` | VARCHAR(500) | |
| Delivery Date | `delivery_date` | DATE | |

## 5. Payment and Salesperson
**Table**: `customer_transaction_salesorder_payment_salesperson`
*Linked via `so_basic_detail_id`*
*Combined table for Payment Terms and Salesperson details*

| UI Label | Database Column | Type | Notes |
|----------|----------------|------|-------|
| Credit Period | `credit_period` | VARCHAR(100) | |
| Salesperson-in-charge | `salesperson_in_charge` | VARCHAR(255) | |
| Employee ID | `employee_id` | VARCHAR(50) | |
| Employee Name | `employee_name` | VARCHAR(255) | Auto-filled based on ID |

## Foreign Key Relationships
All auxiliary tables link back to the main Basic Details table using:
- **Foreign Key**: `so_basic_detail_id`
- **Reference Table**: `customer_transaction_salesorder_basicdetails`
- **Reference Column**: `id`
