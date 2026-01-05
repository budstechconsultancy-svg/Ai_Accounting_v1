"""
Inventory Module URL Configuration
"""

from django.urls import path, include
from rest_framework import routers
from .api import (
    InventoryStockGroupViewSet,
    InventoryUnitViewSet,
    InventoryStockItemViewSet,
    StockMovementViewSet
)
from .reports import StockSummaryReportView

router = routers.DefaultRouter()

# Inventory endpoints
router.register('stock-groups', InventoryStockGroupViewSet, basename='inventory-stock-groups')
router.register('units', InventoryUnitViewSet, basename='inventory-units')
router.register('stock-items', InventoryStockItemViewSet, basename='inventory-stock-items')
router.register('stock-movements', StockMovementViewSet, basename='stock-movements')

urlpatterns = [
    path('', include(router.urls)),
    # Reports
    path('reports/stock-summary/', StockSummaryReportView.as_view(), name='stock-summary-report'),
]
