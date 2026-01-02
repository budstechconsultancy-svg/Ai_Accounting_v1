import os
import django
import sys

# Add project root to path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User
from inventory.models import InventoryUnit, InventoryStockGroup, InventoryStockItem

def seed_data():
    try:
        user = User.objects.get(username='dummy')
        tenant_id = user.tenant_id
    except User.DoesNotExist:
        print("Error: User 'dummy' not found. Please run create_demo_user.py first.")
        return

    print(f"Seeding data for Tenant: {tenant_id}")

    # Seed Units
    units_data = [
        {'name': 'Kilograms', 'symbol': 'Kg'},
        {'name': 'Pieces', 'symbol': 'Pcs'},
        {'name': 'Liters', 'symbol': 'L'},
    ]

    for u in units_data:
        unit, created = InventoryUnit.objects.get_or_create(
            name=u['name'], 
            tenant_id=tenant_id,
            defaults={'symbol': u['symbol']}
        )
        if created:
            print(f"Created unit: {u['name']}")

    # Seed Groups
    groups_data = [
        {'name': 'Raw Materials'},
        {'name': 'Finished Goods'},
    ]

    for g in groups_data:
        group, created = InventoryStockGroup.objects.get_or_create(
            name=g['name'], 
            tenant_id=tenant_id
        )
        if created:
            print(f"Created group: {g['name']}")

    # Seed Items
    items_data = [
        {'name': 'Laptop Battery', 'group': 'Raw Materials', 'unit': 'Pieces', 'rate': 2500, 'opening_balance': 50},
        {'name': 'LCD Screen', 'group': 'Raw Materials', 'unit': 'Pieces', 'rate': 4500, 'opening_balance': 30},
        {'name': 'Motherboard', 'group': 'Raw Materials', 'unit': 'Pieces', 'rate': 8500, 'opening_balance': 20},
        {'name': 'Gaming Laptop', 'group': 'Finished Goods', 'unit': 'Pieces', 'rate': 75000, 'opening_balance': 10},
        {'name': 'Office Laptop', 'group': 'Finished Goods', 'unit': 'Pieces', 'rate': 45000, 'opening_balance': 15},
    ]

    for i in items_data:
        item, created = InventoryStockItem.objects.get_or_create(
            name=i['name'],
            tenant_id=tenant_id,
            defaults={
                'group': i['group'],
                'unit': i['unit'],
                'rate': i['rate'],
                'opening_balance': i['opening_balance'],
                'current_balance': i['opening_balance']
            }
        )
        if created:
            print(f"Created stock item: {i['name']}")
        else:
            # Update existing if needed
            item.group = i['group']
            item.unit = i['unit']
            item.rate = i['rate']
            item.opening_balance = i['opening_balance']
            item.current_balance = i['opening_balance']
            item.save()
            print(f"Updated stock item: {i['name']}")

    print(f"Successfully seeded/updated 5 inventory items for user 'dummy'")

if __name__ == "__main__":
    seed_data()
