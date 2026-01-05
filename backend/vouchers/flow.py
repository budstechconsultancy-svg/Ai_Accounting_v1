"""
Vouchers Flow Layer - Business Logic + RBAC + Tenant Validation
This is the ONLY place for business decisions in the Vouchers module.
Every function MUST start with tenant validation and permission checks.
"""

import logging
from core.rbac import check_permission
from core.tenant import get_user_tenant_id
from . import database as db

logger = logging.getLogger('vouchers.flow')


# ============================================================================
# VOUCHER OPERATIONS
# ============================================================================

def list_vouchers(user, voucher_type=None):
    """
    List all vouchers for the user's tenant, optionally filtered by type.
    
    Args:
        user: Authenticated user
        voucher_type: Optional voucher type filter
    
    Returns:
        QuerySet of vouchers
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'ACCOUNTING_VOUCHERS')
    if not has_perm:
        raise PermissionError("Permission denied: ACCOUNTING_VOUCHERS")
    
    # 3. Business logic - fetch data with optional filtering
    if voucher_type:
        return db.get_vouchers_by_type(voucher_type, tenant_id)
    return db.get_all_vouchers(tenant_id)


def create_voucher(user, data):
    """
    Create a new voucher.
    
    Args:
        user: Authenticated user
        data: Voucher data
    
    Returns:
        Created voucher instance
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'ACCOUNTING_VOUCHERS')
    if not has_perm:
        raise PermissionError("Permission denied: ACCOUNTING_VOUCHERS")
    
    # 3. Business logic - create
    return db.create_voucher(data, tenant_id)


def bulk_create_vouchers(user, vouchers_data):
    """
    Create multiple vouchers at once.
    
    Args:
        user: Authenticated user
        vouchers_data: List of voucher data
    
    Returns:
        List of created voucher instances
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'ACCOUNTING_VOUCHERS')
    if not has_perm:
        raise PermissionError("Permission denied: ACCOUNTING_VOUCHERS")
    
    # 3. Business logic - bulk create
    return db.bulk_create_vouchers(vouchers_data, tenant_id)


def update_voucher(user, voucher_id, data):
    """
    Update an existing voucher.
    
    Args:
        user: Authenticated user
        voucher_id: ID of voucher to update
        data: Updated data
    
    Returns:
        Updated voucher instance
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'ACCOUNTING_VOUCHERS')
    if not has_perm:
        raise PermissionError("Permission denied: ACCOUNTING_VOUCHERS")
    
    # 3. Business logic - update
    return db.update_voucher(voucher_id, data, tenant_id)


def delete_voucher(user, voucher_id):
    """
    Delete a voucher.
    
    Args:
        user: Authenticated user
        voucher_id: ID of voucher to delete
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'ACCOUNTING_VOUCHERS')
    if not has_perm:
        raise PermissionError("Permission denied: ACCOUNTING_VOUCHERS")
    
    # 3. Business logic - delete
    db.delete_voucher(voucher_id, tenant_id)


# ============================================================================
# JOURNAL ENTRY OPERATIONS
# ============================================================================

def list_journal_entries(user):
    """
    List all journal entries for the user's tenant.
    
    Args:
        user: Authenticated user
    
    Returns:
        QuerySet of journal entries
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'ACCOUNTING_VOUCHERS')
    if not has_perm:
        raise PermissionError("Permission denied: ACCOUNTING_VOUCHERS")
    
    # 3. Business logic - fetch data
    return db.get_all_journal_entries(tenant_id)


def create_journal_entry(user, data):
    """
    Create a new journal entry.
    
    Args:
        user: Authenticated user
        data: Journal entry data
    
    Returns:
        Created journal entry instance
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'ACCOUNTING_VOUCHERS')
    if not has_perm:
        raise PermissionError("Permission denied: ACCOUNTING_VOUCHERS")
    
    # 3. Business logic - create
    return db.create_journal_entry(data, tenant_id)


def update_journal_entry(user, entry_id, data):
    """
    Update an existing journal entry.
    
    Args:
        user: Authenticated user
        entry_id: ID of journal entry to update
        data: Updated data
    
    Returns:
        Updated journal entry instance
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'ACCOUNTING_VOUCHERS')
    if not has_perm:
        raise PermissionError("Permission denied: ACCOUNTING_VOUCHERS")
    
    # 3. Business logic - update
    return db.update_journal_entry(entry_id, data, tenant_id)


def delete_journal_entry(user, entry_id):
    """
    Delete a journal entry.
    
    Args:
        user: Authenticated user
        entry_id: ID of journal entry to delete
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'ACCOUNTING_VOUCHERS')
    if not has_perm:
        raise PermissionError("Permission denied: ACCOUNTING_VOUCHERS")
    
    # 3. Business logic - delete
    db.delete_journal_entry(entry_id, tenant_id)
