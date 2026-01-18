
import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounting.models import (
    MasterVoucherSales, MasterVoucherCreditNote, MasterVoucherReceipts, 
    MasterVoucherPurchases, MasterVoucherDebitNote, MasterVoucherPayments, 
    MasterVoucherExpenses, MasterVoucherJournal, MasterVoucherContra
)
from core.models import User

def seed_all_tenants():
    # Get all unique tenant_ids
    tenant_ids = list(User.objects.values_list('tenant_id', flat=True).distinct())
    # Add 'default-tenant' just in case
    if 'default-tenant' not in tenant_ids:
        tenant_ids.append('default-tenant')
        
    print(f"Found {len(tenant_ids)} tenants to seed: {tenant_ids}")
    
    for tenant_id in tenant_ids:
        print(f"\nSeeding for tenant: {tenant_id}")
        seed_sales(tenant_id)
        seed_credit_note(tenant_id)
        seed_receipts(tenant_id)
        seed_purchases(tenant_id)
        seed_debit_note(tenant_id)
        seed_payments(tenant_id)
        seed_expenses(tenant_id)
        seed_journal(tenant_id)
        seed_contra(tenant_id)

def seed_sales(tenant_id):
    configs = [
        {'voucher_name': 'Sales B2B', 'prefix': 'SAL3-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Sales B2C', 'prefix': 'SAL4-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Sales Export', 'prefix': 'SAL2-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Sales Invoice', 'prefix': 'SAL-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Sales New', 'prefix': 'Sal', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
    ]
    for config in configs:
        MasterVoucherSales.objects.get_or_create(
            tenant_id=tenant_id,
            voucher_name=config['voucher_name'],
            defaults={**config, 'enable_auto_numbering': True, 'is_active': True, 'current_number': config['start_from']}
        )

def seed_credit_note(tenant_id):
    configs = [
        {'voucher_name': 'Credit Note B2B', 'prefix': 'CN-B2B-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Credit Note B2C', 'prefix': 'CN-B2C-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Credit Note Export', 'prefix': 'CN-EXP-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
    ]
    for config in configs:
        MasterVoucherCreditNote.objects.get_or_create(
            tenant_id=tenant_id,
            voucher_name=config['voucher_name'],
            defaults={**config, 'enable_auto_numbering': True, 'is_active': True, 'current_number': config['start_from']}
        )

def seed_receipts(tenant_id):
    configs = [
        {'voucher_name': 'Receipt Cash', 'prefix': 'RCP-CASH-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Receipt Bank', 'prefix': 'RCP-BANK-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Receipt Online', 'prefix': 'RCP-ONL-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
    ]
    for config in configs:
        MasterVoucherReceipts.objects.get_or_create(
            tenant_id=tenant_id,
            voucher_name=config['voucher_name'],
            defaults={**config, 'enable_auto_numbering': True, 'is_active': True, 'current_number': config['start_from']}
        )

def seed_purchases(tenant_id):
    configs = [
        {'voucher_name': 'Purchase Local', 'prefix': 'PUR-LOC-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Purchase Import', 'prefix': 'PUR-IMP-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Purchase Interstate', 'prefix': 'PUR-INT-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
    ]
    for config in configs:
        MasterVoucherPurchases.objects.get_or_create(
            tenant_id=tenant_id,
            voucher_name=config['voucher_name'],
            defaults={**config, 'enable_auto_numbering': True, 'is_active': True, 'current_number': config['start_from']}
        )

def seed_debit_note(tenant_id):
    configs = [
        {'voucher_name': 'Debit Note Local', 'prefix': 'DN-LOC-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Debit Note Import', 'prefix': 'DN-IMP-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
    ]
    for config in configs:
        MasterVoucherDebitNote.objects.get_or_create(
            tenant_id=tenant_id,
            voucher_name=config['voucher_name'],
            defaults={**config, 'enable_auto_numbering': True, 'is_active': True, 'current_number': config['start_from']}
        )

def seed_payments(tenant_id):
    configs = [
        {'voucher_name': 'Payment Cash', 'prefix': 'PAY-CASH-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Payment Bank', 'prefix': 'PAY-BANK-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Payment Online', 'prefix': 'PAY-ONL-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
    ]
    for config in configs:
        MasterVoucherPayments.objects.get_or_create(
            tenant_id=tenant_id,
            voucher_name=config['voucher_name'],
            defaults={**config, 'enable_auto_numbering': True, 'is_active': True, 'current_number': config['start_from']}
        )

def seed_expenses(tenant_id):
    configs = [
        {'voucher_name': 'Expense General', 'prefix': 'EXP-GEN-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Expense Travel', 'prefix': 'EXP-TRV-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Expense Office', 'prefix': 'EXP-OFF-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
    ]
    for config in configs:
        MasterVoucherExpenses.objects.get_or_create(
            tenant_id=tenant_id,
            voucher_name=config['voucher_name'],
            defaults={**config, 'enable_auto_numbering': True, 'is_active': True, 'current_number': config['start_from']}
        )

def seed_journal(tenant_id):
    configs = [
        {'voucher_name': 'Journal Entry', 'prefix': 'JV-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Journal Adjustment', 'prefix': 'JV-ADJ-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
    ]
    for config in configs:
        MasterVoucherJournal.objects.get_or_create(
            tenant_id=tenant_id,
            voucher_name=config['voucher_name'],
            defaults={**config, 'enable_auto_numbering': True, 'is_active': True, 'current_number': config['start_from']}
        )

def seed_contra(tenant_id):
    configs = [
        {'voucher_name': 'Contra Cash to Bank', 'prefix': 'CNT-C2B-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Contra Bank to Cash', 'prefix': 'CNT-B2C-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
        {'voucher_name': 'Contra Bank Transfer', 'prefix': 'CNT-BTR-', 'suffix': '/25-26', 'start_from': 1, 'required_digits': 4},
    ]
    for config in configs:
        MasterVoucherContra.objects.get_or_create(
            tenant_id=tenant_id,
            voucher_name=config['voucher_name'],
            defaults={**config, 'enable_auto_numbering': True, 'is_active': True, 'current_number': config['start_from']}
        )

if __name__ == '__main__':
    seed_all_tenants()
