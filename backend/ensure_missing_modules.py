
import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Module

def ensure_modules():
    print("Ensuring missing modules exist...")
    
    # 1. Get Parents
    try:
        masters = Module.objects.get(code='MASTERS')
        print(f"✅ Found MASTERS (ID: {masters.id})")
    except Module.DoesNotExist:
        print("❌ MASTERS module missing! Cannot add children.")
        return

    try:
        reports = Module.objects.get(code='REPORTS')
        print(f"✅ Found REPORTS (ID: {reports.id})")
    except Module.DoesNotExist:
        # Create REPORTS if missing
        reports = Module.objects.create(
            code='REPORTS', name='Reports', display_order=50, is_active=True
        )
        print(f"✅ Created REPORTS (ID: {reports.id})")

    # 2. List of modules to ensure
    modules_to_add = [
        # Masters Children
        {
            'code': 'MASTERS_VOUCHER_CONFIG',
            'name': 'Voucher Configuration',
            'parent': masters,
            'order': 5
        },
        # Reports Children
        {
            'code': 'REPORTS_DAY_BOOK',
            'name': 'Day Book',
            'parent': reports,
            'order': 1
        },
        {
            'code': 'REPORTS_LEDGER',
            'name': 'Ledger Report',
            'parent': reports,
            'order': 2
        },
        {
            'code': 'REPORTS_TRIAL_BALANCE',
            'name': 'Trial Balance',
            'parent': reports,
            'order': 3
        },
        {
            'code': 'REPORTS_STOCK_SUMMARY',
            'name': 'Stock Summary',
            'parent': reports,
            'order': 4
        },
        {
            'code': 'REPORTS_GST',
            'name': 'GST Reports',
            'parent': reports,
            'order': 5
        },
    ]
    
    for m in modules_to_add:
        obj, created = Module.objects.get_or_create(
            code=m['code'],
            defaults={
                'name': m['name'],
                'parent_module_id': m['parent'].id,
                'display_order': m['order'],
                'is_active': True
            }
        )
        if created:
            print(f"✅ Created {m['code']}")
        else:
            print(f"ℹ️  {m['code']} already exists")
            # Ensure it's active
            if not obj.is_active:
                obj.is_active = True
                obj.save()
                print(f"   -> Reactivated {m['code']}")

if __name__ == '__main__':
    ensure_modules()
