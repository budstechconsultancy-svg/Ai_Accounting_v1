"""
Services Module URL Configuration
"""

from django.urls import path, include
from rest_framework import routers
from .views import ServiceViewSet

router = routers.DefaultRouter()

# Service endpoints
router.register('', ServiceViewSet, basename='services')

urlpatterns = [
    path('', include(router.urls)),
]
