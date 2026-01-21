"""
Test script to verify Sales Order API endpoint
Run this to test if the backend can create sales orders
"""

import requests
import json
from datetime import date

# API endpoint
API_URL = "http://localhost:8000/api/customer-portal/sales-orders/"

# Sample sales order data
sales_order_data = {
    "so_series_name": "SO-2024",
    "so_number": "SO-2024-TEST-001",
    "date": str(date.today()),
    "customer_po_number": "PO-TEST-123",
    "customer_name": "Test Customer",
    "branch": "Test Branch",
    "address": "123 Test Street, Test City",
    "email": "test@example.com",
    "contact_number": "1234567890",
    "quotation_type": "quotation",
    "quotation_number": "SQ-2024-001",
    "items": [
        {
            "item_code": "TEST001",
            "item_name": "Test Product A",
            "quantity": 10.0,
            "price": 100.0,
            "taxable_value": 1000.0,
            "gst": 180.0,
            "net_value": 1180.0
        },
        {
            "item_code": "TEST002",
            "item_name": "Test Product B",
            "quantity": 5.0,
            "price": 200.0,
            "taxable_value": 1000.0,
            "gst": 180.0,
            "net_value": 1180.0
        }
    ],
    "delivery_terms": {
        "deliver_at": "Test Warehouse - 456 Industrial Ave",
        "delivery_date": "2026-01-25"
    },
    "payment_terms": {
        "credit_period": "30 days"
    },
    "salesperson": {
        "employee_id": "EMP-TEST-001",
        "employee_name": "Test Salesperson"
    }
}

def test_create_sales_order():
    """Test creating a sales order via API"""
    print("=" * 80)
    print("Testing Sales Order API Endpoint")
    print("=" * 80)
    print(f"\nEndpoint: {API_URL}")
    print(f"\nSending data:")
    print(json.dumps(sales_order_data, indent=2))
    print("\n" + "=" * 80)
    
    try:
        response = requests.post(
            API_URL,
            json=sales_order_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            print("\n✅ SUCCESS! Sales Order created successfully!")
            print("\nResponse Data:")
            print(json.dumps(response.json(), indent=2))
        elif response.status_code == 200:
            print("\n✅ SUCCESS! Sales Order created successfully!")
            print("\nResponse Data:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"\n❌ ERROR! Status code: {response.status_code}")
            print("\nError Response:")
            try:
                print(json.dumps(response.json(), indent=2))
            except:
                print(response.text)
        
        print("\n" + "=" * 80)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to backend server")
        print("Make sure the backend is running: python manage.py runserver")
        print("=" * 80)
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("=" * 80)

if __name__ == "__main__":
    test_create_sales_order()
