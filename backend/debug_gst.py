
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from customerportal.models import CustomerMasterCustomerBasicDetails, CustomerMasterCustomerGSTDetails

latest = CustomerMasterCustomerBasicDetails.objects.last()
print(f"Latest Customer: {latest.customer_name} (ID: {latest.id})")

gst_records = CustomerMasterCustomerGSTDetails.objects.filter(customer_basic_detail=latest)
print(f"Total GST Records: {gst_records.count()}")

for gst in gst_records:
    print(f"- ID: {gst.id}")
    print(f"  GSTIN: {gst.gstin}")
    print(f"  Branch Ref: {gst.branch_reference_name}")
    print(f"  Address: {gst.branch_address}")
    print(f"  Is Unregistered: {gst.is_unregistered}")
