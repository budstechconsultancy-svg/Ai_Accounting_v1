from rest_framework import serializers
from .models import (
    Employee, SalaryComponent, SalaryTemplate, SalaryTemplateComponent,
    EmployeeSalaryStructure, PayRun, PayRunDetail, StatutoryConfiguration,
    Attendance, LeaveApplication
)


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class SalaryComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryComponent
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class SalaryTemplateComponentSerializer(serializers.ModelSerializer):
    component_name = serializers.CharField(source='component.component_name', read_only=True)
    component_type = serializers.CharField(source='component.component_type', read_only=True)
    
    class Meta:
        model = SalaryTemplateComponent
        fields = ['id', 'component', 'component_name', 'component_type', 'value']


class SalaryTemplateSerializer(serializers.ModelSerializer):
    components = SalaryTemplateComponentSerializer(many=True, read_only=True)
    
    class Meta:
        model = SalaryTemplate
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class EmployeeSalaryStructureSerializer(serializers.ModelSerializer):
    component_name = serializers.CharField(source='component.component_name', read_only=True)
    component_type = serializers.CharField(source='component.component_type', read_only=True)
    
    class Meta:
        model = EmployeeSalaryStructure
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class PayRunDetailSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.employee_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)
    
    class Meta:
        model = PayRunDetail
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class PayRunSerializer(serializers.ModelSerializer):
    details = PayRunDetailSerializer(many=True, read_only=True)
    
    class Meta:
        model = PayRun
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class StatutoryConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatutoryConfiguration
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.employee_name', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class LeaveApplicationSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.employee_name', read_only=True)
    
    class Meta:
        model = LeaveApplication
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
