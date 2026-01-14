from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryMasterCategoryViewSet

router = DefaultRouter()
router.register('master-categories', InventoryMasterCategoryViewSet, basename='inventory-master-category')

urlpatterns = [
    path('', include(router.urls)),
]
