"""
Customer Portal Serializers
Handles data serialization for API responses
"""
from rest_framework import serializers
from .database import (
    CustomerMaster,
    CustomerMasterCategory,
    CustomerMastersSalesQuotation,
    CustomerMasterCustomer,
    CustomerTransaction,
    CustomerSalesQuotation,
    CustomerSalesOrder,
    CustomerMasterLongTermContractBasicDetail,
    CustomerMasterLongTermContractProductService,
    CustomerMasterLongTermContractTermsCondition
)


class CustomerMasterSerializer(serializers.ModelSerializer):
    """Serializer for Customer Master"""
    
    class Meta:
        model = CustomerMaster
        fields = [
            'id', 'tenant_id', 'customer_code', 'customer_name',
            'email', 'phone', 'mobile',
            'address_line1', 'address_line2', 'city', 'state', 'country', 'pincode',
            'gstin', 'pan', 'category_id',
            'credit_limit', 'credit_days', 'opening_balance', 'current_balance',
            'is_active', 'is_deleted', 'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerMasterCategorySerializer(serializers.ModelSerializer):
    """Serializer for Customer Master Category"""
    
    class Meta:
        model = CustomerMasterCategory
        fields = [
            'id', 'tenant_id', 'category', 'group', 'subgroup',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']


class CustomerMastersSalesQuotationSerializer(serializers.ModelSerializer):
    """Serializer for Customer Masters Sales Quotation Series"""
    
    class Meta:
        model = CustomerMastersSalesQuotation
        fields = [
            'id', 'tenant_id', 'series_name', 'customer_category',
            'prefix', 'suffix', 'required_digits', 'current_number', 'auto_year',
            'is_active', 'is_deleted', 'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_by', 'created_at', 'updated_at']


class CustomerMasterCustomerSerializer(serializers.ModelSerializer):
    """
    Serializer for Customer Master Customer (Create New Customer form)
    Handles saving data to all 6 separate tables when 'Onboard Customer' is clicked
    """
    
    # Accept these fields in the request but they won't be saved to BasicDetails
    gst_details = serializers.JSONField(required=False, allow_null=True)
    products_services = serializers.JSONField(required=False, allow_null=True)
    banking_info = serializers.JSONField(required=False, allow_null=True)
    
    # TDS fields (will be saved to separate table)
    msme_no = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    fssai_no = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    iec_code = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    eou_status = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    tcs_section = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    tcs_enabled = serializers.BooleanField(required=False, default=False)
    tds_section = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    tds_enabled = serializers.BooleanField(required=False, default=False)
    
    # Terms & Conditions fields (will be saved to separate table)
    credit_period = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    credit_terms = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    penalty_terms = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    delivery_terms = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    warranty_details = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    force_majeure = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    dispute_terms = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    class Meta:
        model = CustomerMasterCustomer  # This is aliased to CustomerMasterCustomerBasicDetails
        fields = [
            'id', 'tenant_id', 'customer_name', 'customer_code', 'customer_category',
            'pan_number', 'contact_person', 'email_address', 'contact_number',
            'is_also_vendor',
            # These are not in the model but accepted in serializer
            'gst_details', 'products_services', 'banking_info',
            'msme_no', 'fssai_no', 'iec_code', 'eou_status',
            'tcs_section', 'tcs_enabled', 'tds_section', 'tds_enabled',
            'credit_period', 'credit_terms', 'penalty_terms',
            'delivery_terms', 'warranty_details', 'force_majeure', 'dispute_terms',
            'is_active', 'is_deleted', 'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_by', 'created_at', 'updated_at']

    def to_representation(self, instance):
        """
        Convert the model instance to a dictionary for JSON serialization
        Only include fields that actually exist in the BasicDetails model
        """
        return {
            'id': instance.id,
            'tenant_id': instance.tenant_id,
            'customer_name': instance.customer_name,
            'customer_code': instance.customer_code,
            'customer_category': instance.customer_category_id,
            'pan_number': instance.pan_number,
            'contact_person': instance.contact_person,
            'email_address': instance.email_address,
            'contact_number': instance.contact_number,
            'is_also_vendor': instance.is_also_vendor,
            'is_active': instance.is_active,
            'is_deleted': instance.is_deleted,
            'created_at': instance.created_at.isoformat() if instance.created_at else None,
            'updated_at': instance.updated_at.isoformat() if instance.updated_at else None,
            'created_by': instance.created_by,
            'updated_by': instance.updated_by,
        }

    def create(self, validated_data):
        """
        Create customer and save data to all 6 separate tables
        This is called when 'Onboard Customer' button is clicked
        """
        from .models import (
            CustomerMasterCustomerGSTDetails,
            CustomerMasterCustomerProductService,
            CustomerMasterCustomerTDS,
            CustomerMasterCustomerBanking,
            CustomerMasterCustomerTermsCondition
        )
        from django.db import transaction
        
        # Extract data for separate tables
        gst_details_data = validated_data.pop('gst_details', None)
        products_services_data = validated_data.pop('products_services', None)
        banking_info_data = validated_data.pop('banking_info', None)
        
        # Extract TDS fields
        tds_data = {
            'msme_no': validated_data.pop('msme_no', None),
            'fssai_no': validated_data.pop('fssai_no', None),
            'iec_code': validated_data.pop('iec_code', None),
            'eou_status': validated_data.pop('eou_status', None),
            'tcs_section': validated_data.pop('tcs_section', None),
            'tcs_enabled': validated_data.pop('tcs_enabled', False),
            'tds_section': validated_data.pop('tds_section', None),
            'tds_enabled': validated_data.pop('tds_enabled', False),
        }
        
        # Extract Terms & Conditions fields
        terms_data = {
            'credit_period': validated_data.pop('credit_period', None),
            'credit_terms': validated_data.pop('credit_terms', None),
            'penalty_terms': validated_data.pop('penalty_terms', None),
            'delivery_terms': validated_data.pop('delivery_terms', None),
            'warranty_details': validated_data.pop('warranty_details', None),
            'force_majeure': validated_data.pop('force_majeure', None),
            'dispute_terms': validated_data.pop('dispute_terms', None),
        }
        
        # Use transaction to ensure all-or-nothing save
        with transaction.atomic():
            # 1. Create Basic Details (parent table)
            basic_details = super().create(validated_data)
            
            # 2. Create GST Details (if provided)
            if gst_details_data:
                gstins = gst_details_data.get('gstins', [])
                branches = gst_details_data.get('branches', [])
                
                # Create GST detail for each GSTIN/branch
                for gstin in gstins:
                    CustomerMasterCustomerGSTDetails.objects.create(
                        customer_basic_detail=basic_details,
                        tenant_id=basic_details.tenant_id,
                        gstin=gstin,
                        is_unregistered=False,
                        created_by=basic_details.created_by
                    )
                
                # Create branch details
                for branch in branches:
                    CustomerMasterCustomerGSTDetails.objects.create(
                        customer_basic_detail=basic_details,
                        tenant_id=basic_details.tenant_id,
                        gstin=branch.get('gstin'),
                        branch_reference_name=branch.get('defaultRef'),
                        branch_address=branch.get('address'),
                        created_by=basic_details.created_by
                    )
            
            # 3. Create Product/Service mappings (if provided)
            if products_services_data and 'items' in products_services_data:
                items = products_services_data['items']
                for item in items:
                    if item.get('itemCode'):  # Only create if item code exists
                        CustomerMasterCustomerProductService.objects.create(
                            customer_basic_detail=basic_details,
                            tenant_id=basic_details.tenant_id,
                            item_code=item.get('itemCode'),
                            item_name=item.get('itemName'),
                            customer_item_code=item.get('custItemCode'),
                            customer_item_name=item.get('custItemName'),
                            uom=item.get('uom'),
                            customer_uom=item.get('custUom'),
                            created_by=basic_details.created_by
                        )
            
            # 4. Create TDS Details (if any TDS data provided)
            if any(tds_data.values()):
                CustomerMasterCustomerTDS.objects.update_or_create(
                    customer_basic_detail=basic_details,
                    defaults={
                        'tenant_id': basic_details.tenant_id,
                        'created_by': basic_details.created_by,
                        **tds_data
                    }
                )
            
            # 5. Create Banking Information (if provided)
            if banking_info_data and 'accounts' in banking_info_data:
                accounts = banking_info_data['accounts']
                for account in accounts:
                    if account.get('accountNumber'):  # Only create if account number exists
                        CustomerMasterCustomerBanking.objects.create(
                            customer_basic_detail=basic_details,
                            tenant_id=basic_details.tenant_id,
                            account_number=account.get('accountNumber'),
                            bank_name=account.get('bankName'),
                            ifsc_code=account.get('ifscCode'),
                            branch_name=account.get('branchName'),
                            swift_code=account.get('swiftCode'),
                            associated_branches=account.get('associatedBranches'),
                            created_by=basic_details.created_by
                        )
            
            # 6. Create Terms & Conditions (if any terms data provided)
            if any(terms_data.values()):
                CustomerMasterCustomerTermsCondition.objects.update_or_create(
                    customer_basic_detail=basic_details,
                    defaults={
                        'tenant_id': basic_details.tenant_id,
                        'created_by': basic_details.created_by,
                        **terms_data
                    }
                )
        
        return basic_details

    def update(self, instance, validated_data):
        """
        Update customer and related data in all 6 tables
        """
        from .models import (
            CustomerMasterCustomerGSTDetails,
            CustomerMasterCustomerProductService,
            CustomerMasterCustomerTDS,
            CustomerMasterCustomerBanking,
            CustomerMasterCustomerTermsCondition
        )
        from django.db import transaction
        
        # Extract data for separate tables
        gst_details_data = validated_data.pop('gst_details', None)
        products_services_data = validated_data.pop('products_services', None)
        banking_info_data = validated_data.pop('banking_info', None)
        
        # Extract TDS fields
        tds_data = {
            'msme_no': validated_data.pop('msme_no', None),
            'fssai_no': validated_data.pop('fssai_no', None),
            'iec_code': validated_data.pop('iec_code', None),
            'eou_status': validated_data.pop('eou_status', None),
            'tcs_section': validated_data.pop('tcs_section', None),
            'tcs_enabled': validated_data.pop('tcs_enabled', False),
            'tds_section': validated_data.pop('tds_section', None),
            'tds_enabled': validated_data.pop('tds_enabled', False),
        }
        
        # Extract Terms & Conditions fields
        terms_data = {
            'credit_period': validated_data.pop('credit_period', None),
            'credit_terms': validated_data.pop('credit_terms', None),
            'penalty_terms': validated_data.pop('penalty_terms', None),
            'delivery_terms': validated_data.pop('delivery_terms', None),
            'warranty_details': validated_data.pop('warranty_details', None),
            'force_majeure': validated_data.pop('force_majeure', None),
            'dispute_terms': validated_data.pop('dispute_terms', None),
        }
        
        with transaction.atomic():
            # Update basic details
            instance = super().update(instance, validated_data)
            
            # Update GST Details
            if gst_details_data is not None:
                # Delete existing GST details
                CustomerMasterCustomerGSTDetails.objects.filter(customer_basic_detail=instance).delete()
                
                # Create new ones
                gstins = gst_details_data.get('gstins', [])
                branches = gst_details_data.get('branches', [])
                
                for gstin in gstins:
                    CustomerMasterCustomerGSTDetails.objects.create(
                        customer_basic_detail=instance,
                        tenant_id=instance.tenant_id,
                        gstin=gstin,
                        is_unregistered=False,
                        updated_by=instance.updated_by
                    )
                
                for branch in branches:
                    CustomerMasterCustomerGSTDetails.objects.create(
                        customer_basic_detail=instance,
                        tenant_id=instance.tenant_id,
                        gstin=branch.get('gstin'),
                        branch_reference_name=branch.get('defaultRef'),
                        branch_address=branch.get('address'),
                        updated_by=instance.updated_by
                    )
            
            # Update Products/Services
            if products_services_data is not None:
                CustomerMasterCustomerProductService.objects.filter(customer_basic_detail=instance).delete()
                
                items = products_services_data.get('items', [])
                for item in items:
                    if item.get('itemCode'):
                        CustomerMasterCustomerProductService.objects.create(
                            customer_basic_detail=instance,
                            tenant_id=instance.tenant_id,
                            item_code=item.get('itemCode'),
                            item_name=item.get('itemName'),
                            customer_item_code=item.get('custItemCode'),
                            customer_item_name=item.get('custItemName'),
                            uom=item.get('uom'),
                            customer_uom=item.get('custUom'),
                            updated_by=instance.updated_by
                        )
            
            # Update TDS Details
            if any(tds_data.values()):
                tds_instance, created = CustomerMasterCustomerTDS.objects.get_or_create(
                    customer_basic_detail=instance,
                    defaults={'tenant_id': instance.tenant_id}
                )
                for key, value in tds_data.items():
                    setattr(tds_instance, key, value)
                tds_instance.updated_by = instance.updated_by
                tds_instance.save()
            
            # Update Banking Info
            if banking_info_data is not None:
                CustomerMasterCustomerBanking.objects.filter(customer_basic_detail=instance).delete()
                
                accounts = banking_info_data.get('accounts', [])
                for account in accounts:
                    if account.get('accountNumber'):
                        CustomerMasterCustomerBanking.objects.create(
                            customer_basic_detail=instance,
                            tenant_id=instance.tenant_id,
                            account_number=account.get('accountNumber'),
                            bank_name=account.get('bankName'),
                            ifsc_code=account.get('ifscCode'),
                            branch_name=account.get('branchName'),
                            swift_code=account.get('swiftCode'),
                            associated_branches=account.get('associatedBranches'),
                            updated_by=instance.updated_by
                        )
            
            # Update Terms & Conditions
            if any(terms_data.values()):
                terms_instance, created = CustomerMasterCustomerTermsCondition.objects.get_or_create(
                    customer_basic_detail=instance,
                    defaults={'tenant_id': instance.tenant_id}
                )
                for key, value in terms_data.items():
                    setattr(terms_instance, key, value)
                terms_instance.updated_by = instance.updated_by
                terms_instance.save()
        
        return instance



class CustomerTransactionSerializer(serializers.ModelSerializer):
    """Serializer for Customer Transaction"""
    
    class Meta:
        model = CustomerTransaction
        fields = [
            'id', 'tenant_id', 'customer_id', 'transaction_type',
            'transaction_number', 'transaction_date',
            'amount', 'tax_amount', 'total_amount',
            'payment_status', 'payment_mode',
            'reference_number', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerSalesQuotationSerializer(serializers.ModelSerializer):
    """Serializer for Sales Quotation"""
    
    class Meta:
        model = CustomerSalesQuotation
        fields = [
            'id', 'tenant_id', 'customer_id', 'quotation_number',
            'quotation_date', 'valid_until',
            'subtotal', 'tax_amount', 'discount_amount', 'total_amount',
            'status', 'terms_and_conditions', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerSalesOrderSerializer(serializers.ModelSerializer):
    """Serializer for Sales Order"""
    
    class Meta:
        model = CustomerSalesOrder
        fields = [
            'id', 'tenant_id', 'customer_id', 'order_number',
            'order_date', 'expected_delivery_date',
            'quotation_reference', 'po_number',
            'subtotal', 'tax_amount', 'discount_amount', 'shipping_charges', 'total_amount',
            'status', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# TODO: Uncomment when CustomerMasterLongTermContract model is created
# class CustomerMasterLongTermContractSerializer(serializers.ModelSerializer):
#     """Serializer for Customer Master Long-term Contracts"""
#     
#     class Meta:
#         model = CustomerMasterLongTermContract
#         fields = [
#             'id', 'tenant_id', 'contract_number', 'customer_id', 'customer_name',
#             'branch_id', 'contract_type', 'contract_validity_from', 'contract_validity_to',
#             'contract_document', 'automate_billing', 'bill_start_date', 'billing_frequency',
#             'voucher_name', 'bill_period_from', 'bill_period_to', 'products_services',
#             'payment_terms', 'penalty_terms', 'force_majeure', 'termination_clause',
#             'dispute_terms', 'other_terms', 'is_active', 'is_deleted',
#             'created_at', 'updated_at', 'created_by'
#         ]
#         read_only_fields = ['id', 'tenant_id', 'created_by', 'created_at', 'updated_at']



# ============================================================================
# LONG-TERM CONTRACTS SERIALIZERS
# ============================================================================

class CustomerMasterLongTermContractProductServiceSerializer(serializers.ModelSerializer):
    """Serializer for Long-term Contract Products/Services"""
    
    class Meta:
        model = CustomerMasterLongTermContractProductService
        fields = [
            'id', 'tenant_id', 'contract_basic_detail', 'item_code', 'item_name',
            'customer_item_name', 'qty_min', 'qty_max', 'price_min', 'price_max',
            'acceptable_price_deviation', 'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerMasterLongTermContractTermsConditionSerializer(serializers.ModelSerializer):
    """Serializer for Long-term Contract Terms & Conditions"""
    
    class Meta:
        model = CustomerMasterLongTermContractTermsCondition
        fields = [
            'id', 'tenant_id', 'contract_basic_detail', 'payment_terms', 'penalty_terms',
            'force_majeure', 'termination_clause', 'dispute_terms', 'others',
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CustomerMasterLongTermContractBasicDetailSerializer(serializers.ModelSerializer):
    """Serializer for Long-term Contract Basic Details"""
    products_services = CustomerMasterLongTermContractProductServiceSerializer(many=True, read_only=True)
    terms_conditions = CustomerMasterLongTermContractTermsConditionSerializer(read_only=True)
    
    class Meta:
        model = CustomerMasterLongTermContractBasicDetail
        fields = [
            'id', 'tenant_id', 'contract_number', 'customer_id', 'customer_name',
            'branch_id', 'contract_type', 'contract_validity_from', 'contract_validity_to',
            'contract_document', 'automate_billing', 'bill_start_date', 'billing_frequency',
            'voucher_name', 'bill_period_from', 'bill_period_to',
            'is_active', 'is_deleted', 'created_at', 'updated_at', 'created_by',
            'products_services', 'terms_conditions'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_by', 'created_at', 'updated_at']
