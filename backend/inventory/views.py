from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import InventoryCategory, InventoryLocation, InventoryItem
from .serializers import (
    InventoryCategorySerializer, 
    InventoryCategoryTreeSerializer, 
    InventoryLocationSerializer,
    InventoryItemSerializer
)
from core.tenant import get_tenant_from_request


class InventoryCategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Inventory Categories
    
    GET /api/inventory/categories/ - List all categories
    POST /api/inventory/categories/ - Create new category
    GET /api/inventory/categories/{id}/ - Get category details
    PUT /api/inventory/categories/{id}/ - Update category
    DELETE /api/inventory/categories/{id}/ - Delete category (only user-created)
    GET /api/inventory/categories/tree/ - Get category tree structure
    """
    serializer_class = InventoryCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        tenant_id = get_tenant_from_request(self.request)
        return InventoryCategory.objects.filter(
            tenant_id=tenant_id,
            is_active=True
        ).select_related('parent').prefetch_related('subcategories')
    
    def perform_create(self, serializer):
        tenant_id = get_tenant_from_request(self.request)
        serializer.save(tenant_id=tenant_id, is_system=False)
    
    def destroy(self, request, *args, **kwargs):
        """Delete category - only allow deletion of user-created categories"""
        instance = self.get_object()
        
        # Check if it's a system category
        if instance.is_system:
            return Response(
                {'error': 'System categories cannot be deleted'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if it has subcategories
        if instance.subcategories.exists():
            return Response(
                {'error': 'Cannot delete category with subcategories'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Soft delete
        instance.is_active = False
        instance.save()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get category tree structure"""
        tenant_id = get_tenant_from_request(request)
        
        # Get root categories (no parent)
        root_categories = InventoryCategory.objects.filter(
            tenant_id=tenant_id,
            is_active=True,
            parent__isnull=True
        ).order_by('display_order', 'name')
        
        serializer = InventoryCategoryTreeSerializer(root_categories, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def root(self, request):
        """Get only root categories (for dropdown)"""
        tenant_id = get_tenant_from_request(request)
        
        root_categories = InventoryCategory.objects.filter(
            tenant_id=tenant_id,
            is_active=True,
            parent__isnull=True
        ).order_by('display_order', 'name')
        
        serializer = self.get_serializer(root_categories, many=True)
        return Response(serializer.data)


class InventoryLocationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Inventory Locations
    
    GET /api/inventory/locations/ - List all locations
    POST /api/inventory/locations/ - Create new location
    GET /api/inventory/locations/{id}/ - Get location details
    PUT /api/inventory/locations/{id}/ - Update location
    DELETE /api/inventory/locations/{id}/ - Delete location
    """
    serializer_class = InventoryLocationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        tenant_id = get_tenant_from_request(self.request)
        return InventoryLocation.objects.filter(
            tenant_id=tenant_id,
            is_active=True
        )
    
    def perform_create(self, serializer):
        tenant_id = get_tenant_from_request(self.request)
        serializer.save(tenant_id=tenant_id)
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete location"""
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class InventoryItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Inventory Items
    
    GET /api/inventory/items/ - List all items
    POST /api/inventory/items/ - Create new item
    GET /api/inventory/items/{id}/ - Get item details
    PUT /api/inventory/items/{id}/ - Update item
    DELETE /api/inventory/items/{id}/ - Delete item
    """
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        tenant_id = get_tenant_from_request(self.request)
        return InventoryItem.objects.filter(
            tenant_id=tenant_id,
            is_active=True
        )
    
    def perform_create(self, serializer):
        tenant_id = get_tenant_from_request(self.request)
        serializer.save(tenant_id=tenant_id)
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete item"""
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
