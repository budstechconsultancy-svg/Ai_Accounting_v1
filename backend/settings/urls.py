"""
Settings Module URL Configuration
"""

from django.urls import path, include
from rest_framework import routers
from .api import CompanySettingsViewSet

router = routers.DefaultRouter()

# Settings endpoints
router.register('company-settings', CompanySettingsViewSet, basename='company-settings')

urlpatterns = [
    path('', include(router.urls)),
]
