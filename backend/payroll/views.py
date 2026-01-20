from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from datetime import datetime, timedelta
from decimal import Decimal

from .models import (
    Employee, SalaryComponent, SalaryTemplate, SalaryTemplateComponent,
    EmployeeSalaryStructure, PayRun, PayRunDetail, StatutoryConfiguration,
    Attendance, LeaveApplication
)
from .serializers import (
    EmployeeSerializer, SalaryComponentSerializer, SalaryTemplateSerializer,
    EmployeeSalaryStructureSerializer, PayRunSerializer, PayRunDetailSerializer,
    StatutoryConfigurationSerializer, AttendanceSerializer, LeaveApplicationSerializer
)


class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    
    def get_queryset(self):
        tenant_id = self.request.session.get('tenant_id')
        return Employee.objects.filter(tenant_id=tenant_id).order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant_id = self.request.session.get('tenant_id')
        serializer.save(tenant_id=tenant_id)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get employee statistics"""
        tenant_id = request.session.get('tenant_id')
        
        total_employees = Employee.objects.filter(tenant_id=tenant_id, status='Active').count()
        total_departments = Employee.objects.filter(tenant_id=tenant_id, status='Active').values('department').distinct().count()
        
        return Response({
            'total_employees': total_employees,
            'active_employees': total_employees,
            'total_departments': total_departments
        })


class SalaryComponentViewSet(viewsets.ModelViewSet):
    serializer_class = SalaryComponentSerializer
    
    def get_queryset(self):
        tenant_id = self.request.session.get('tenant_id')
        return SalaryComponent.objects.filter(tenant_id=tenant_id, is_active=True).order_by('component_type', 'component_name')
    
    def perform_create(self, serializer):
        tenant_id = self.request.session.get('tenant_id')
        serializer.save(tenant_id=tenant_id)


class SalaryTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = SalaryTemplateSerializer
    
    def get_queryset(self):
        tenant_id = self.request.session.get('tenant_id')
        return SalaryTemplate.objects.filter(tenant_id=tenant_id, is_active=True).order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant_id = self.request.session.get('tenant_id')
        serializer.save(tenant_id=tenant_id)


class EmployeeSalaryStructureViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSalaryStructureSerializer
    
    def get_queryset(self):
        employee_id = self.request.query_params.get('employee_id')
        queryset = EmployeeSalaryStructure.objects.filter(is_active=True)
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        
        return queryset.order_by('component__component_type', 'component__component_name')


class PayRunViewSet(viewsets.ModelViewSet):
    serializer_class = PayRunSerializer
    
    def get_queryset(self):
        tenant_id = self.request.session.get('tenant_id')
        return PayRun.objects.filter(tenant_id=tenant_id).order_by('-start_date')
    
    def perform_create(self, serializer):
        tenant_id = self.request.session.get('tenant_id')
        
        # Generate pay run code
        current_month = datetime.now().strftime('%Y%m')
        last_run = PayRun.objects.filter(tenant_id=tenant_id).order_by('-id').first()
        sequence = 1 if not last_run else int(last_run.pay_run_code.split('-')[-1]) + 1
        pay_run_code = f"PR-{current_month}-{sequence:04d}"
        
        serializer.save(tenant_id=tenant_id, pay_run_code=pay_run_code)
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Process payroll for all employees in the pay run"""
        pay_run = self.get_object()
        tenant_id = request.session.get('tenant_id')
        
        if pay_run.status != 'Draft':
            return Response(
                {'error': 'Only draft pay runs can be processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all active employees
        employees = Employee.objects.filter(tenant_id=tenant_id, status='Active')
        
        total_gross = Decimal('0')
        total_deductions = Decimal('0')
        total_net = Decimal('0')
        
        for employee in employees:
            # Calculate salary
            basic = employee.basic_salary
            hra = employee.hra
            gross = basic + hra
            
            # Calculate deductions (simplified)
            epf = basic * Decimal('0.12')  # 12% EPF
            esi = gross * Decimal('0.0075') if gross <= 21000 else Decimal('0')  # 0.75% ESI
            total_ded = epf + esi
            
            net = gross - total_ded
            
            # Create pay run detail
            PayRunDetail.objects.create(
                pay_run=pay_run,
                employee=employee,
                basic_salary=basic,
                hra=hra,
                gross_salary=gross,
                epf_employee=epf,
                esi_employee=esi,
                total_deductions=total_ded,
                net_salary=net,
                days_present=30  # Default
            )
            
            total_gross += gross
            total_deductions += total_ded
            total_net += net
        
        # Update pay run totals
        pay_run.total_employees = employees.count()
        pay_run.gross_pay = total_gross
        pay_run.total_deductions = total_deductions
        pay_run.net_pay = total_net
        pay_run.status = 'Processed'
        pay_run.save()
        
        return Response({
            'message': 'Pay run processed successfully',
            'total_employees': pay_run.total_employees,
            'gross_pay': str(pay_run.gross_pay),
            'net_pay': str(pay_run.net_pay)
        })
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a processed pay run"""
        pay_run = self.get_object()
        
        if pay_run.status != 'Processed':
            return Response(
                {'error': 'Only processed pay runs can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pay_run.status = 'Approved'
        pay_run.save()
        
        return Response({'message': 'Pay run approved successfully'})
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark pay run as paid"""
        pay_run = self.get_object()
        
        if pay_run.status != 'Approved':
            return Response(
                {'error': 'Only approved pay runs can be marked as paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pay_run.status = 'Paid'
        pay_run.payment_date = datetime.now().date()
        pay_run.save()
        
        # Mark all details as paid
        pay_run.details.update(is_paid=True, payment_date=datetime.now().date())
        
        return Response({'message': 'Pay run marked as paid successfully'})


class PayRunDetailViewSet(viewsets.ModelViewSet):
    serializer_class = PayRunDetailSerializer
    
    def get_queryset(self):
        pay_run_id = self.request.query_params.get('pay_run_id')
        queryset = PayRunDetail.objects.all()
        
        if pay_run_id:
            queryset = queryset.filter(pay_run_id=pay_run_id)
        
        return queryset.order_by('employee__employee_name')


class StatutoryConfigurationViewSet(viewsets.ModelViewSet):
    serializer_class = StatutoryConfigurationSerializer
    
    def get_queryset(self):
        tenant_id = self.request.session.get('tenant_id')
        return StatutoryConfiguration.objects.filter(tenant_id=tenant_id, is_active=True)
    
    def perform_create(self, serializer):
        tenant_id = self.request.session.get('tenant_id')
        serializer.save(tenant_id=tenant_id)


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    
    def get_queryset(self):
        tenant_id = self.request.session.get('tenant_id')
        employee_id = self.request.query_params.get('employee_id')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        queryset = Attendance.objects.filter(tenant_id=tenant_id)
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if start_date:
            queryset = queryset.filter(attendance_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(attendance_date__lte=end_date)
        
        return queryset.order_by('-attendance_date')
    
    def perform_create(self, serializer):
        tenant_id = self.request.session.get('tenant_id')
        serializer.save(tenant_id=tenant_id)
    
    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        """Bulk mark attendance for multiple employees"""
        tenant_id = request.session.get('tenant_id')
        attendance_date = request.data.get('attendance_date')
        employee_ids = request.data.get('employee_ids', [])
        status_value = request.data.get('status', 'Present')
        
        if not attendance_date or not employee_ids:
            return Response(
                {'error': 'attendance_date and employee_ids are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_count = 0
        for emp_id in employee_ids:
            Attendance.objects.update_or_create(
                tenant_id=tenant_id,
                employee_id=emp_id,
                attendance_date=attendance_date,
                defaults={'status': status_value}
            )
            created_count += 1
        
        return Response({
            'message': f'Attendance marked for {created_count} employees',
            'count': created_count
        })


class LeaveApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveApplicationSerializer
    
    def get_queryset(self):
        tenant_id = self.request.session.get('tenant_id')
        employee_id = self.request.query_params.get('employee_id')
        status_filter = self.request.query_params.get('status')
        
        queryset = LeaveApplication.objects.filter(tenant_id=tenant_id)
        
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        tenant_id = self.request.session.get('tenant_id')
        serializer.save(tenant_id=tenant_id)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve leave application"""
        leave = self.get_object()
        
        if leave.status != 'Pending':
            return Response(
                {'error': 'Only pending leaves can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        leave.status = 'Approved'
        leave.approved_by = request.user.username if hasattr(request.user, 'username') else 'Admin'
        leave.approved_date = datetime.now()
        leave.save()
        
        return Response({'message': 'Leave approved successfully'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject leave application"""
        leave = self.get_object()
        
        if leave.status != 'Pending':
            return Response(
                {'error': 'Only pending leaves can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        leave.status = 'Rejected'
        leave.rejection_reason = request.data.get('reason', '')
        leave.save()
        
        return Response({'message': 'Leave rejected successfully'})
