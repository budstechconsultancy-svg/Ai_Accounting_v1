from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import connection
from datetime import datetime, timedelta
from decimal import Decimal
import random
import time

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with sample data for AI Report testing using raw SQL'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting to seed report data...'))
        
        # Get demo user
        try:
            user = User.objects.get(email='demo@example.com')
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('Demo user not found. Please login first with demo@example.com'))
            return
        
        tenant_id = str(user.id)
        if not user.tenant_id:
            user.tenant_id = tenant_id
            user.save()
        else:
            tenant_id = user.tenant_id
        
        self.stdout.write(self.style.SUCCESS(f'Using tenant_id: {tenant_id}'))
        
        # Delete existing vouchers using raw SQL
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM vouchers WHERE tenant_id = %s", [tenant_id])
            deleted = cursor.rowcount
            self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} existing vouchers'))
        
        customers = ['ABC Corporation', 'XYZ Industries', 'Global Tech Solutions', 'Prime Retail Ltd', 'Metro Enterprises']
        vendors = ['Supplier A Ltd', 'Vendor B Corp', 'Materials Inc', 'Parts Wholesale']
        
        base_date = datetime.now() - timedelta(days=30)
        timestamp = int(time.time())
        
        total_created = 0
        
        # Insert Sales Vouchers
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
                        VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                    """, [tenant_id, 'sales', f'SI-{timestamp}-{i}', voucher_date, customer,
                          float(total), float(total), float(amount), float(cgst), float(sgst), 0.00])
                    total_created += 1
                    self.stdout.write(f'✓ Created sales: SI-{timestamp}-{i}')
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'✗ Sales error: {str(e)[:200]}'))
        
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
                        VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                    """, [tenant_id, 'purchase', f'PI-{timestamp}-{i}', voucher_date, vendor,
                          float(total), float(total), float(amount), float(cgst), float(sgst), 0.00])
                    total_created += 1
                    self.stdout.write(f'✓ Created purchase: PI-{timestamp}-{i}')
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'✗ Purchase error: {str(e)[:200]}'))
        
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
                        VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                    """, [tenant_id, 'payment', f'PAY-{timestamp}-{i}', voucher_date, vendor,
                          account, float(amount), f'Payment to {vendor}'])
                    total_created += 1
                    self.stdout.write(f'✓ Created payment: PAY-{timestamp}-{i}')
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'✗ Payment error: {str(e)[:200]}'))
        
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
                        VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                    """, [tenant_id, 'receipt', f'REC-{timestamp}-{i}', voucher_date, customer,
                          account, float(amount), f'Receipt from {customer}'])
                    total_created += 1
                    self.stdout.write(f'✓ Created receipt: REC-{timestamp}-{i}')
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'✗ Receipt error: {str(e)[:200]}'))
        
        # Summary
        self.stdout.write(self.style.SUCCESS(f'\n=== SEED DATA SUMMARY ==='))
        self.stdout.write(self.style.SUCCESS(f'Total Created: {total_created}/27'))
        
        if total_created > 0:
            self.stdout.write(self.style.SUCCESS('\n✓ Seed data created successfully!'))
            self.stdout.write(self.style.SUCCESS('Go to Reports → AI Report and test the dashboard!'))
        else:
            self.stdout.write(self.style.ERROR('\n✗ No vouchers were created. Check errors above.'))
