import os
import django
import sys

# Add project root to path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = 'dummy'
email = 'dummy@example.com'
password = 'dummy'

try:
    # Check if user exists by username
    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        print(f"Updating existing user: {username}")
    else:
        # Check if email is already taken by another user
        if User.objects.filter(email=email).exists():
            print(f"User with email {email} already exists but with different username.")
            user = User.objects.get(email=email)
            print(f"Updating user {user.username} instead.")
        else:
            user = User.objects.create_user(username=username, email=email)
            print(f"Created new user: {username}")

    user.set_password(password)
    user.email = email
    user.is_active = True
    # Grant all permissions for demo purposes
    user.is_staff = True
    user.is_superuser = True 
    
    user.save()
    print(f"Successfully set password and admin permissions for user: {user.username}")
    print(f"Login details: Username: {user.username}, Email: {user.email}, Password: {password}")

except Exception as e:
    print(f"Error creating/updating user: {e}")
