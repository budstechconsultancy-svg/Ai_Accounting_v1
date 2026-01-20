
import os
import django
import sys
from datetime import datetime
from rest_framework.test import APIRequestFactory

# Setup Django environment
sys.path.append('c:/108/muthu/Ai_Accounting_v1-7/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from customerportal.serializers import CustomerMasterCustomerSerializer
from customerportal.database import (
    CustomerMasterCustomerBasicDetails, 
    CustomerMasterCustomerGSTDetails, 
    CustomerMasterCustomerProductService, 
    CustomerMasterCustomerTDS, 
    CustomerMasterCustomerBanking, 
    CustomerMasterCustomerTermsCondition
)
from django.contrib.auth import get_user_model

def test_create_customer():
    """
    Test creating a customer with MINIMAL data to verify all tables get populated
    """
    print("=" * 80)
    print("TESTING CUSTOMER CREATION WITH MINIMAL DATA")
    print("=" * 80)
    
    # 1. Create a dummy user and request
    try:
        User = get_user_model()
        user = User.objects.first()
        if not user:
            print("❌ No user found in database. Cannot test.")
            return

        print(f"Using user: {user.username}")

        # Mock request
        factory = APIRequestFactory()
        request = factory.post('/api/dummy/')
        request.user = user
        
        # 2. Define MINIMAL payload (only required fields)
        payload = {
            'customer_name': f'Test Customer {datetime.now().strftime("%H%M%S")}',
            'customer_code': f'CUST-{datetime.now().strftime("%H%M%S")}',
            # EMPTY related data
            'gst_details': {'gstins': [], 'branches': []},
            'products_services': {'items': []},
            'banking_info': {'accounts': []},
            # TDS fields empty/null
            'msme_no': None,
            # Terms empty/null
            'credit_period': None,
        }
        
        print(f"Payload prepared for: {payload['customer_name']}")
        
        # 3. Initialize Serializer
        serializer = CustomerMasterCustomerSerializer(data=payload, context={'request': request})
        
        # 4. Validate and Save
        if serializer.is_valid():
            print("✅ Serializer validation passed")
            print("Attempting to save...")
            
            try:
                customer = serializer.save()
                print(f"✅ Customer saved successfully! ID: {customer.id}")
                
                # 5. Verify ALL tables have records
                verify_tables(customer.id)
                
            except Exception as e:
                print(f"❌ Error saving customer: {str(e)}")
                import traceback
                traceback.print_exc()
        else:
            print("❌ Serializer validation failed:")
            print(serializer.errors)
            
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()

def verify_tables(customer_id):
    """Verify records exist in all 6 tables"""
    print("\nVerifying database records...")
    
    # 1. Basic Details
    basic = CustomerMasterCustomerBasicDetails.objects.filter(id=customer_id).exists()
    print(f"Basic Details: {'✅ Found' if basic else '❌ MISSING'}")
    
    # 2. GST Details
    gst = CustomerMasterCustomerGSTDetails.objects.filter(customer_basic_detail_id=customer_id).count()
    print(f"GST Details:   {'✅ Found (' + str(gst) + ' records)' if gst > 0 else '❌ MISSING'}")
    
    # 3. Product/Service
    prod = CustomerMasterCustomerProductService.objects.filter(customer_basic_detail_id=customer_id).count()
    print(f"Products:      {'✅ Found (' + str(prod) + ' records)' if prod > 0 else '❌ MISSING'}")
    
    # 4. TDS
    tds = CustomerMasterCustomerTDS.objects.filter(customer_basic_detail_id=customer_id).exists()
    print(f"TDS Details:   {'✅ Found' if tds else '❌ MISSING'}")
    
    # 5. Banking
    bank = CustomerMasterCustomerBanking.objects.filter(customer_basic_detail_id=customer_id).count()
    print(f"Banking:       {'✅ Found (' + str(bank) + ' records)' if bank > 0 else '❌ MISSING'}")
    
    # 6. Terms
    terms = CustomerMasterCustomerTermsCondition.objects.filter(customer_basic_detail_id=customer_id).exists()
    print(f"Terms & Cond:  {'✅ Found' if terms else '❌ MISSING'}")

if __name__ == "__main__":
    test_create_customer()
