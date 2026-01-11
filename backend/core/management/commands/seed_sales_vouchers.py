"""
Seed data for Sales Vouchers with Customers and Vendors
Creates sample customers, vendors, and sales vouchers with line items
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from datetime import date, timedelta
from decimal import Decimal
from accounting.models import (
    SalesVoucher,
    SalesVoucherItem,
    ReceiptVoucherType,
    MasterLedger
)
from core.models import Tenant


class Command(BaseCommand):
    help = 'Seed sample sales voucher data with customers and vendors'

    def handle(self, *args, **options):
        self.stdout.write('Starting sales voucher seeding...')
        
        try:
            with transaction.atomic():
                # Get all tenants
                tenants = Tenant.objects.all()
                
                if not tenants.exists():
                    self.stdout.write(self.style.WARNING('No tenants found. Please create tenants first.'))
                    return
                
                total_created = 0
                
                for tenant in tenants:
                    self.stdout.write(f'\n{"="*60}')
                    self.stdout.write(f'Seeding data for tenant: {tenant.name} ({tenant.id})')
                    self.stdout.write(f'{"="*60}')
                    
                    # Create customers
                    customers = self._create_customers(tenant.id)
                    self.stdout.write(self.style.SUCCESS(f'✓ Created {len(customers)} customers'))
                    
                    # Create vendors
                    vendors = self._create_vendors(tenant.id)
                    self.stdout.write(self.style.SUCCESS(f'✓ Created {len(vendors)} vendors'))
                    
                    # Get or create voucher types
                    voucher_types = self._get_or_create_voucher_types(tenant.id)
                    self.stdout.write(self.style.SUCCESS(f'✓ Found/Created {len(voucher_types)} voucher types'))
                    
                    # Create sample sales vouchers with items
                    vouchers_created = self._create_sample_vouchers(
                        tenant.id,
                        voucher_types,
                        customers
                    )
                    
                    total_created += vouchers_created
                    self.stdout.write(self.style.SUCCESS(f'✓ Created {vouchers_created} sales vouchers with items'))
                
                self.stdout.write(f'\n{"="*60}')
                self.stdout.write(self.style.SUCCESS(f'✅ Successfully created {total_created} total sales vouchers!'))
                self.stdout.write(f'{"="*60}\n')
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error seeding sales vouchers: {str(e)}'))
            import traceback
            traceback.print_exc()
    
    def _create_customers(self, tenant_id):
        """Create sample customer ledgers"""
        customers = []
        
        customer_data = [
            {
                'name': 'ABC Corporation',
                'gstin': '29ABCDE1234F1Z5',
                'state': 'Karnataka',
                'address': '123 MG Road, Bangalore, Karnataka - 560001',
                'contact': '9876543210'
            },
            {
                'name': 'XYZ Enterprises',
                'gstin': '27XYZAB5678G2Z1',
                'state': 'Maharashtra',
                'address': '456 Andheri East, Mumbai, Maharashtra - 400069',
                'contact': '9876543211'
            },
            {
                'name': 'Tech Solutions Pvt Ltd',
                'gstin': '29TECHSO1234H3Z',
                'state': 'Karnataka',
                'address': '789 Whitefield, Bangalore, Karnataka - 560066',
                'contact': '9876543212'
            },
            {
                'name': 'Global Traders',
                'gstin': '33GLOBAL5678I4Z',
                'state': 'Tamil Nadu',
                'address': '321 Anna Salai, Chennai, Tamil Nadu - 600002',
                'contact': '9876543213'
            },
            {
                'name': 'Prime Industries',
                'gstin': '29PRIMEI1234J5Z',
                'state': 'Karnataka',
                'address': '654 Koramangala, Bangalore, Karnataka - 560034',
                'contact': '9876543214'
            },
        ]
        
        for data in customer_data:
            # Check if customer already exists
            existing = MasterLedger.objects.filter(
                tenant_id=tenant_id,
                name=data['name']
            ).first()
            
            if existing:
                customers.append(existing)
                continue
            
            customer = MasterLedger.objects.create(
                tenant_id=tenant_id,
                name=data['name'],
                group='Sundry Debtors',
                category='Asset',
                sub_group_1='Current Assets',
                gstin=data['gstin'],
                state=data['state'],
                extended_data={
                    'address': data['address'],
                    'contact': data['contact']
                },
                code=f'CUS-{len(customers)+1:04d}'
            )
            customers.append(customer)
        
        return customers
    
    def _create_vendors(self, tenant_id):
        """Create sample vendor ledgers"""
        vendors = []
        
        vendor_data = [
            {
                'name': 'Supplier One Pvt Ltd',
                'gstin': '29SUPONE1234K6Z',
                'state': 'Karnataka',
                'address': '111 Industrial Area, Bangalore, Karnataka - 560045',
                'contact': '9876543220'
            },
            {
                'name': 'Vendor Services Ltd',
                'gstin': '27VENDOR5678L7Z',
                'state': 'Maharashtra',
                'address': '222 Bandra West, Mumbai, Maharashtra - 400050',
                'contact': '9876543221'
            },
            {
                'name': 'Raw Materials Co',
                'gstin': '29RAWMAT1234M8Z',
                'state': 'Karnataka',
                'address': '333 Peenya, Bangalore, Karnataka - 560058',
                'contact': '9876543222'
            },
        ]
        
        for data in vendor_data:
            # Check if vendor already exists
            existing = MasterLedger.objects.filter(
                tenant_id=tenant_id,
                name=data['name']
            ).first()
            
            if existing:
                vendors.append(existing)
                continue
            
            vendor = MasterLedger.objects.create(
                tenant_id=tenant_id,
                name=data['name'],
                group='Sundry Creditors',
                category='Liability',
                sub_group_1='Current Liabilities',
                gstin=data['gstin'],
                state=data['state'],
                extended_data={
                    'address': data['address'],
                    'contact': data['contact']
                },
                code=f'VEN-{len(vendors)+1:04d}'
            )
            vendors.append(vendor)
        
        return vendors
    
    def _get_or_create_voucher_types(self, tenant_id):
        """Get or create receipt voucher types"""
        voucher_types = []
        
        # Standard voucher types
        types_data = [
            {'name': 'Sales Invoice', 'code': 'SI', 'description': 'Standard sales invoice'},
            {'name': 'Tax Invoice', 'code': 'TI', 'description': 'Tax invoice with GST'},
            {'name': 'Retail Invoice', 'code': 'RI', 'description': 'Retail sales invoice'},
        ]
        
        for type_data in types_data:
            voucher_type, created = ReceiptVoucherType.objects.get_or_create(
                tenant_id=tenant_id,
                code=type_data['code'],
                defaults={
                    'name': type_data['name'],
                    'description': type_data['description'],
                    'is_active': True,
                    'display_order': 1
                }
            )
            voucher_types.append(voucher_type)
        
        return voucher_types
    
    def _create_sample_vouchers(self, tenant_id, voucher_types, customers):
        """Create sample sales vouchers with line items"""
        vouchers_created = 0
        
        # Sample items data
        items_catalog = [
            {'name': 'Laptop Dell Inspiron', 'hsn': '84713000', 'rate': Decimal('45000.00')},
            {'name': 'Office Chair Executive', 'hsn': '94013000', 'rate': Decimal('8500.00')},
            {'name': 'Printer HP LaserJet', 'hsn': '84433210', 'rate': Decimal('15000.00')},
            {'name': 'Monitor 24 inch LED', 'hsn': '85285200', 'rate': Decimal('12000.00')},
            {'name': 'Keyboard Wireless', 'hsn': '84716060', 'rate': Decimal('1500.00')},
            {'name': 'Mouse Optical', 'hsn': '84716070', 'rate': Decimal('500.00')},
            {'name': 'Desk Wooden Executive', 'hsn': '94036000', 'rate': Decimal('18000.00')},
            {'name': 'Projector Full HD', 'hsn': '85286200', 'rate': Decimal('35000.00')},
        ]
        
        # Create 10 vouchers
        for i in range(10):
            # Rotate through voucher types and customers
            voucher_type = voucher_types[i % len(voucher_types)]
            customer = customers[i % len(customers)]
            
            # Generate voucher date (last 60 days)
            voucher_date = date.today() - timedelta(days=i * 6)
            
            # Determine addresses and tax type
            customer_state = customer.state or 'Karnataka'
            company_state = 'Karnataka'  # Default company state
            
            # Determine tax type
            if customer_state.lower() == company_state.lower():
                tax_type = 'within_state'
            else:
                tax_type = 'other_state'
            
            # Get customer address
            address_data = customer.extended_data or {}
            customer_address = address_data.get('address', f'{customer.name} Address')
            customer_contact = address_data.get('contact', '9876543210')
            
            # Generate invoice number
            invoice_number = f"SV-{tenant_id[:8]}-{(i+1):04d}"
            
            # Create voucher
            try:
                voucher = SalesVoucher.objects.create(
                    tenant_id=tenant_id,
                    sales_invoice_number=invoice_number,
                    date=voucher_date,
                    voucher_type=voucher_type,
                    customer=customer,
                    
                    # Billing address
                    bill_to_address=customer_address,
                    bill_to_gstin=customer.gstin or '',
                    bill_to_contact=customer_contact,
                    bill_to_state=customer_state,
                    bill_to_country='India',
                    
                    # Shipping address (same as billing)
                    ship_to_address=customer_address,
                    ship_to_state=customer_state,
                    ship_to_country='India',
                    
                    # Tax and status
                    tax_type=tax_type,
                    status='draft' if i % 3 == 0 else 'completed',
                    current_step=1 if i % 3 == 0 else 5,
                    
                    # Totals (will be calculated from items)
                    total_taxable_amount=Decimal('0.00'),
                    total_cgst=Decimal('0.00'),
                    total_sgst=Decimal('0.00'),
                    total_igst=Decimal('0.00'),
                    grand_total=Decimal('0.00'),
                )
                
                # Add 2-4 line items per voucher
                num_items = 2 + (i % 3)  # 2, 3, or 4 items
                total_taxable = Decimal('0.00')
                total_cgst = Decimal('0.00')
                total_sgst = Decimal('0.00')
                total_igst = Decimal('0.00')
                
                for j in range(num_items):
                    item_data = items_catalog[(i + j) % len(items_catalog)]
                    quantity = Decimal(str(1 + (j % 3)))  # 1, 2, or 3 quantity
                    rate = item_data['rate']
                    taxable_amount = quantity * rate
                    
                    # Calculate GST (18% for most items)
                    gst_rate = Decimal('18.00')
                    
                    if tax_type == 'within_state':
                        cgst_rate = gst_rate / 2
                        sgst_rate = gst_rate / 2
                        cgst_amount = (taxable_amount * cgst_rate / 100).quantize(Decimal('0.01'))
                        sgst_amount = (taxable_amount * sgst_rate / 100).quantize(Decimal('0.01'))
                        igst_amount = Decimal('0.00')
                    else:
                        cgst_rate = Decimal('0.00')
                        sgst_rate = Decimal('0.00')
                        cgst_amount = Decimal('0.00')
                        sgst_amount = Decimal('0.00')
                        igst_amount = (taxable_amount * gst_rate / 100).quantize(Decimal('0.01'))
                    
                    total_amount = taxable_amount + cgst_amount + sgst_amount + igst_amount
                    
                    # Create line item
                    SalesVoucherItem.objects.create(
                        tenant_id=tenant_id,
                        sales_voucher=voucher,
                        line_number=j + 1,
                        item_name=item_data['name'],
                        hsn_code=item_data['hsn'],
                        quantity=quantity,
                        unit='Nos',
                        rate=rate,
                        taxable_amount=taxable_amount,
                        cgst_rate=cgst_rate,
                        cgst_amount=cgst_amount,
                        sgst_rate=sgst_rate,
                        sgst_amount=sgst_amount,
                        igst_rate=gst_rate if tax_type != 'within_state' else Decimal('0.00'),
                        igst_amount=igst_amount,
                        total_amount=total_amount
                    )
                    
                    # Accumulate totals
                    total_taxable += taxable_amount
                    total_cgst += cgst_amount
                    total_sgst += sgst_amount
                    total_igst += igst_amount
                
                # Update voucher totals
                grand_total = total_taxable + total_cgst + total_sgst + total_igst
                voucher.total_taxable_amount = total_taxable
                voucher.total_cgst = total_cgst
                voucher.total_sgst = total_sgst
                voucher.total_igst = total_igst
                voucher.grand_total = grand_total
                voucher.save()
                
                vouchers_created += 1
                self.stdout.write(f'  ✓ Created voucher: {voucher.sales_invoice_number} for {customer.name} (₹{grand_total:,.2f})')
                
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  ⚠ Failed to create voucher {i+1}: {str(e)}'))
        
        return vouchers_created
