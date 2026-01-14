"""
Management command to seed the 6 base inventory categories.
These are system categories that serve as the foundation for the inventory hierarchy.
"""
from django.core.management.base import BaseCommand
from inventory.models import InventoryCategory
from django.db import transaction


class Command(BaseCommand):
    help = 'Seed the 6 base inventory categories (RAW MATERIAL, Work in Progress, etc.)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id',
            type=str,
            help='Tenant ID to seed categories for (required)',
            required=True
        )

    def handle(self, *args, **options):
        tenant_id = options['tenant_id']
        
        self.stdout.write(self.style.SUCCESS(f'\n🌱 Seeding Base Inventory Categories for tenant: {tenant_id}...'))
        
        # The 6 base inventory categories
        categories = [
            {'name': 'RAW MATERIAL', 'order': 1},
            {'name': 'Work in Progress', 'order': 2},
            {'name': 'Finished goods', 'order': 3},
            {'name': 'Stores and Spares', 'order': 4},
            {'name': 'Packing Material', 'order': 5},
            {'name': 'Stock in Trade', 'order': 6},
        ]
        
        created_count = 0
        existing_count = 0
        
        with transaction.atomic():
            for cat_data in categories:
                # Check if category already exists for this tenant
                existing = InventoryCategory.objects.filter(
                    tenant_id=tenant_id,
                    name=cat_data['name'],
                    parent__isnull=True  # Root category
                ).first()
                
                if existing:
                    self.stdout.write(f'  ⏭️  {cat_data["name"]} - Already exists')
                    existing_count += 1
                else:
                    InventoryCategory.objects.create(
                        tenant_id=tenant_id,
                        name=cat_data['name'],
                        parent=None,
                        is_system=True,  # Mark as system category
                        is_active=True,
                        description=f'Base category for {cat_data["name"]}',
                        display_order=cat_data['order']
                    )
                    self.stdout.write(self.style.SUCCESS(f'  ✅ {cat_data["name"]} - Created'))
                    created_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'\n✨ Seeding complete!'))
        self.stdout.write(f'   Created: {created_count}')
        self.stdout.write(f'   Existing: {existing_count}')
        self.stdout.write(f'   Total: {created_count + existing_count}\n')
