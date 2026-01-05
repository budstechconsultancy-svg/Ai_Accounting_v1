"""
Login Database Layer - Pure Data Access
NO business logic, NO RBAC, NO tenant validation.
Only database queries.
"""

import logging
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger('login.database')


# ============================================================================
# USER QUERIES
# ============================================================================

def get_user_by_username(username):
    """Get user by username."""
    try:
        return User.objects.get(username=username)
    except User.DoesNotExist:
        return None
