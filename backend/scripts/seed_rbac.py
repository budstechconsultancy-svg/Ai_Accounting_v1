#!/usr/bin/env python
"""
RBAC Seed Script for AI Accounting Application
Seeds default permissions and creates owner role for a tenant with all permissions.
"""

import os
import sys
import django
from django.conf import settings

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Permission, Role, UserRole, User
import uuid

def seed_rbac_for_tenant(tenant_id, owner_username=None):
    """
    Seeds RBAC data for a specific tenant.
    Creates default permissions, owner role with full permissions in JSON,
    and assigns it to the owner user if provided.
    """
    print(f"Seeding RBAC for tenant {tenant_id}")

    # Seed permissions (tenant-independent, as per schema)
    permissions = [
        # Accounting permissions
        Permission(code='accounting_vouchers_read', module='accounting', group_name='Vouchers', description='Read access to vouchers'),
        Permission(code='accounting_vouchers_write', module='accounting', group_name='Vouchers', description='Write access to vouchers'),
        Permission(code='accounting_vouchers_delete', module='accounting', group_name='Vouchers', description='Delete access to vouchers'),

        # Inventory permissions
        Permission(code='inventory_items_read', module='inventory', group_name='Stock Items', description='Read access to stock items'),
        Permission(code='inventory_items_write', module='inventory', group_name='Stock Items', description='Write access to stock items'),
        Permission(code='inventory_items_delete', module='inventory', group_name='Stock Items', description='Delete access to stock items'),
        Permission(code='inventory_groups_read', module='inventory', group_name='Stock Groups', description='Read access to stock groups'),
        Permission(code='inventory_groups_write', module='inventory', group_name='Stock Groups', description='Write access to stock groups'),
        Permission(code='inventory_groups_delete', module='inventory', group_name='Stock Groups', description='Delete access to stock groups'),

        # Masters permissions
        Permission(code='masters_ledgers_read', module='masters', group_name='Ledgers', description='Read access to ledgers'),
        Permission(code='masters_ledgers_write', module='masters', group_name='Ledgers', description='Write access to ledgers'),
        Permission(code='masters_ledgers_delete', module='masters', group_name='Ledgers', description='Delete access to ledgers'),
        Permission(code='masters_groups_read', module='masters', group_name='Groups', description='Read access to ledger groups'),
        Permission(code='masters_groups_write', module='masters', group_name='Groups', description='Write access to ledger groups'),
        Permission(code='masters_groups_delete', module='masters', group_name='Groups', description='Delete access to ledger groups'),

        # Reports permissions
        Permission(code='reports_view', module='reports', group_name='Reports', description='View access to reports'),

        # Users permissions
        Permission(code='users_read', module='users', group_name='Users', description='Read access to user management'),
        Permission(code='users_write', module='users', group_name='Users', description='Write access to user management'),
        Permission(code='users_delete', module='users', group_name='Users', description='Delete access to user management'),

        # Roles permissions
        Permission(code='roles_read', module='roles', group_name='Roles', description='Read access to role management'),
        Permission(code='roles_write', module='roles', group_name='Roles', description='Write access to role management'),
        Permission(code='roles_delete', module='roles', group_name='Roles', description='Delete access to role management'),
    ]

    created_permissions = []
    for perm in permissions:
        obj, created = Permission.objects.get_or_create(
            code=perm.code,
            defaults={
                'module': perm.module,
                'group_name': perm.group_name,
                'description': perm.description
            }
        )
        if created:
            created_permissions.append(obj)
            print(f"Created permission: {obj.code}")

    # Get all permission codes for owner role
    all_perm_codes = list(Permission.objects.values_list('code', flat=True))

    # Create Owner role for tenant with all permissions
    owner_role, created = Role.objects.get_or_create(
        tenant_id=tenant_id,
        name='Owner',
        defaults={
            'description': 'Full access to all modules and functions',
            'permissions': all_perm_codes
        }
    )

    if created:
        print(f"Created owner role for tenant {tenant_id}: {owner_role.name} with all permissions")
    else:
        print(f"Owner role already exists for tenant {tenant_id}")
        # Check if permissions are set
        if not owner_role.permissions:
            owner_role.permissions = all_perm_codes
            owner_role.save()
            print(f"Updated {owner_role.name} role with all permissions")

    # Assign owner role to the owner user if provided
    if owner_username:
        try:
            owner_user = User.objects.get(username=owner_username, tenant_id=tenant_id)
            user_role, created = UserRole.objects.get_or_create(
                user=owner_user,
                role=owner_role,
                tenant_id=tenant_id
            )
            if created:
                print(f"Assigned {owner_role.name} role to user {owner_username}")
            else:
                print(f"User {owner_username} already has {owner_role.name} role")
        except User.DoesNotExist:
            print(f"Warning: Owner user {owner_username} not found for tenant {tenant_id}")

    print(f"RBAC seeding completed for tenant {tenant_id}")
    return owner_role

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python seed_rbac.py <tenant_id> [owner_username]")
        sys.exit(1)

    tenant_id = sys.argv[1]
    owner_username = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        seed_rbac_for_tenant(tenant_id, owner_username)
        print("Seed script completed successfully.")
    except Exception as e:
        print(f"Error running seed script: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
