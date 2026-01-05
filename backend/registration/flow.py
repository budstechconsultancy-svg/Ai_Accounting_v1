"""
Registration Flow Layer - Business Logic
NO RBAC needed (registration is public), NO tenant validation (creating tenants).
Business logic for user registration.
"""

import logging
import uuid
from django.contrib.auth.hashers import make_password
from django.core.files.storage import default_storage
from django.utils import timezone
from django.db import transaction
from core.token import MyTokenObtainPairSerializer
from core.rbac import get_all_permission_ids, get_permission_codes_from_ids
from . import database as db

logger = logging.getLogger('registration.flow')


# ============================================================================
# REGISTRATION OPERATIONS
# ============================================================================

def initiate_registration(username, email, password, company_name, phone, selected_plan, logo_file=None):
    """
    Initiate registration process.
    
    Args:
        username: Username
        email: Email
        password: Plain text password
        company_name: Company name
        phone: Phone number
        selected_plan: Selected plan
        logo_file: Logo file (optional)
    
    Returns:
        dict: Success response with phone
    """
    # Validate uniqueness
    if db.check_username_exists(username):
        raise ValueError("Username already exists")
    
    if db.check_phone_exists(phone):
        raise ValueError("Phone number already registered")
    
    # Handle logo upload
    logo_path = None
    if logo_file:
        temp_filename = f"temp_logos/{uuid.uuid4()}_{logo_file.name}"
        logo_path = default_storage.save(temp_filename, logo_file)
    
    # Hash password
    password_hash = make_password(password)
    
    # Store pending registration
    pending = db.create_or_update_pending_registration(
        phone=phone,
        username=username,
        email=email,
        password_hash=password_hash,
        company_name=company_name,
        selected_plan=selected_plan,
        logo_path=logo_path
    )
    
    # Mask phone for logging
    if len(phone) > 4:
        masked_phone = phone[:2] + '*' * (len(phone) - 4) + phone[-2:]
    else:
        masked_phone = '*' * len(phone)
    
    logger.info(f"📝 Registration initiated for {username} - Phone: {masked_phone}")
    
    return {
        'success': True,
        'message': f'Registration data saved for {masked_phone}',
        'phone': phone
    }


def complete_registration(phone):
    """
    Complete registration and create user account.
    
    Args:
        phone: Phone number
    
    Returns:
        dict: User data with JWT tokens
    """
    # Get pending registration
    pending = db.get_pending_registration(phone)
    if not pending:
        raise ValueError("Registration session expired. Please start registration again.")
    
    with transaction.atomic():
        # Create tenant
        tenant = db.create_tenant(pending.company_name)
        
        # Move logo to permanent location
        final_logo_path = None
        if pending.logo_path:
            import os
            temp_path = pending.logo_path
            final_filename = f"logos/{tenant.id}_{os.path.basename(temp_path)}"
            
            if default_storage.exists(temp_path):
                try:
                    with default_storage.open(temp_path, 'rb') as temp_file:
                        final_logo_path = default_storage.save(final_filename, temp_file)
                    default_storage.delete(temp_path)
                except Exception as e:
                    logger.error(f"Error moving logo file: {e}")
        
        # Create user
        user = db.create_user(
            username=pending.username,
            email=pending.email,
            password_hash=pending.password_hash,
            company_name=pending.company_name,
            phone=pending.phone,
            selected_plan=pending.selected_plan,
            tenant_id=tenant.id,
            logo_path=final_logo_path
        )
        
        # Seed default ledger groups
        try:
            db.seed_default_ledger_groups(tenant.id)
        except Exception as e:
            logger.warning(f"Error seeding default groups: {e}")
        
        # Delete pending registration
        db.delete_pending_registration(phone)
        
        # Log successful registration
        logger.info(
            f"✅ [{timezone.now()}] New user registered - "
            f"Tenant: {tenant.id} ({pending.company_name}) - "
            f"User: {user.username}"
        )
        print(f"\n{'='*80}")
        print(f"✅ NEW REGISTRATION - {timezone.now()}")
        print(f"Tenant ID: {tenant.id}")
        print(f"Company: {pending.company_name}")
        print(f"User: {user.username}")
        print(f"Phone: {user.phone} (verified)")
        print(f"{'='*80}\n")
        
        # Auto-login: Generate JWT tokens
        refresh = MyTokenObtainPairSerializer.get_token(user)
        access_token = str(refresh.access_token)
        
        # Get permissions (Owner gets all 33)
        all_ids = get_all_permission_ids()
        permissions = get_permission_codes_from_ids(all_ids)
        
        logger.info(f"✅ Auto-login: Generated JWT token with {len(permissions)} permissions")
        
        return {
            'success': True,
            'message': 'Registration successful! You are now logged in.',
            'access': access_token,
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'company_name': user.company_name,
                'phone': user.phone,
                'tenant_id': user.tenant_id,
                'selected_plan': user.selected_plan,
            },
            'permissions': permissions
        }
