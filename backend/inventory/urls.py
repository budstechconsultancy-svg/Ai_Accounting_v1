from django.urls import path, include
from rest_framework import routers
from .views import (
    InventoryStockGroupViewSet, InventoryUnitViewSet,
    InventoryStockItemViewSet, StockMovementViewSet
)
from .report_views import (
    StockSummaryReportView, InventoryValuationSummaryView,
    InventoryValuationDetailView,
    InventoryAgingReportView, ItemDetailsReportView,
    SalesByItemReportView, PurchasesByItemReportView,
    InventoryAdjustmentReportView, WarehouseSummaryReportView,
    WarehouseDetailReportView
)

router = routers.DefaultRouter()

# Inventory endpoints - separate for each type
router.register('stock-groups', InventoryStockGroupViewSet, basename='inventory-stock-groups')
router.register('units', InventoryUnitViewSet, basename='inventory-units')
router.register('stock-items', InventoryStockItemViewSet, basename='inventory-stock-items')
router.register('stock-movements', StockMovementViewSet, basename='stock-movements')

urlpatterns = [
    path('', include(router.urls)),
    
    # Reports
    path('reports/stock-summary', StockSummaryReportView.as_view(), name='report-stock-summary'),
    path('reports/inventory-valuation-summary', InventoryValuationSummaryView.as_view(), name='report-valuation-summary'),
    path('reports/inventory-valuation-detail', InventoryValuationDetailView.as_view(), name='report-valuation-detail'),
    path('reports/inventory-aging', InventoryAgingReportView.as_view(), name='report-aging'),
    path('reports/item-details', ItemDetailsReportView.as_view(), name='report-item-details'),
    path('reports/sales-by-item', SalesByItemReportView.as_view(), name='report-sales-by-item'),
    path('reports/purchases-by-item', PurchasesByItemReportView.as_view(), name='report-purchases-by-item'),
    path('reports/inventory-adjustment', InventoryAdjustmentReportView.as_view(), name='report-inventory-adjustment'),
    path('reports/warehouse-summary', WarehouseSummaryReportView.as_view(), name='report-warehouse-summary'),
    path('reports/warehouse-detail', WarehouseDetailReportView.as_view(), name='report-warehouse-detail'),
]
