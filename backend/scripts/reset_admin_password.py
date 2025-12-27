import os
import django
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User

try:
    user = User.objects.get(username='budstech')
    user.set_password('123')
    user.save()
    print(f"✅ Password for user '{user.username}' has been successfully reset to '123'")
except User.DoesNotExist:
    print("❌ User 'budstech' not found!")
except Exception as e:
    print(f"❌ Error resetting password: {e}")
