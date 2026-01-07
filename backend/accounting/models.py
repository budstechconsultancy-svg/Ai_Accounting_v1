from django.db import models
from django.utils import timezone
from core.models import BaseModel

# ============================================================================
# NEW PRODUCTION COA ARCHITECTURE (ERP Grade)
# ============================================================================

class MasterChartOfAccounts(models.Model):
    """
    Global read-only master hierarchy for Chart of Accounts.
    Standardized across all tenants.
    """
    type_of_business = models.CharField(max_length=255)
    financial_reporting = models.CharField(max_length=255)
    major_group = models.CharField(max_length=255)
    group = models.CharField(max_length=255)
    sub_group_1 = models.CharField(max_length=255, null=True, blank=True)
    sub_group_2 = models.CharField(max_length=255, null=True, blank=True)
    sub_group_3 = models.CharField(max_length=255, null=True, blank=True)
    ledger_name = models.CharField(max_length=255, null=True, blank=True)
    ledger_code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    
    level_depth = models.IntegerField(default=1)
    import_version = models.CharField(max_length=20, default='1.0')
    imported_at = models.DateTimeField(auto_now_add=True)
    
    # helper for UI
    is_leaf = models.BooleanField(default=False)

    class Meta:
        db_table = 'master_chart_of_accounts'
        verbose_name_plural = "Master Chart of Accounts"

    def __str__(self):
        return f"{self.ledger_name} ({self.ledger_code})" if self.ledger_name else self.group

class TenantLedger(BaseModel):
    """
    Tenant-specific selection of ledgers from the master.
    """
    master_ledger = models.ForeignKey(MasterChartOfAccounts, on_delete=models.RESTRICT)
    custom_alias = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'tenant_ledgers'
        unique_together = ('tenant_id', 'master_ledger')

    def __str__(self):
        return self.custom_alias or self.master_ledger.ledger_name

# ============================================================================
# LEGACY MODELS (Maintained for backward compatibility and current registration)
# ============================================================================

class MasterLedgerGroup(BaseModel):
    name = models.CharField(max_length=255)
    parent = models.CharField(max_length=255, null=True, blank=True, help_text="Parent group name")
    
    class Meta:
        db_table = 'master_ledger_groups'
        unique_together = ('name', 'tenant_id')

    def __str__(self):
        return self.name

class MasterLedger(BaseModel):
    REG_TYPE_CHOICES = [
        ('Registered', 'Registered'),
        ('Unregistered', 'Unregistered'),
        ('Composition', 'Composition'),
    ]
    name = models.CharField(max_length=255)
    group = models.CharField(max_length=255, help_text="Ledger group name")
    
    # Hierarchy fields (Migration 0004+)
    category = models.CharField(max_length=255, null=True, blank=True)
    sub_group_1 = models.CharField(max_length=255, null=True, blank=True)
    sub_group_2 = models.CharField(max_length=255, null=True, blank=True)
    sub_group_3 = models.CharField(max_length=255, null=True, blank=True)
    ledger_type = models.CharField(max_length=255, null=True, blank=True)
    
    gstin = models.CharField(max_length=15, null=True, blank=True)
    registration_type = models.CharField(max_length=20, choices=REG_TYPE_CHOICES, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    
    extended_data = models.JSONField(
        null=True, 
        blank=True, 
        help_text="Group-specific fields (e.g., cashLocation, loanAccountNumber)"
    )
    
    # Parent ledger for nested custom ledgers
    parent_ledger_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="ID of parent custom ledger for nested structure"
    )
    
    # Auto-assigned ledger code based on hierarchy
    code = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        unique=True,
        db_column='ledger_code',
        help_text="Auto-generated code based on hierarchy position"
    )
    
    # Dynamic question answers (NEW FIELD for questions system)
    additional_data = models.JSONField(
        null=True,
        blank=True,
        help_text="Stores answers to dynamic questions (e.g., opening balance, GSTIN, credit limit)"
    )

    class Meta:
        db_table = 'master_ledgers'
        unique_together = ('name', 'tenant_id')

    def __str__(self):
        return f"{self.name} ({self.group})"

class MasterVoucherConfig(BaseModel):
    name = models.CharField(max_length=255, default='__NUMBERING__')
    
    sales_enable_auto = models.BooleanField(default=True)
    sales_prefix = models.CharField(max_length=50, null=True, blank=True)
    sales_suffix = models.CharField(max_length=50, null=True, blank=True)
    sales_next_number = models.PositiveBigIntegerField(default=1)
    sales_padding = models.IntegerField(default=4)
    sales_preview = models.CharField(max_length=255, null=True, blank=True)
    
    purchase_enable_auto = models.BooleanField(default=True)
    purchase_prefix = models.CharField(max_length=50, null=True, blank=True)
    purchase_suffix = models.CharField(max_length=50, null=True, blank=True)
    purchase_next_number = models.PositiveBigIntegerField(default=1)
    purchase_padding = models.IntegerField(default=4)
    purchase_preview = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'master_voucher_config'

