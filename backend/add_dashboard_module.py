
import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Module

def add_dashboard():
    print("Ensuring DASHBOARD module exists...")
    
    # Check if exists
    if Module.objects.filter(code='DASHBOARD').exists():
        print("✅ DASHBOARD module already exists.")
        return

    # Create it
    # We'll give it display_order=1 to be at the top
    try:
        Module.objects.create(
            code='DASHBOARD',
            name='Dashboard',
            description='Main Dashboard',
            display_order=1,
            is_active=True
        )
        print("✅ DASHBOARD module created successfully.")
    except Exception as e:
        print(f"❌ Failed to create DASHBOARD module: {e}")

if __name__ == '__main__':
    add_dashboard()
