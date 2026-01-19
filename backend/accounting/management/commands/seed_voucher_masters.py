"""
Django management command to seed separate voucher master tables
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from accounting.models import (
    MasterVoucherSales,
    MasterVoucherCreditNote,
    MasterVoucherReceipts,
    MasterVoucherPurchases,
    MasterVoucherDebitNote,
    MasterVoucherPayments,
    MasterVoucherExpenses,
    MasterVoucherJournal,
    MasterVoucherContra
)


class Command(BaseCommand):
    help = 'Seed separate voucher master tables with default configurations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id',
            type=str,
            default='default-tenant',
            help='Tenant ID for seeding (default: default-tenant)'
        )

    def handle(self, *args, **options):
        tenant_id = options['tenant_id']
        
        self.stdout.write(self.style.SUCCESS(f'\n=== Seeding Voucher Master Tables for tenant: {tenant_id} ===\n'))
        
        with transaction.atomic():
            # Sales Vouchers
            self.seed_sales_vouchers(tenant_id)
            
            # Credit Note Vouchers
            self.seed_creditnote_vouchers(tenant_id)
            
            # Receipts Vouchers
            self.seed_receipts_vouchers(tenant_id)
            
            # Purchases Vouchers
            self.seed_purchases_vouchers(tenant_id)
            
            # Debit Note Vouchers
            self.seed_debitnote_vouchers(tenant_id)
            
            # Payments Vouchers
            self.seed_payments_vouchers(tenant_id)
            
            # Expenses Vouchers
            self.seed_expenses_vouchers(tenant_id)
            
            # Journal Vouchers
            self.seed_journal_vouchers(tenant_id)
            
            # Contra Vouchers
            self.seed_contra_vouchers(tenant_id)
        
        self.stdout.write(self.style.SUCCESS('\n=== Seeding Complete! ===\n'))

    def seed_sales_vouchers(self, tenant_id):
        """Seed Sales Voucher Master"""
        self.stdout.write('Seeding Sales Vouchers...')
        
        sales_configs = [
            {'voucher_name': 'Sales B2B', 'prefix': 'SAL3-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Sales B2C', 'prefix': 'SAL4-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Sales Export', 'prefix': 'SAL2-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Sales Invoice', 'prefix': 'SAL-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Sales New', 'prefix': 'Sal', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        ]
        
        for config in sales_configs:
            obj, created = MasterVoucherSales.objects.get_or_create(
                tenant_id=tenant_id,
                voucher_name=config['voucher_name'],
                defaults={
                    'prefix': config['prefix'],
                    'suffix': config['suffix'],
                    'start_from': config['start_from'],
                    'current_number': config['start_from'],
                    'required_digits': config['required_digits'],
                    'enable_auto_numbering': True,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {config["voucher_name"]}'))

    def seed_creditnote_vouchers(self, tenant_id):
        """Seed Credit Note Voucher Master"""
        self.stdout.write('Seeding Credit Note Vouchers...')
        
        configs = [
            {'voucher_name': 'Credit Note B2B', 'prefix': 'CN-B2B-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Credit Note B2C', 'prefix': 'CN-B2C-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Credit Note Export', 'prefix': 'CN-EXP-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        ]
        
        for config in configs:
            obj, created = MasterVoucherCreditNote.objects.get_or_create(
                tenant_id=tenant_id,
                voucher_name=config['voucher_name'],
                defaults={
                    'prefix': config['prefix'],
                    'suffix': config['suffix'],
                    'start_from': config['start_from'],
                    'current_number': config['start_from'],
                    'required_digits': config['required_digits'],
                    'enable_auto_numbering': True,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {config["voucher_name"]}'))

    def seed_receipts_vouchers(self, tenant_id):
        """Seed Receipts Voucher Master"""
        self.stdout.write('Seeding Receipts Vouchers...')
        
        configs = [
            {'voucher_name': 'Receipt Cash', 'prefix': 'RCP-CASH-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Receipt Bank', 'prefix': 'RCP-BANK-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Receipt Online', 'prefix': 'RCP-ONL-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        ]
        
        for config in configs:
            obj, created = MasterVoucherReceipts.objects.get_or_create(
                tenant_id=tenant_id,
                voucher_name=config['voucher_name'],
                defaults={
                    'prefix': config['prefix'],
                    'suffix': config['suffix'],
                    'start_from': config['start_from'],
                    'current_number': config['start_from'],
                    'required_digits': config['required_digits'],
                    'enable_auto_numbering': True,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {config["voucher_name"]}'))

    def seed_purchases_vouchers(self, tenant_id):
        """Seed Purchases Voucher Master"""
        self.stdout.write('Seeding Purchases Vouchers...')
        
        configs = [
            {'voucher_name': 'Purchase Local', 'prefix': 'PUR-LOC-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Purchase Import', 'prefix': 'PUR-IMP-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Purchase Interstate', 'prefix': 'PUR-INT-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        ]
        
        for config in configs:
            obj, created = MasterVoucherPurchases.objects.get_or_create(
                tenant_id=tenant_id,
                voucher_name=config['voucher_name'],
                defaults={
                    'prefix': config['prefix'],
                    'suffix': config['suffix'],
                    'start_from': config['start_from'],
                    'current_number': config['start_from'],
                    'required_digits': config['required_digits'],
                    'enable_auto_numbering': True,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {config["voucher_name"]}'))

    def seed_debitnote_vouchers(self, tenant_id):
        """Seed Debit Note Voucher Master"""
        self.stdout.write('Seeding Debit Note Vouchers...')
        
        configs = [
            {'voucher_name': 'Debit Note Local', 'prefix': 'DN-LOC-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Debit Note Import', 'prefix': 'DN-IMP-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        ]
        
        for config in configs:
            obj, created = MasterVoucherDebitNote.objects.get_or_create(
                tenant_id=tenant_id,
                voucher_name=config['voucher_name'],
                defaults={
                    'prefix': config['prefix'],
                    'suffix': config['suffix'],
                    'start_from': config['start_from'],
                    'current_number': config['start_from'],
                    'required_digits': config['required_digits'],
                    'enable_auto_numbering': True,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {config["voucher_name"]}'))

    def seed_payments_vouchers(self, tenant_id):
        """Seed Payments Voucher Master"""
        self.stdout.write('Seeding Payments Vouchers...')
        
        configs = [
            {'voucher_name': 'Payment Cash', 'prefix': 'PAY-CASH-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Payment Bank', 'prefix': 'PAY-BANK-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Payment Online', 'prefix': 'PAY-ONL-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        ]
        
        for config in configs:
            obj, created = MasterVoucherPayments.objects.get_or_create(
                tenant_id=tenant_id,
                voucher_name=config['voucher_name'],
                defaults={
                    'prefix': config['prefix'],
                    'suffix': config['suffix'],
                    'start_from': config['start_from'],
                    'current_number': config['start_from'],
                    'required_digits': config['required_digits'],
                    'enable_auto_numbering': True,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {config["voucher_name"]}'))

    def seed_expenses_vouchers(self, tenant_id):
        """Seed Expenses Voucher Master"""
        self.stdout.write('Seeding Expenses Vouchers...')
        
        configs = [
            {'voucher_name': 'Expense General', 'prefix': 'EXP-GEN-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Expense Travel', 'prefix': 'EXP-TRV-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Expense Office', 'prefix': 'EXP-OFF-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        ]
        
        for config in configs:
            obj, created = MasterVoucherExpenses.objects.get_or_create(
                tenant_id=tenant_id,
                voucher_name=config['voucher_name'],
                defaults={
                    'prefix': config['prefix'],
                    'suffix': config['suffix'],
                    'start_from': config['start_from'],
                    'current_number': config['start_from'],
                    'required_digits': config['required_digits'],
                    'enable_auto_numbering': True,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {config["voucher_name"]}'))

    def seed_journal_vouchers(self, tenant_id):
        """Seed Journal Voucher Master"""
        self.stdout.write('Seeding Journal Vouchers...')
        
        configs = [
            {'voucher_name': 'Journal Entry', 'prefix': 'JV-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Journal Adjustment', 'prefix': 'JV-ADJ-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        ]
        
        for config in configs:
            obj, created = MasterVoucherJournal.objects.get_or_create(
                tenant_id=tenant_id,
                voucher_name=config['voucher_name'],
                defaults={
                    'prefix': config['prefix'],
                    'suffix': config['suffix'],
                    'start_from': config['start_from'],
                    'current_number': config['start_from'],
                    'required_digits': config['required_digits'],
                    'enable_auto_numbering': True,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {config["voucher_name"]}'))

    def seed_contra_vouchers(self, tenant_id):
        """Seed Contra Voucher Master"""
        self.stdout.write('Seeding Contra Vouchers...')
        
        configs = [
            {'voucher_name': 'Contra Cash to Bank', 'prefix': 'CNT-C2B-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Contra Bank to Cash', 'prefix': 'CNT-B2C-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
            {'voucher_name': 'Contra Bank Transfer', 'prefix': 'CNT-BTR-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        ]
        
        for config in configs:
            obj, created = MasterVoucherContra.objects.get_or_create(
                tenant_id=tenant_id,
                voucher_name=config['voucher_name'],
                defaults={
                    'prefix': config['prefix'],
                    'suffix': config['suffix'],
                    'start_from': config['start_from'],
                    'current_number': config['start_from'],
                    'required_digits': config['required_digits'],
                    'enable_auto_numbering': True,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {config["voucher_name"]}'))
