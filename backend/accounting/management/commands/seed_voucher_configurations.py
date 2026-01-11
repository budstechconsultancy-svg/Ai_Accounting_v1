from django.core.management.base import BaseCommand
from django.utils import timezone
from accounting.models import VoucherConfiguration
from core.models import Tenant
from datetime import date

class Command(BaseCommand):
    help = 'Seed default voucher configurations for all tenants'

    def handle(self, *args, **options):
        self.stdout.write('Seeding voucher configurations...')
        
        tenants = Tenant.objects.all()
        if not tenants.exists():
            self.stdout.write(self.style.WARNING('No tenants found.'))
            return

        today = date.today()
        # Fiscal year logic
        # If current month is Jan-Mar, fiscal year started prev year April
        if today.month < 4:
            effective_from = date(today.year - 1, 4, 1)
        else:
            effective_from = date(today.year, 4, 1)
            
        effective_to = date(effective_from.year + 1, 3, 31)
        
        # Derive suffix from year e.g. /24-25
        yy_start = str(effective_from.year)[-2:]
        yy_end = str(effective_to.year)[-2:]
        suffix_str = f"/{yy_start}-{yy_end}"

        base_configs = [
            {'type': 'sales', 'prefix_base': 'SAL', 'names': ['Sales Invoice', 'Sales Export', 'Sales B2B', 'Sales B2C', 'Sales SEZ']},
            {'type': 'credit-note', 'prefix_base': 'CN', 'names': ['Credit Note', 'Credit Note Return', 'Credit Note Discount', 'Credit Note Write-off', 'Credit Note Adjust']},
            {'type': 'receipts', 'prefix_base': 'REC', 'names': ['Receipt Voucher', 'Receipt Advance', 'Receipt Bank', 'Receipt Cash', 'Receipt Adjust']},
            {'type': 'purchases', 'prefix_base': 'PUR', 'names': ['Purchase Voucher', 'Purchase Import', 'Purchase Services', 'Purchase Assets', 'Purchase RM']},
            {'type': 'debit-note', 'prefix_base': 'DN', 'names': ['Debit Note', 'Debit Note Return', 'Debit Note Price Diff', 'Debit Note Adjust', 'Debit Note Other']},
            {'type': 'payments', 'prefix_base': 'PAY', 'names': ['Payment Voucher', 'Payment Advance', 'Payment Expenses', 'Payment Vendor', 'Payment Salary']},
            {'type': 'expenses', 'prefix_base': 'EXP', 'names': ['Expense Voucher', 'Expense Petty Cash', 'Expense Travel', 'Expense Office', 'Expense Utilities']},
            {'type': 'journal', 'prefix_base': 'JRN', 'names': ['Journal Voucher', 'Journal Adjust', 'Journal Depreciation', 'Journal Opening', 'Journal Closing']},
            {'type': 'contra', 'prefix_base': 'CNT', 'names': ['Contra Voucher', 'Contra Deposit', 'Contra Withdrawal', 'Contra Transfer', 'Contra Petty']},
        ]

        count = 0
        for tenant in tenants:
            self.stdout.write(f"Processing tenant: {tenant.name} ({tenant.id})")
            for base in base_configs:
                for idx, name in enumerate(base['names']):
                    # Create unique prefix for each variant, e.g., SAL-, SAL2-, SAL3- or similar
                    # Or better: SALES-, SALEXP-, SALB2B-, etc if possible.
                    # Simple approach: SAL1-, SAL2-...
                    prefix = f"{base['prefix_base']}-" if idx == 0 else f"{base['prefix_base']}{idx+1}-"
                    
                    try:
                        obj, created = VoucherConfiguration.objects.get_or_create(
                            tenant_id=tenant.id,
                            voucher_type=base['type'],
                            voucher_name=name,
                            effective_from=effective_from,
                            defaults={
                                'enable_auto_numbering': True,
                                'prefix': prefix,
                                'suffix': suffix_str,
                                'start_from': 1,
                                'current_number': 1,
                                'required_digits': 4,
                                'effective_to': effective_to,
                                'is_active': True
                            }
                        )
                        if created:
                            count += 1
                            self.stdout.write(f"  Created: {name}")
                        else:
                            self.stdout.write(f"  Exists: {name}")
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"  Error creating {name}: {e}"))
        
        self.stdout.write(self.style.SUCCESS(f'Successfully processed voucher configurations. Total created: {count}'))
