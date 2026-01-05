"""
Vouchers Module URL Configuration
"""

from django.urls import path, include
from rest_framework import routers
from .api import VoucherViewSet, JournalEntryViewSet

router = routers.DefaultRouter()

# Voucher endpoints
router.register('vouchers', VoucherViewSet, basename='vouchers')
router.register('journal-entries', JournalEntryViewSet, basename='journal-entries')

urlpatterns = [
    path('', include(router.urls)),
]
