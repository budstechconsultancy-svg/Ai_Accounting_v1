
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from customerportal.models import (
    CustomerMasterCustomerBasicDetails,
    CustomerMasterCustomerGSTDetails,
    CustomerMasterCustomerProductService,
    CustomerMasterCustomerTDS,
    CustomerMasterCustomerBanking,
    CustomerMasterCustomerTermsCondition
)

latest_customer = CustomerMasterCustomerBasicDetails.objects.last()

if latest_customer:
    print(f"Latest Customer: {latest_customer.customer_name} ({latest_customer.customer_code}) ID: {latest_customer.id}")
    
    print(f"GST Details: {CustomerMasterCustomerGSTDetails.objects.filter(customer_basic_detail=latest_customer).count()}")
    print(f"Products: {CustomerMasterCustomerProductService.objects.filter(customer_basic_detail=latest_customer).count()}")
    
    try:
        tds = CustomerMasterCustomerTDS.objects.get(customer_basic_detail=latest_customer)
        print(f"TDS: Found (Enabled: {tds.tds_enabled})")
    except CustomerMasterCustomerTDS.DoesNotExist:
        print("TDS: None")
        
    print(f"Banking: {CustomerMasterCustomerBanking.objects.filter(customer_basic_detail=latest_customer).count()}")
    
    try:
        terms = CustomerMasterCustomerTermsCondition.objects.get(customer_basic_detail=latest_customer)
        print(f"Terms: Found (Credit Period: {terms.credit_period})")
    except CustomerMasterCustomerTermsCondition.DoesNotExist:
        print("Terms: None")
        
else:
    print("No customers found.")
