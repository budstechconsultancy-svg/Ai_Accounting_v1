import os
import django
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import authenticate, get_user_model
from core.models import User

def debug_auth():
    print("--- Debugging Authentication ---")
    username = 'budstech'
    password = '123'
    
    # 1. Check User direct fetch
    try:
        user = User.objects.get(username=username)
        print(f"User found: {user.username} (ID: {user.id})")
        print(f"Is Active: {user.is_active}")
        
        # 2. Check Password Check
        is_password_correct = user.check_password(password)
        print(f"Password Check result: {is_password_correct}")
        
        if not is_password_correct:
            print("❌ password mismatch! Resetting again...")
            user.set_password(password)
            user.save()
            print("Password reset. Checking again:", user.check_password(password))
            
    except User.DoesNotExist:
        print(f"❌ User {username} does not exist!")
        return

    # 3. Test iterate methods
    auth_user = authenticate(username=username, password=password)
    print(f"django.contrib.auth.authenticate result: {auth_user}")
    
    if auth_user:
        print("✅ Authentication Successful via Django!")
    else:
        print("❌ Authentication Failed via Django.")

if __name__ == "__main__":
    debug_auth()
