
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from customerportal.models import CustomerMasterCustomerBasicDetails

latest = CustomerMasterCustomerBasicDetails.objects.last()
if latest:
    print(f"LATEST CUSTOMER: {latest.customer_name} ({latest.customer_code})")
    
    # Check counts
    print(f"Basic Details: OK (ID: {latest.id})")
    print(f"GST Details: {latest.gst_details.count()}")
    print(f"Products: {latest.products_services.count()}")
    
    try:
        print(f"TDS: {'OK' if latest.tds_details else 'None'}")
    except:
        print("TDS: None")
        
    print(f"Banking: {latest.banking_details.count()}")
    
    try:
        print(f"Terms: {'OK' if latest.terms_conditions else 'None'}")
    except:
        print("Terms: None")
else:
    print("No customers found")
