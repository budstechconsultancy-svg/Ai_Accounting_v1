import uuid
from rest_framework import serializers
from .models import (
    MasterLedgerGroup, MasterLedger, MasterVoucherConfig,
    Voucher, JournalEntry
)

# ============================================================================
# MASTER SERIALIZERS
# ============================================================================

from core.utils import TenantModelSerializerMixin

class MasterLedgerGroupSerializer(TenantModelSerializerMixin, serializers.ModelSerializer):
    under = serializers.CharField(source='parent', required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = MasterLedgerGroup
        fields = ['id', 'name', 'under', 'tenant_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']


class MasterLedgerSerializer(TenantModelSerializerMixin, serializers.ModelSerializer):
    registrationType = serializers.CharField(source='registration_type', required=False, allow_blank=True, allow_null=True)
    
    # Define all possible extended_data fields as serializer fields
    # These will be flattened in to_representation and collected in to_internal_value
    cashLocation = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    loanAccountNumber = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    panGstin = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    lenderName = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    loanAmount = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    interestType = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    interestRate = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    loanStartDate = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    loanEndDate = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    securityType = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    tenure = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    tenureOption = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    tenureDays = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    tenureMonths = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    tenureYears = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bankAccountNumber = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    gstinPan = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    enableBankReconciliation = serializers.BooleanField(required=False, allow_null=True)
    bankName = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    ifscCode = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    branch = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bankingCurrency = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    referenceWiseTracking = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    creditPeriod = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    isDepreciationPerIncomeTax = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    depreciationPercentage = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    isAmortizationPerIncomeTax = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    amortizationPercentage = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    companyCIN = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    dividendRate = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    equityInstrumentsCIN = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    debentureBondCIN = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    debentureBondInterestRate = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    debentureBondMaturityDate = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    inventoryType = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    inventoryValuationMethod = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = MasterLedger
        fields = [
            'id', 'name', 'group', 'gstin', 'registrationType', 'state', 
            'tenant_id', 'created_at', 'updated_at',
            # Extended data fields
            'cashLocation', 'loanAccountNumber', 'panGstin', 'lenderName', 'loanAmount',
            'interestType', 'interestRate', 'loanStartDate', 'loanEndDate', 'securityType',
            'tenure', 'tenureOption', 'tenureDays', 'tenureMonths', 'tenureYears',
            'bankAccountNumber', 'gstinPan',
            'enableBankReconciliation', 'bankName', 'ifscCode', 'branch', 'bankingCurrency',
            'referenceWiseTracking', 'creditPeriod', 'isDepreciationPerIncomeTax', 
            'depreciationPercentage', 'isAmortizationPerIncomeTax', 'amortizationPercentage',
            'companyCIN', 'dividendRate', 'equityInstrumentsCIN', 'debentureBondCIN',
            'debentureBondInterestRate', 'debentureBondMaturityDate', 'inventoryType',
            'inventoryValuationMethod'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        """Flatten extended_data fields to top level"""
        ret = super().to_representation(instance)
        
        # Add extended_data fields to top level
        if instance.extended_data:
            for key, value in instance.extended_data.items():
                ret[key] = value
        
        return ret
    
    def to_internal_value(self, data):
        """Collect extended_data fields from top level"""
        # List of fields that should go into extended_data
        extended_fields = [
            'cashLocation', 'loanAccountNumber', 'panGstin', 'lenderName', 'loanAmount',
            'interestType', 'interestRate', 'loanStartDate', 'loanEndDate', 'securityType',
            'tenure', 'tenureOption', 'tenureDays', 'tenureMonths', 'tenureYears',
            'bankAccountNumber', 'gstinPan',
            'enableBankReconciliation', 'bankName', 'ifscCode', 'branch', 'bankingCurrency',
            'referenceWiseTracking', 'creditPeriod', 'isDepreciationPerIncomeTax', 
            'depreciationPercentage', 'isAmortizationPerIncomeTax', 'amortizationPercentage',
            'companyCIN', 'dividendRate', 'equityInstrumentsCIN', 'debentureBondCIN',
            'debentureBondInterestRate', 'debentureBondMaturityDate', 'inventoryType',
            'inventoryValuationMethod'
        ]
        
        # Collect extended fields
        extended_data = {}
        for field in extended_fields:
            if field in data:
                value = data.get(field)
                if value:  # Only store non-empty values
                    extended_data[field] = value
        
        # Store in a temporary attribute to be used during create/update
        data['_extended_data'] = extended_data
        
        return super().to_internal_value(data)
    
    def create(self, validated_data):
        """Extract and store extended_data"""
        extended_data = validated_data.pop('_extended_data', {})
        instance = super().create(validated_data)
        instance.extended_data = extended_data
        instance.save()
        return instance
    
    def update(self, instance, validated_data):
        """Extract and update extended_data"""
        extended_data = validated_data.pop('_extended_data', {})
        instance = super().update(instance, validated_data)
        # Merge with existing extended_data
        if instance.extended_data:
            instance.extended_data.update(extended_data)
        else:
            instance.extended_data = extended_data
        instance.save()
        return instance


class MasterVoucherConfigSerializer(TenantModelSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = MasterVoucherConfig
        fields = '__all__'
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']


# ============================================================================
# VOUCHER SERIALIZERS - Unified
# ============================================================================

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ['id', 'ledger', 'debit', 'credit', 'entry_type', 'amount']
        read_only_fields = ['id', 'entry_type', 'amount']


class VoucherSerializer(TenantModelSerializerMixin, serializers.ModelSerializer):
    """Unified serializer for all voucher types with type-specific validation"""
    
    # Frontend compatibility fields (camelCase)
    items = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    entries = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    
    invoiceNo = serializers.CharField(source='invoice_no', required=False, allow_blank=True)
    isInterState = serializers.BooleanField(source='is_inter_state', required=False)
    totalTaxableAmount = serializers.DecimalField(source='total_taxable_amount', max_digits=15, decimal_places=2, required=False)
    totalCgst = serializers.DecimalField(source='total_cgst', max_digits=15, decimal_places=2, required=False)
    totalSgst = serializers.DecimalField(source='total_sgst', max_digits=15, decimal_places=2, required=False)
    totalIgst = serializers.DecimalField(source='total_igst', max_digits=15, decimal_places=2, required=False)
    totalDebit = serializers.DecimalField(source='total_debit', max_digits=15, decimal_places=2, required=False)
    totalCredit = serializers.DecimalField(source='total_credit', max_digits=15, decimal_places=2, required=False)
    fromAccount = serializers.CharField(source='from_account', required=False, allow_blank=True)
    toAccount = serializers.CharField(source='to_account', required=False, allow_blank=True)
    
    class Meta:
        model = Voucher
        fields = '__all__'
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']
        extra_kwargs = {
            'voucher_number': {'required': False},
            'party': {'required': False, 'allow_blank': True},
            'account': {'required': False, 'allow_blank': True},
            'from_account': {'required': False, 'allow_blank': True},
            'to_account': {'required': False, 'allow_blank': True}
        }
    
    def to_representation(self, instance):
        """Convert to frontend-friendly format"""
        ret = super().to_representation(instance)
        
        # Add camelCase fields
        ret['invoiceNo'] = instance.invoice_no
        ret['isInterState'] = instance.is_inter_state
        ret['totalTaxableAmount'] = instance.total_taxable_amount
        ret['totalCgst'] = instance.total_cgst
        ret['totalSgst'] = instance.total_sgst
        ret['totalIgst'] = instance.total_igst
        ret['totalDebit'] = instance.total_debit
        ret['totalCredit'] = instance.total_credit
        ret['fromAccount'] = instance.from_account
        ret['toAccount'] = instance.to_account
        
        # Add items for sales/purchase
        if instance.type in ['sales', 'purchase']:
            ret['items'] = instance.items_data or []
        
        # Add journal entries for journal vouchers
        if instance.type == 'journal':
            entries = instance.journal_entries.all()
            ret['entries'] = JournalEntrySerializer(entries, many=True).data
        
        return ret
    
    def validate(self, data):
        """Type-specific validation"""
        voucher_type = data.get('type')
        
        if voucher_type in ['sales', 'purchase']:
            # Validate sales/purchase specific fields
            if not data.get('party'):
                data['party'] = 'Unknown'
        
        elif voucher_type in ['payment', 'receipt']:
            # Validate payment/receipt specific fields
            if not data.get('party'):
                data['party'] = 'Unknown'
            if not data.get('account'):
                data['account'] = 'Cash'
            if not data.get('amount'):
                raise serializers.ValidationError({'amount': 'Amount is required for payment/receipt vouchers'})
        
        elif voucher_type == 'contra':
            # Validate contra specific fields
            if not data.get('from_account'):
                data['from_account'] = 'Cash'
            if not data.get('to_account'):
                data['to_account'] = 'Bank'
            if not data.get('amount'):
                raise serializers.ValidationError({'amount': 'Amount is required for contra vouchers'})
        
        return data
    
    def create(self, validated_data):
        """Create voucher with type-specific logic"""
        items_data = validated_data.pop('items', [])
        entries_data = validated_data.pop('entries', [])
        voucher_type = validated_data.get('type')
        
        # Inject tenant_id from request user
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['tenant_id'] = request.user.tenant_id
        
        # Store items_data for sales/purchase
        if voucher_type in ['sales', 'purchase']:
            validated_data['items_data'] = items_data
        
        # Auto-generate voucher_number if not provided
        if 'voucher_number' not in validated_data or not validated_data['voucher_number']:
            prefix_map = {
                'sales': 'SALES',
                'purchase': 'PURCH',
                'payment': 'PAY',
                'receipt': 'REC',
                'contra': 'CONTRA',
                'journal': 'JV'
            }
            prefix = prefix_map.get(voucher_type, 'VCH')
            unique_suffix = str(uuid.uuid4())[:8]
            validated_data['voucher_number'] = validated_data.get('invoice_no') or f"{prefix}-AUTO-{unique_suffix}"
        
        tenant_id = validated_data.get('tenant_id')
        voucher = Voucher.objects.create(**validated_data)
        
        # Create journal entries based on voucher type
        self._create_journal_entries(voucher, validated_data, entries_data, tenant_id)
        
        return voucher
    
    def _create_journal_entries(self, voucher, validated_data, entries_data, tenant_id):
        """Create journal entries based on voucher type"""
        voucher_type = voucher.type
        
        if voucher_type == 'sales':
            # Debit: Party, Credit: Sales
            JournalEntry.objects.create(
                voucher=voucher,
                ledger=validated_data.get('party', 'Unknown'),
                debit=voucher.total or 0,
                credit=0,
                tenant_id=tenant_id
            )
            JournalEntry.objects.create(
                voucher=voucher,
                ledger='Sales',
                debit=0,
                credit=voucher.total or 0,
                tenant_id=tenant_id
            )
        
        elif voucher_type == 'purchase':
            # Debit: Purchase, Credit: Party
            JournalEntry.objects.create(
                voucher=voucher,
                ledger='Purchase',
                debit=voucher.total or 0,
                credit=0,
                tenant_id=tenant_id
            )
            JournalEntry.objects.create(
                voucher=voucher,
                ledger=validated_data.get('party', 'Unknown'),
                debit=0,
                credit=voucher.total or 0,
                tenant_id=tenant_id
            )
        
        elif voucher_type == 'payment':
            # Debit: Party, Credit: Account
            JournalEntry.objects.create(
                voucher=voucher,
                ledger=validated_data.get('party', 'Unknown'),
                debit=voucher.amount or 0,
                credit=0,
                tenant_id=tenant_id
            )
            JournalEntry.objects.create(
                voucher=voucher,
                ledger=validated_data.get('account', 'Cash'),
                debit=0,
                credit=voucher.amount or 0,
                tenant_id=tenant_id
            )
        
        elif voucher_type == 'receipt':
            # Debit: Account, Credit: Party
            JournalEntry.objects.create(
                voucher=voucher,
                ledger=validated_data.get('account', 'Cash'),
                debit=voucher.amount or 0,
                credit=0,
                tenant_id=tenant_id
            )
            JournalEntry.objects.create(
                voucher=voucher,
                ledger=validated_data.get('party', 'Unknown'),
                debit=0,
                credit=voucher.amount or 0,
                tenant_id=tenant_id
            )
        
        elif voucher_type == 'contra':
            # Debit: To Account, Credit: From Account
            JournalEntry.objects.create(
                voucher=voucher,
                ledger=validated_data.get('to_account', 'Bank'),
                debit=voucher.amount or 0,
                credit=0,
                tenant_id=tenant_id
            )
            JournalEntry.objects.create(
                voucher=voucher,
                ledger=validated_data.get('from_account', 'Cash'),
                debit=0,
                credit=voucher.amount or 0,
                tenant_id=tenant_id
            )
        
        elif voucher_type == 'journal':
            # Create custom journal entries
            for entry in entries_data:
                JournalEntry.objects.create(
                    voucher=voucher,
                    ledger=entry.get('ledger'),
                    debit=entry.get('debit', 0),
                    credit=entry.get('credit', 0),
                    tenant_id=tenant_id
                )
