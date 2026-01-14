from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryMasterCategoryViewSet
from .api import (
    InventoryStockGroupViewSet, InventoryUnitViewSet,
    InventoryStockItemViewSet, StockMovementViewSet
)

router = DefaultRouter()
router.register('master-categories', InventoryMasterCategoryViewSet, basename='inventory-master-category')
router.register('stock-groups', InventoryStockGroupViewSet, basename='inventory-stock-group')
router.register('units', InventoryUnitViewSet, basename='inventory-unit')
router.register('stock-items', InventoryStockItemViewSet, basename='inventory-stock-item')
router.register('stock-movements', StockMovementViewSet, basename='stock-movement')

urlpatterns = [
    path('', include(router.urls)),
]
