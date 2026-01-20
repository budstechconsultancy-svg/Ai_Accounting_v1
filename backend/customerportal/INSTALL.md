# Customer Portal - Quick Installation Guide

## 📦 Installation Steps

### Step 1: Register the App in Django Settings
Edit `backend/backend/settings.py` and add `'customerportal'` to `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    
    # Your existing apps
    'accounting',
    'core',
    'inventory',
    'login',
    'masters',
    'registration',
    'reports',
    'settings',
    'vendors',
    'vouchers',
    
    # Add this line
    'customerportal',  # ← Add this
]
```

### Step 2: Add URL Routing
Edit `backend/backend/urls.py` and add the customer portal URLs:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Your existing URL patterns
    path('api/accounting/', include('accounting.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/vendors/', include('vendors.urls')),
    # ... other patterns ...
    
    # Add this line
    path('api/customerportal/', include('customerportal.urls')),  # ← Add this
]
```

### Step 3: Create Database Migrations
Run these commands in the backend directory:

```bash
# Navigate to backend directory
cd c:\108\muthu\Ai_Accounting_v1-6\backend

# Create migrations for customerportal
python manage.py makemigrations customerportal

# Apply migrations to database
python manage.py migrate customerportal
```

### Step 4: Verify Installation
Test the API endpoints:

```bash
# Start the Django server (if not already running)
python manage.py runserver

# Test in browser or Postman:
# GET http://localhost:8000/api/customerportal/customers/
# GET http://localhost:8000/api/customerportal/categories/
# GET http://localhost:8000/api/customerportal/quotations/
```

### Step 5: Access Django Admin (Optional)
```bash
# Create superuser if you haven't already
python manage.py createsuperuser

# Access admin at:
# http://localhost:8000/admin/

# You'll see Customer Portal models in the admin interface
```

## 🧪 Testing the API

### Create a Customer
```bash
POST http://localhost:8000/api/customerportal/customers/
Content-Type: application/json

{
  "customer_name": "ABC Corporation",
  "email": "contact@abc.com",
  "phone": "+919876543210",
  "address_line1": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "pincode": "400001",
  "gstin": "27AABCU9603R1ZM",
  "credit_limit": 100000,
  "credit_days": 30
}
```

### Create a Category
```bash
POST http://localhost:8000/api/customerportal/categories/
Content-Type: application/json

{
  "category_name": "Retail",
  "description": "Retail customers",
  "discount_percentage": 5.00
}
```

### Create a Quotation
```bash
POST http://localhost:8000/api/customerportal/quotations/
Content-Type: application/json

{
  "customer_id": 1,
  "quotation_date": "2026-01-19",
  "valid_until": "2026-02-19",
  "subtotal": 50000,
  "tax_amount": 9000,
  "discount_amount": 1000,
  "terms_and_conditions": "Payment within 30 days"
}
```

### Convert Quotation to Order
```bash
POST http://localhost:8000/api/customerportal/quotations/1/convert_to_order/
```

## 🔍 Troubleshooting

### Issue: Module not found
**Solution**: Make sure you've added `'customerportal'` to `INSTALLED_APPS` in settings.py

### Issue: No such table
**Solution**: Run migrations:
```bash
python manage.py makemigrations customerportal
python manage.py migrate customerportal
```

### Issue: URL not found
**Solution**: Make sure you've added the URL pattern to `backend/urls.py`

### Issue: Permission denied
**Solution**: Make sure you're authenticated. Add authentication token to request headers:
```
Authorization: Bearer <your-token>
```

## 📊 Database Tables Created

After running migrations, these tables will be created:
- `customer_master`
- `customer_category`
- `customer_transaction`
- `customer_sales_quotation`
- `customer_sales_order`

## 🎯 Next Steps

1. ✅ Install the module (follow steps above)
2. 🔄 Test API endpoints
3. 🎨 Create frontend components
4. 📱 Integrate with existing UI
5. 🧪 Add unit tests
6. 📝 Create user documentation

## 💡 Tips

- All customer codes are auto-generated (CUST-00001, CUST-00002, etc.)
- All quotation and order numbers include the year (SQ-2026-00001, SO-2026-00001)
- Customer balances are automatically updated when transactions are created
- Use soft delete (deactivate) instead of hard delete for customers
- All operations are tenant-isolated

## 📞 Support

For issues or questions, refer to:
- `README.md` - Complete documentation
- `ARCHITECTURE.md` - Architecture diagram
- `SUMMARY.md` - Feature summary
