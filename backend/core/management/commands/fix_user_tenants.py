"""
Management command to fix users without tenant_id
"""
from django.core.management.base import BaseCommand
from core.models import User, Tenant


class Command(BaseCommand):
    help = 'Fix users without tenant_id by creating/assigning tenants'

    def handle(self, *args, **options):
        users = User.objects.all()
        
        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(f"Found {users.count()} users in the database")
        self.stdout.write(f"{'='*60}\n")
        
        fixed_count = 0
        
        for user in users:
            self.stdout.write(f"User: {user.username}")
            self.stdout.write(f"  Email: {user.email}")
            self.stdout.write(f"  Tenant ID: {user.tenant_id if user.tenant_id else 'MISSING!'}")
            
            if not user.tenant_id:
                self.stdout.write(self.style.WARNING(f"  User {user.username} has no tenant_id!"))
                
                if user.company_name:
                    tenant = Tenant.objects.filter(name=user.company_name).first()
                    if tenant:
                        self.stdout.write(self.style.SUCCESS(f"  Found existing tenant: {tenant.name} ({tenant.id})"))
                    else:
                        tenant = Tenant.objects.create(name=user.company_name)
                        self.stdout.write(self.style.SUCCESS(f"  Created new tenant: {tenant.name} ({tenant.id})"))
                    
                    user.tenant_id = tenant.id
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f"  Updated user {user.username} with tenant_id: {tenant.id}"))
                    fixed_count += 1
                else:
                    self.stdout.write(self.style.ERROR(f"  Cannot fix: User has no company_name"))
            else:
                self.stdout.write(self.style.SUCCESS(f"  Tenant ID is set"))
            
            self.stdout.write("")
        
        self.stdout.write(f"\n{'='*60}")
        self.stdout.write(self.style.SUCCESS(f"Done! Fixed {fixed_count} users."))
        self.stdout.write(f"{'='*60}\n")
