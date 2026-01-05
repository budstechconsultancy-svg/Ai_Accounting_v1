
import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Module, RoleModule

def seed_modules():
    print("Seeding modules...")
    
    # Disable FK checks to allow truncate/delete
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        
    print("Clearing role_modules...")
    RoleModule.objects.all().delete()

    print("Clearing existing modules...")
    Module.objects.all().delete()
    
    with connection.cursor() as cursor:
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
    
    # Parent Modules
    parents = [
        (1, 'DASHBOARD', 'Dashboard', 'Overview', 1),
        (2, 'MASTERS', 'Masters', 'Master Data', 2),
        (3, 'VOUCHERS', 'Vouchers', 'Transactions', 3),
        (4, 'INVENTORY', 'Inventory', 'Stock Management', 4),
        (5, 'REPORTS', 'Reports', 'Financial Reports', 5),
        (6, 'SETTINGS', 'Settings', 'Configuration', 6),
        (7, 'USERS', 'Users', 'User Management', 7),
    ]

    for pid, code, name, desc, order in parents:
        Module.objects.update_or_create(
            id=pid,
            defaults={
                'code': code,
                'name': name,
                'description': desc,
                'parent_module_id': None,
                'display_order': order,
                'is_active': True
            }
        )
        print(f"Verified parent: {name}")

    # Child Modules
    children = [
        # Masters
        ('MASTERS_LEDGERS', 'Ledgers', 'Manage Ledgers', 2, 1),
        ('MASTERS_GROUPS', 'Groups', 'Manage Groups', 2, 2),
        ('MASTERS_VOUCHER_TYPES', 'Voucher Types', 'Manage Voucher Config', 2, 3),
        
        # Vouchers
        ('VOUCHERS_SALES', 'Sales', 'Sales Vouchers', 3, 1),
        ('VOUCHERS_PURCHASE', 'Purchase', 'Purchase Vouchers', 3, 2),
        ('VOUCHERS_PAYMENT', 'Payment', 'Payment Vouchers', 3, 3),
        ('VOUCHERS_RECEIPT', 'Receipt', 'Receipt Vouchers', 3, 4),
        ('VOUCHERS_JOURNAL', 'Journal', 'Journal Vouchers', 3, 5),
        ('VOUCHERS_CONTRA', 'Contra', 'Contra Vouchers', 3, 6),
        ('VOUCHERS_CREDIT_NOTE', 'Credit Note', 'Credit Notes', 3, 7),
        ('VOUCHERS_DEBIT_NOTE', 'Debit Note', 'Debit Notes', 3, 8),
        
        # Inventory
        ('INVENTORY_ITEMS', 'Stock Items', 'Manage Stock Items', 4, 1),
        ('INVENTORY_GROUPS', 'Stock Groups', 'Manage Stock Groups', 4, 2),
        ('INVENTORY_UNITS', 'Units', 'Manage Units', 4, 3),
        
        # Reports
        ('REPORTS_DAYBOOK', 'Daybook', 'Daybook Report', 5, 1),
        ('REPORTS_TRIAL_BALANCE', 'Trial Balance', 'Trial Balance Report', 5, 2),
        ('REPORTS_PROFIT_LOSS', 'Profit & Loss', 'P&L Report', 5, 3),
        ('REPORTS_BALANCE_SHEET', 'Balance Sheet', 'Balance Sheet Report', 5, 4),
        ('REPORTS_STOCK_SUMMARY', 'Stock Summary', 'Stock Summary Report', 5, 5),
        ('REPORTS_GSTR1', 'GSTR-1', 'GST Return 1', 5, 6),
        ('REPORTS_GSTR3B', 'GSTR-3B', 'GST Return 3B', 5, 7),
        
        # Settings
        ('SETTINGS_COMPANY', 'Company', 'Company Settings', 6, 1),
        ('SETTINGS_USERS', 'Users', 'Manage Users', 6, 2),
        
        # Users
        ('USERS_MANAGE', 'Manage Users', 'Create/Edit Users', 7, 1),
        ('USERS_ROLES', 'Manage Roles', 'Create/Edit Roles', 7, 2),
    ]

    for code, name, desc, pid, order in children:
        Module.objects.update_or_create(
            code=code,
            defaults={
                'name': name,
                'description': desc,
                'parent_module_id': pid,
                'display_order': order,
                'is_active': True
            }
        )
        print(f"Verified child: {name}")

    print("✅ Modules seeded successfully.")

if __name__ == '__main__':
    seed_modules()
