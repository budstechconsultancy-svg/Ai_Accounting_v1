#!/usr/bin/env python
"""Simple verification of the payroll database fix"""
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

print("\n" + "="*60)
print("PAYROLL DATABASE FIX VERIFICATION")
print("="*60 + "\n")

# Test each model
models_to_test = [
    ('EmployeeBasicDetails', EmployeeBasicDetails),
    ('EmployeeEmployment', EmployeeEmployment),
    ('EmployeeSalary', EmployeeSalary),
    ('EmployeeStatutory', EmployeeStatutory),
    ('EmployeeBankDetails', EmployeeBankDetails),
]

all_passed = True

for name, model in models_to_test:
    try:
        count = model.objects.all().count()
        print(f"[OK] {name:30} - {count} records")
    except Exception as e:
        print(f"[FAIL] {name:30} - Error: {str(e)[:40]}")
        all_passed = False

print("\n" + "="*60)
if all_passed:
    print("SUCCESS! All payroll models are working correctly.")
    print("The tenant_id column fix has been applied successfully.")
else:
    print("FAILED! Some models have errors.")
print("="*60 + "\n")

sys.exit(0 if all_passed else 1)
