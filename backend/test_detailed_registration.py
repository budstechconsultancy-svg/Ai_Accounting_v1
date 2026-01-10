"""
Test with detailed logging
"""
import requests
import json
import time

print("=" * 80)
print("DETAILED REGISTRATION TEST")
print("=" * 80)

# Unique test data
timestamp = str(int(time.time()))
test_data = {
    "username": f"test_{timestamp}",
    "password": "testpass123",
    "company_name": f"Test Co {timestamp}",
    "selected_plan": "Starter",
    "email": f"test{timestamp}@test.com",
    "phone": f"+{timestamp}"
}

print(f"\nTest Username: {test_data['username']}")

# Send registration request
print("\n1. Sending registration request...")
response = requests.post(
    'http://localhost:8000/api/auth/register/',
    json=test_data
)

print(f"   Status: {response.status_code}")

if response.status_code == 201:
    print("   ✅ API returned 201 Created")
    response_data = response.json()
    
    if 'user' in response_data:
        user_id = response_data['user'].get('id')
        print(f"   User ID from response: {user_id}")
    
    # Wait a moment for database to commit
    print("\n2. Waiting 2 seconds for database commit...")
    time.sleep(2)
    
    # Check database
    print("\n3. Checking database...")
    import os, django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()
    from core.models import User
    
    user_exists = User.objects.filter(username=test_data['username']).exists()
    print(f"   User exists: {user_exists}")
    
    if user_exists:
        user = User.objects.get(username=test_data['username'])
        print(f"   ✅ SUCCESS! User found in database!")
        print(f"   ID: {user.id}")
        print(f"   Username: {user.username}")
        print(f"   Company: {user.company_name}")
    else:
        print(f"   ❌ ERROR! User '{test_data['username']}' NOT in database!")
        
        # Check all recent users
        print("\n   Recent users in database:")
        for u in User.objects.order_by('-id')[:5]:
            print(f"     - {u.username} (ID: {u.id})")
else:
    print(f"   ❌ Registration failed: {response.status_code}")
    print(f"   Response: {response.text[:500]}")
