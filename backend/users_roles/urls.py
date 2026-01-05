"""
Users & Roles Module URL Configuration
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import (
    SettingsUsersView,
    RolesViewSet,
    ModulesView
)

router = DefaultRouter()
router.register(r'roles', RolesViewSet, basename='roles')

urlpatterns = [
    # User management
    path('settings/users/', SettingsUsersView.as_view(), name='settings-users'),
    path('settings/users/<int:user_id>/', SettingsUsersView.as_view(), name='settings-user-detail'),
    
    # Modules Schema (for UI tree)
    path('modules/', ModulesView.as_view(), name='modules-list'),
    
    # Roled (via router)
    path('', include(router.urls)),
]
