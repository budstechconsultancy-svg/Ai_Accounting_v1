
import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Module

def list_mods():
    print("--- Active Modules ---")
    mods = Module.objects.filter(is_active=True).order_by('display_order')
    for m in mods:
        print(f"[{m.code}] {m.name} (Parent: {m.parent_module_id})")

if __name__ == '__main__':
    list_mods()
