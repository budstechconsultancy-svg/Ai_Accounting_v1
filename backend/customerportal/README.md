# Customer Portal Module

## Overview
The Customer Portal module manages all customer-related operations including customer master data, categories, transactions, sales quotations, and sales orders.

## Structure

### Files Created
1. **`__init__.py`** - Module initialization
2. **`api.py`** - REST API endpoints and viewsets
3. **`database.py`** - Database models and schema definitions
4. **`flow.py`** - Business logic and workflows
5. **`models.py`** - Django models (imports from database.py)
6. **`serializers.py`** - API serializers for data validation
7. **`urls.py`** - URL routing configuration
8. **`apps.py`** - Django app configuration
9. **`admin.py`** - Django admin interface configuration

## Database Models

### 1. CustomerMaster
Main customer information table
- **Fields**: customer_code, customer_name, contact info, address, GST/PAN, credit limits, balances
- **Table**: `customer_master`

### 2. CustomerCategory
Customer categorization (Retail, Wholesale, etc.)
- **Fields**: category_name, description, discount_percentage
- **Table**: `customer_category`

### 3. CustomerTransaction
All customer transactions (invoices, payments, credit/debit notes)
- **Fields**: transaction_type, transaction_number, amounts, payment status
- **Table**: `customer_transaction`

### 4. CustomerSalesQuotation
Sales quotations management
- **Fields**: quotation_number, dates, amounts, status, terms
- **Table**: `customer_sales_quotation`

### 5. CustomerSalesOrder
Sales orders management
- **Fields**: order_number, dates, amounts, status, shipping details
- **Table**: `customer_sales_order`

## API Endpoints

All endpoints are prefixed with `/api/customerportal/`

### Customer Master
- `GET /customers/` - List all customers
- `POST /customers/` - Create new customer
- `GET /customers/{id}/` - Get customer details
- `PUT /customers/{id}/` - Update customer
- `DELETE /customers/{id}/` - Delete customer
- `POST /customers/{id}/deactivate/` - Soft delete customer

### Customer Categories
- `GET /categories/` - List all categories
- `POST /categories/` - Create new category
- `GET /categories/{id}/` - Get category details
- `PUT /categories/{id}/` - Update category
- `DELETE /categories/{id}/` - Delete category

### Customer Transactions
- `GET /transactions/` - List all transactions
- `POST /transactions/` - Create new transaction
- `GET /transactions/{id}/` - Get transaction details
- `GET /transactions/by_customer/?customer_id={id}` - Get customer transactions

### Sales Quotations
- `GET /quotations/` - List all quotations
- `POST /quotations/` - Create new quotation
- `GET /quotations/{id}/` - Get quotation details
- `PUT /quotations/{id}/` - Update quotation
- `POST /quotations/{id}/convert_to_order/` - Convert to sales order

### Sales Orders
- `GET /orders/` - List all orders
- `POST /orders/` - Create new order
- `GET /orders/{id}/` - Get order details
- `PUT /orders/{id}/` - Update order

## Business Flows

### CustomerFlow
- `create_customer()` - Create customer with auto-generated code
- `update_customer_balance()` - Update balance based on transactions

### QuotationFlow
- `create_quotation()` - Create quotation with auto-numbering
- `convert_to_order()` - Convert quotation to sales order

### OrderFlow
- `create_order()` - Create sales order with auto-numbering
- `update_order_status()` - Update order status

### TransactionFlow
- `create_transaction()` - Create transaction and update customer balance

## Installation Steps

### 1. Register the App
Add to `backend/backend/settings.py`:
```python
INSTALLED_APPS = [
    # ... other apps
    'customerportal',
]
```

### 2. Include URLs
Add to `backend/backend/urls.py`:
```python
urlpatterns = [
    # ... other patterns
    path('api/customerportal/', include('customerportal.urls')),
]
```

### 3. Create Migrations
```bash
python manage.py makemigrations customerportal
python manage.py migrate customerportal
```

### 4. Create Superuser (if needed)
```bash
python manage.py createsuperuser
```

## Usage Examples

### Create a Customer
```python
from customerportal.flow import CustomerFlow

customer = CustomerFlow.create_customer(
    tenant_id='tenant-123',
    customer_data={
        'customer_name': 'ABC Corporation',
        'email': 'contact@abc.com',
        'phone': '+919876543210',
        'credit_limit': 100000,
        'credit_days': 30
    }
)
```

### Create a Quotation
```python
from customerportal.flow import QuotationFlow

quotation = QuotationFlow.create_quotation(
    tenant_id='tenant-123',
    customer_id=1,
    quotation_data={
        'quotation_date': '2026-01-19',
        'valid_until': '2026-02-19',
        'subtotal': 50000,
        'tax_amount': 9000,
        'discount_amount': 1000
    }
)
```

### Convert Quotation to Order
```python
from customerportal.flow import QuotationFlow

order = QuotationFlow.convert_to_order(quotation_id=1)
```

## Features

✅ **Multi-tenant Support** - All models support tenant isolation
✅ **Auto-numbering** - Automatic generation of customer codes, quotation numbers, order numbers
✅ **Balance Management** - Automatic customer balance updates
✅ **Soft Delete** - Customers can be deactivated without deletion
✅ **Status Tracking** - Track quotation and order statuses
✅ **Validation** - Email and phone number validation
✅ **Admin Interface** - Full Django admin support

## Next Steps

1. Create database migrations
2. Register app in Django settings
3. Add URL routing to main urls.py
4. Test API endpoints
5. Create frontend integration
6. Add additional business rules as needed

## Notes

- All monetary values use `DecimalField` for precision
- Tenant isolation is enforced at the queryset level
- Transaction types: invoice, payment, credit_note, debit_note
- Quotation statuses: draft, sent, accepted, rejected, converted
- Order statuses: pending, confirmed, processing, shipped, delivered, cancelled
