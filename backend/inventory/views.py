from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.utils import TenantQuerysetMixin, IsTenantMember
from .models import InventoryStockGroup, InventoryUnit, InventoryStockItem, StockMovement
from .serializers import (
    InventoryStockGroupSerializer, InventoryUnitSerializer,
    InventoryStockItemSerializer, StockMovementSerializer
)

# ============================================================================
# INVENTORY VIEWSETS
# ============================================================================

class InventoryStockGroupViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    queryset = InventoryStockGroup.objects.all()
    serializer_class = InventoryStockGroupSerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    required_permission = 'INVENTORY_STOCK_GROUPS'


class InventoryUnitViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    queryset = InventoryUnit.objects.all()
    serializer_class = InventoryUnitSerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    required_permission = 'INVENTORY_UNITS'


class InventoryStockItemViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    queryset = InventoryStockItem.objects.all()
    serializer_class = InventoryStockItemSerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    required_permission = 'INVENTORY_ITEMS'
    
    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk_create(self, request):
        """Create multiple stock items at once"""
        items_data = request.data if isinstance(request.data, list) else [request.data]
        
        serializer = self.get_serializer(data=items_data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({'success': True, 'count': len(items_data)}, status=status.HTTP_201_CREATED)


class StockMovementViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
