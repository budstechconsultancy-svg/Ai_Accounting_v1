import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from decimal import Decimal
import random
import time

User = get_user_model()

print("Creating seed data with explicit IDs...")

# Get demo user
# Get demo user or fallback to first user
try:
    user = User.objects.get(email='demo@example.com')
except User.DoesNotExist:
    user = User.objects.first()
    if not user:
        print('No users found. Please run create_admin.py first.')
        exit(1)
    print(f'Demo user not found. Using first available user: {user.email}')

tenant_id = str(user.id)
if not user.tenant_id:
    user.tenant_id = tenant_id
    user.save()
else:
    tenant_id = user.tenant_id

print(f'Using tenant_id: {tenant_id}')

# Get the maximum existing ID
with connection.cursor() as cursor:
    cursor.execute("SELECT COALESCE(MAX(id), 0) FROM vouchers")
    max_id = cursor.fetchone()[0]
    print(f'Max existing ID: {max_id}')
    
    # Delete existing test vouchers for this tenant
    cursor.execute("DELETE FROM vouchers WHERE tenant_id = %s", [tenant_id])
    deleted = cursor.rowcount
    print(f'Deleted {deleted} existing vouchers')

customers = ['ABC Corporation', 'XYZ Industries', 'Global Tech Solutions', 'Prime Retail Ltd', 'Metro Enterprises']
vendors = ['Supplier A Ltd', 'Vendor B Corp', 'Materials Inc', 'Parts Wholesale']

base_date = datetime.now() - timedelta(days=30)
timestamp = int(time.time())
current_id = max_id + 1
total_created = 0

# Insert Sales Vouchers with explicit IDs
sales_amounts = [125000, 85000, 150000, 95000, 110000, 175000, 88000, 132000]
with connection.cursor() as cursor:
    for i in range(8):
        customer = random.choice(customers)
        amount = Decimal(str(sales_amounts[i]))
        cgst = amount * Decimal('0.09')
        sgst = amount * Decimal('0.09')
        total = amount + cgst + sgst
        voucher_date = (base_date + timedelta(days=i*3)).strftime('%Y-%m-%d')
        
        try:
            cursor.execute("""
                INSERT INTO vouchers 
                (id, tenant_id, type, voucher_number, date, party, amount, total, 
                 total_taxable_amount, total_cgst, total_sgst, total_igst, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, [current_id, tenant_id, 'sales', f'SI-{timestamp}-{i}', voucher_date, customer,
                  float(total), float(total), float(amount), float(cgst), float(sgst), 0.00])
            total_created += 1
            print(f'✓ Created sales #{current_id}: SI-{timestamp}-{i} - ₹{total:,.2f}')
            current_id += 1
        except Exception as e:
            print(f'✗ Sales error: {str(e)[:200]}')

# Insert Purchase Vouchers
purchase_amounts = [75000, 55000, 92000, 68000, 81000, 105000, 62000]
with connection.cursor() as cursor:
    for i in range(7):
        vendor = random.choice(vendors)
        amount = Decimal(str(purchase_amounts[i]))
        cgst = amount * Decimal('0.09')
        sgst = amount * Decimal('0.09')
        total = amount + cgst + sgst
        voucher_date = (base_date + timedelta(days=i*4)).strftime('%Y-%m-%d')
        
        try:
            cursor.execute("""
                INSERT INTO vouchers 
                (id, tenant_id, type, voucher_number, date, party, amount, total,
                 total_taxable_amount, total_cgst, total_sgst, total_igst, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, [current_id, tenant_id, 'purchase', f'PI-{timestamp}-{i}', voucher_date, vendor,
                  float(total), float(total), float(amount), float(cgst), float(sgst), 0.00])
            total_created += 1
            print(f'✓ Created purchase #{current_id}: PI-{timestamp}-{i} - ₹{total:,.2f}')
            current_id += 1
        except Exception as e:
            print(f'✗ Purchase error: {str(e)[:200]}')

# Insert Payment Vouchers
with connection.cursor() as cursor:
    for i in range(6):
        vendor = random.choice(vendors)
        amount = Decimal(str(random.randint(20000, 60000)))
        voucher_date = (base_date + timedelta(days=i*5)).strftime('%Y-%m-%d')
        account = random.choice(['HDFC Bank', 'Cash'])
        
        try:
            cursor.execute("""
                INSERT INTO vouchers 
                (id, tenant_id, type, voucher_number, date, party, account, amount, narration, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, [current_id, tenant_id, 'payment', f'PAY-{timestamp}-{i}', voucher_date, vendor,
                  account, float(amount), f'Payment to {vendor}'])
            total_created += 1
            print(f'✓ Created payment #{current_id}: PAY-{timestamp}-{i} - ₹{amount:,.2f}')
            current_id += 1
        except Exception as e:
            print(f'✗ Payment error: {str(e)[:200]}')

# Insert Receipt Vouchers
with connection.cursor() as cursor:
    for i in range(6):
        customer = random.choice(customers)
        amount = Decimal(str(random.randint(30000, 80000)))
        voucher_date = (base_date + timedelta(days=i*5+1)).strftime('%Y-%m-%d')
        account = random.choice(['HDFC Bank', 'Cash'])
        
        try:
            cursor.execute("""
                INSERT INTO vouchers 
                (id, tenant_id, type, voucher_number, date, party, account, amount, narration, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, [current_id, tenant_id, 'receipt', f'REC-{timestamp}-{i}', voucher_date, customer,
                  account, float(amount), f'Receipt from {customer}'])
            total_created += 1
            print(f'✓ Created receipt #{current_id}: REC-{timestamp}-{i} - ₹{amount:,.2f}')
            current_id += 1
        except Exception as e:
            print(f'✗ Receipt error: {str(e)[:200]}')

# Verify
with connection.cursor() as cursor:
    cursor.execute("SELECT COUNT(*) FROM vouchers WHERE tenant_id = %s", [tenant_id])
    count = cursor.fetchone()[0]
    
print(f'\n=== SEED DATA SUMMARY ===')
print(f'Total Created: {total_created}/27')
print(f'Total in DB: {count}')

if total_created > 0:
    print('\n✓ Seed data created successfully!')
    print('Refresh your browser and go to Reports → AI Report')
    print('Try queries like: "show sales report" or "expense analysis"')
else:
    print('\n✗ No vouchers were created. Check errors above.')
