"""
Test registration with detailed error catching
"""
import requests
import time

timestamp = str(int(time.time()))
test_data = {
    "username": f"finaltest_{timestamp}",
    "password": "testpass123",
    "company_name": f"Final Test Co {timestamp}",
    "selected_plan": "Starter",
    "email": f"finaltest{timestamp}@test.com",
    "phone": f"+{timestamp}"
}

print("=" * 80)
print("FINAL REGISTRATION TEST")
print("=" * 80)
print(f"\nUsername: {test_data['username']}")
print(f"Company: {test_data['company_name']}")

try:
    print("\nSending request...")
    response = requests.post(
        'http://localhost:8000/api/auth/register/',
        json=test_data,
        timeout=10
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 201:
        print("✅ Got 201 Created")
        data = response.json()
        user_id = data.get('user', {}).get('id')
        print(f"User ID from response: {user_id}")
        
        # Wait and check database
        print("\nWaiting 3 seconds...")
        time.sleep(3)
        
        import os, django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
        django.setup()
        from core.models import User
        
        exists = User.objects.filter(username=test_data['username']).exists()
        print(f"\nUser in database: {exists}")
        
        if exists:
            print("\n✅✅✅ SUCCESS! User saved to database!")
        else:
            print("\n❌ FAILED! User not in database")
            print("\nChecking if ANY user with that ID exists...")
            if user_id:
                id_exists = User.objects.filter(id=user_id).exists()
                print(f"User ID {user_id} exists: {id_exists}")
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
