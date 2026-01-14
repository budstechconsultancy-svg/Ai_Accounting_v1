from rest_framework import serializers
from .models import (
    InventoryMasterCategory, InventoryLocation,
    InventoryStockGroup, InventoryUnit, InventoryStockItem, StockMovement
)


class InventoryMasterCategorySerializer(serializers.ModelSerializer):
    """Serializer for Inventory Master Category"""
    full_path = serializers.ReadOnlyField()
    
    class Meta:
        model = InventoryMasterCategory
        fields = [
            'id', 'category', 'group', 'subgroup', 
            'is_active', 'full_path', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_path']


class InventoryLocationSerializer(serializers.ModelSerializer):
    """Serializer for Inventory Location"""
    
    location_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryLocation
        fields = [
            'id', 'name', 'location_type', 'location_type_display',
            'address_line1', 'address_line2', 'address_line3',
            'city', 'state', 'country', 'pincode',
            'gstin', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_location_type_display(self, obj):
        """Get display name for location type"""
        # Check if it's a predefined type
        for value, label in InventoryLocation.LOCATION_TYPES:
            if obj.location_type == value:
                return label
        # If not predefined, return the custom value with title case
        return obj.location_type.title() if obj.location_type else ''
    
    def validate_gstin(self, value):
        """Validate GSTIN format if provided"""
        if value and len(value) != 15:
            raise serializers.ValidationError('GSTIN must be exactly 15 characters')
        return value

class InventoryStockGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryStockGroup
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'tenant_id']

class InventoryUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryUnit
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'tenant_id']

class InventoryStockItemSerializer(serializers.ModelSerializer):
    group_name = serializers.CharField(source='group.name', read_only=True)
    unit_name = serializers.CharField(source='unit.symbol', read_only=True)
    
    class Meta:
        model = InventoryStockItem
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'tenant_id']

class StockMovementSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'tenant_id']

