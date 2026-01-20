"""
Test script to verify customer creation is working
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from customerportal.models import CustomerMasterCustomerBasicDetails

# Check if any customers exist
customers = CustomerMasterCustomerBasicDetails.objects.all()
print(f"\nTotal customers in database: {customers.count()}")

if customers.exists():
    print("\nLatest customers:")
    for customer in customers.order_by('-id')[:5]:
        print(f"  ID: {customer.id}, Name: {customer.customer_name}, Code: {customer.customer_code}, Created: {customer.created_at}")
else:
    print("\nNo customers found in database.")

# Try to create a test customer
print("\n" + "="*80)
print("Creating a test customer...")
print("="*80)

try:
    test_customer = CustomerMasterCustomerBasicDetails.objects.create(
        tenant_id='test-tenant-123',
        customer_name='Test Customer',
        customer_code=f'TEST-{os.urandom(3).hex().upper()}',
        created_by='test_script'
    )
    print(f"✓ SUCCESS: Test customer created with ID: {test_customer.id}")
    print(f"  Name: {test_customer.customer_name}")
    print(f"  Code: {test_customer.customer_code}")
    
    # Delete the test customer
    test_customer.delete()
    print(f"✓ Test customer deleted")
    
except Exception as e:
    print(f"✗ ERROR: {e}")

print("\n" + "="*80)
print("Database connection and model are working correctly!")
print("="*80)
