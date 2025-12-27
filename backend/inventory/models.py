from django.db import models
from core.models import BaseModel

# ============================================================================
# INVENTORY MODELS - Separate tables for each inventory type
# ============================================================================

class InventoryStockGroup(BaseModel):
    """Stock Groups - formerly InventoryMaster with type='StockGroup'"""
    name = models.CharField(max_length=255)
    parent = models.CharField(max_length=255, blank=True, null=True, help_text="Parent group name")
    
    class Meta:
        db_table = 'inventory_stock_groups'
        unique_together = ('name', 'tenant_id')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class InventoryUnit(BaseModel):
    """Units of Measurement - formerly InventoryMaster with type='Unit'"""
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=20, help_text="e.g., Kg, L, Pcs")
    
    class Meta:
        db_table = 'inventory_units'
        unique_together = ('name', 'tenant_id')
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.symbol})"


class InventoryStockItem(BaseModel):
    """Stock Items - formerly InventoryMaster with type='StockItem'"""
    name = models.CharField(max_length=255)
    group = models.CharField(max_length=255, help_text="Stock group name")
    unit = models.CharField(max_length=100, help_text="Unit name")
    
    # Stock tracking
    opening_balance = models.DecimalField(max_digits=15, decimal_places=3, default=0, help_text="Opening stock quantity")
    current_balance = models.DecimalField(max_digits=15, decimal_places=3, default=0, help_text="Current stock quantity")
    
    # Pricing
    rate = models.DecimalField(max_digits=15, decimal_places=2, default=0, help_text="Default rate/price")
    
    # GST
    hsn_code = models.CharField(max_length=20, blank=True, null=True)
    gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="GST percentage")
    
    # Additional info
    description = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'inventory_stock_items'
        unique_together = ('name', 'tenant_id')
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.unit})"


# ============================================================================
# STOCK MOVEMENTS - Track inventory transactions
# ============================================================================

class StockMovement(BaseModel):
    """Track stock movements for all transactions"""
    stock_item = models.CharField(max_length=255, help_text="Stock item name")
    
    # Transaction reference
    transaction_type = models.CharField(max_length=20, choices=[
        ('sales', 'Sales'),
        ('purchase', 'Purchase'),
        ('adjustment', 'Stock Adjustment'),
    ])
    transaction_id = models.BigIntegerField(null=True, blank=True)
    transaction_date = models.DateField()
    
    # Movement details
    quantity = models.DecimalField(max_digits=15, decimal_places=3)
    movement_type = models.CharField(max_length=10, choices=[
        ('in', 'Stock In'),
        ('out', 'Stock Out'),
    ])
    
    # Pricing
    rate = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Balance after movement
    balance_quantity = models.DecimalField(max_digits=15, decimal_places=3, default=0)
    
    narration = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'stock_movements'
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['stock_item', 'transaction_date']),
            models.Index(fields=['transaction_type', 'transaction_id']),
        ]
    
    def __str__(self):
        return f"{self.stock_item} - {self.movement_type} {self.quantity}"
