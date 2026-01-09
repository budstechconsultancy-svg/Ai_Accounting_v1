"""
Sync master_ledgers to Transcaction_file
Creates entries in Transcaction_file for all ledgers in master_ledgers
"""

from django.core.management.base import BaseCommand
from accounting.models import MasterLedger
from accounting.models_transaction import TransactionFile


class Command(BaseCommand):
    help = 'Sync master_ledgers to Transcaction_file table'

    def handle(self, *args, **options):
        self.stdout.write('🔄 Syncing master_ledgers to Transcaction_file...')
        
        # Get all master ledgers
        master_ledgers = MasterLedger.objects.all()
        
        self.stdout.write(f'Found {master_ledgers.count()} ledgers in master_ledgers')
        
        created_count = 0
        updated_count = 0
        
        for ledger in master_ledgers:
            # Determine nature based on category
            nature_map = {
                'Asset': 'Asset',
                'Liability': 'Liability',
                'Income': 'Income',
                'Expenditure': 'Expense',
                'Expense': 'Expense',
                'Capital': 'Capital',
            }
            nature = nature_map.get(ledger.category, 'Asset')
            
            # Determine balance type based on nature
            if nature in ['Asset', 'Expense']:
                balance_type = 'Dr'
                # Give assets some default balance for testing
                default_balance = 100000.00 if 'bank' in ledger.name.lower() or 'cash' in ledger.name.lower() else 0.00
            else:
                balance_type = 'Cr'
                default_balance = 0.00
            
            # Create or update in Transcaction_file
            # Get next available ID
            max_id = TransactionFile.objects.aggregate(models.Max('id'))['id__max'] or 0
            next_id = max_id + 1
            
            transaction_file, created = TransactionFile.objects.update_or_create(
                ledger_name=ledger.name,
                tenant_id=1,  # Using tenant_id = 1
                defaults={
                    'id': next_id if not TransactionFile.objects.filter(ledger_name=ledger.name, tenant_id=1).exists() else None,
                    'financial_year_id': 1,
                    'ledger_code': ledger.code or f'LED{ledger.id:04d}',
                    'nature': nature,
                    'ledger_type': ledger.ledger_type or ledger.group,
                    'is_active': True,
                    'opening_balance': default_balance,
                    'opening_balance_type': balance_type,
                    'current_balance': default_balance,
                    'current_balance_type': balance_type,
                    'gstin': ledger.gstin,
                    'state': ledger.state,
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'  ✓ Created: {ledger.name} with balance {default_balance} {balance_type}')
            else:
                updated_count += 1
                self.stdout.write(f'  ↻ Updated: {ledger.name}')
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Sync complete!'))
        self.stdout.write(self.style.SUCCESS(f'  Created: {created_count}'))
        self.stdout.write(self.style.SUCCESS(f'  Updated: {updated_count}'))
