
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

print("\n" + "="*80)
print("🔍 VERIFYING LATEST CUSTOMER DATA")
print("="*80)

# 1. Check Basic Details
latest_customer = CustomerMasterCustomerBasicDetails.objects.last()

if not latest_customer:
    print("❌ No customers found in the database.")
    exit()

print(f"\n1. ✅ BASIC DETAILS (ID: {latest_customer.id})")
print(f"   Name: {latest_customer.customer_name}")
print(f"   Code: {latest_customer.customer_code}")
print(f"   Tenant ID: {latest_customer.tenant_id}")
print(f"   Created At: {latest_customer.created_at}")

# 2. Check GST Details
gst_details = CustomerMasterCustomerGSTDetails.objects.filter(customer_basic_detail=latest_customer)
print(f"\n2. GST DETAILS (Found: {gst_details.count()})")
if gst_details.exists():
    for gst in gst_details:
        print(f"   ✅ GSTIN: {gst.gstin} (Branch: {gst.branch_reference_name})")
else:
    print("   ⚠️ No GST details found")

# 3. Check Products/Services
products = CustomerMasterCustomerProductService.objects.filter(customer_basic_detail=latest_customer)
print(f"\n3. PRODUCTS/SERVICES (Found: {products.count()})")
if products.exists():
    for prod in products:
        print(f"   ✅ Item: {prod.item_name} ({prod.item_code})")
else:
    print("   ⚠️ No products found - checking via related_name 'product_services'")
    # Double check via related name to be sure
    try:
        related_products = latest_customer.product_services.all()
        print(f"   Using related_name 'product_services': Found {related_products.count()}")
        for prod in related_products:
             print(f"   ✅ Item: {prod.item_name} ({prod.item_code})")
    except AttributeError:
        print("   ❌ attribute 'product_services' not found on customer object")

# 4. Check TDS Details
try:
    tds = CustomerMasterCustomerTDS.objects.get(customer_basic_detail=latest_customer)
    print("\n4. ✅ TDS DETAILS")
    print(f"   TDS Enabled: {tds.tds_enabled}")
    if tds.msme_no: print(f"   MSME No: {tds.msme_no}")
except CustomerMasterCustomerTDS.DoesNotExist:
    print("\n4. ⚠️ No TDS details found")

# 5. Check Banking Info
banking = CustomerMasterCustomerBanking.objects.filter(customer_basic_detail=latest_customer)
print(f"\n5. BANKING INFO (Found: {banking.count()})")
if banking.exists():
    for bank in banking:
        print(f"   ✅ Bank: {bank.bank_name} (Acc: {bank.account_number})")
else:
    print("   ⚠️ No banking info found")

# 6. Check Terms & Conditions
try:
    terms = CustomerMasterCustomerTermsCondition.objects.get(customer_basic_detail=latest_customer)
    print("\n6. ✅ TERMS & CONDITIONS")
    if terms.credit_period: print(f"   Credit Period: {terms.credit_period}")
    if terms.credit_terms: print(f"   Credit Terms: {terms.credit_terms}")
except CustomerMasterCustomerTermsCondition.DoesNotExist:
    print("\n6. ⚠️ No terms & conditions found")

print("\n" + "="*80)
