import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import MasterHierarchyRaw

with open('hierarchy_analysis.txt', 'w', encoding='utf-8') as f:
    # Helper to print distinct codes for a level
    def analyze_level(level_name, db_field):
        f.write(f"\n--- Analysis for {level_name} ({db_field}) ---\n")
        items = MasterHierarchyRaw.objects.filter(**{f"{db_field}__isnull": False}).exclude(**{f"{db_field}": ''}).values(db_field, 'code').order_by('code')[:10]
        for item in items:
            f.write(f"  {item[db_field]} -> Code: {item['code']}\n")

    analyze_level("Category", "major_group_1")
    analyze_level("Group", "group_1")
    analyze_level("Sub Group 1", "sub_group_1_1")
    analyze_level("Ledger", "ledger_1")

    # Check if there are rows where ledger_1 is NULL but group_1 is NOT NULL
    groups_without_ledger = MasterHierarchyRaw.objects.filter(ledger_1__isnull=True, group_1__isnull=False).count()
    f.write(f"\nRows with Group but NO Ledger: {groups_without_ledger}\n")
