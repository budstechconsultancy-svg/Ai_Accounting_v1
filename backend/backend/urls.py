
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.auth_views import CookieTokenObtainPairView, CookieTokenRefreshView, LogoutView
from core.token import MyTokenObtainPairSerializer
import threading
import sys

def check_db_connection():
    from django.db import connection
    try:
        connection.ensure_connection()
        print("✅ Database connected successfully!")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

# Run only once on startup (prevent partial execution during autoreload)
if 'runserver' in sys.argv and threading.current_thread() is threading.main_thread():
    # Only run in the main thread to avoid duplicates
    pass
# Hack: Use AppConfig.ready() is better, but this is a quick spot for urls.py
check_db_connection()



urlpatterns = [
    path('admin/', admin.site.urls),
    # Auth endpoints
    path('api/auth/login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/logout/', LogoutView.as_view(), name='auth_logout'),
    
    # Core (Company, Health, Agent) - mapped to /api/
    path('api/', include('core.urls')),
    
    # Accounting - mapped to /api/ and /api/masters/
    path('api/', include('accounting.urls')),
    path('api/masters/', include('accounting.urls')),
    
    # Inventory - mapped to /api/ and /api/inventory/
    path('api/', include('inventory.urls')),
    path('api/inventory/', include('inventory.urls')),
    
    # OTP Service
    # OTP Service
    path('api/otp/', include('otp.urls')),

    # Reports
    path('api/reports/', include('reports.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
