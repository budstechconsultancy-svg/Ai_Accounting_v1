from django.urls import path, include
from rest_framework import routers
from .views import (
    InventoryStockGroupViewSet, InventoryUnitViewSet,
    InventoryStockItemViewSet, StockMovementViewSet
)

router = routers.DefaultRouter()

# Inventory endpoints - separate for each type
router.register('stock-groups', InventoryStockGroupViewSet, basename='inventory-stock-groups')
router.register('units', InventoryUnitViewSet, basename='inventory-units')
router.register('stock-items', InventoryStockItemViewSet, basename='inventory-stock-items')
router.register('stock-movements', StockMovementViewSet, basename='stock-movements')

urlpatterns = [
    path('', include(router.urls)),
]
