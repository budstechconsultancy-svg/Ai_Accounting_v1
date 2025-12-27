from django.urls import path, include  # type: ignore
from rest_framework import routers  # type: ignore
from .views import (
    CompanySettingsViewSet, health_check, check_status,
    ModulePermissionsSchemaView, UserModulePermissionsView, AgentMessageView, AIProxyView,
    ai_metrics, health_with_metrics, AdminPaymentsView,
    SettingsUsersView
)
from .admin_views import AdminSubscriptionsView, AdminUserStatusView
# from .otp_views import SendOTPView, VerifyOTPView # REMOVED
from .registration_views import RegisterInitiateView, VerifyOTPAndCreateUserView
# REMOVED: permission_views - no longer using permission tables
# from .permission_views import PermissionModulesListView, RolePermissionsView
from .reports_views import (
    DayBookExcelView, LedgerExcelView, TrialBalanceExcelView, 
    StockSummaryExcelView, GSTReportExcelView
)

router = routers.DefaultRouter()
router.register('company-settings', CompanySettingsViewSet, basename='company-settings')

urlpatterns = [
    # New OTP-based Registration Flow
    path('auth/register/', RegisterInitiateView.as_view(), name='register-initiate'),
    path('auth/verify-otp-and-create-user/', VerifyOTPAndCreateUserView.as_view(), name='verify-otp-and-create-user'),
    
    # OTP Verification (for existing users) - MOVED TO NEW OTP APP
    # path('auth/send-otp', SendOTPView.as_view(), name='send-otp'), # REMOVED
    # path('auth/verify-otp', VerifyOTPView.as_view(), name='verify-otp'), # REMOVED
    
    path('auth/check-status/', check_status, name='check-status'),
    path('health/', health_check, name='health'), # /api/health

    # Reports
    path('reports/daybook/excel/', DayBookExcelView.as_view(), name='report-daybook-excel'),
    path('reports/ledger/excel/', LedgerExcelView.as_view(), name='report-ledger-excel'),
    path('reports/trialbalance/excel/', TrialBalanceExcelView.as_view(), name='report-trialbalance-excel'),
    path('reports/stocksummary/excel/', StockSummaryExcelView.as_view(), name='report-stocksummary-excel'),
    path('reports/gst/excel/', GSTReportExcelView.as_view(), name='report-gst-excel'),

    # Admin endpoints
    path('admin/subscriptions/', AdminSubscriptionsView.as_view(), name='admin-subscriptions'),
    path('admin/user-subscription/', AdminUserStatusView.as_view(), name='admin-user-subscription'),
    path('admin/payments/', AdminPaymentsView.as_view(), name='admin-payments'),

    # Module Permissions
    path('module-permissions/schema/', ModulePermissionsSchemaView.as_view()),
    path('module-permissions/user/<str:user_id>/', UserModulePermissionsView.as_view()),

    # AI Services
    path('ai/<str:action>/', AIProxyView.as_view(), name='ai-proxy'),
    path('agent/message/', AgentMessageView.as_view()),  # Legacy endpoint, uses AI proxy internally
    path('metrics/ai/', ai_metrics, name='ai-metrics'),
    
    # Settings
    path('settings/users/', SettingsUsersView.as_view(), name='settings-users'),
    path('settings/users/<int:user_id>/', SettingsUsersView.as_view(), name='settings-user-detail'),
    # REMOVED: Role-related endpoints - no longer using roles
    # path('settings/roles/', SettingsRolesView.as_view(), name='settings-roles'),
    # path('seed-module-roles', SeedModuleRolesView.as_view(), name='seed-module-roles'),
    # path('settings/module-roles/', ModuleRolesView.as_view(), name='module-roles'),

    # REMOVED: Permission endpoints - no longer using permission tables
    # path('permissions/modules/', PermissionModulesListView.as_view(), name='permission-modules'),
    # path('roles/<int:role_id>/permissions/', RolePermissionsView.as_view(), name='role-permissions'),

    path('', include(router.urls)),
]
