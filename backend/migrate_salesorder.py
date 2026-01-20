"""
Migration script to create Sales Order tables
Run this after making migrations
"""

# To create the migrations and apply them, run:
# 1. python manage.py makemigrations customerportal
# 2. python manage.py migrate customerportal

# If you encounter issues with migrations, you can:
# 1. Drop the existing sales order tables (if any)
# 2. Run the SQL from salesorder_tables.sql directly in MySQL
# 3. Fake the migration: python manage.py migrate customerportal --fake

print("Sales Order Tables Migration Guide")
print("=" * 80)
print()
print("Step 1: Create migrations")
print("  python manage.py makemigrations customerportal")
print()
print("Step 2: Apply migrations")
print("  python manage.py migrate customerportal")
print()
print("Alternative: Run SQL directly")
print("  mysql -u your_user -p your_database < salesorder_tables.sql")
print()
print("=" * 80)
