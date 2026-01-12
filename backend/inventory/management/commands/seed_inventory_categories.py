from django.core.management.base import BaseCommand
from inventory.models import InventoryCategory
from core.models import Tenant


class Command(BaseCommand):
    help = 'Seed default inventory categories'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🌱 Seeding default inventory categories...'))
        
        # Get tenant
        tenant = Tenant.objects.first()
        if not tenant:
            self.stdout.write(self.style.WARNING('⚠️  No tenant found'))
            return
        
        self.stdout.write(f"Using tenant: {tenant.name}")
        
        # Define default system categories
        default_categories = [
            {'name': 'RAW MATERIAL', 'display_order': 1},
            {'name': 'Work in Progress', 'display_order': 2},
            {'name': 'Finished goods', 'display_order': 3},
            {'name': 'Stores and Spares', 'display_order': 4},
            {'name': 'Packing Material', 'display_order': 5},
            {'name': 'Stock in Trade', 'display_order': 6},
            {'name': 'by product', 'display_order': 7},
            {'name': 'scrap', 'display_order': 8},
        ]
        
        created_count = 0
        skipped_count = 0
        
        for cat_data in default_categories:
            # Check if already exists
            existing = InventoryCategory.objects.filter(
                tenant_id=tenant.id,
                name=cat_data['name'],
                parent__isnull=True
            ).first()
            
            if existing:
                self.stdout.write(f"  ⚠️  Skipped: {cat_data['name']} (already exists)")
                skipped_count += 1
                continue
            
            # Create new category
            InventoryCategory.objects.create(
                tenant_id=tenant.id,
                name=cat_data['name'],
                display_order=cat_data['display_order'],
                is_system=True,  # Mark as system category
                is_active=True
            )
            
            self.stdout.write(f"  ✓ Created: {cat_data['name']}")
            created_count += 1
        
        # Summary
        self.stdout.write(self.style.SUCCESS(f'\n✅ Seeding completed!'))
        self.stdout.write(f"  📊 Created: {created_count}")
        self.stdout.write(f"  ⏭️  Skipped: {skipped_count}")
        
        # Show total count
        total = InventoryCategory.objects.filter(tenant_id=tenant.id).count()
        self.stdout.write(f"  📝 Total categories: {total}")
