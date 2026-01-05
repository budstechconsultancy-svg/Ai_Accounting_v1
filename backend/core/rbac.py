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
    
    Args:
        user: TenantUser instance
    
    Returns:
        dict: {module_code: {can_view, can_create, can_edit, can_delete}}
    """
    # If Owner (User model), return ALL modules
    if is_owner(user):
        with connection.cursor() as cursor:
            cursor.execute("SELECT code FROM modules WHERE is_active = TRUE")
            return {row[0]: {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True} 
                   for row in cursor.fetchall()}

    if not hasattr(user, 'role_id') or not user.role_id:
        # Backward compatibility: check selected_submodule_ids
        selected_ids = getattr(user, 'selected_submodule_ids', []) or []
        if selected_ids:
            # Convert old permission IDs to module codes
            with connection.cursor() as cursor:
                format_strings = ','.join(['%s'] * len(selected_ids))
                cursor.execute(f"SELECT code FROM modules WHERE id IN ({format_strings})", tuple(selected_ids))
                modules = {row[0]: {'can_view': True, 'can_create': True, 'can_edit': True, 'can_delete': True} 
                          for row in cursor.fetchall()}
                return modules
        return {}
    
    # Query role_modules table
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT m.code, rm.can_view, rm.can_create, rm.can_edit, rm.can_delete
            FROM role_modules rm
            JOIN modules m ON rm.module_id = m.id
            WHERE rm.role_id = %s AND m.is_active = TRUE
        """, [user.role_id])
        
        modules = {}
        for row in cursor.fetchall():
            modules[row[0]] = {
                'can_view': bool(row[1]),
                'can_create': bool(row[2]),
                'can_edit': bool(row[3]),
                'can_delete': bool(row[4])
            }
        return modules


def check_permission(user, permission_code, action='view'):
    """
    Check if user has permission to perform an action on a module.
    
    Args:
        user: User or TenantUser instance
        permission_code: String module code (e.g., 'MASTERS_LEDGERS')
        action: 'view', 'create', 'edit', or 'delete' (default: 'view')
    
    Returns:
        tuple: (has_permission: bool, error_response: JsonResponse or None)
    """
    # Owners have full access
    if is_owner(user):
        return True, None
    
    # Get user's role modules
    user_modules = get_user_role_modules(user)
    
    # Check if user has access to this module
    if permission_code not in user_modules:
        # Check if it's a parent module access (sometimes UI checks parent)
        # For simplicity, strict check
        return False, JsonResponse({
            'detail': 'You do not have permission to access this module.',
            'code': 'permission_denied',
            'required_permission': permission_code
        }, status=403)
    
    # Check specific action permission
    module_perms = user_modules[permission_code]
    action_key = f'can_{action}'
    
    if action_key not in module_perms or not module_perms[action_key]:
        return False, JsonResponse({
            'detail': f'You do not have permission to {action} this module.',
            'code': 'permission_denied',
            'required_permission': permission_code,
            'required_action': action
        }, status=403)
    
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
    """Get all modules from database."""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT id, code, name, description, parent_module_id, display_order
            FROM modules
            WHERE is_active = TRUE
            ORDER BY parent_module_id, display_order
        """)
        columns = ['id', 'code', 'name', 'description', 'parent_module_id', 'display_order']
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


def get_role_permissions(role_id):
    """Get all module permissions for a specific role."""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT m.code, rm.can_view, rm.can_create, rm.can_edit, rm.can_delete
            FROM role_modules rm
            JOIN modules m ON rm.module_id = m.id
            WHERE rm.role_id = %s AND m.is_active = TRUE
        """, [role_id])
        
        modules = {}
        for row in cursor.fetchall():
            modules[row[0]] = {
                'can_view': bool(row[1]),
                'can_create': bool(row[2]),
                'can_edit': bool(row[3]),
                'can_delete': bool(row[4])
            }
        return modules


def get_all_permission_ids():
    """Get all standard permission IDs (module IDs)."""
    from django.apps import apps
    Module = apps.get_model('core', 'Module')
    return list(Module.objects.filter(is_active=True).values_list('id', flat=True))


def get_permission_codes_from_ids(ids):
    """Convert list of permission IDs (module IDs) to codes."""
    if not ids:
        return []
    from django.apps import apps
    Module = apps.get_model('core', 'Module')
    # Filter valid IDs to avoid specific erros if ID doesn't exist? No, filter is safe.
    return list(Module.objects.filter(id__in=ids).values_list('code', flat=True))