class Voucher(BaseModel):
    VOUCHER_TYPES = [
        ('sales', 'Sales'),
        ('purchase', 'Purchase'),
        ('payment', 'Payment'),
        ('receipt', 'Receipt'),
        ('contra', 'Contra'),
        ('journal', 'Journal'),
    ]
    type = models.CharField(max_length=20, choices=VOUCHER_TYPES)
    voucher_number = models.CharField(max_length=50)
    date = models.DateField(default=timezone.now)
    party = models.CharField(max_length=255, null=True, blank=True)
    account = models.CharField(max_length=255, null=True, blank=True, help_text="Payment/Receipt account (Cash/Bank)")
    amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)
    narration = models.TextField(null=True, blank=True)
    
    # Sales/Purchase specific
    invoice_no = models.CharField(max_length=50, null=True, blank=True)
    is_inter_state = models.BooleanField(default=False, null=True, blank=True)
    total_taxable_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)
    total_cgst = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)
    total_sgst = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)
    total_igst = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)
    
    # Journal/Unified fields
    total_debit = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)
    total_credit = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)
    
    # Contra specific
    from_account = models.CharField(max_length=255, null=True, blank=True)
    to_account = models.CharField(max_length=255, null=True, blank=True)
    
    items_data = models.JSONField(null=True, blank=True, help_text="Line items with qty, rate, etc")

    class Meta:
        db_table = 'vouchers'
        unique_together = ('voucher_number', 'tenant_id', 'type')
        ordering = ['-date']
        indexes = [
            models.Index(fields=['type', 'tenant_id', 'date']),
            models.Index(fields=['tenant_id', 'date']),
        ]

class JournalEntry(BaseModel):
    voucher = models.ForeignKey(Voucher, on_delete=models.CASCADE, related_name='journal_entries')
    ledger = models.CharField(max_length=255)
    debit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'journal_entries'
        indexes = [
            models.Index(fields=['voucher', 'tenant_id']),
        ]

class MasterHierarchyRaw(models.Model):
    """
    Global hierarchy data (unmanaged, maps to existing table).
    This represents the complete COA from the original project source.
    """
    # Explicitly adding ID as requested in previous sessions
    id = models.AutoField(primary_key=True)
    
    major_group_1 = models.TextField(null=True, blank=True)
    group_1 = models.TextField(null=True, blank=True)
    sub_group_1_1 = models.TextField(null=True, blank=True)
    sub_group_2_1 = models.TextField(null=True, blank=True)
    sub_group_3_1 = models.TextField(null=True, blank=True)
    ledger_1 = models.TextField(null=True, blank=True)
    code = models.TextField(null=True, blank=True)
    
    class Meta:
        managed = False
        db_table = 'master_hierarchy_raw'
class ExtractedInvoice(BaseModel):
    """
    Stores data extracted from invoices via OCR.
    Supports 109 fields mapping to the Excel export specification.
    """
    # General Details
    voucher_date = models.CharField(max_length=20, null=True, blank=True)
    invoice_number = models.CharField(max_length=100, null=True, blank=True)
    po_number = models.CharField(max_length=100, null=True, blank=True)
    po_date = models.CharField(max_length=20, null=True, blank=True)
    
    # Supplier Details
    supplier_name = models.CharField(max_length=255, null=True, blank=True)
    bill_from_address = models.TextField(null=True, blank=True)
    ship_from_address = models.TextField(null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=100, null=True, blank=True)
    sales_person = models.CharField(max_length=255, null=True, blank=True)
    gstin = models.CharField(max_length=15, null=True, blank=True)
    pan = models.CharField(max_length=10, null=True, blank=True)
    msme_number = models.CharField(max_length=50, null=True, blank=True)
    payment_terms = models.CharField(max_length=255, null=True, blank=True)
    delivery_terms = models.CharField(max_length=255, null=True, blank=True)
    
    # Ledger Details
    ledger_amount = models.CharField(max_length=50, null=True, blank=True)
    ledger_rate = models.CharField(max_length=50, null=True, blank=True)
    ledger_dr_cr = models.CharField(max_length=10, null=True, blank=True, db_column='ledger_amount_dr_cr')
    ledger_narration = models.TextField(null=True, blank=True)
    ledger_description = models.TextField(null=True, blank=True, db_column='description_of_ledger')
    tax_payment_type = models.CharField(max_length=100, null=True, blank=True, db_column='type_of_tax_payment')
    
    # Item Details
    item_code = models.CharField(max_length=100, null=True, blank=True)
    item_description = models.TextField(null=True, blank=True, db_column='item_description')
    quantity = models.CharField(max_length=50, null=True, blank=True)
    uom = models.CharField(max_length=50, null=True, blank=True, db_column='quantity_uom')
    item_rate = models.CharField(max_length=50, null=True, blank=True)
    discount_pct = models.CharField(max_length=50, null=True, blank=True, db_column='disc_pct')
    item_amount = models.CharField(max_length=50, null=True, blank=True)
    marks = models.CharField(max_length=255, null=True, blank=True)
    num_packages = models.CharField(max_length=50, null=True, blank=True, db_column='no_of_packages')
    freight_charges = models.CharField(max_length=50, null=True, blank=True)
    
    # HSN/SAC
    hsn_sac = models.CharField(max_length=20, null=True, blank=True, db_column='hsn_sac_details')
    
    # GST Details
    gst_rate = models.CharField(max_length=50, null=True, blank=True)
    igst_amount = models.CharField(max_length=50, null=True, blank=True)
    cgst_amount = models.CharField(max_length=50, null=True, blank=True)
    sgst_amount = models.CharField(max_length=50, null=True, blank=True, db_column='sgst_utgst_amount')
    cess_rate = models.CharField(max_length=50, null=True, blank=True)
    cess_amount = models.CharField(max_length=50, null=True, blank=True)
    state_cess_rate = models.CharField(max_length=50, null=True, blank=True)
    state_cess_amount = models.CharField(max_length=50, null=True, blank=True)
    reverse_charge = models.CharField(max_length=10, null=True, blank=True, db_column='applicable_for_reverse_charge')
    taxable_value = models.CharField(max_length=50, null=True, blank=True)
    invoice_value = models.CharField(max_length=50, null=True, blank=True)
    
    # Flexible Storage for all 109 fields
    additional_fields = models.JSONField(null=True, blank=True, help_text="Stores the remaining 60+ fields dynamically")

    class Meta:
        db_table = 'extracted_invoices'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.invoice_number} - {self.supplier_name}"
