"""
Test script to verify customer onboarding data is being saved to all 6 tables
Run this after onboarding a customer to verify data integrity
"""

import os
import django
import sys

# Setup Django environment
sys.path.append('c:/108/muthu/Ai_Accounting_v1-7/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from customerportal.database import (
    CustomerMasterCustomerBasicDetails,
    CustomerMasterCustomerGSTDetails,
    CustomerMasterCustomerProductService,
    CustomerMasterCustomerTDS,
    CustomerMasterCustomerBanking,
    CustomerMasterCustomerTermsCondition
)

def test_customer_onboarding():
    """
    Test that customer data is being saved to all 6 tables
    """
    print("=" * 80)
    print("CUSTOMER ONBOARDING DATA VERIFICATION")
    print("=" * 80)
    
    # Get the most recent customer
    try:
        latest_customer = CustomerMasterCustomerBasicDetails.objects.filter(
            is_deleted=False
        ).order_by('-created_at').first()
        
        if not latest_customer:
            print("\n❌ No customers found in the database")
            return
        
        print(f"\n✅ Found customer: {latest_customer.customer_code} - {latest_customer.customer_name}")
        print(f"   Created at: {latest_customer.created_at}")
        print(f"   Tenant ID: {latest_customer.tenant_id}")
        
        # Check each related table
        print("\n" + "-" * 80)
        print("CHECKING RELATED TABLES:")
        print("-" * 80)
        
        # 1. Basic Details (already have this)
        print(f"\n1. ✅ Basic Details Table:")
        print(f"   - Customer Code: {latest_customer.customer_code}")
        print(f"   - Customer Name: {latest_customer.customer_name}")
        print(f"   - PAN Number: {latest_customer.pan_number or 'Not provided'}")
        print(f"   - Contact Person: {latest_customer.contact_person or 'Not provided'}")
        print(f"   - Email: {latest_customer.email_address or 'Not provided'}")
        print(f"   - Contact Number: {latest_customer.contact_number or 'Not provided'}")
        
        # 2. GST Details
        gst_details = CustomerMasterCustomerGSTDetails.objects.filter(
            customer_basic_detail=latest_customer
        )
        print(f"\n2. {'✅' if gst_details.exists() else '⚠️'} GST Details Table:")
        if gst_details.exists():
            for idx, gst in enumerate(gst_details, 1):
                print(f"   Entry {idx}:")
                print(f"   - GSTIN: {gst.gstin or 'Unregistered'}")
                print(f"   - Branch: {gst.branch_reference_name or 'N/A'}")
                print(f"   - Address: {gst.branch_address or 'N/A'}")
        else:
            print("   No GST details found")
        
        # 3. Product/Service Mappings
        products = CustomerMasterCustomerProductService.objects.filter(
            customer_basic_detail=latest_customer
        )
        print(f"\n3. {'✅' if products.exists() else '⚠️'} Products/Services Table:")
        if products.exists():
            for idx, prod in enumerate(products, 1):
                print(f"   Entry {idx}:")
                print(f"   - Item Code: {prod.item_code}")
                print(f"   - Item Name: {prod.item_name}")
                print(f"   - Customer Item Code: {prod.customer_item_code or 'N/A'}")
                print(f"   - Customer Item Name: {prod.customer_item_name or 'N/A'}")
                print(f"   - UOM: {prod.uom or 'N/A'}")
                print(f"   - Customer UOM: {prod.customer_uom or 'N/A'}")
        else:
            print("   No product/service mappings found")
        
        # 4. TDS Details
        try:
            tds_details = latest_customer.tds_details
            print(f"\n4. ✅ TDS & Statutory Details Table:")
            print(f"   - MSME No: {tds_details.msme_no or 'Not provided'}")
            print(f"   - FSSAI No: {tds_details.fssai_no or 'Not provided'}")
            print(f"   - IEC Code: {tds_details.iec_code or 'Not provided'}")
            print(f"   - EOU Status: {tds_details.eou_status or 'Not provided'}")
            print(f"   - TCS Section: {tds_details.tcs_section or 'Not provided'}")
            print(f"   - TCS Enabled: {tds_details.tcs_enabled}")
            print(f"   - TDS Section: {tds_details.tds_section or 'Not provided'}")
            print(f"   - TDS Enabled: {tds_details.tds_enabled}")
        except CustomerMasterCustomerTDS.DoesNotExist:
            print(f"\n4. ⚠️ TDS & Statutory Details Table:")
            print("   No TDS details found")
        
        # 5. Banking Details
        banking = CustomerMasterCustomerBanking.objects.filter(
            customer_basic_detail=latest_customer
        )
        print(f"\n5. {'✅' if banking.exists() else '⚠️'} Banking Information Table:")
        if banking.exists():
            for idx, bank in enumerate(banking, 1):
                print(f"   Entry {idx}:")
                print(f"   - Account Number: {bank.account_number}")
                print(f"   - Bank Name: {bank.bank_name}")
                print(f"   - IFSC Code: {bank.ifsc_code}")
                print(f"   - Branch Name: {bank.branch_name or 'N/A'}")
                print(f"   - SWIFT Code: {bank.swift_code or 'N/A'}")
                print(f"   - Associated Branches: {bank.associated_branches or 'N/A'}")
        else:
            print("   No banking details found")
        
        # 6. Terms & Conditions ← THIS IS WHAT YOU ASKED ABOUT
        try:
            terms = latest_customer.terms_conditions
            print(f"\n6. ✅ Terms & Conditions Table:")
            print(f"   - Credit Period: {terms.credit_period or 'Not provided'}")
            print(f"   - Credit Terms: {terms.credit_terms or 'Not provided'}")
            print(f"   - Penalty Terms: {terms.penalty_terms or 'Not provided'}")
            print(f"   - Delivery Terms: {terms.delivery_terms or 'Not provided'}")
            print(f"   - Warranty Details: {terms.warranty_details or 'Not provided'}")
            print(f"   - Force Majeure: {terms.force_majeure or 'Not provided'}")
            print(f"   - Dispute Terms: {terms.dispute_terms or 'Not provided'}")
            print(f"   - Created At: {terms.created_at}")
            
            # Check if any terms were actually filled
            has_data = any([
                terms.credit_period,
                terms.credit_terms,
                terms.penalty_terms,
                terms.delivery_terms,
                terms.warranty_details,
                terms.force_majeure,
                terms.dispute_terms
            ])
            
            if has_data:
                print("\n   ✅ Terms & Conditions data is being saved correctly!")
            else:
                print("\n   ⚠️ Terms & Conditions record exists but all fields are empty")
                
        except CustomerMasterCustomerTermsCondition.DoesNotExist:
            print(f"\n6. ⚠️ Terms & Conditions Table:")
            print("   No terms & conditions found")
            print("   This is normal if you didn't fill in any T&C fields")
        
        print("\n" + "=" * 80)
        print("VERIFICATION COMPLETE")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_customer_onboarding()
