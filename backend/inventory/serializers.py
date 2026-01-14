from rest_framework import serializers
from .models import InventoryMasterCategory


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
