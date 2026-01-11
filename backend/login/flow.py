"""
Login Flow Layer - Business Logic
NO RBAC needed (authentication is public), NO tenant validation.
Business logic for login and token management.
"""

import logging
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from core.token import MyTokenObtainPairSerializer
logger = logging.getLogger('login.flow')

# ============================================================================
# LOGIN OPERATIONS
# ============================================================================

def authenticate_user(username, password):
    """
    Authenticate user with username and password.
    
    Args:
        username: Username
        password: Plain text password
    
    Returns:
        tuple: (user, token_data) if successful, (None, error_message) if failed
    """
    from django.contrib.auth import authenticate
    
    # Authenticate user
    user = authenticate(username=username, password=password)
    
    if user is None:
        # Fallback: Try TenantUser (Staff)
        try:
            from core.models import TenantUser
            candidate = TenantUser.objects.get(username=username)
            if candidate.check_password(password):
                if candidate.is_active:
                    user = candidate
                else:
                    return None, "Account is inactive"
        except TenantUser.DoesNotExist:
            pass
            
    if user is None:
        return None, "Invalid credentials"
    
    if not user.is_active:
        return None, "Account is inactive"
    
    # Generate tokens
    refresh = MyTokenObtainPairSerializer.get_token(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    # RBAC Removed - permissions are no longer used
    permissions = []
    permission_ids = []
    
    token_data = {
        'access': access_token,
        'refresh': refresh_token,
        'username': user.username,
        'email': getattr(user, 'email', ''),
        'tenant_id': user.tenant_id,
        'company_name': getattr(user, 'company_name', ''),
        'permissions': permissions,
        'submodule_ids': permission_ids,
        'role': 'Owner', # Defaulting to Owner/Admin for single-user mode
    }
    
    # Log login
    logger.info(
        f"🔐 LOGIN SUCCESS - {timezone.localtime().strftime('%Y-%m-%d %H:%M:%S')} | "
        f"Tenant: {user.tenant_id} ({token_data['company_name']}) | "
        f"User: {user.username} ({token_data['email']})"
    )
    
    return user, token_data


def refresh_access_token(refresh_token):
    """
    Refresh access token.
    
    Args:
        refresh_token: Refresh token string
    
    Returns:
        dict: New tokens or None if failed
    """
    from rest_framework_simplejwt.tokens import RefreshToken as JWT_RefreshToken
    
    try:
        refresh = JWT_RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        
        return {
            'access': access_token,
            'refresh': str(refresh)  # May be rotated
        }
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        return None
