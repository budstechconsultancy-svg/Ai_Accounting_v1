"""
Registration Module URL Configuration
"""

from django.urls import path
from .api import RegisterInitiateView, CreateUserView

urlpatterns = [
    path('register-initiate/', RegisterInitiateView.as_view(), name='auth-register-initiate'),
    path('create-account/', CreateUserView.as_view(), name='auth-create-account'),
]
