from rest_framework import serializers
from .models import InventoryMasterCategory, InventoryLocation


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

