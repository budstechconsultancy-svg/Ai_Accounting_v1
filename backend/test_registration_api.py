"""
Simple test to call registration API and check if user is saved
"""
import requests
import json

print("=" * 80)
print("TESTING REGISTRATION API")
print("=" * 80)

# Test data
test_data = {
    "username": "apitest_user_" + str(int(__import__('time').time())),
    "password": "testpass123",
    "company_name": "API Test Company " + str(int(__import__('time').time())),
    "selected_plan": "Starter",
    "email": "apitest@test.com",
    "phone": "+9876543210"
}

print("\nSending registration request...")
print(f"Username: {test_data['username']}")
print(f"Company: {test_data['company_name']}")

try:
    response = requests.post(
        'http://localhost:8000/api/auth/register/',
        json=test_data,
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    
    if response.status_code == 201:
        print("\n✅ Registration API returned success!")
        
        # Now check database
        import os, django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
        django.setup()
        from core.models import User
        
        user_exists = User.objects.filter(username=test_data['username']).exists()
        print(f"\nUser in database: {user_exists}")
        
        if user_exists:
            user = User.objects.get(username=test_data['username'])
            print(f"  Username: {user.username}")
            print(f"  Company: {user.company_name}")
            print(f"  Email: {user.email}")
            print("\n✅ SUCCESS! User was saved to users table!")
        else:
            print("\n❌ ERROR! User NOT in database despite 201 response!")
    else:
        print(f"\n❌ Registration failed with status {response.status_code}")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
