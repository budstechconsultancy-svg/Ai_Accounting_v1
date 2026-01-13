from django.db import models
from inventory.models import InventoryCategory

class POSeries(models.Model):
    name = models.CharField(max_length=100, help_text="Name of PO series")
    category = models.ForeignKey(
        InventoryCategory,
        on_delete=models.PROTECT,
        related_name='po_series',
        null=True,
        blank=True,
        help_text="Category of the PO Series"
    )
    prefix = models.CharField(max_length=50, blank=True, null=True, help_text="Prefix for the PO Number, e.g., PO/")
    suffix = models.CharField(max_length=50, blank=True, null=True, help_text="Suffix for the PO Number, e.g., /2024")
    
    # Financial Year logic: The user wants it to change automatically. 
    # Valid options might be: 'Auto' (Use current FY), 'Static' (Use specific string), or 'None'.
    # Given the checkbox-like description, a boolean "auto_financial_year" is best for now.
    auto_financial_year = models.BooleanField(default=True, help_text="Automatically include financial year")
    
    digits = models.IntegerField(default=4, help_text="Number of digits for the sequence")
    current_value = models.IntegerField(default=1, help_text="Next number in the sequence")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vendors_po_series'
        verbose_name = 'PO Series'
        verbose_name_plural = 'PO Series'

    def __str__(self):
        return self.name
