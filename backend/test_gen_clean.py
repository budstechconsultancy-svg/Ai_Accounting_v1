import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.utils import generate_ledger_code

with open('test_result_clean.txt', 'w', encoding='utf-8') as f:
    tenant_id = 1
    
    # Case 1
    data1 = {'category': 'NPO Funds', 'group': 'Unrestricted Funds', 'tenant_id': tenant_id}
    code1 = generate_ledger_code(data1, tenant_id)
    f.write(f"Group Level Code: {code1}\n")
    
    # Case 2
    data2 = {'category': 'Liability', 'group': 'Long-term borrowings', 'sub_group_1': 'Secured Loans', 'tenant_id': tenant_id}
    code2 = generate_ledger_code(data2, tenant_id)
    f.write(f"SubGroup Level Code: {code2}\n")
    
    # Case 3: Non-existent
    data3 = {'category': 'NonExistent', 'group': 'Nothing', 'tenant_id': tenant_id}
    code3 = generate_ledger_code(data3, tenant_id)
    f.write(f"Fallback Code: {code3}\n")
