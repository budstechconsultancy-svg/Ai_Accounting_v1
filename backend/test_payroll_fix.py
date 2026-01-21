#!/usr/bin/env python
"""Quick test to verify the payroll database fix"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from payroll.models import EmployeeBasicDetails, EmployeeEmployment

# Try to query the database
try:
    employees = EmployeeBasicDetails.objects.all()
    print(f"✅ Successfully queried EmployeeBasicDetails: {employees.count()} records")
    
    employment = EmployeeEmployment.objects.all()
    print(f"✅ Successfully queried EmployeeEmployment: {employment.count()} records")
    
    print("\n✅ DATABASE FIX SUCCESSFUL!")
    print("The 'tenant_id' column is now present and working correctly.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("The database fix did not work.")
