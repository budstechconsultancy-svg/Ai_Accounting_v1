
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from customerportal.serializers import CustomerMasterCustomerSerializer
from django.contrib.auth import get_user_model

User = get_user_model()
# Get a user and tenant
user = User.objects.first()
# Mock request
class MockRequest:
    def __init__(self, user):
        self.user = user

request = MockRequest(user)

data = {
    "customer_name": "Debug Customer",
    "customer_code": "DEBUG-001",
    "customer_category": 1,
    "gst_details": {
        "gstins": ["12ABCDE1234F1Z5"],
        "branches": []
    },
    "products_services": {
        "items": []
    },
    "banking_info": {
        "accounts": []
    }
}

print("Instantiating serializer...")
serializer = CustomerMasterCustomerSerializer(data=data, context={'request': request})
if serializer.is_valid():
    print("Serializer is valid.")
    print("Calling serializer.save()...")
    
    # We need to ensure tenant_id is set. 
    # The ViewSet usually handles this in perform_create, but serializer.save() calls create() with validated_data.
    # The serializer doesn't expect tenant_id in validated_data for Create, but Model requires it.
    # In ViewSet: serializer.save(tenant_id=..., created_by=...)
    
    try:
        instance = serializer.save(tenant_id=user.tenant_id, created_by=user.username)
        print(f"Saved instance: {instance}")
    except Exception as e:
        print(f"Error saving: {e}")
        import traceback
        traceback.print_exc()

else:
    print("Serializer errors:", serializer.errors)
