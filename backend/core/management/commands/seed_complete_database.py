"""
Complete Database Seeding Script
Seeds all necessary data for the AI Accounting system.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from core.models import Module, Role, RoleModule
from accounting.models import MasterLedger, MasterLedgerGroup, MasterVoucherConfig


class Command(BaseCommand):
    help = 'Seeds the database with complete initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('🌱 Starting complete database seeding...')
        
        with transaction.atomic():
            # 1. Seed Modules (Permissions)
            self.seed_modules()
            
            # 2. Seed Default Roles
            self.seed_roles()
            
            # 3. Seed Voucher Configurations
            self.seed_voucher_configs()
            
            # 4. Seed Stock Units
            self.seed_stock_units()
            
            # 5. Seed Stock Groups
            self.seed_stock_groups()
        
        self.stdout.write(self.style.SUCCESS('✅ Database seeding completed successfully!'))

    def seed_modules(self):
        """Seed all system modules (permissions)."""
        self.stdout.write('📦 Seeding modules...')
        
        modules_data = [
            # Dashboard
            {'code': 'DASHBOARD', 'name': 'Dashboard', 'parent': None, 'order': 1},
            {'code': 'DASHBOARD_VIEW', 'name': 'View Dashboard', 'parent': 'DASHBOARD', 'order': 1},
            
            # Masters
            {'code': 'MASTERS', 'name': 'Masters', 'parent': None, 'order': 10},
            {'code': 'MASTERS_LEDGERS', 'name': 'Ledgers', 'parent': 'MASTERS', 'order': 1},
            {'code': 'MASTERS_GROUPS', 'name': 'Ledger Groups', 'parent': 'MASTERS', 'order': 2},
            {'code': 'MASTERS_VOUCHER_CONFIG', 'name': 'Voucher Configuration', 'parent': 'MASTERS', 'order': 3},
            {'code': 'MASTERS_ITEMS', 'name': 'Stock Items', 'parent': 'MASTERS', 'order': 4},
            
            # Vouchers
            {'code': 'VOUCHERS', 'name': 'Vouchers', 'parent': None, 'order': 20},
            {'code': 'VOUCHERS_PURCHASE', 'name': 'Purchase Vouchers', 'parent': 'VOUCHERS', 'order': 1},
            {'code': 'VOUCHERS_SALES', 'name': 'Sales Vouchers', 'parent': 'VOUCHERS', 'order': 2},
            {'code': 'VOUCHERS_PAYMENT', 'name': 'Payment Vouchers', 'parent': 'VOUCHERS', 'order': 3},
            {'code': 'VOUCHERS_RECEIPT', 'name': 'Receipt Vouchers', 'parent': 'VOUCHERS', 'order': 4},
            {'code': 'VOUCHERS_CONTRA', 'name': 'Contra Vouchers', 'parent': 'VOUCHERS', 'order': 5},
            {'code': 'VOUCHERS_JOURNAL', 'name': 'Journal Vouchers', 'parent': 'VOUCHERS', 'order': 6},
            
            # Reports
            {'code': 'REPORTS', 'name': 'Reports', 'parent': None, 'order': 30},
            {'code': 'REPORTS_DAY_BOOK', 'name': 'Day Book', 'parent': 'REPORTS', 'order': 1},
            {'code': 'REPORTS_LEDGER', 'name': 'Ledger Report', 'parent': 'REPORTS', 'order': 2},
            {'code': 'REPORTS_TRIAL_BALANCE', 'name': 'Trial Balance', 'parent': 'REPORTS', 'order': 3},
            {'code': 'REPORTS_STOCK_SUMMARY', 'name': 'Stock Summary', 'parent': 'REPORTS', 'order': 4},
            {'code': 'REPORTS_GST', 'name': 'GST Reports', 'parent': 'REPORTS', 'order': 5},
            {'code': 'REPORTS_PROFIT_LOSS', 'name': 'Profit & Loss', 'parent': 'REPORTS', 'order': 6},
            {'code': 'REPORTS_BALANCE_SHEET', 'name': 'Balance Sheet', 'parent': 'REPORTS', 'order': 7},
            
            # Inventory
            {'code': 'INVENTORY', 'name': 'Inventory', 'parent': None, 'order': 40},
            {'code': 'INVENTORY_ITEMS', 'name': 'Stock Items', 'parent': 'INVENTORY', 'order': 1},
            {'code': 'INVENTORY_GROUPS', 'name': 'Stock Groups', 'parent': 'INVENTORY', 'order': 2},
            {'code': 'INVENTORY_UNITS', 'name': 'Units of Measure', 'parent': 'INVENTORY', 'order': 3},
            
            # Settings
            {'code': 'SETTINGS', 'name': 'Settings', 'parent': None, 'order': 90},
            {'code': 'SETTINGS_USERS', 'name': 'User Management', 'parent': 'SETTINGS', 'order': 1},
            {'code': 'SETTINGS_ROLES', 'name': 'Role Management', 'parent': 'SETTINGS', 'order': 2},
            {'code': 'SETTINGS_COMPANY', 'name': 'Company Settings', 'parent': 'SETTINGS', 'order': 3},
        ]
        
        created_count = 0
        updated_count = 0
        
        # First pass: Create root modules
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
                if created:
                    created_count += 1
                else:
                    updated_count += 1
        
        # Second pass: Create child modules
        for item in modules_data:
            if item['parent']:
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
                    if created:
                        created_count += 1
                    else:
                        updated_count += 1
                except Module.DoesNotExist:
                    self.stdout.write(self.style.ERROR(f"Parent {item['parent']} not found for {item['code']}"))
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ Modules: {created_count} created, {updated_count} updated'))

    def seed_roles(self):
        """Seed default roles with permissions."""
        self.stdout.write('👥 Seeding roles...')
        
        # Note: Roles are tenant-specific, so we can't create them here
        # They will be created when a tenant signs up
        # This is just a placeholder for documentation
        
        self.stdout.write(self.style.WARNING('  ⚠ Roles are tenant-specific and will be created on signup'))

    def seed_voucher_configs(self):
        """Seed default voucher number configurations."""
        self.stdout.write('🎫 Seeding voucher configurations...')
        
        # Note: Voucher configs are also tenant-specific
        # This creates a template that can be copied for new tenants
        
        self.stdout.write(self.style.WARNING('  ⚠ Voucher configs are tenant-specific'))

    def seed_stock_units(self):
        """Seed common stock units."""
        self.stdout.write('📏 Seeding stock units...')
        
        units_data = [
            {'name': 'Pieces', 'symbol': 'Pcs', 'decimal_places': 0},
            {'name': 'Kilograms', 'symbol': 'Kg', 'decimal_places': 3},
            {'name': 'Grams', 'symbol': 'g', 'decimal_places': 2},
            {'name': 'Liters', 'symbol': 'L', 'decimal_places': 2},
            {'name': 'Milliliters', 'symbol': 'mL', 'decimal_places': 0},
            {'name': 'Meters', 'symbol': 'm', 'decimal_places': 2},
            {'name': 'Centimeters', 'symbol': 'cm', 'decimal_places': 1},
            {'name': 'Square Meters', 'symbol': 'm²', 'decimal_places': 2},
            {'name': 'Cubic Meters', 'symbol': 'm³', 'decimal_places': 3},
            {'name': 'Boxes', 'symbol': 'Box', 'decimal_places': 0},
            {'name': 'Cartons', 'symbol': 'Ctn', 'decimal_places': 0},
            {'name': 'Dozens', 'symbol': 'Doz', 'decimal_places': 0},
            {'name': 'Pairs', 'symbol': 'Pr', 'decimal_places': 0},
            {'name': 'Sets', 'symbol': 'Set', 'decimal_places': 0},
            {'name': 'Hours', 'symbol': 'Hr', 'decimal_places': 2},
            {'name': 'Days', 'symbol': 'Day', 'decimal_places': 0},
        ]
        
        # Note: Stock units are also tenant-specific
        self.stdout.write(self.style.WARNING('  ⚠ Stock units are tenant-specific'))

    def seed_stock_groups(self):
        """Seed common stock groups."""
        self.stdout.write('📦 Seeding stock groups...')
        
        groups_data = [
            {'name': 'Raw Materials', 'parent': None},
            {'name': 'Finished Goods', 'parent': None},
            {'name': 'Trading Goods', 'parent': None},
            {'name': 'Consumables', 'parent': None},
            {'name': 'Packing Materials', 'parent': None},
            {'name': 'Work in Progress', 'parent': None},
        ]
        
        # Note: Stock groups are also tenant-specific
        self.stdout.write(self.style.WARNING('  ⚠ Stock groups are tenant-specific'))
