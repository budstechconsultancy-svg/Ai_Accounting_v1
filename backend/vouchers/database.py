"""
Vouchers Database Layer - Pure Data Access
NO business logic, NO RBAC, NO tenant validation.
Only database queries accepting tenant_id as parameter.
"""

import logging
from accounting.models import Voucher, JournalEntry

logger = logging.getLogger('vouchers.database')


# ============================================================================
# VOUCHER QUERIES
# ============================================================================

def get_all_vouchers(tenant_id):
    """Get all vouchers for a tenant."""
    return Voucher.objects.filter(tenant_id=tenant_id)


def get_vouchers_by_type(voucher_type, tenant_id):
    """Get vouchers filtered by type."""
    return Voucher.objects.filter(tenant_id=tenant_id, type=voucher_type)


def get_voucher_by_id(voucher_id, tenant_id):
    """Get a specific voucher by ID."""
    return Voucher.objects.get(id=voucher_id, tenant_id=tenant_id)


def create_voucher(data, tenant_id):
    """Create a new voucher."""
    return Voucher.objects.create(tenant_id=tenant_id, **data)


def bulk_create_vouchers(vouchers_data, tenant_id):
    """Create multiple vouchers at once."""
    vouchers = [
        Voucher(tenant_id=tenant_id, **voucher_data)
        for voucher_data in vouchers_data
    ]
    return Voucher.objects.bulk_create(vouchers)


def update_voucher(voucher_id, data, tenant_id):
    """Update an existing voucher."""
    voucher = get_voucher_by_id(voucher_id, tenant_id)
    for key, value in data.items():
        setattr(voucher, key, value)
    voucher.save()
    return voucher


def delete_voucher(voucher_id, tenant_id):
    """Delete a voucher."""
    voucher = get_voucher_by_id(voucher_id, tenant_id)
    voucher.delete()


# ============================================================================
# JOURNAL ENTRY QUERIES
# ============================================================================

def get_all_journal_entries(tenant_id):
    """Get all journal entries for a tenant."""
    return JournalEntry.objects.filter(tenant_id=tenant_id)


def get_journal_entry_by_id(entry_id, tenant_id):
    """Get a specific journal entry by ID."""
    return JournalEntry.objects.get(id=entry_id, tenant_id=tenant_id)


def get_journal_entries_by_voucher(voucher_id, tenant_id):
    """Get all journal entries for a specific voucher."""
    return JournalEntry.objects.filter(voucher_id=voucher_id, tenant_id=tenant_id)


def create_journal_entry(data, tenant_id):
    """Create a new journal entry."""
    return JournalEntry.objects.create(tenant_id=tenant_id, **data)


def update_journal_entry(entry_id, data, tenant_id):
    """Update an existing journal entry."""
    entry = get_journal_entry_by_id(entry_id, tenant_id)
    for key, value in data.items():
        setattr(entry, key, value)
    entry.save()
    return entry


def delete_journal_entry(entry_id, tenant_id):
    """Delete a journal entry."""
    entry = get_journal_entry_by_id(entry_id, tenant_id)
    entry.delete()


def get_untagged_transactions_for_ledger(ledger_id, tenant_id):
    """
    Get untagged credit transactions for a specific ledger.
    Returns outstanding purchase/sales invoices that haven't been fully paid.
    
    Args:
        ledger_id: ID of the ledger (party)
        tenant_id: Tenant ID for filtering
    
    Returns:
        List of transaction dictionaries
    """
    from accounting.models import MasterLedger
    
    # Get the ledger name
    try:
        ledger = MasterLedger.objects.get(id=ledger_id, tenant_id=tenant_id)
        ledger_name = ledger.name
    except MasterLedger.DoesNotExist:
        return []
    
    # Query vouchers where this ledger is the party
    # For now, we'll return purchase/sales vouchers
    # In a real system, you'd track payment status in a separate table
    vouchers = Voucher.objects.filter(
        tenant_id=tenant_id,
        party=ledger_name,
        type__in=['purchase', 'sales']
    ).values('id', 'date', 'invoice_no', 'total')
    
    # Transform to the expected format
    transactions = []
    for voucher in vouchers:
        transactions.append({
            'id': voucher['id'],
            'date': voucher['date'].isoformat() if voucher['date'] else '',
            'reference_number': voucher['invoice_no'] or f"V-{voucher['id']}",
            'amount': float(voucher['total'] or 0),
            'payment': 0  # Default payment amount
        })
    
    return transactions

