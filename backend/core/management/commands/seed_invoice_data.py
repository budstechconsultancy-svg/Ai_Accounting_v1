"""
Seed data for Sales Invoices
Creates sample invoice data for testing
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from datetime import date, timedelta
from decimal import Decimal
from accounting.models import (
    SalesInvoice,
    ReceiptVoucherType,
    MasterLedger
)
from core.models import Tenant
from django.db.models import Q


class Command(BaseCommand):
    help = 'Seed sample sales invoice data'

    def handle(self, *args, **options):
        self.stdout.write('Starting sales invoice seeding...')
        
        try:
            with transaction.atomic():
                # Get all tenants
                tenants = Tenant.objects.all()
                
                if not tenants.exists():
                    self.stdout.write(self.style.WARNING('No tenants found. Please create tenants first.'))
                    return
                
                total_created = 0
                
                for tenant in tenants:
                    self.stdout.write(f'\nSeeding invoices for tenant: {tenant.name} ({tenant.id})')
                    
                    # Get or create voucher types
                    voucher_types = self._get_or_create_voucher_types(tenant.id)
                    
                    # Get customers
                    customers = self._get_customers(tenant.id)
                    
                    if not customers:
                        self.stdout.write(self.style.WARNING(f'No customers found for tenant {tenant.name}'))
                        continue
                    
                    # Create sample invoices
                    invoices_created = self._create_sample_invoices(
                        tenant.id,
                        voucher_types,
                        customers
                    )
                    
                    total_created += invoices_created
                    self.stdout.write(self.style.SUCCESS(f'Created {invoices_created} invoices for {tenant.name}'))
                
                self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully created {total_created} total invoices!'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error seeding invoices: {str(e)}'))
            import traceback
            traceback.print_exc()
    
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
            
            if created:
                self.stdout.write(f'  Created voucher type: {voucher_type.name}')
        
        return voucher_types
    
    def _get_customers(self, tenant_id):
        """Get customer ledgers"""
        # Try to find customers by common group names
        customers = MasterLedger.objects.filter(
            tenant_id=tenant_id
        ).filter(
            Q(group__icontains='Debtor') |
            Q(group__icontains='Customer') |
            Q(group__icontains='Receivable') |
            Q(group__icontains='Sundry Debtors')
        )[:10]  # Limit to 10 customers
        
        if not customers.exists():
            # Fallback: Get any ledgers
            customers = MasterLedger.objects.filter(tenant_id=tenant_id)[:5]
        
        return list(customers)
    
    def _create_sample_invoices(self, tenant_id, voucher_types, customers):
        """Create sample invoices"""
        invoices_created = 0
        
        # Create 5 invoices per tenant
        for i in range(5):
            # Rotate through voucher types and customers
            voucher_type = voucher_types[i % len(voucher_types)]
            customer = customers[i % len(customers)]
            
            # Generate invoice date (last 30 days)
            invoice_date = date.today() - timedelta(days=i * 6)
            
            # Determine addresses and tax type
            customer_state = customer.state or 'Karnataka'
            company_state = 'Karnataka'  # Default company state
            
            # Determine tax type
            if customer_state.lower() == company_state.lower():
                tax_type = 'within_state'
            else:
                tax_type = 'other_state'
            
            # Get customer address from extended_data or additional_data
            address_data = customer.extended_data or customer.additional_data or {}
            customer_address = address_data.get('address', f'{customer.name} Address')
            customer_contact = address_data.get('contact', '9876543210')
            
            # Generate invoice number
            invoice_number = f"SI-{tenant_id[:8]}-{(i+1):04d}"
            
            # Create invoice
            try:
                invoice = SalesInvoice.objects.create(
                    tenant_id=tenant_id,
                    invoice_number=invoice_number,
                    invoice_date=invoice_date,
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
                )
                
                invoices_created += 1
                self.stdout.write(f'  ✓ Created invoice: {invoice.invoice_number} for {customer.name}')
                
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'  ⚠ Failed to create invoice {i+1}: {str(e)}'))
        
        return invoices_created
