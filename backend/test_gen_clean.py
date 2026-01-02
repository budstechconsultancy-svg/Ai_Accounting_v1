"""
Clean test for ledger code generation
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.utils import generate_ledger_code

print("Testing ledger code generation...")

# Test 1: Fallback code
print("\n1. Testing fallback code generation...")
try:
    code = generate_ledger_code({'name': 'Test'}, tenant_id=1)
    print(f"   Generated: {code}")
    print(f"   ✓ Success")
except Exception as e:
    print(f"   ✗ Error: {e}")
    import traceback
    traceback.print_exc()

print("\nDone!")
