
import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterLedger

def check_strings():
    print("Checking exact group names for Asset ledgers...")
    ledgers = MasterLedger.objects.filter(category__icontains='Asset')
    
    unique_groups = set()
    for l in ledgers:
        if l.group:
            unique_groups.add(f"'{l.group}'")
            
    print("Unique Groups found:")
    for g in unique_groups:
        print(g)
        
    print("\nChecking exact Sub Group 1 names for Asset ledgers...")
    unique_sg1 = set()
    for l in ledgers:
        if l.sub_group_1:
            unique_sg1.add(f"'{l.sub_group_1}'")
            
    print("Unique Sub Group 1 found:")
    for sg in unique_sg1:
        print(sg)

if __name__ == "__main__":
    check_strings()
