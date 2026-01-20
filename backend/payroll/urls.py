from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet, SalaryComponentViewSet, SalaryTemplateViewSet,
    EmployeeSalaryStructureViewSet, PayRunViewSet, PayRunDetailViewSet,
    StatutoryConfigurationViewSet, AttendanceViewSet, LeaveApplicationViewSet
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'salary-components', SalaryComponentViewSet, basename='salary-component')
router.register(r'salary-templates', SalaryTemplateViewSet, basename='salary-template')
router.register(r'employee-salary-structure', EmployeeSalaryStructureViewSet, basename='employee-salary-structure')
router.register(r'pay-runs', PayRunViewSet, basename='pay-run')
router.register(r'pay-run-details', PayRunDetailViewSet, basename='pay-run-detail')
router.register(r'statutory-config', StatutoryConfigurationViewSet, basename='statutory-config')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'leave-applications', LeaveApplicationViewSet, basename='leave-application')

urlpatterns = [
    path('', include(router.urls)),
]
