from django.core.management.base import BaseCommand
import requests


class Command(BaseCommand):
    help = 'Test inventory categories API'

    def handle(self, *args, **options):
        try:
            # Test the API endpoint
            response = requests.get('http://localhost:8000/api/inventory/categories/')
            
            self.stdout.write(f'Status Code: {response.status_code}')
            
            if response.status_code == 200:
                data = response.json()
                self.stdout.write(self.style.SUCCESS(f'✅ API working! Found {len(data)} categories'))
                for cat in data[:5]:
                    self.stdout.write(f"  - {cat.get('name')} (ID: {cat.get('id')})")
            else:
                self.stdout.write(self.style.ERROR(f'❌ API returned error: {response.text}'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {str(e)}'))
