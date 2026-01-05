
import os
import django
import sys
import requests

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import TenantUser

def reproduce_error():
    user = TenantUser.objects.first()
    if not user:
        user = get_user_model().objects.first() # fallback to owner
    
    if not user:
        print("No user found to test with.")
        return

    print(f"Testing with user: {user.username} (type: {type(user).__name__})")
    
    # Generate Token
    refresh = RefreshToken.for_user(user)
    if isinstance(user, TenantUser):
        refresh['user_type'] = 'tenant_user'
        refresh['tenant_id'] = user.tenant_id
        
    access_token = str(refresh.access_token)
    
    print(f"Generated Access Token.")
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    # Endpoint known to fail
    url = 'http://127.0.0.1:8000/api/inventory/units/'
    
    print(f"GET {url}...")
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Response Code: {response.status_code}")
        if response.status_code == 500:
            print("❌ Reproduced 500 Error!")
        else:
            print(f"Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == '__main__':
    reproduce_error()
