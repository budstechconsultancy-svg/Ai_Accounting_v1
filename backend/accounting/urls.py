from django.urls import path, include
from rest_framework import routers
from .views import (
    MasterLedgerGroupViewSet, MasterLedgerViewSet, MasterVoucherConfigViewSet,
    MasterHierarchyRawViewSet, VoucherViewSet, JournalEntryViewSet
)
from .views_questions import LedgerQuestionsView, LedgerCreateWithQuestionsView


router = routers.DefaultRouter()

# Master endpoints
router.register('masters/ledger-groups', MasterLedgerGroupViewSet, basename='master-ledger-groups')
router.register('masters/ledgers', MasterLedgerViewSet, basename='master-ledgers')
router.register('masters/voucher-config', MasterVoucherConfigViewSet, basename='master-voucher-config')

# Global hierarchy endpoint (no authentication required)
router.register('hierarchy', MasterHierarchyRawViewSet, basename='hierarchy')

# Unified voucher endpoint - filter by type using query params
# e.g., /api/accounting/vouchers/?type=sales
router.register('vouchers', VoucherViewSet, basename='vouchers')

# Journal entries
router.register('journal-entries', JournalEntryViewSet, basename='journal-entries')

urlpatterns = [
    path('', include(router.urls)),
    
    # Questions System endpoints
    path('ledgers/questions/', LedgerQuestionsView.as_view(), name='ledger-questions'),
    path('ledgers/create-with-questions/', LedgerCreateWithQuestionsView.as_view(), name='ledger-create-with-questions'),
]

