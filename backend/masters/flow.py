"""
Masters Flow Layer - Business Logic + RBAC + Tenant Validation
This is the ONLY place for business decisions in the Masters module.
Every function MUST start with tenant validation and permission checks.
"""

import logging
from django.db import IntegrityError, transaction
from rest_framework import serializers as drf_serializers
from core.rbac import check_permission, is_owner
from core.tenant import get_user_tenant_id
from accounting.utils import generate_ledger_code
from . import database as db

logger = logging.getLogger('masters.flow')


# ============================================================================
# LEDGER GROUP OPERATIONS
# ============================================================================

def list_ledger_groups(user):
    """
    List all ledger groups for the user's tenant.
    
    Args:
        user: Authenticated user
    
    Returns:
        QuerySet of ledger groups
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'MASTERS_LEDGER_GROUPS')
    if not has_perm:
        raise PermissionError("Permission denied: MASTERS_LEDGER_GROUPS")
    
    # 3. Business logic - fetch data
    return db.get_all_ledger_groups(tenant_id)


def create_ledger_group(user, data):
    """
    Create a new ledger group.
    
    Args:
        user: Authenticated user
        data: Ledger group data
    
    Returns:
        Created ledger group instance
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'MASTERS_LEDGER_GROUPS')
    if not has_perm:
        raise PermissionError("Permission denied: MASTERS_LEDGER_GROUPS")
    
    # 3. Business logic - create
    return db.create_ledger_group(data, tenant_id)


def update_ledger_group(user, ledger_group_id, data):
    """
    Update an existing ledger group.
    
    Args:
        user: Authenticated user
        ledger_group_id: ID of ledger group to update
        data: Updated data
    
    Returns:
        Updated ledger group instance
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'MASTERS_LEDGER_GROUPS')
    if not has_perm:
        raise PermissionError("Permission denied: MASTERS_LEDGER_GROUPS")
    
    # 3. Business logic - update
    return db.update_ledger_group(ledger_group_id, data, tenant_id)


def delete_ledger_group(user, ledger_group_id):
    """
    Delete a ledger group.
    
    Args:
        user: Authenticated user
        ledger_group_id: ID of ledger group to delete
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'MASTERS_LEDGER_GROUPS')
    if not has_perm:
        raise PermissionError("Permission denied: MASTERS_LEDGER_GROUPS")
    
    # 3. Business logic - delete
    db.delete_ledger_group(ledger_group_id, tenant_id)


# ============================================================================
# LEDGER OPERATIONS
# ============================================================================

def list_ledgers(user):
    """
    List all ledgers for the user's tenant.
    
    Args:
        user: Authenticated user
    
    Returns:
        QuerySet of ledgers
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'MASTERS_LEDGERS')
    if not has_perm:
        raise PermissionError("Permission denied: MASTERS_LEDGERS")
    
    # 3. Business logic - fetch data
    logger.info(f"🔍 Listing ledgers for tenant {tenant_id}, user: {user}")
    ledgers = db.get_all_ledgers(tenant_id)
    logger.info(f"🔍 Found {ledgers.count()} ledgers")
    return ledgers


def create_ledger(user, validated_data):
    """
    Create a new ledger with auto-generated code and retry logic.
    
    Args:
        user: Authenticated user
        validated_data: Validated ledger data
    
    Returns:
        Created ledger instance
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'MASTERS_LEDGERS')
    if not has_perm:
        raise PermissionError("Permission denied: MASTERS_LEDGERS")
    
    # 3. Business logic - create with code generation and retry
    logger.info(f"📝 Creating ledger for tenant {tenant_id} - Data: {validated_data}")
    
    # Extract question answers before creating ledger
    question_answers = validated_data.pop('additional_data', {})
    logger.info(f"📋 Question answers extracted: {question_answers}")
    
    # Retry logic for code generation (handles race conditions)
    max_retries = 3
    ledger = None
    
    for attempt in range(max_retries):
        try:
            with transaction.atomic():
                # Generate code
                ledger_code = generate_ledger_code(validated_data, tenant_id)
                logger.info(
                    f"🔢 Generated ledger code: {ledger_code} "
                    f"(attempt {attempt + 1}/{max_retries})"
                )
                
                # Save with generated code (including additional_data)
                ledger_data = {**validated_data, 'code': ledger_code, 'additional_data': question_answers}
                ledger = db.create_ledger(ledger_data, tenant_id)
                logger.info(f"✅ Ledger saved successfully with code: {ledger_code}")
                
                # Save answers to Answer table
                if question_answers and isinstance(question_answers, dict):
                    from accounting.models_question import Question, Answer
                    logger.info(f"💾 Saving {len(question_answers)} answers to answers table...")
                    
                    for q_id, ans_text in question_answers.items():
                        if not ans_text:
                            logger.info(f"⏭️  Skipping empty answer for Q_ID: {q_id}")
                            continue
                            
                        try:
                            question_obj = Question.objects.get(id=q_id)
                            Answer.objects.create(
                                ledger_code=ledger.code,
                                sub_group_1_1=question_obj.sub_group_1_1,
                                sub_group_1_2=question_obj.sub_group_1_2,
                                question=question_obj.question,
                                answer=ans_text,
                                tenant_id=tenant_id
                            )
                            logger.info(f"✅ Saved answer for Q:{q_id} to answers table")
                        except Question.DoesNotExist:
                            logger.warning(f"⚠️  Question with ID {q_id} does not exist!")
                        except Exception as e:
                            logger.error(f"❌ Failed to save answer for Q:{q_id}: {e}")
                else:
                    logger.info("ℹ️  No question answers to save")
                
                break  # Success, exit retry loop
                
        except IntegrityError as e:
            if attempt == max_retries - 1:
                # Last attempt failed
                logger.error(
                    f"❌ Failed to generate unique code after {max_retries} attempts. "
                    f"Error: {str(e)}"
                )
                raise drf_serializers.ValidationError({
                    'code': 'Failed to generate unique ledger code. Please try again.'
                })
            
            # Retry on next iteration
            logger.warning(
                f"⚠️ Code collision detected on attempt {attempt + 1}, retrying..."
            )
            continue
    
    logger.info(f"✅ Ledger created successfully: {ledger}")
    return ledger


