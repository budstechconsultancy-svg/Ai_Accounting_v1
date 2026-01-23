from django.db import models
from core.models import BaseModel

class InventoryMasterCategory(BaseModel):
    """
    Inventory Master Category Model
    Stores the master category hierarchy (Category -> Group -> Subgroup)
    """
    category = models.CharField(
        max_length=255, 
        help_text="Top-level category (e.g., RAW MATERIAL, Finished goods)",
        default="General"
    )
    group = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Group under category (optional)"
    )
    subgroup = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Subgroup under group (optional)"
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'inventory_master_category'
        unique_together = ('tenant_id', 'category', 'group', 'subgroup')
        ordering = ['category', 'group', 'subgroup']
        indexes = [
            models.Index(fields=['tenant_id', 'is_active']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        parts = [self.category]
        if self.group:
            parts.append(self.group)
        if self.subgroup:
            parts.append(self.subgroup)
        return " > ".join(parts)


class InventoryLocation(BaseModel):
    """
    Inventory Location Model
    Stores warehouse/storage locations
    """
    name = models.CharField(max_length=255, help_text="Location name", default="Main Location")
    location_type = models.CharField(
        max_length=50,
        help_text="Type of location (predefined or custom)",
        default='warehouse'
    )
    
    # Detailed Address Fields
    address_line1 = models.CharField(max_length=255, default='', help_text="Address Line 1 (Required)")
    address_line2 = models.CharField(max_length=255, null=True, blank=True, help_text="Address Line 2 (Optional)")
    address_line3 = models.CharField(max_length=255, null=True, blank=True, help_text="Address Line 3 (Optional)")
    city = models.CharField(max_length=100, default='', help_text="City")
    state = models.CharField(max_length=100, default='', help_text="State")
    country = models.CharField(max_length=100, default='India', help_text="Country")
    pincode = models.CharField(max_length=20, default='', help_text="Pincode/Zip Code")
    
    vendor_name = models.CharField(max_length=255, null=True, blank=True, help_text="Vendor/Agent Name")
    customer_name = models.CharField(max_length=255, null=True, blank=True, help_text="Customer Name")
    
    gstin = models.CharField(
        max_length=15,
        null=True,
        blank=True,
        help_text="GSTIN"
    )
    
    class Meta:
        db_table = 'inventory_master_location'
        ordering = ['name']
        indexes = [
            models.Index(fields=['tenant_id', 'name']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.location_type})"


class InventoryItem(BaseModel):
    """
    Inventory Item Model
    Stores individual inventory items/products
    """
    item_code = models.CharField(max_length=100, help_text="Item Code", default="ITEM000")
    item_name = models.CharField(max_length=255, help_text="Item Name", default="New Item")
    description = models.TextField(null=True, blank=True, help_text="Item Description")
    
    # Category Links
    category = models.ForeignKey(InventoryMasterCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='items')
    category_path = models.CharField(max_length=500, null=True, blank=True, help_text="Full category path display")
    subgroup = models.ForeignKey(InventoryMasterCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='subgroup_items')
    
    # Vendor Specific
    is_vendor_specific = models.BooleanField(default=False)
    vendor_specific_name = models.CharField(max_length=255, null=True, blank=True)
    vendor_specific_suffix = models.CharField(max_length=50, null=True, blank=True)
    
    # Units
    uom = models.CharField(max_length=50, help_text="Unit of Measure", default="nos")
    alternate_uom = models.CharField(max_length=50, null=True, blank=True)
    conversion_factor = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    
    # Pricing & Tax
    rate = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    rate_unit = models.CharField(max_length=50, null=True, blank=True)
    hsn_code = models.CharField(max_length=20, null=True, blank=True)
    gst_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Other
    reorder_level = models.CharField(max_length=255, null=True, blank=True)
    is_saleable = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inventory_master_inventoryitems'
        ordering = ['item_name']
        indexes = [
            models.Index(fields=['tenant_id', 'item_code']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f"{self.item_code} - {self.item_name}"


class InventoryUnit(BaseModel):
    name = models.CharField(max_length=100, default="Number")  # e.g. Kilogram
    symbol = models.CharField(max_length=50, default="nos") # e.g. kg
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inventory_unit'

    def __str__(self):
        return f"{self.name} ({self.symbol})"


class InventoryMasterGRN(BaseModel):
    """
    GRN (Goods Receipt Note) Master Configuration.
    """
    name = models.CharField(max_length=255, help_text="GRN Series Name", default="GRN Series")
    grn_type = models.CharField(max_length=100, help_text="GRN Type (job_work, purchase, import, other)", default="other")
    prefix = models.CharField(max_length=50, null=True, blank=True)
    suffix = models.CharField(max_length=50, null=True, blank=True)
    year = models.CharField(max_length=4, help_text="Year", default="2024")
    required_digits = models.IntegerField(help_text="Required Digits", default=4)
    preview = models.CharField(max_length=255, null=True, blank=True)
    
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inventory_master_grn'
        ordering = ['name']

    def __str__(self):
        return self.name


class InventoryMasterIssueSlip(BaseModel):
    """
    Issue Slip Master Configuration.
    """
    name = models.CharField(max_length=255, help_text="Issue Slip Series Name", default="Issue Slip Series")
    issue_slip_type = models.CharField(max_length=100, help_text="Issue Slip Type (internal_transfer, customer_return, damage, other)", default="other")
    prefix = models.CharField(max_length=50, null=True, blank=True)
    suffix = models.CharField(max_length=50, null=True, blank=True)
    year = models.CharField(max_length=4, help_text="Year", default="2024")
    required_digits = models.IntegerField(help_text="Required Digits", default=4)
    preview = models.CharField(max_length=255, null=True, blank=True)
    
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inventory_master_issueslip'
        ordering = ['name']

    def __str__(self):
        return self.name
