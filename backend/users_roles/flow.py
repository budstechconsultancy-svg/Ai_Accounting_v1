"""
Users & Roles Flow Layer - Business Logic + RBAC + Tenant Validation
This is the ONLY place for business decisions in the Users & Roles module.
Every function MUST start with tenant validation and permission checks.
"""

import logging
from core.rbac import check_permission
from core.models import TenantUser
from core.tenant import get_user_tenant_id
from . import database as db

logger = logging.getLogger('users_roles.flow')


# ============================================================================
# USER MANAGEMENT OPERATIONS
# ============================================================================

def list_tenant_users(user):
    """
    List all tenant users with their roles.
    
    Args:
        user: Authenticated user
    
    Returns:
        List of tenant users with role details
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'USERS_MANAGE')
    if not has_perm:
        # Check if user is trying to view self
        pass # For pure listing often restricted to admin
        # Let it fail for now if not permitted
        raise PermissionError("Permission denied: USERS_MANAGE")
    
    # 3. Business logic - fetch and format data
    users = db.get_tenant_users(tenant_id)
    
    # Enrich with role names
    roles = db.get_tenant_roles(tenant_id)
    role_map = {r.id: r.name for r in roles}
    
    user_list = []
    for u in users:
        role_name = role_map.get(u.role_id, "No Role") if hasattr(u, 'role_id') and u.role_id else "No Role"
            
        user_list.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'is_active': u.is_active,
            'last_login': getattr(u, 'last_login', None),
            'role_id': getattr(u, 'role_id', None),
            'role_name': role_name
        })
        
    return user_list


def create_tenant_user(user, data):
    """
    Create a new tenant user with role.
    
    Args:
        user: Authenticated user (must be Owner)
        data: User data dict (username, password, email, role_id)
    """
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'USERS_MANAGE', 'create')
    if not has_perm:
        raise PermissionError("Permission denied: USERS_MANAGE (create)")
    
    # 3. Business logic
    if db.check_username_exists(data['username']):
        raise ValueError("Username already exists")
    
    # Validate role belongs to tenant
    if data.get('role_id'):
        role = db.get_role_by_id(data['role_id'], tenant_id)
        if not role:
            raise ValueError("Invalid role ID")
            
    return db.create_tenant_user(data, tenant_id)


def update_tenant_user(user, user_id, data):
    """Update a tenant user."""
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'USERS_MANAGE', 'edit')
    if not has_perm:
        raise PermissionError("Permission denied: USERS_MANAGE (edit)")
    
    # 3. Business logic
    # Validate role if changing
    if data.get('role_id'):
        role = db.get_role_by_id(data['role_id'], tenant_id)
        if not role:
            raise ValueError("Invalid role ID")
            
    return db.update_tenant_user(user_id, data, tenant_id)


def delete_tenant_user(user, user_id):
    """Delete a tenant user."""
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'USERS_MANAGE', 'delete')
    if not has_perm:
        raise PermissionError("Permission denied: USERS_MANAGE (delete)")
    
    # 3. Business logic
    db.delete_tenant_user(user_id, tenant_id)


# ============================================================================
# ROLE MANAGEMENT OPERATIONS
# ============================================================================

def list_roles(user):
    """List all roles for the tenant."""
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check - viewing roles requires USERS_ROLES permission
    has_perm, error_response = check_permission(user, 'USERS_ROLES', 'view')
    if not has_perm:
        # Fallback for user creation screen? maybe USERS_MANAGE should allow listing roles?
        # Check USERS_MANAGE too as a fallback for assigning roles?
        has_manage, _ = check_permission(user, 'USERS_MANAGE', 'view')
        if not has_manage:
            raise PermissionError("Permission denied: USERS_ROLES (view)")
    
    # 3. Business logic
    return db.get_tenant_roles(tenant_id)


def get_role_details(user, role_id):
    """Get role details including permissions."""
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    if not tenant_id:
        raise PermissionError("User has no associated tenant")
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'USERS_ROLES', 'view')
    if not has_perm:
        raise PermissionError("Permission denied: USERS_ROLES (view)")
    
    # 3. Business logic
    role = db.get_role_by_id(role_id, tenant_id)
    if not role:
        raise ValueError("Role not found")
        
    permissions = db.get_role_permissions(role_id)
    return role, permissions


def create_role(user, data):
    """Create a new role with permissions."""
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'USERS_ROLES', 'create')
    if not has_perm:
        raise PermissionError("Permission denied: USERS_ROLES (create)")
    
    # 3. Business logic
    role = db.create_role(data, tenant_id)
    
    if 'permissions' in data and data['permissions']:
        db.update_role_permissions(role.id, data['permissions'])
        
    return role


def update_role(user, role_id, data):
    """Update a role and its permissions."""
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'USERS_ROLES', 'edit')
    if not has_perm:
        raise PermissionError("Permission denied: USERS_ROLES (edit)")
    
    # 3. Business logic
    role = db.update_role(role_id, data, tenant_id)
    if not role:
        raise ValueError("Role not found")
        
    if 'permissions' in data:
        db.update_role_permissions(role.id, data['permissions'])
        
    return role


def delete_role(user, role_id):
    """Delete a role."""
    # 1. Tenant validation
    tenant_id = get_user_tenant_id(user)
    
    # 2. RBAC check
    has_perm, error_response = check_permission(user, 'USERS_ROLES', 'delete')
    if not has_perm:
        raise PermissionError("Permission denied: USERS_ROLES (delete)")
    
    # 3. Business logic
    db.delete_role(role_id, tenant_id)
