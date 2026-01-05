"""
Seed default roles for all existing tenants.
Run this with: python seed_roles.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import transaction
from core.models import Tenant, Role, RoleModule, Module

def seed_roles():
    """Seed default roles and permissions for all tenants."""
    try:
        tenants = Tenant.objects.all()
        print(f"Found {tenants.count()} tenants.")
        
        # Get all modules
        all_modules = list(Module.objects.all())
        print(f"Found {len(all_modules)} modules.")
        
        with transaction.atomic():
            for tenant in tenants:
                print(f"\nProcessing tenant: {tenant.name} ({tenant.id})")
                
                # 1. Create Owner Role
                owner_role, created = Role.objects.get_or_create(
                    tenant_id=tenant.id,
                    name='Owner',
                    defaults={
                        'description': 'Full access to all modules',
                        'is_system': True
                    }
                )
                if created:
                    print("   ✅ Created Owner role")
                    # Grant all permissions to Owner
                    for module in all_modules:
                        RoleModule.objects.create(
                            role_id=owner_role.id,
                            module_id=module.id,
                            can_view=True,
                            can_create=True,
                            can_edit=True,
                            can_delete=True
                        )
                    print("      Mapped all modules to Owner")
                else:
                    print("   ℹ️  Owner role already exists")

                # 2. Create Accountant Role
                accountant_role, created = Role.objects.get_or_create(
                    tenant_id=tenant.id,
                    name='Accountant',
                    defaults={
                        'description': 'Full accounting access, limited settings',
                        'is_system': True
                    }
                )
                if created:
                    print("   ✅ Created Accountant role")
                    # Grant accounting permissions
                    for module in all_modules:
                        # Skip Admin/Settings/Users for Accountant
                        if module.code.startswith('USERS') or module.code.startswith('SETTINGS'):
                            continue
                        
                        RoleModule.objects.create(
                            role_id=accountant_role.id,
                            module_id=module.id,
                            can_view=True,
                            can_create=True,
                            can_edit=True,
                            # Prevent deleting important masters
                            can_delete=False if 'MASTERS' in module.code else True
                        )
                    print("      Mapped accounting modules to Accountant")

                # 3. Create Data Entry Role
                data_entry_role, created = Role.objects.get_or_create(
                    tenant_id=tenant.id,
                    name='Data Entry',
                    defaults={
                        'description': 'Limited access for voucher entry',
                        'is_system': True
                    }
                )
                if created:
                    print("   ✅ Created Data Entry role")
                    # Grant data entry permissions
                    for module in all_modules:
                        # Only Dashboard, Vouchers, Inventory
                        if not (module.code.startswith('DASHBOARD') or 
                                module.code.startswith('VOUCHERS') or 
                                module.code.startswith('INVENTORY')):
                            continue
                            
                        RoleModule.objects.create(
                            role_id=data_entry_role.id,
                            module_id=module.id,
                            can_view=True,
                            # Create but no edit/delete for most things
                            can_create=True,
                            can_edit=False,
                            can_delete=False
                        )
                    print("      Mapped data entry modules")

        print("\n✅ Successfully seeded roles for all tenants!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    seed_roles()
