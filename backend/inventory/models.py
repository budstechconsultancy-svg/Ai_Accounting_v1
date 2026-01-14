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
<<<<<<< HEAD
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
