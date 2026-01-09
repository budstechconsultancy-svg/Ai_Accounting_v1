"""
Seed TransactionFile with Sample Ledgers
Creates sample ledgers in Transcaction_file table with balances.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from accounting.models_transaction import TransactionFile
from core.models import User


class Command(BaseCommand):
    help = 'Seeds Transcaction_file table with sample ledgers and balances'

    def handle(self, *args, **options):
        # Use tenant_id = 1 as per schema (BIGINT)
        tenant_id = 1
        
        self.stdout.write(f'Using tenant_id: {tenant_id}')

        
        self.stdout.write('🌱 Seeding Transcaction_file with sample ledgers...')
        
        with transaction.atomic():
            self.seed_bank_accounts(tenant_id)
            self.seed_cash_accounts(tenant_id)
            self.seed_party_ledgers(tenant_id)
        
        self.stdout.write(self.style.SUCCESS('✅ Transcaction_file seeded successfully!'))

    def seed_bank_accounts(self, tenant_id):
        """Seed bank account ledgers with balances."""
        self.stdout.write('🏦 Seeding bank accounts...')
        
        bank_accounts = [
            {
                'ledger_name': 'HDFC Bank',
                'ledger_code': 'BANK001',
                'nature': 'Asset',
                'ledger_type': 'Bank Account',
                'opening_balance': 250000.00,
                'opening_balance_type': 'Dr',
                'current_balance': 250000.00,
                'current_balance_type': 'Dr',
                'bank_name': 'HDFC Bank',
                'branch_name': 'Main Branch',
                'account_number': '50100123456789',
                'ifsc_code': 'HDFC0001234',
            },
            {
                'ledger_name': 'ICICI Bank',
                'ledger_code': 'BANK002',
                'nature': 'Asset',
                'ledger_type': 'Bank Account',
                'opening_balance': 150000.00,
                'opening_balance_type': 'Dr',
                'current_balance': 150000.00,
                'current_balance_type': 'Dr',
                'bank_name': 'ICICI Bank',
                'branch_name': 'Corporate Branch',
                'account_number': '012345678901',
                'ifsc_code': 'ICIC0001234',
            },
            {
                'ledger_name': 'SBI Current Account',
                'ledger_code': 'BANK003',
                'nature': 'Asset',
                'ledger_type': 'Bank Account',
                'opening_balance': 180000.00,
                'opening_balance_type': 'Dr',
                'current_balance': 180000.00,
                'current_balance_type': 'Dr',
                'bank_name': 'State Bank of India',
                'branch_name': 'City Branch',
                'account_number': '30123456789',
                'ifsc_code': 'SBIN0001234',
            },
        ]
        
        created = 0
        for acc in bank_accounts:
            ledger, is_created = TransactionFile.objects.update_or_create(
                ledger_name=acc['ledger_name'],
                tenant_id=tenant_id,
                defaults={
                    **acc,
                    'financial_year_id': 1,  # Default FY
                    'is_active': True,
                }
            )
            if is_created:
                created += 1
                self.stdout.write(f'  Created: {ledger.ledger_name} with balance ₹{ledger.current_balance}')
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ Created {created} bank accounts'))

    def seed_cash_accounts(self, tenant_id):
        """Seed cash account ledgers."""
        self.stdout.write('💵 Seeding cash accounts...')
        
        cash_accounts = [
            {
                'ledger_name': 'Cash in Hand',
                'ledger_code': 'CASH001',
                'nature': 'Asset',
                'ledger_type': 'Cash',
                'opening_balance': 50000.00,
                'opening_balance_type': 'Dr',
                'current_balance': 50000.00,
                'current_balance_type': 'Dr',
            },
            {
                'ledger_name': 'Petty Cash',
                'ledger_code': 'CASH002',
                'nature': 'Asset',
                'ledger_type': 'Cash',
                'opening_balance': 10000.00,
                'opening_balance_type': 'Dr',
                'current_balance': 10000.00,
                'current_balance_type': 'Dr',
            },
        ]
        
        created = 0
        for acc in cash_accounts:
            ledger, is_created = TransactionFile.objects.update_or_create(
                ledger_name=acc['ledger_name'],
                tenant_id=tenant_id,
                defaults={
                    **acc,
                    'financial_year_id': 1,
                    'is_active': True,
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
                'ledger_name': 'ABC Suppliers Pvt Ltd',
                'ledger_code': 'SUPP001',
                'nature': 'Liability',
                'ledger_type': 'Sundry Creditor',
                'opening_balance': 0.00,
                'opening_balance_type': 'Cr',
                'current_balance': 0.00,
                'current_balance_type': 'Cr',
                'gstin': '29ABCDE1234F1Z5',
                'gst_applicable': True,
                'state': 'Karnataka',
                'credit_days': 30,
            },
            {
                'ledger_name': 'XYZ Customers Ltd',
                'ledger_code': 'CUST001',
                'nature': 'Asset',
                'ledger_type': 'Sundry Debtor',
                'opening_balance': 0.00,
                'opening_balance_type': 'Dr',
                'current_balance': 0.00,
                'current_balance_type': 'Dr',
                'gstin': '27XYZAB5678G2Z1',
                'gst_applicable': True,
                'state': 'Maharashtra',
                'credit_days': 45,
            },
        ]
        
        created = 0
        for party in parties:
            ledger, is_created = TransactionFile.objects.update_or_create(
                ledger_name=party['ledger_name'],
                tenant_id=tenant_id,
                defaults={
                    **party,
                    'financial_year_id': 1,
                    'is_active': True,
                }
            )
            if is_created:
                created += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ Created {created} party ledgers'))
