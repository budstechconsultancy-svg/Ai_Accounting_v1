from rest_framework import serializers
from .models import (
    InventoryMasterCategory, InventoryLocation, InventoryItem, InventoryUnit,
    InventoryMasterGRN, InventoryMasterIssueSlip,
    InventoryOperationJobWork, InventoryOperationJobWorkItem,
    InventoryOperationInterUnit, InventoryOperationInterUnitItem,
    InventoryOperationLocationChange, InventoryOperationLocationChangeItem,
    InventoryOperationProduction, InventoryOperationProductionItem,
    InventoryOperationConsumption, InventoryOperationConsumptionItem,
    InventoryOperationScrap, InventoryOperationScrapItem,
    InventoryOperationOutward, InventoryOperationOutwardItem,
    InventoryOperationDeliveryChallan, InventoryOperationEWayBill
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

class InventoryOperationDeliveryChallanSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryOperationDeliveryChallan
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']

class InventoryOperationEWayBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryOperationEWayBill
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']

# -------------------------------------------------------------------------
# OPERATION SERIALIZERS
# -------------------------------------------------------------------------

# --- Job Work ---
class InventoryOperationJobWorkItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryOperationJobWorkItem
        exclude = ['tenant_id', 'parent']
        read_only_fields = ['id', 'created_at', 'updated_at']

class InventoryOperationJobWorkSerializer(serializers.ModelSerializer):
    items = InventoryOperationJobWorkItemSerializer(many=True)
    delivery_challan = InventoryOperationDeliveryChallanSerializer(required=False)
    eway_bill = InventoryOperationEWayBillSerializer(required=False)

    class Meta:
        model = InventoryOperationJobWork
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        delivery_challan_data = validated_data.pop('delivery_challan', None)
        eway_bill_data = validated_data.pop('eway_bill', None)

        job_work = InventoryOperationJobWork.objects.create(**validated_data)
        for item_data in items_data:
            InventoryOperationJobWorkItem.objects.create(parent=job_work, tenant_id=job_work.tenant_id, **item_data)
        
        if delivery_challan_data:
            InventoryOperationDeliveryChallan.objects.create(issue_slip_no=job_work.issue_slip_no, tenant_id=job_work.tenant_id, **delivery_challan_data)
        if eway_bill_data:
            InventoryOperationEWayBill.objects.create(issue_slip_no=job_work.issue_slip_no, tenant_id=job_work.tenant_id, **eway_bill_data)
            
        return job_work

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance = super().update(instance, validated_data)
        
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InventoryOperationJobWorkItem.objects.create(parent=instance, tenant_id=instance.tenant_id, **item_data)
        return instance

# --- Inter Unit ---
class InventoryOperationInterUnitItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryOperationInterUnitItem
        exclude = ['tenant_id', 'parent']
        read_only_fields = ['id', 'created_at', 'updated_at']

class InventoryOperationInterUnitSerializer(serializers.ModelSerializer):
    items = InventoryOperationInterUnitItemSerializer(many=True)
    delivery_challan = InventoryOperationDeliveryChallanSerializer(required=False)
    eway_bill = InventoryOperationEWayBillSerializer(required=False)

    class Meta:
        model = InventoryOperationInterUnit
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        delivery_challan_data = validated_data.pop('delivery_challan', None)
        eway_bill_data = validated_data.pop('eway_bill', None)

        inter_unit = InventoryOperationInterUnit.objects.create(**validated_data)
        for item_data in items_data:
            InventoryOperationInterUnitItem.objects.create(parent=inter_unit, tenant_id=inter_unit.tenant_id, **item_data)
        
        if delivery_challan_data:
            InventoryOperationDeliveryChallan.objects.create(issue_slip_no=inter_unit.issue_slip_no, tenant_id=inter_unit.tenant_id, **delivery_challan_data)
        if eway_bill_data:
            InventoryOperationEWayBill.objects.create(issue_slip_no=inter_unit.issue_slip_no, tenant_id=inter_unit.tenant_id, **eway_bill_data)

        return inter_unit
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance = super().update(instance, validated_data)
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InventoryOperationInterUnitItem.objects.create(parent=instance, tenant_id=instance.tenant_id, **item_data)
        return instance

# --- Location Change ---
class InventoryOperationLocationChangeItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryOperationLocationChangeItem
        exclude = ['tenant_id', 'parent']
        read_only_fields = ['id', 'created_at', 'updated_at']

class InventoryOperationLocationChangeSerializer(serializers.ModelSerializer):
    items = InventoryOperationLocationChangeItemSerializer(many=True)
    delivery_challan = InventoryOperationDeliveryChallanSerializer(required=False)
    eway_bill = InventoryOperationEWayBillSerializer(required=False)

    class Meta:
        model = InventoryOperationLocationChange
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        delivery_challan_data = validated_data.pop('delivery_challan', None)
        eway_bill_data = validated_data.pop('eway_bill', None)

        obj = InventoryOperationLocationChange.objects.create(**validated_data)
        for item_data in items_data:
            InventoryOperationLocationChangeItem.objects.create(parent=obj, tenant_id=obj.tenant_id, **item_data)
        
        if delivery_challan_data:
            InventoryOperationDeliveryChallan.objects.create(issue_slip_no=obj.issue_slip_no, tenant_id=obj.tenant_id, **delivery_challan_data)
        if eway_bill_data:
            InventoryOperationEWayBill.objects.create(issue_slip_no=obj.issue_slip_no, tenant_id=obj.tenant_id, **eway_bill_data)
            
        return obj

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance = super().update(instance, validated_data)
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InventoryOperationLocationChangeItem.objects.create(parent=instance, tenant_id=instance.tenant_id, **item_data)
        return instance

# --- Production ---
class InventoryOperationProductionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryOperationProductionItem
        exclude = ['tenant_id', 'parent']
        read_only_fields = ['id', 'created_at', 'updated_at']

class InventoryOperationProductionSerializer(serializers.ModelSerializer):
    items = InventoryOperationProductionItemSerializer(many=True)
    delivery_challan = InventoryOperationDeliveryChallanSerializer(required=False)
    eway_bill = InventoryOperationEWayBillSerializer(required=False)

    class Meta:
        model = InventoryOperationProduction
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        delivery_challan_data = validated_data.pop('delivery_challan', None)
        eway_bill_data = validated_data.pop('eway_bill', None)

        obj = InventoryOperationProduction.objects.create(**validated_data)
        for item_data in items_data:
            InventoryOperationProductionItem.objects.create(parent=obj, tenant_id=obj.tenant_id, **item_data)
        
        if delivery_challan_data:
            InventoryOperationDeliveryChallan.objects.create(issue_slip_no=obj.issue_slip_no, tenant_id=obj.tenant_id, **delivery_challan_data)
        if eway_bill_data:
            InventoryOperationEWayBill.objects.create(issue_slip_no=obj.issue_slip_no, tenant_id=obj.tenant_id, **eway_bill_data)

        return obj

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance = super().update(instance, validated_data)
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InventoryOperationProductionItem.objects.create(parent=instance, tenant_id=instance.tenant_id, **item_data)
        return instance

# --- Consumption ---
class InventoryOperationConsumptionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryOperationConsumptionItem
        exclude = ['tenant_id', 'parent']
        read_only_fields = ['id', 'created_at', 'updated_at']

class InventoryOperationConsumptionSerializer(serializers.ModelSerializer):
    items = InventoryOperationConsumptionItemSerializer(many=True)
    delivery_challan = InventoryOperationDeliveryChallanSerializer(required=False)
    eway_bill = InventoryOperationEWayBillSerializer(required=False)

    class Meta:
        model = InventoryOperationConsumption
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        delivery_challan_data = validated_data.pop('delivery_challan', None)
        eway_bill_data = validated_data.pop('eway_bill', None)

        obj = InventoryOperationConsumption.objects.create(**validated_data)
        for item_data in items_data:
            InventoryOperationConsumptionItem.objects.create(parent=obj, tenant_id=obj.tenant_id, **item_data)
        
        if delivery_challan_data:
            InventoryOperationDeliveryChallan.objects.create(issue_slip_no=obj.issue_slip_no, tenant_id=obj.tenant_id, **delivery_challan_data)
        if eway_bill_data:
            InventoryOperationEWayBill.objects.create(issue_slip_no=obj.issue_slip_no, tenant_id=obj.tenant_id, **eway_bill_data)

        return obj

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance = super().update(instance, validated_data)
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InventoryOperationConsumptionItem.objects.create(parent=instance, tenant_id=instance.tenant_id, **item_data)
        return instance

# --- Scrap ---
class InventoryOperationScrapItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryOperationScrapItem
        exclude = ['tenant_id', 'parent']
        read_only_fields = ['id', 'created_at', 'updated_at']

class InventoryOperationScrapSerializer(serializers.ModelSerializer):
    items = InventoryOperationScrapItemSerializer(many=True)
    delivery_challan = InventoryOperationDeliveryChallanSerializer(required=False)
    eway_bill = InventoryOperationEWayBillSerializer(required=False)

    class Meta:
        model = InventoryOperationScrap
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        delivery_challan_data = validated_data.pop('delivery_challan', None)
        eway_bill_data = validated_data.pop('eway_bill', None)

        obj = InventoryOperationScrap.objects.create(**validated_data)
        for item_data in items_data:
            InventoryOperationScrapItem.objects.create(parent=obj, tenant_id=obj.tenant_id, **item_data)
        
        if delivery_challan_data:
            InventoryOperationDeliveryChallan.objects.create(issue_slip_no=obj.issue_slip_no, tenant_id=obj.tenant_id, **delivery_challan_data)
        if eway_bill_data:
            InventoryOperationEWayBill.objects.create(issue_slip_no=obj.issue_slip_no, tenant_id=obj.tenant_id, **eway_bill_data)

        return obj

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance = super().update(instance, validated_data)
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InventoryOperationScrapItem.objects.create(parent=instance, tenant_id=instance.tenant_id, **item_data)
        return instance

# --- Outward ---
class InventoryOperationOutwardItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryOperationOutwardItem
        exclude = ['tenant_id', 'parent']
        read_only_fields = ['id', 'created_at', 'updated_at']

class InventoryOperationOutwardSerializer(serializers.ModelSerializer):
    items = InventoryOperationOutwardItemSerializer(many=True)
    delivery_challan = InventoryOperationDeliveryChallanSerializer(required=False)
    eway_bill = InventoryOperationEWayBillSerializer(required=False)

    class Meta:
        model = InventoryOperationOutward
        fields = '__all__'
        read_only_fields = ['tenant_id', 'id', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        delivery_challan_data = validated_data.pop('delivery_challan', None)
        eway_bill_data = validated_data.pop('eway_bill', None)

        obj = InventoryOperationOutward.objects.create(**validated_data)
        for item_data in items_data:
            InventoryOperationOutwardItem.objects.create(parent=obj, tenant_id=obj.tenant_id, **item_data)
        
        # Mapping outward_slip_no to issue_slip_no for generic tables
        if delivery_challan_data:
            InventoryOperationDeliveryChallan.objects.create(issue_slip_no=obj.outward_slip_no, tenant_id=obj.tenant_id, **delivery_challan_data)
        if eway_bill_data:
            InventoryOperationEWayBill.objects.create(issue_slip_no=obj.outward_slip_no, tenant_id=obj.tenant_id, **eway_bill_data)

        return obj

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        instance = super().update(instance, validated_data)
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InventoryOperationOutwardItem.objects.create(parent=instance, tenant_id=instance.tenant_id, **item_data)
        return instance
