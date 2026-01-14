from django.db import models
from django.utils import timezone
from core.models import BaseModel


class InventoryMasterCategory(BaseModel):
    """
    Inventory Master Category Model
    Stores the master category hierarchy (Category -> Group -> Subgroup)
    This is a flat lookup table for category definitions
    """
    category = models.CharField(
        max_length=255, 
        help_text="Top-level category (e.g., RAW MATERIAL, Finished goods)"
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
    
    @property
    def full_path(self):
        """Get full category path"""
        return str(self)


class InventoryLocation(BaseModel):
    """
    Inventory Location Model
    Stores warehouse/storage locations
    """
    LOCATION_TYPES = [
        ('warehouse', 'Warehouse'),
        ('store', 'Store'),
        ('godown', 'Godown'),
        ('factory', 'Factory'),
        ('office', 'Office'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=255, help_text="Location name")
    location_type = models.CharField(
        max_length=50,
        help_text="Type of location (predefined or custom)"
    )
    
    # Detailed Address Fields
    address_line1 = models.CharField(max_length=255, default='', help_text="Address Line 1 (Required)")
    address_line2 = models.CharField(max_length=255, null=True, blank=True, help_text="Address Line 2 (Optional)")
    address_line3 = models.CharField(max_length=255, null=True, blank=True, help_text="Address Line 3 (Optional)")
    city = models.CharField(max_length=100, default='', help_text="City")
    state = models.CharField(max_length=100, default='', help_text="State")
    country = models.CharField(max_length=100, default='India', help_text="Country")
    pincode = models.CharField(max_length=20, default='', help_text="Pincode/Zip Code")
    
    gstin = models.CharField(
        max_length=15,
        null=True,
        blank=True,
        help_text="GSTIN"
    )

class InventoryStockGroup(BaseModel):
    name = models.CharField(max_length=255)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='children')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inventory_stock_group'

    def __str__(self):
        return self.name

class InventoryUnit(BaseModel):
    name = models.CharField(max_length=100)  # e.g. Kilogram
    symbol = models.CharField(max_length=50) # e.g. kg
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inventory_unit'

    def __str__(self):
        return f"{self.name} ({self.symbol})"

class InventoryStockItem(BaseModel):
    name = models.CharField(max_length=255)
    group = models.ForeignKey(InventoryStockGroup, on_delete=models.PROTECT, related_name='items', null=True, blank=True)
    unit = models.ForeignKey(InventoryUnit, on_delete=models.PROTECT, related_name='items', null=True, blank=True)
    
    # Pricing
    standard_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0) # Purchase Rate
    standard_price = models.DecimalField(max_digits=12, decimal_places=2, default=0) # Selling Rate
    
    # Taxation
    hsn_code = models.CharField(max_length=20, blank=True, null=True)
    gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Opening Balance
    opening_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    opening_rate = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    opening_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inventory_stock_item'

    def __str__(self):
        return self.name

class StockMovement(BaseModel):
    item = models.ForeignKey(InventoryStockItem, on_delete=models.CASCADE, related_name='movements')
    date = models.DateField(default=timezone.now)
    
    voucher_type = models.CharField(max_length=50) # Sales, Purchase, etc.
    voucher_id = models.CharField(max_length=100, blank=True, null=True) # ID of the source voucher
    
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    rate = models.DecimalField(max_digits=12, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    MOVEMENT_TYPES = [('IN', 'In'), ('OUT', 'Out')]
    direction = models.CharField(max_length=10, choices=MOVEMENT_TYPES)
    
    narraration = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'inventory_stock_movement'
