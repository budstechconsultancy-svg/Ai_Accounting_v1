"""
Login Module URL Configuration
"""

from django.urls import path
from .api import LoginView, TokenRefreshView, LogoutView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
]
