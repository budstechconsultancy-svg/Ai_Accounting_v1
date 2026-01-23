from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InventoryMasterCategoryViewSet, 
    InventoryLocationViewSet,
    InventoryItemViewSet,
    InventoryUnitViewSet,
    InventoryMasterGRNViewSet,
    InventoryMasterIssueSlipViewSet
)

router = DefaultRouter()
router.register('master-categories', InventoryMasterCategoryViewSet, basename='inventory-master-category')
router.register('locations', InventoryLocationViewSet, basename='inventory-location')
router.register('items', InventoryItemViewSet, basename='inventory-item')
router.register('units', InventoryUnitViewSet, basename='inventory-unit')
router.register('master-voucher-grn', InventoryMasterGRNViewSet, basename='inventory-master-grn')
router.register('master-voucher-issue-slip', InventoryMasterIssueSlipViewSet, basename='inventory-master-issue-slip')

urlpatterns = [
    path('', include(router.urls)),
]
