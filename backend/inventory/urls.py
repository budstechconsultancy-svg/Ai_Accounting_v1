from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryCategoryViewSet, InventoryLocationViewSet, InventoryItemViewSet

router = DefaultRouter()
router.register('categories', InventoryCategoryViewSet, basename='inventory-category')
router.register('locations', InventoryLocationViewSet, basename='inventory-location')
router.register('items', InventoryItemViewSet, basename='inventory-item')

urlpatterns = [
    path('', include(router.urls)),
]
