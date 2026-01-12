from rest_framework import serializers
from .models import InventoryCategory, InventoryLocation, InventoryItem


class InventoryCategorySerializer(serializers.ModelSerializer):
    """Serializer for Inventory Category"""
    
    full_path = serializers.ReadOnlyField()
    level = serializers.ReadOnlyField()
    subcategories_count = serializers.SerializerMethodField()
    parent_name = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryCategory
        fields = [
            'id', 'name', 'parent', 'parent_name', 'is_system', 
            'is_active', 'description', 'display_order',
            'full_path', 'level', 'subcategories_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_system']
    
    def get_subcategories_count(self, obj):
        """Get count of subcategories"""
        return obj.subcategories.filter(is_active=True).count()
    
    def get_parent_name(self, obj):
        """Get parent category name"""
        return obj.parent.name if obj.parent else None
    
    def validate(self, data):
        """Validate category data"""
        # Prevent circular references
        if 'parent' in data and data['parent']:
            parent = data['parent']
            if parent.id == self.instance.id if self.instance else None:
                raise serializers.ValidationError({
                    'parent': 'A category cannot be its own parent'
                })
        
        return data


class InventoryCategoryTreeSerializer(serializers.ModelSerializer):
    """Serializer for Category Tree View"""
    
    subcategories = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryCategory
        fields = ['id', 'name', 'is_system', 'is_active', 'subcategories']
    
    def get_subcategories(self, obj):
        """Recursively get subcategories"""
        subcats = obj.subcategories.filter(is_active=True).order_by('display_order', 'name')
        return InventoryCategoryTreeSerializer(subcats, many=True).data


class InventoryLocationSerializer(serializers.ModelSerializer):
    """Serializer for Inventory Location"""
    
    location_type_display = serializers.CharField(source='get_location_type_display', read_only=True)
    
    class Meta:
        model = InventoryLocation
        fields = [
            'id', 'name', 'location_type', 'location_type_display',
            'address_line1', 'address_line2', 'address_line3',
            'city', 'state', 'country', 'pincode',
            'gstin', 'is_active', 'is_default',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_gstin(self, value):
        """Validate GSTIN format if provided"""
        if value and len(value) != 15:
            raise serializers.ValidationError('GSTIN must be exactly 15 characters')
        return value


class InventoryItemSerializer(serializers.ModelSerializer):
    """Serializer for Inventory Item"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    
    class Meta:
        model = InventoryItem
        fields = [
            'id', 'item_code', 'name', 'category', 'category_name',
            'hsn_code', 'description', 'unit',
            'has_multiple_units', 'alternative_unit', 'conversion_factor',
            'gst_rate', 'rate', 'location', 'location_name',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """
        Validation logic for item
        """
        # If alternative unit is selected, conversion factor is required? 
        # Not explicitly enforced by model, but good for UI logic.
        # User requirement: "1 box = 200 nos" - implies conversion factor is needed if simple boolean is checked?
        # For now, we trust the frontend or basic model constraints.
        return data
