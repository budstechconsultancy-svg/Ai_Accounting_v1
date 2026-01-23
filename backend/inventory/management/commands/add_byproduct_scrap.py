from django.core.management.base import BaseCommand
from inventory.models import InventoryMasterCategory
from core.models import Tenant


class Command(BaseCommand):
    help = 'Add By-product and Scrap categories'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Adding By-product and Scrap categories...'))
        
        # Get tenant
        tenant = Tenant.objects.first()
        if not tenant:
            self.stdout.write(self.style.ERROR('ERROR: No tenant found!'))
            return
        
        self.stdout.write(f"Using tenant: {tenant.name}")
        
        # Add By-product
        cat1, created1 = InventoryMasterCategory.objects.get_or_create(
            tenant_id=tenant.id,
            category='By-product',
            group=None,
            subgroup=None,
            defaults={'is_active': True}
        )
        if created1:
            self.stdout.write(self.style.SUCCESS("✓ Created: By-product"))
        else:
            self.stdout.write(self.style.WARNING("⚠ Already exists: By-product"))

        # Add Scrap
        cat2, created2 = InventoryMasterCategory.objects.get_or_create(
            tenant_id=tenant.id,
            category='Scrap',
            group=None,
            subgroup=None,
            defaults={'is_active': True}
        )
        if created2:
            self.stdout.write(self.style.SUCCESS("✓ Created: Scrap"))
        else:
            self.stdout.write(self.style.WARNING("⚠ Already exists: Scrap"))

        self.stdout.write(self.style.SUCCESS('\n✅ Done! Refresh your browser to see the new categories.'))
