"""
Test if balance is being returned in API
"""
from django.core.management.base import BaseCommand
from accounting.models import MasterLedger
from accounting.serializers import MasterLedgerSerializer


class Command(BaseCommand):
    help = 'Test balance in serializer'

    def handle(self, *args, **options):
        # Get HDFC ledger
        ledger = MasterLedger.objects.filter(name__icontains='hdfc').first()
        
        if not ledger:
            self.stdout.write(self.style.ERROR('No HDFC ledger found'))
            return
        
        self.stdout.write(f'Found ledger: {ledger.name}')
        
        # Serialize it
        serializer = MasterLedgerSerializer(ledger)
        data = serializer.data
        
        self.stdout.write('\n📊 Serialized Data:')
        self.stdout.write(f'  Name: {data.get("name")}')
        self.stdout.write(f'  Balance: {data.get("balance")}')
        self.stdout.write(f'  Category: {data.get("category")}')
        self.stdout.write(f'  Group: {data.get("group")}')
        
        if 'balance' in data:
            self.stdout.write(self.style.SUCCESS(f'\n✅ Balance field IS present: {data["balance"]}'))
        else:
            self.stdout.write(self.style.ERROR('\n❌ Balance field is MISSING'))
            self.stdout.write('\nAvailable fields:')
            for key in data.keys():
                self.stdout.write(f'  - {key}')
