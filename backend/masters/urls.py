"""
Masters Module URL Configuration
"""

from django.urls import path, include
from rest_framework import routers
from .api import (
    MasterLedgerGroupViewSet,
    MasterLedgerViewSet,
    MasterVoucherConfigViewSet,
    MasterHierarchyRawViewSet
)

router = routers.DefaultRouter()

# Master endpoints
router.register('ledger-groups', MasterLedgerGroupViewSet, basename='master-ledger-groups')
router.register('ledgers', MasterLedgerViewSet, basename='master-ledgers')
router.register('voucher-config', MasterVoucherConfigViewSet, basename='master-voucher-config')

# Global hierarchy endpoint (no authentication required)
router.register('hierarchy', MasterHierarchyRawViewSet, basename='hierarchy')

urlpatterns = [
    path('', include(router.urls)),
]
