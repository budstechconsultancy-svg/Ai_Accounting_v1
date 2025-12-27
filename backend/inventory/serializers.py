from rest_framework import serializers
from .models import InventoryStockGroup, InventoryUnit, InventoryStockItem, StockMovement

# ============================================================================
# INVENTORY SERIALIZERS
# ============================================================================

from core.utils import TenantModelSerializerMixin

class InventoryStockGroupSerializer(TenantModelSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = InventoryStockGroup
        fields = ['id', 'name', 'parent', 'tenant_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']


class InventoryUnitSerializer(TenantModelSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = InventoryUnit
        fields = ['id', 'name', 'symbol', 'tenant_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']


class InventoryStockItemSerializer(TenantModelSerializerMixin, serializers.ModelSerializer):
    hsnCode = serializers.CharField(source='hsn_code', required=False, allow_blank=True, allow_null=True)
    gstRate = serializers.DecimalField(source='gst_rate', max_digits=5, decimal_places=2, required=False)
    openingBalance = serializers.DecimalField(source='opening_balance', max_digits=15, decimal_places=3, required=False)
    currentBalance = serializers.DecimalField(source='current_balance', max_digits=15, decimal_places=3, read_only=True)

    class Meta:
        model = InventoryStockItem
        fields = [
            'id', 'name', 'group', 'unit', 'openingBalance', 'currentBalance',
            'rate', 'hsnCode', 'gstRate', 'description',
            'tenant_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set current_balance to opening_balance initially
        if 'opening_balance' in validated_data and 'current_balance' not in validated_data:
            validated_data['current_balance'] = validated_data['opening_balance']
        
        return super().create(validated_data)


class StockMovementSerializer(TenantModelSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = '__all__'
        read_only_fields = ['id', 'tenant_id', 'created_at', 'updated_at', 'balance_quantity']
