
import os
import django
import sys
import requests
import uuid

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

def test_api_user_creation():
    print("Testing User Creation API (POST /api/settings/users/)...")
    
    # Needs Owner Account
    owner = get_user_model().objects.first()
    if not owner:
        print("❌ No owner found.")
        return

    # Generate Token
    refresh = RefreshToken.for_user(owner)
    access_token = str(refresh.access_token)
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    url = 'http://127.0.0.1:8000/api/settings/users/'
    
    username = f"api_test_{str(uuid.uuid4())[:8]}"
    payload = {
        "name": username,
        "email": f"{username}@test.com",
        "password": "Password123!",
        "submodule_ids": [1, 5, 8] # Custom permissions
    }
    
    print(f"Creating user {username} via API...")
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Response Code: {response.status_code}")
        
        if response.status_code == 200:
             print("✅ API returned 200 OK")
             print(f"Response Body: {response.json()}")
             
             # Verify in DB
             from core.models import TenantUser
             user = TenantUser.objects.filter(username=username).first()
             if user:
                 print(f"✅ User found in DB. Submodules: {user.selected_submodule_ids}")
                 if user.selected_submodule_ids == [1, 5, 8]:
                     print("✅ Submodules match!")
                 else:
                     print("❌ Submodules mismatch!")
                 # Cleanup
                 user.delete()
             else:
                 print("❌ User NOT found in DB!")
                 
        else:
             print(f"❌ API Failed: {response.text}")

    except Exception as e:
        print(f"Request Error: {e}")

if __name__ == '__main__':
    test_api_user_creation()
