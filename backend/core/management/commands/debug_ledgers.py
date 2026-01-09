"""
Debug script to check ledger names and balances
"""
from django.core.management.base import BaseCommand
from accounting.models import MasterLedger
from accounting.models_transaction import TransactionFile


class Command(BaseCommand):
    help = 'Debug ledger names and balances'

    def handle(self, *args, **options):
        self.stdout.write('🔍 Checking ledger names...\n')
        
        # Check master_ledgers
        self.stdout.write('📋 Master Ledgers (Bank/Cash):')
        master_ledgers = MasterLedger.objects.filter(
            group__icontains='bank'
        ) | MasterLedger.objects.filter(group__icontains='cash')
        
        for ledger in master_ledgers[:10]:
            self.stdout.write(f'  - Name: "{ledger.name}"')
            self.stdout.write(f'    Group: {ledger.group}')
            self.stdout.write(f'    Category: {ledger.category}')
            self.stdout.write('')
        
        # Check Transcaction_file
        self.stdout.write('\n💰 Transcaction_file entries:')
        transaction_files = TransactionFile.objects.all()[:10]
        
        for tf in transaction_files:
            self.stdout.write(f'  - Name: "{tf.ledger_name}"')
            self.stdout.write(f'    Balance: {tf.current_balance} {tf.current_balance_type}')
            self.stdout.write(f'    Nature: {tf.nature}')
            self.stdout.write('')
        
        # Check for exact match
        self.stdout.write('\n🔎 Checking for "HDFC Bank Current Account":')
        hdfc_master = MasterLedger.objects.filter(name__icontains='hdfc').first()
        if hdfc_master:
            self.stdout.write(f'  Master Ledger: "{hdfc_master.name}"')
            
            hdfc_trans = TransactionFile.objects.filter(ledger_name=hdfc_master.name).first()
            if hdfc_trans:
                self.stdout.write(f'  ✅ Found in Transcaction_file!')
                self.stdout.write(f'     Balance: {hdfc_trans.current_balance} {hdfc_trans.current_balance_type}')
            else:
                self.stdout.write(f'  ❌ NOT found in Transcaction_file')
                self.stdout.write(f'  Searching for similar names...')
                similar = TransactionFile.objects.filter(ledger_name__icontains='hdfc')
                for s in similar:
                    self.stdout.write(f'    Found: "{s.ledger_name}"')
        else:
            self.stdout.write('  ❌ No HDFC ledger in master_ledgers')