def update_ledger(user, ledger_id, data):
    """
    Update an existing ledger.
    
    Args:
        user: Authenticated user
        ledger_id: ID of ledger to update
        data: Updated data
    
    Returns:
        Updated ledger instance
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'MASTERS_LEDGERS')
    if not has_perm:
        raise PermissionError("Permission denied: MASTERS_LEDGERS")
    
    # 3. Business logic - update
    logger.info(f"📝 Updating ledger {ledger_id} for tenant {tenant_id} - Data: {data}")
    ledger = db.update_ledger(ledger_id, data, tenant_id)
    logger.info(f"✅ Ledger updated successfully: {ledger}")
    return ledger


def delete_ledger(user, ledger_id):
    """
    Delete a ledger.
    
    Args:
        user: Authenticated user
        ledger_id: ID of ledger to delete
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'MASTERS_LEDGERS')
    if not has_perm:
        raise PermissionError("Permission denied: MASTERS_LEDGERS")
    
    # 3. Business logic - delete
    db.delete_ledger(ledger_id, tenant_id)


# ============================================================================
# VOUCHER CONFIG OPERATIONS
# ============================================================================

def list_voucher_configs(user):
    """
    List all voucher configs for the user's tenant.
    
    Args:
        user: Authenticated user
    
    Returns:
        QuerySet of voucher configs
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'MASTERS_VOUCHER_CONFIG')
    if not has_perm:
        raise PermissionError("Permission denied: MASTERS_VOUCHER_CONFIG")
    
    # 3. Business logic - fetch data
    return db.get_all_voucher_configs(tenant_id)


def create_voucher_config(user, data):
    """
    Create a new voucher config.
    
    Args:
        user: Authenticated user
        data: Voucher config data
    
    Returns:
        Created voucher config instance
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'MASTERS_VOUCHER_CONFIG')
    if not has_perm:
        raise PermissionError("Permission denied: MASTERS_VOUCHER_CONFIG")
    
    # 3. Business logic - create
    return db.create_voucher_config(data, tenant_id)


def update_voucher_config(user, config_id, data):
    """
    Update an existing voucher config.
    
    Args:
        user: Authenticated user
        config_id: ID of voucher config to update
        data: Updated data
    
    Returns:
        Updated voucher config instance
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'MASTERS_VOUCHER_CONFIG')
    if not has_perm:
        raise PermissionError("Permission denied: MASTERS_VOUCHER_CONFIG")
    
    # 3. Business logic - update
    return db.update_voucher_config(config_id, data, tenant_id)


def delete_voucher_config(user, config_id):
    """
    Delete a voucher config.
    
    Args:
        user: Authenticated user
        config_id: ID of voucher config to delete
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'MASTERS_VOUCHER_CONFIG')
    if not has_perm:
        raise PermissionError("Permission denied: MASTERS_VOUCHER_CONFIG")
    
    # 3. Business logic - delete
    db.delete_voucher_config(config_id, tenant_id)


# ============================================================================
# HIERARCHY OPERATIONS (Global - No Tenant/RBAC)
# ============================================================================

def list_hierarchy_data():
    """
    List all hierarchy data (global, no authentication required).
    
    Returns:
        QuerySet of hierarchy data
    """
    # No tenant validation or RBAC - this is global data
    return db.get_all_hierarchy_data()
