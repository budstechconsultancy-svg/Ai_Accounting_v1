"""
Script to remove all RBAC check_permission calls from flow.py files.
This removes the RBAC checks since the modules table doesn't exist.
"""

import re
import os

# List of flow.py files
flow_files = [
    r"c:\update\Ai_Accounting_v1\backend\inventory\flow.py",
    r"c:\update\Ai_Accounting_v1\backend\masters\flow.py",
    r"c:\update\Ai_Accounting_v1\backend\reports\flow.py",
    r"c:\update\Ai_Accounting_v1\backend\settings\flow.py",
    r"c:\update\Ai_Accounting_v1\backend\users_roles\flow.py",
    r"c:\update\Ai_Accounting_v1\backend\vouchers\flow.py",
]

def remove_rbac_from_file(filepath):
    """Remove RBAC check_permission calls from a file."""
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Remove import of check_permission
    content = re.sub(
        r'from core\.rbac import check_permission(?:, is_owner)?\n',
        '',
        content
    )
    
    # Remove RBAC check blocks (# 2. RBAC check ... if not has_perm: ...)
    # Pattern: matches the comment, the check_permission call, and the if block
    content = re.sub(
        r'\s*# 2\. RBAC check\n\s*has_perm, error_response = check_permission\([^)]+\)\n\s*if not has_perm:\n\s*raise PermissionError\([^)]+\)\n',
        '',
        content
    )
    
    # Update comment numbers (# 3. Business logic -> # 2. Business logic)
    content = re.sub(r'# 3\. Business logic', '# 2. Business logic', content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[OK] Updated: {os.path.basename(filepath)}")
        return True
    else:
        print(f"[-] No changes: {os.path.basename(filepath)}")
        return False

# Process all files
print("Removing RBAC from flow.py files...\n")
updated_count = 0

for filepath in flow_files:
    if remove_rbac_from_file(filepath):
        updated_count += 1

print(f"\n[OK] Complete! Updated {updated_count} files.")
