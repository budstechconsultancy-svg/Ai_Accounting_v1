from django.db import models
from core.models import BaseModel

# ============================================================================
# MASTER MODELS - Separate tables for each master type
# ============================================================================

class MasterLedgerGroup(BaseModel):
    """Ledger Groups - formerly Master with type='LedgerGroup'"""
    name = models.CharField(max_length=255)
    parent = models.CharField(max_length=255, blank=True, null=True, help_text="Parent group name")
    
    class Meta:
        db_table = 'master_ledger_groups'
        unique_together = ('name', 'tenant_id')
    
    def __str__(self):
        return self.name


class MasterLedger(BaseModel):
    """Ledgers - formerly Master with type='Ledger'"""
    name = models.CharField(max_length=255)
    group = models.CharField(max_length=255, help_text="Ledger group name")
    gstin = models.CharField(max_length=15, blank=True, null=True)
    registration_type = models.CharField(
        max_length=20,
        choices=[
            ('Registered', 'Registered'),
            ('Unregistered', 'Unregistered'),
            ('Composition', 'Composition'),
        ],
        blank=True,
        null=True
    )
    state = models.CharField(max_length=100, blank=True, null=True)
    
    # Extended data for conditional fields based on ledger group
    # Stores fields like cashLocation, loanAccountNumber, inventoryType, etc.
    extended_data = models.JSONField(
        blank=True, 
        null=True,
        help_text="Group-specific fields (e.g., cashLocation for Cash group, loanAccountNumber for Secured Loans)"
    )
    
    class Meta:
        db_table = 'master_ledgers'
        unique_together = ('name', 'tenant_id')
    
    def __str__(self):
        return self.name


class MasterVoucherConfig(BaseModel):
    """Voucher numbering configuration - formerly Master with type='Voucher'"""
    name = models.CharField(max_length=255, default='__NUMBERING__')
    
    # Sales voucher numbering
    sales_enable_auto = models.BooleanField(default=True)
    sales_prefix = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. INV-")
    sales_suffix = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. /24-25")
    sales_next_number = models.PositiveBigIntegerField(default=1)
    sales_padding = models.IntegerField(default=4)
    sales_preview = models.CharField(max_length=255, blank=True, null=True)
    
    # Purchase voucher numbering
    purchase_enable_auto = models.BooleanField(default=True)
    purchase_prefix = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. PO-")
    purchase_suffix = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. /24-25")
    purchase_next_number = models.PositiveBigIntegerField(default=1)
    purchase_padding = models.IntegerField(default=4)
    purchase_preview = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        db_table = 'master_voucher_config'
    
    def __str__(self):
        return f"Voucher Config - Tenant {self.tenant_id}"


# ============================================================================
# VOUCHER MODELS - Unified table with type column
# ============================================================================

class Voucher(BaseModel):
    """Unified Voucher model for all voucher types"""
    
    # Type field to distinguish voucher types
    type = models.CharField(max_length=20, choices=[
        ('sales', 'Sales'),
        ('purchase', 'Purchase'),
        ('payment', 'Payment'),
        ('receipt', 'Receipt'),
        ('contra', 'Contra'),
        ('journal', 'Journal'),
    ])
    
    # Common fields for all voucher types
    voucher_number = models.CharField(max_length=50)
    date = models.DateField()
    narration = models.TextField(blank=True, null=True)
    
    # Fields for Sales & Purchase vouchers
    party = models.CharField(max_length=255, blank=True, null=True)
    invoice_no = models.CharField(max_length=100, blank=True, null=True)
    is_inter_state = models.BooleanField(default=False, null=True, blank=True)
    
    total_taxable_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)
    total_cgst = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)
    total_sgst = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)
    total_igst = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)
    
    items_data = models.JSONField(null=True, blank=True, help_text="Line items with qty, rate, etc")
    
    # Fields for Payment & Receipt vouchers
    account = models.CharField(max_length=255, blank=True, null=True, help_text="Payment/Receipt account (Cash/Bank)")
    amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Fields for Contra vouchers
    from_account = models.CharField(max_length=255, blank=True, null=True)
    to_account = models.CharField(max_length=255, blank=True, null=True)
    
    # Fields for Journal vouchers
    total_debit = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)
    total_credit = models.DecimalField(max_digits=15, decimal_places=2, default=0, null=True, blank=True)
    
    class Meta:
        db_table = 'vouchers'
        ordering = ['-date']
        unique_together = ('voucher_number', 'tenant_id', 'type')
        indexes = [
            models.Index(fields=['type', 'tenant_id', 'date']),
            models.Index(fields=['tenant_id', 'date']),
        ]
    
    def __str__(self):
        return f"{self.get_type_display()} {self.voucher_number}"


# ============================================================================
# JOURNAL ENTRIES - Linked to unified voucher table
# ============================================================================

class JournalEntry(BaseModel):
    """Journal entries for all voucher types"""
    voucher = models.ForeignKey('Voucher', on_delete=models.CASCADE, related_name='journal_entries')
    
    ledger = models.CharField(max_length=255)
    debit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'journal_entries'
        indexes = [
            models.Index(fields=['voucher', 'tenant_id']),
        ]
    
    @property
    def entry_type(self):
        return 'Dr' if self.debit > 0 else 'Cr'
    
    @property
    def amount(self):
        return self.debit if self.debit > 0 else self.credit
    
    def __str__(self):
        return f"{self.ledger} - {self.entry_type} {self.amount}"
