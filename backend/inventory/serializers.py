from rest_framework import serializers
from .models import (
    InventoryMasterCategory, InventoryLocation, InventoryItem, InventoryUnit,
    InventoryMasterGRN, InventoryMasterIssueSlip
)

class InventoryMasterCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryMasterCategory
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']

class InventoryLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryLocation
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']

class InventoryUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryUnit
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']

class InventoryMasterGRNSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryMasterGRN
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']

class InventoryMasterIssueSlipSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryMasterIssueSlip
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']
