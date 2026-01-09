"""
Seed Sample Ledgers with Balances
Creates sample ledgers including bank accounts with opening balances.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from accounting.models import MasterLedger
from core.models import User


class Command(BaseCommand):
    help = 'Seeds sample ledgers with balances for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id',
            type=str,
            help='Tenant ID to seed data for (optional, will use first user if not provided)',
        )

    def handle(self, *args, **options):
        tenant_id = options.get('tenant_id')
        
        if not tenant_id:
            # Get the first user's tenant_id
            try:
                user = User.objects.first()
                if user:
                    tenant_id = user.tenant_id
                    self.stdout.write(f'Using tenant_id: {tenant_id}')
                else:
                    self.stdout.write(self.style.ERROR('No users found. Please create a user first.'))
                    return
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error finding user: {str(e)}'))
                return
        
        self.stdout.write('🌱 Seeding sample ledgers with balances...')
        
        with transaction.atomic():
            self.seed_bank_accounts(tenant_id)
            self.seed_cash_accounts(tenant_id)
            self.seed_party_ledgers(tenant_id)
            self.seed_expense_ledgers(tenant_id)
            self.seed_income_ledgers(tenant_id)
        
        self.stdout.write(self.style.SUCCESS('✅ Sample ledgers seeded successfully!'))

    def seed_bank_accounts(self, tenant_id):
        """Seed bank account ledgers with balances."""
        self.stdout.write('🏦 Seeding bank accounts...')
        
        bank_accounts = [
            {
                'name': 'HDFC Bank',
                'group': 'Bank Accounts',
                'category': 'Asset',
                'sub_group_1': 'Current Assets',
                'sub_group_2': 'Bank Accounts',
                'opening_balance': 250000.00,
                'account_number': '50100123456789',
                'ifsc': 'HDFC0001234',
                'branch': 'Main Branch'
            },
            {
                'name': 'ICICI Bank',
                'group': 'Bank Accounts',
                'category': 'Asset',
                'sub_group_1': 'Current Assets',
                'sub_group_2': 'Bank Accounts',
                'opening_balance': 150000.00,
                'account_number': '012345678901',
                'ifsc': 'ICIC0001234',
                'branch': 'Corporate Branch'
            },
            {
                'name': 'SBI Current Account',
                'group': 'Bank Accounts',
                'category': 'Asset',
                'sub_group_1': 'Current Assets',
                'sub_group_2': 'Bank Accounts',
                'opening_balance': 180000.00,
                'account_number': '30123456789',
                'ifsc': 'SBIN0001234',
                'branch': 'City Branch'
            },
        ]
        
        created = 0
        for acc in bank_accounts:
            opening_balance = acc.pop('opening_balance')
            account_number = acc.pop('account_number', None)
            ifsc = acc.pop('ifsc', None)
            branch = acc.pop('branch', None)
            
            # Store additional data in extended_data
            extended_data = {}
            if account_number:
                extended_data['account_number'] = account_number
            if ifsc:
                extended_data['ifsc'] = ifsc
            if branch:
                extended_data['branch'] = branch
            
            # Store opening balance in additional_data
            additional_data = {
                'opening_balance': opening_balance,
                'current_balance': opening_balance
            }
            
            ledger, is_created = MasterLedger.objects.update_or_create(
                name=acc['name'],
                tenant_id=tenant_id,
                defaults={
                    **acc,
                    'extended_data': extended_data,
                    'additional_data': additional_data
                }
            )
            if is_created:
                created += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ Created {created} bank accounts'))

    def seed_cash_accounts(self, tenant_id):
        """Seed cash account ledgers."""
        self.stdout.write('💵 Seeding cash accounts...')
        
        cash_accounts = [
            {
                'name': 'Cash in Hand',
                'group': 'Cash-in-Hand',
                'category': 'Asset',
                'sub_group_1': 'Current Assets',
                'sub_group_2': 'Cash',
                'opening_balance': 50000.00
            },
            {
                'name': 'Petty Cash',
                'group': 'Cash-in-Hand',
                'category': 'Asset',
                'sub_group_1': 'Current Assets',
                'sub_group_2': 'Cash',
                'opening_balance': 10000.00
            },
        ]
        
        created = 0
        for acc in cash_accounts:
            opening_balance = acc.pop('opening_balance')
            
            additional_data = {
                'opening_balance': opening_balance,
                'current_balance': opening_balance
            }
            
            ledger, is_created = MasterLedger.objects.update_or_create(
                name=acc['name'],
                tenant_id=tenant_id,
                defaults={
                    **acc,
                    'additional_data': additional_data
                }
            )
            if is_created:
                created += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ Created {created} cash accounts'))

    def seed_party_ledgers(self, tenant_id):
        """Seed party (customer/supplier) ledgers."""
        self.stdout.write('👥 Seeding party ledgers...')
        
        parties = [
            {
                'name': 'ABC Suppliers Pvt Ltd',
                'group': 'Sundry Creditors',
                'category': 'Liability',
                'sub_group_1': 'Current Liabilities',
                'sub_group_2': 'Trade Payables',
                'gstin': '29ABCDE1234F1Z5',
                'state': 'Karnataka',
                'registration_type': 'Registered'
            },
            {
                'name': 'XYZ Customers Ltd',
                'group': 'Sundry Debtors',
                'category': 'Asset',
                'sub_group_1': 'Current Assets',
                'sub_group_2': 'Trade Receivables',
                'gstin': '27XYZAB5678G2Z1',
                'state': 'Maharashtra',
                'registration_type': 'Registered'
            },
            {
                'name': 'Local Supplier',
                'group': 'Sundry Creditors',
                'category': 'Liability',
                'sub_group_1': 'Current Liabilities',
                'sub_group_2': 'Trade Payables',
                'state': 'Karnataka',
                'registration_type': 'Unregistered'
            },
        ]
        
        created = 0
        for party in parties:
            ledger, is_created = MasterLedger.objects.update_or_create(
                name=party['name'],
                tenant_id=tenant_id,
                defaults=party
            )
            if is_created:
                created += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ Created {created} party ledgers'))

    def seed_expense_ledgers(self, tenant_id):
        """Seed expense ledgers."""
        self.stdout.write('💸 Seeding expense ledgers...')
        
        expenses = [
            {'name': 'Rent Expense', 'group': 'Indirect Expenses', 'category': 'Expenditure'},
            {'name': 'Salary Expense', 'group': 'Direct Expenses', 'category': 'Expenditure'},
            {'name': 'Electricity Expense', 'group': 'Indirect Expenses', 'category': 'Expenditure'},
            {'name': 'Telephone Expense', 'group': 'Indirect Expenses', 'category': 'Expenditure'},
            {'name': 'Office Supplies', 'group': 'Indirect Expenses', 'category': 'Expenditure'},
        ]
        
        created = 0
        for expense in expenses:
            ledger, is_created = MasterLedger.objects.update_or_create(
                name=expense['name'],
                tenant_id=tenant_id,
                defaults=expense
            )
            if is_created:
                created += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ Created {created} expense ledgers'))

    def seed_income_ledgers(self, tenant_id):
        """Seed income ledgers."""
        self.stdout.write('💰 Seeding income ledgers...')
        
        incomes = [
            {'name': 'Sales Revenue', 'group': 'Sales Accounts', 'category': 'Income'},
            {'name': 'Service Income', 'group': 'Sales Accounts', 'category': 'Income'},
            {'name': 'Interest Income', 'group': 'Indirect Income', 'category': 'Income'},
        ]
        
        created = 0
        for income in incomes:
            ledger, is_created = MasterLedger.objects.update_or_create(
                name=income['name'],
                tenant_id=tenant_id,
                defaults=income
            )
            if is_created:
                created += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ Created {created} income ledgers'))
