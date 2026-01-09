from django.core.management.base import BaseCommand
from core.models import Module

class Command(BaseCommand):
    help = 'Seeds the database with standard modules and permissions'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding modules and permissions...')

        # clear existing? No, maybe update_or_create is safer to preserve IDs if possible, 
        # but for now let's ensure we have the structure.
        
        # Format: (Code, Name, Description, Parent Code OR None, Display Order)
        # We will use a dictionary structure to handle parent lookups dynamically
        
        modules_data = [
            # Root Modules
            {'code': 'MASTERS', 'name': 'Masters', 'parent': None, 'order': 10},
            {'code': 'VOUCHERS', 'name': 'Vouchers', 'parent': None, 'order': 20},
            {'code': 'REPORTS', 'name': 'Reports', 'parent': None, 'order': 30},
            {'code': 'INVENTORY', 'name': 'Inventory', 'parent': None, 'order': 40}, # If needed
            {'code': 'SETTINGS', 'name': 'Settings', 'parent': None, 'order': 90},

            # Masters Sub-modules
            {'code': 'MASTERS_LEDGERS', 'name': 'Ledgers', 'parent': 'MASTERS', 'order': 1},
            {'code': 'MASTERS_GROUPS', 'name': 'Ledger Groups', 'parent': 'MASTERS', 'order': 2}, # Even if hidden in UI, valid perm
            {'code': 'MASTERS_VOUCHER_CONFIG', 'name': 'Voucher Types', 'parent': 'MASTERS', 'order': 3},
            {'code': 'MASTERS_ITEMS', 'name': 'Stock Items', 'parent': 'MASTERS', 'order': 4},

            # Vouchers Sub-modules (Actions usually, but represented as modules for tab access)
            {'code': 'VOUCHERS_ENTRY', 'name': 'Voucher Entry', 'parent': 'VOUCHERS', 'order': 1},
            
            # Reports Sub-modules
            {'code': 'REPORTS_DAY_BOOK', 'name': 'Day Book', 'parent': 'REPORTS', 'order': 1},
            {'code': 'REPORTS_LEDGER', 'name': 'Ledger Report', 'parent': 'REPORTS', 'order': 2},
            {'code': 'REPORTS_TRIAL_BALANCE', 'name': 'Trial Balance', 'parent': 'REPORTS', 'order': 3},
            {'code': 'REPORTS_STOCK_SUMMARY', 'name': 'Stock Summary', 'parent': 'REPORTS', 'order': 4},
            {'code': 'REPORTS_GST', 'name': 'GST Reports', 'parent': 'REPORTS', 'order': 5},
            {'code': 'REPORTS_PROFIT_LOSS', 'name': 'Profit & Loss', 'parent': 'REPORTS', 'order': 6},
            {'code': 'REPORTS_BALANCE_SHEET', 'name': 'Balance Sheet', 'parent': 'REPORTS', 'order': 7},

            # Settings
            {'code': 'SETTINGS_USERS', 'name': 'User Management', 'parent': 'SETTINGS', 'order': 1},
            {'code': 'SETTINGS_COMPANY', 'name': 'Company Settings', 'parent': 'SETTINGS', 'order': 2},
        ]

        created_count = 0
        updated_count = 0

        # First pass: Create Root modules
        for item in modules_data:
            if item['parent'] is None:
                module, created = Module.objects.update_or_create(
                    code=item['code'],
                    defaults={
                        'name': item['name'],
                        'display_order': item['order'],
                        'is_active': True,
                        'parent_module_id': None
                    }
                )
                if created: created_count += 1
                else: updated_count += 1

        # Second pass: Create Child modules
        for item in modules_data:
            if item['parent']:
                # Find parent ID
                try:
                    parent = Module.objects.get(code=item['parent'])
                    module, created = Module.objects.update_or_create(
                        code=item['code'],
                        defaults={
                            'name': item['name'],
                            'display_order': item['order'],
                            'is_active': True,
                            'parent_module_id': parent.id
                        }
                    )
                    if created: created_count += 1
                    else: updated_count += 1
                except Module.DoesNotExist:
                    self.stdout.write(self.style.ERROR(f"Parent {item['parent']} not found for {item['code']}"))

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded permissions: {created_count} created, {updated_count} updated.'))
