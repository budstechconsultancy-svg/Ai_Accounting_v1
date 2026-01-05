
import os
import django
import sys
import traceback

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User
from masters.flow import list_ledgers
from accounting.serializers import MasterLedgerSerializer

def debug_ledgers():
    print("Debug: Fetching user...")
    user = User.objects.first()
    if not user:
        print("Error: No users found.")
        return

    print(f"Debug: Using user {user.username} (Tenant: {user.tenant_id})")
    
    try:
        print("Debug: Calling list_ledgers...")
        ledgers = list_ledgers(user)
        print(f"Success: Found {len(ledgers)} ledgers. Testing serializer...")
        
        serializer = MasterLedgerSerializer(ledgers, many=True)
        data = serializer.data
        print(f"Success: Serialized {len(data)} items.")
        
        for l in ledgers[:5]:
            print(f" - {l.name} ({l.code})")
    except Exception as e:
        print("\n❌ Exception Traceback:")
        traceback.print_exc()

if __name__ == '__main__':
    debug_ledgers()
