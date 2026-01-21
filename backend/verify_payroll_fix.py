#!/usr/bin/env python
"""Comprehensive verification of the payroll database fix"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from payroll.models import (
    EmployeeBasicDetails, 
    EmployeeEmployment, 
    EmployeeSalary,
    EmployeeStatutory,
    EmployeeBankDetails
)
import pymysql

def check_database_columns():
    """Verify tenant_id column exists in all tables"""
    print("=" * 60)
    print("CHECKING DATABASE SCHEMA")
    print("=" * 60)
    
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='Ulaganathan123',
        database='ai_accounting'
    )
    cursor = conn.cursor()
    
    tables = [
        'payroll_employee_employment',
        'payroll_employee_salary',
        'payroll_employee_statutory',
        'payroll_employee_bank_details'
    ]
    
    all_good = True
    for table in tables:
        cursor.execute(f"DESCRIBE {table}")
        columns = [row[0] for row in cursor.fetchall()]
        has_tenant_id = 'tenant_id' in columns
        
        status = "✅" if has_tenant_id else "❌"
        print(f"{status} {table:40} tenant_id: {has_tenant_id}")
        
        if not has_tenant_id:
            all_good = False
    
    conn.close()
    return all_good

def check_django_models():
    """Verify Django models can query the database"""
    print("\n" + "=" * 60)
    print("CHECKING DJANGO ORM QUERIES")
    print("=" * 60)
    
    models = [
        ('EmployeeBasicDetails', EmployeeBasicDetails),
        ('EmployeeEmployment', EmployeeEmployment),
        ('EmployeeSalary', EmployeeSalary),
        ('EmployeeStatutory', EmployeeStatutory),
        ('EmployeeBankDetails', EmployeeBankDetails),
    ]
    
    all_good = True
    for name, model in models:
        try:
            count = model.objects.all().count()
            print(f"✅ {name:30} Query successful ({count} records)")
        except Exception as e:
            print(f"❌ {name:30} Query failed: {str(e)[:50]}")
            all_good = False
    
    return all_good

def check_model_fields():
    """Verify tenant_id field exists in Django models"""
    print("\n" + "=" * 60)
    print("CHECKING DJANGO MODEL FIELDS")
    print("=" * 60)
    
    models = [
        ('EmployeeEmployment', EmployeeEmployment),
        ('EmployeeSalary', EmployeeSalary),
        ('EmployeeStatutory', EmployeeStatutory),
        ('EmployeeBankDetails', EmployeeBankDetails),
    ]
    
    all_good = True
    for name, model in models:
        fields = [f.name for f in model._meta.get_fields()]
        has_tenant_id = 'tenant_id' in fields
        
        status = "✅" if has_tenant_id else "❌"
        print(f"{status} {name:30} has tenant_id field: {has_tenant_id}")
        
        if not has_tenant_id:
            all_good = False
    
    return all_good

def main():
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 10 + "PAYROLL DATABASE FIX VERIFICATION" + " " * 15 + "║")
    print("╚" + "=" * 58 + "╝")
    print()
    
    # Run all checks
    db_check = check_database_columns()
    model_check = check_django_models()
    field_check = check_model_fields()
    
    # Final summary
    print("\n" + "=" * 60)
    print("FINAL SUMMARY")
    print("=" * 60)
    
    if db_check and model_check and field_check:
        print("✅ ALL CHECKS PASSED!")
        print("✅ The payroll database fix is successful.")
        print("✅ Your application should now work without errors.")
        return 0
    else:
        print("❌ SOME CHECKS FAILED!")
        print("❌ Please review the errors above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
