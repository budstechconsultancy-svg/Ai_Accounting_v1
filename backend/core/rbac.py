"""
RBAC (Role-Based Access Control) Module - DATABASE DRIVEN
Centralized permission checking logic using database tables.
NO hardcoded permissions - all data comes from modules, roles, and role_modules tables.
"""

from django.http import JsonResponse
from django.db import connection


def is_owner(user):
    """
    Check if user is an Owner (User model, not TenantUser).
    Owners have full access to all modules in their tenant.
    """
    from .models import TenantUser
    return not isinstance(user, TenantUser)


def get_user_role_modules(user):
    """
    Get all modules accessible to the user based on their role.
    
    RBAC DISABLED: Returns empty dict or ALL permissions without querying database.
    
    Args:
        user: TenantUser instance
    
    Returns:
        dict: {module_code: {can_view, can_create, can_edit, can_delete}}
    """
    # RBAC DISABLED: Check if user is superuser
    if is_owner(user) or getattr(user, 'is_superuser', False):
        # Return ALL permissions without querying database
        return {'ALL': {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True}}
    
    # For non-superusers, return empty (no permissions)
    return {}


def check_permission(user, permission_code, action='view'):
    """
    Check if user has permission to perform an action on a module.
    
    RBAC DISABLED: Always returns True since modules table was removed.
    All authenticated users have full access.
    
    Args:
        user: User or TenantUser instance
        permission_code: String module code (e.g., 'MASTERS_LEDGERS')
        action: 'view', 'create', 'edit', or 'delete' (default: 'view')
    
    Returns:
        tuple: (has_permission: bool, error_response: JsonResponse or None)
    """
    # RBAC DISABLED: Always grant permission
    # This is because the modules table was removed from the database
    # All registered users are superusers with full access
    return True, None


def require_permission(permission_code, action='view'):
    """Decorator to enforce permission checks."""
    def decorator(func):
        def wrapper(request, *args, **kwargs):
            if not hasattr(request, 'user') or not request.user.is_authenticated:
                return JsonResponse({'detail': 'Authentication required'}, status=401)
            
            has_perm, error_response = check_permission(request.user, permission_code, action)
            if not has_perm:
                return error_response
            
            return func(request, *args, **kwargs)
        return wrapper
    return decorator




def get_all_modules():
    """
    Get all modules from database.
    
    RBAC DISABLED: Returns empty list since modules table doesn't exist.
    """
    return []


def get_role_permissions(role_id):
    """
    Get all module permissions for a specific role.
    
    RBAC DISABLED: Returns empty dict since modules table doesn't exist.
    """
    return {}


def get_all_permission_ids():
    """
    Get all standard permission IDs (module IDs).
    
    RBAC DISABLED: Returns empty list since modules table doesn't exist.
    """
    return []


def get_permission_codes_from_ids(ids):
    """
    Convert list of permission IDs (module IDs) to codes.
    
    RBAC DISABLED: Returns empty list since modules table doesn't exist.
    """
    return []
