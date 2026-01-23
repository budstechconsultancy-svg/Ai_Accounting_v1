from django.core.management.base import BaseCommand
from inventory.models import InventoryMasterCategory
from core.models import Tenant


class Command(BaseCommand):
    help = 'Seed default inventory master categories'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🌱 Seeding default inventory master categories...'))
        
        # Get tenant
        tenant = Tenant.objects.first()
        if not tenant:
            self.stdout.write(self.style.WARNING('⚠️  No tenant found'))
            return
        
        self.stdout.write(f"Using tenant: {tenant.name}")
        
        # Define default top-level categories (no group or subgroup)
        default_categories = [
            'Raw Material',
            'Work in Progress',
            'Finished Goods',
            'Stores and Spares',
            'Packing Material',
            'Stock in Trade',
            'By-product',
            'Scrap',
        ]
        
        created_count = 0
        skipped_count = 0
        
        for category_name in default_categories:
            # Check if already exists
            existing = InventoryMasterCategory.objects.filter(
                tenant_id=tenant.id,
                category=category_name,
                group__isnull=True,
                subgroup__isnull=True
            ).first()
            
            if existing:
                self.stdout.write(f"  ⚠️  Skipped: {category_name} (already exists)")
                skipped_count += 1
                continue
            
            # Create new category
            InventoryMasterCategory.objects.create(
                tenant_id=tenant.id,
                category=category_name,
                group=None,
                subgroup=None,
                is_active=True
            )
            
            self.stdout.write(f"  ✓ Created: {category_name}")
            created_count += 1
        
        # Summary
        self.stdout.write(self.style.SUCCESS(f'\n✅ Seeding completed!'))
        self.stdout.write(f"  📊 Created: {created_count}")
        self.stdout.write(f"  ⏭️  Skipped: {skipped_count}")
        
        # Show total count
        total = InventoryMasterCategory.objects.filter(tenant_id=tenant.id).count()
        self.stdout.write(f"  📝 Total categories: {total}")
