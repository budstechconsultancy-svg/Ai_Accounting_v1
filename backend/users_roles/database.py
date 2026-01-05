"""
Users & Roles Database Layer - Pure Data Access
Direct database operations for TenantUser and Role management.
No business logic, RBAC, or tenant validation here.
"""

from django.db import transaction
from django.db.models import Prefetch
from core.models import TenantUser, Role, RoleModule
from core.rbac import get_role_permissions


# ============================================================================
# USER OPERATIONS
# ============================================================================

def get_tenant_users(tenant_id):
    """Get all users for a tenant."""
    # Select related role for efficiency
    return TenantUser.objects.filter(
        tenant_id=tenant_id
    ).order_by('-created_at')


def get_user_by_id(user_id, tenant_id):
    """Get specific user by ID and tenant."""
    try:
        return TenantUser.objects.get(id=user_id, tenant_id=tenant_id)
    except TenantUser.DoesNotExist:
        return None


def get_tenant_user_by_username(username):
    """Get a tenant user by username."""
    try:
        return TenantUser.objects.get(username=username)
    except TenantUser.DoesNotExist:
        return None


def check_username_exists(username):
    """Check if username exists."""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    return (TenantUser.objects.filter(username=username).exists() or
            User.objects.filter(username=username).exists())


def create_tenant_user(data, tenant_id):
    """Create a new tenant user."""
    # Ensure tenant_id is set
    role_id = data.get('role_id')
    
    return TenantUser.objects.create_user(
        username=data['username'],
        password=data['password'],
        email=data.get('email'),
        tenant_id=tenant_id,
        role_id=role_id,
        # Support direct permission assignment (legacy/custom)
        selected_submodule_ids=data.get('submodule_ids', [])
    )


def update_tenant_user(user_id, data, tenant_id):
    """Update existing user."""
    user = get_user_by_id(user_id, tenant_id)
    if not user:
        return None
    
    # Update allowed fields
    if 'email' in data:
        user.email = data['email']
        
    if 'role_id' in data:
        user.role_id = data['role_id']
        
    if 'submodule_ids' in data:
        user.selected_submodule_ids = data['submodule_ids']
        
    if 'is_active' in data:
        user.is_active = data['is_active']
            
    # Handle password change separately if needed
    if 'password' in data and data['password']:
        user.set_password(data['password'])
        
    user.save()
    return user


def delete_tenant_user(user_id, tenant_id):
    """Delete a user."""
    user = get_user_by_id(user_id, tenant_id)
    if user:
        user.delete()
        return True
    return False


# ============================================================================
# ROLE OPERATIONS
# ============================================================================

def get_tenant_roles(tenant_id):
    """Get all roles for a tenant."""
    return Role.objects.filter(tenant_id=tenant_id).order_by('name')


def get_role_by_id(role_id, tenant_id):
    """Get specific role by ID and tenant."""
    try:
        return Role.objects.get(id=role_id, tenant_id=tenant_id)
    except Role.DoesNotExist:
        return None


def create_role(data, tenant_id):
    """Create a new role."""
    return Role.objects.create(
        tenant_id=tenant_id,
        name=data['name'],
        description=data.get('description', ''),
        is_system=False  # User-created roles are never system roles
    )


def update_role(role_id, data, tenant_id):
    """Update role details."""
    role = get_role_by_id(role_id, tenant_id)
    if not role:
        return None
    
    if role.is_system:
        # Cannot rename system roles, but can update description
        if 'description' in data:
            role.description = data['description']
    else:
        if 'name' in data:
            role.name = data['name']
        if 'description' in data:
            role.description = data['description']
            
    role.save()
    return role


def delete_role(role_id, tenant_id):
    """Delete a role."""
    role = get_role_by_id(role_id, tenant_id)
    if not role:
        return False
        
    if role.is_system:
        raise ValueError("Cannot delete system roles")
        
    # Check if role is assigned to users
    if TenantUser.objects.filter(role_id=role_id).exists():
        raise ValueError("Cannot delete role assigned to users")
        
    role.delete()
    return True


def update_role_permissions(role_id, permissions):
    """
    Update permissions for a role.
    
    Args:
        role_id: ID of the role
        permissions: List of dicts with module_id and permissions
        e.g. [{'module_id': 1, 'can_view': True, ...}]
    """
    with transaction.atomic():
        # Clear existing permissions
        RoleModule.objects.filter(role_id=role_id).delete()
        
        # Create new permissions
        role_modules = []
        for perm in permissions:
            role_modules.append(RoleModule(
                role_id=role_id,
                module_id=perm['module_id'],
                can_view=perm.get('can_view', False),
                can_create=perm.get('can_create', False),
                can_edit=perm.get('can_edit', False),
                can_delete=perm.get('can_delete', False)
            ))
            
        RoleModule.objects.bulk_create(role_modules)
    
    return get_role_permissions(role_id)
