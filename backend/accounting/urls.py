from django.urls import path, include
from rest_framework import routers
from .views import (
    MasterLedgerGroupViewSet, MasterLedgerViewSet, MasterVoucherConfigViewSet,
    VoucherViewSet, JournalEntryViewSet
)

router = routers.DefaultRouter()

# Master endpoints
router.register('masters/ledger-groups', MasterLedgerGroupViewSet, basename='master-ledger-groups')
router.register('masters/ledgers', MasterLedgerViewSet, basename='master-ledgers')
router.register('masters/voucher-config', MasterVoucherConfigViewSet, basename='master-voucher-config')

# Unified voucher endpoint - filter by type using query params
# e.g., /api/accounting/vouchers/?type=sales
router.register('vouchers', VoucherViewSet, basename='vouchers')

# Journal entries
router.register('journal-entries', JournalEntryViewSet, basename='journal-entries')

urlpatterns = [
    path('', include(router.urls)),
]
