"""
Vouchers Module URL Configuration
"""

from django.urls import path, include
from rest_framework import routers
from .api import VoucherViewSet, JournalEntryViewSet
from .scan_api import extract_invoice

router = routers.DefaultRouter()

# Voucher endpoints
router.register('vouchers', VoucherViewSet, basename='vouchers')
router.register('journal-entries', JournalEntryViewSet, basename='journal-entries')

urlpatterns = [
    path('extract-invoice/', extract_invoice, name='extract-invoice'),
    path('', include(router.urls)),
]
