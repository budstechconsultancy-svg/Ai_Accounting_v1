from rest_framework import serializers
from .models import VendorMasterCategory


class VendorMasterCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Vendor Master Category
    """
    full_path = serializers.ReadOnlyField()
    
    class Meta:
        model = VendorMasterCategory
        fields = [
            'id',
            'tenant_id',
            'category',
            'group',
            'subgroup',
            'full_path',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at', 'full_path']
