from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import InventoryMasterCategory
from .serializers import InventoryMasterCategorySerializer
from core.tenant import get_tenant_from_request


class InventoryMasterCategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Inventory Master Category
    
    GET /api/inventory/master-categories/ - List all master categories
    POST /api/inventory/master-categories/ - Create new master category
    GET /api/inventory/master-categories/{id}/ - Get master category details
    PUT /api/inventory/master-categories/{id}/ - Update master category
    DELETE /api/inventory/master-categories/{id}/ - Delete master category
    """
    serializer_class = InventoryMasterCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        tenant_id = get_tenant_from_request(self.request)
        return InventoryMasterCategory.objects.filter(
            tenant_id=tenant_id,
            is_active=True
        )
    
    def perform_create(self, serializer):
        tenant_id = get_tenant_from_request(self.request)
        serializer.save(tenant_id=tenant_id)
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete master category"""
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
