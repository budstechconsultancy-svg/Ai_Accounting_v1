from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction, connection, IntegrityError
from decimal import Decimal
from datetime import date, timedelta
import random

from accounting.models import (
    Voucher, 
    SalesVoucher, 
    MasterLedger, 
    ReceiptVoucherType,
    VoucherConfiguration
)
from core.models import Tenant

class Command(BaseCommand):
    help = 'Seed transaction data (Receipts, Payments, Purchases, Credit Notes, etc.)'

    def handle(self, *args, **options):
        self.stdout.write('Seeding other vouchers...')
        
        # Ensure table exists
        self.check_and_create_vouchers_table()

        tenants = Tenant.objects.all()
        if not tenants.exists():
            self.stdout.write(self.style.WARNING('No tenants found.'))
            return

        for tenant in tenants:
            self.stdout.write(f"Processing tenant: {tenant.name}")
            
            customers = list(MasterLedger.objects.filter(tenant_id=tenant.id, group='Sundry Debtors'))
            vendors = list(MasterLedger.objects.filter(tenant_id=tenant.id, group='Sundry Creditors'))
            
            if not customers or not vendors:
                self.stdout.write(self.style.WARNING("  Missing customers/vendors. Run seed_sales_vouchers first."))
                continue

            with transaction.atomic():
                self.create_all_transactions(tenant, customers, vendors)
        
        self.stdout.write(self.style.SUCCESS('Seeding completed.'))

    def create_all_transactions(self, tenant, customers, vendors):
        # 1. Receipts (Voucher)
        self.create_generic_vouchers(tenant, 'receipt', customers, 5, prefix="REC")
        
        # 2. Payments (Voucher)
        self.create_generic_vouchers(tenant, 'payment', vendors, 5, prefix="PAY")
        
        # 3. Purchases (Voucher)
        self.create_generic_vouchers(tenant, 'purchase', vendors, 5, prefix="PUR")
        
        # 4. Journal (Voucher)
        self.create_generic_vouchers(tenant, 'journal', [], 5, prefix="JRN")
        
        # 5. Contra (Voucher)
        self.create_generic_vouchers(tenant, 'contra', [], 5, prefix="CNT")
        
        # 6. Credit Notes (SalesVoucher)
        self.create_credit_notes(tenant, customers, 5)

    def check_and_create_vouchers_table(self):
        with connection.cursor() as cursor:
            # Check if table exists
            cursor.execute("SHOW TABLES LIKE 'vouchers'")
            if cursor.fetchone():
                self.stdout.write("  Table 'vouchers' already exists.")
                return

            self.stdout.write("  Creating 'vouchers' table manually...")
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS `vouchers` (
                    `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                    `tenant_id` varchar(36) NOT NULL,
                    `created_at` datetime(6) NOT NULL,
                    `updated_at` datetime(6) NOT NULL,
                    `type` varchar(20) NOT NULL,
                    `voucher_number` varchar(50) NOT NULL,
                    `date` date NOT NULL,
                    `party` varchar(255) NULL,
                    `account` varchar(255) NULL,
                    `amount` numeric(15, 2) NULL,
                    `total` numeric(15, 2) NULL,
                    `narration` longtext NULL,
                    `invoice_no` varchar(50) NULL,
                    `is_inter_state` tinyint(1) NULL,
                    `total_taxable_amount` numeric(15, 2) NULL,
                    `total_cgst` numeric(15, 2) NULL,
                    `total_sgst` numeric(15, 2) NULL,
                    `total_igst` numeric(15, 2) NULL,
                    `total_debit` numeric(15, 2) NULL,
                    `total_credit` numeric(15, 2) NULL,
                    `from_account` varchar(255) NULL,
                    `to_account` varchar(255) NULL,
                    `items_data` json NULL,
                    `dummy_force` integer NULL,
                    CONSTRAINT `vouchers_unique_number` UNIQUE (`voucher_number`, `tenant_id`, `type`)
                );
            """)
            self.stdout.write(self.style.SUCCESS("  Table 'vouchers' created."))

    def create_generic_vouchers(self, tenant, v_type, parties, count, prefix):
        # Get configurations for this type
        configs = VoucherConfiguration.objects.filter(
            tenant_id=tenant.id, 
            voucher_type=v_type
        )
        
        if not configs.exists():
            self.stdout.write(self.style.WARNING(f"  No {v_type} configurations found. Using default prefix."))
            # Fallback to single loop if no configs (though seed_voucher_configurations should have run)
            config_list = [{'prefix': prefix, 'voucher_name': 'Default'}]
        else:
            config_list = configs

        for config in config_list:
            # Handle object vs dict
            c_prefix = config.prefix if hasattr(config, 'prefix') else config['prefix']
            c_name = config.voucher_name if hasattr(config, 'voucher_name') else config['voucher_name']
            
            self.stdout.write(f"  Creating {count} {v_type} vouchers for config: {c_name}")
            
            for i in range(count):
                try:
                    party_name = parties[i % len(parties)].name if parties else "General Account"
                    amount = Decimal(random.randint(1000, 50000))
                    v_date = date.today() - timedelta(days=random.randint(0, 30))
                    # Use config prefix
                    v_num = f"{c_prefix}{random.randint(10000, 99999)}"
                    
                    Voucher.objects.create(
                        tenant_id=tenant.id,
                        type=v_type,
                        voucher_number=v_num,
                        date=v_date,
                        party=party_name,
                        account="Cash" if i % 2 == 0 else "Bank",
                        amount=amount,
                        total=amount,
                        narration=f"Sample {v_type} entry {i+1} ({c_name})",
                        total_taxable_amount=amount if v_type == 'purchase' else 0,
                    )
                except IntegrityError:
                    self.stdout.write(f"    Skipping duplicate voucher {v_num}")

    def create_credit_notes(self, tenant, customers, count):
        self.stdout.write(f"  Creating {count} Credit Notes (SalesVoucher)...")
        
        # Resolve/Create Voucher Type for Credit Note
        # Get all Credit Note configurations
        configs = VoucherConfiguration.objects.filter(
            tenant_id=tenant.id, 
            voucher_type='credit-note'
        )
        
        if not configs.exists():
            self.stdout.write(self.style.WARNING("  No Credit Note configurations found. Skipping."))
            return

        # Fetch or create the SINGLE generic Credit Note Type to avoid unique constraint violations
        # We assume all Credit Note variants share the same logical 'type' (code='credit-note')
        # even if they have different Numbering Configs.
        cn_type = ReceiptVoucherType.objects.filter(
            tenant_id=tenant.id,
            code='credit-note'
        ).first()
        
        if not cn_type:
            cn_type = ReceiptVoucherType.objects.create(
                tenant_id=tenant.id,
                name="Credit Note",
                code='credit-note',
                is_active=True
            )

        for config in configs:
            self.stdout.write(f"    Processing config: {config.voucher_name}")
            
            # Create a few vouchers for THIS configuration
            # If we really want 'count' total, we could divide. 
            # But creating 'count' per config seems safer/better for testing.
            current_count = count  
            
            for i in range(current_count):
                try:
                    customer = customers[i % len(customers)]
                    v_date = date.today() - timedelta(days=random.randint(0, 30))
                    
                    v_num = f"{config.prefix or 'CN-'}{random.randint(10000, 99999)}"

                    customer_address = customer.extended_data.get('address', 'Address') if customer.extended_data else ""
                    
                    SalesVoucher.objects.create(
                        tenant_id=tenant.id,
                        sales_invoice_number=v_num,
                        date=v_date,
                        voucher_type=cn_type, # Point to Credit Note Type
                        customer=customer,
                        bill_to_address=customer_address,
                        bill_to_country='India',
                        ship_to_address=customer_address,
                        ship_to_country='India',
                        tax_type='within_state',
                        status='details_added',
                        grand_total=Decimal(random.randint(500, 5000))
                    )
                except IntegrityError:
                    self.stdout.write(f"    Skipping duplicate Credit Note {v_num}")
