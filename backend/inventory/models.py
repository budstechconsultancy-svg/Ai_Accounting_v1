from django.db import models
from django.utils import timezone
from core.models import BaseModel


class InventoryCategory(BaseModel):
    """
    Inventory Category Model
    Stores inventory categories with hierarchical structure
    """
    name = models.CharField(max_length=255, help_text="Category name")
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories',
        help_text="Parent category for hierarchical structure"
    )
    is_system = models.BooleanField(
        default=False,
        help_text="System-defined categories cannot be deleted"
    )
    is_active = models.BooleanField(default=True)
    description = models.TextField(null=True, blank=True)
    display_order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'inventory_categories'
        unique_together = ('tenant_id', 'name', 'parent')
        ordering = ['display_order', 'name']
        indexes = [
            models.Index(fields=['tenant_id', 'is_active']),
            models.Index(fields=['parent']),
        ]
    
    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name
    
    @property
    def full_path(self):
        """Get full category path"""
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name
    
    @property
    def level(self):
        """Get category level (0 for root, 1 for first level, etc.)"""
        if self.parent:
            return self.parent.level + 1
        return 0


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
        help_text="GSTIN for this location (optional)"
    )
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(
        default=False,
        help_text="Default location for transactions"
    )
    
    class Meta:
        db_table = 'inventory_locations'
        unique_together = ('tenant_id', 'name')
        ordering = ['-is_default', 'name']
        indexes = [
            models.Index(fields=['tenant_id', 'is_active']),
            models.Index(fields=['location_type']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_location_type_display()})"


class InventoryItem(BaseModel):
    """
    Inventory Item Model
    """
    UNIT_CHOICES = [
        ('nos', 'Numbers'),
        ('kg', 'Kilograms'),
        ('gm', 'Grams'),
        ('m', 'Meters'),
        ('cm', 'Centimeters'),
        ('l', 'Liters'),
        ('ml', 'Milliliters'),
        ('box', 'Box'),
        ('pch', 'Pouch'),
        ('set', 'Set'),
        ('pcs', 'Pieces'),
        ('doz', 'Dozen'),
        ('bag', 'Bag'),
        ('bdl', 'Bundle'),
        ('can', 'Can'),
        ('btl', 'Bottle'),
    ]

    item_code = models.CharField(max_length=50, help_text="Auto or Custom Item Code")
    name = models.CharField(max_length=255, help_text="Item Name")
    category = models.ForeignKey(
        InventoryCategory, 
        on_delete=models.PROTECT, 
        related_name='items',
        help_text="Category from master"
    )
    hsn_code = models.CharField(max_length=20, null=True, blank=True, help_text="HSN Code")
    description = models.TextField(null=True, blank=True, help_text="Description (Automatic from HSN logic placeholder)")
    
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='nos', help_text="Primary Unit")
    
    # Multiple units logic
    has_multiple_units = models.BooleanField(default=False, help_text="Show multiple units")
    alternative_unit = models.CharField(
        max_length=20, 
        choices=UNIT_CHOICES, 
        null=True, 
        blank=True,
        help_text="Alternative Unit"
    )
    conversion_factor = models.DecimalField(
        max_digits=10, 
        decimal_places=4, 
        null=True, 
        blank=True, 
        help_text="Factor to convert: 1 Alternative Unit = X Primary Unit (e.g., 1 Box = 200 Nos)"
    )
    
    gst_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.00,
        help_text="GST Rate (%)"
    )
    rate = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0.00,
        help_text="Rate per unit"
    )
    
    location = models.ForeignKey(
        InventoryLocation, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='items',
        help_text="Default Location"
    )
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'inventory_items'
        unique_together = ('tenant_id', 'item_code')
        ordering = ['name']
        indexes = [
            models.Index(fields=['tenant_id', 'name']),
            models.Index(fields=['hsn_code']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return f"{self.item_code} - {self.name}"
