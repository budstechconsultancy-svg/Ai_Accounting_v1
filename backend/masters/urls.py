"""
Masters Module URL Configuration
"""

from django.urls import path, include
from rest_framework import routers
from .api import (
    MasterLedgerGroupViewSet,
    MasterLedgerViewSet,
    MasterVoucherConfigViewSet,
    MasterHierarchyRawViewSet,
    VoucherConfigurationViewSet,
    AmountTransactionViewSet
)

router = routers.DefaultRouter()

# Master endpoints
router.register('ledger-groups', MasterLedgerGroupViewSet, basename='ledger-groups')
router.register('ledgers', MasterLedgerViewSet, basename='ledgers')
router.register('voucher-configs', MasterVoucherConfigViewSet, basename='voucher-configs')
router.register('voucher-configurations', VoucherConfigurationViewSet, basename='voucher-configurations')
router.register('amount-transactions', AmountTransactionViewSet, basename='amount-transactions')

# Global hierarchy endpoint (no authentication required)
router.register('hierarchy', MasterHierarchyRawViewSet, basename='hierarchy')

urlpatterns = [
    path('', include(router.urls)),
]
