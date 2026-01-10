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
# DIRECT REGISTRATION (NO OTP)
# ============================================================================

def direct_registration(username, email, password, company_name, phone, selected_plan, logo_file=None):
    """
    Direct registration - create user immediately without OTP.
    
    Args:
        username: Username
        email: Email
        password: Plain text password
        company_name: Company name
        phone: Phone number
        selected_plan: Selected plan
        logo_file: Logo file (optional)
    
    Returns:
        dict: User data with JWT tokens
    """
    # Validate uniqueness
    if db.check_username_exists(username):
        raise ValueError("Username already exists")
    
    if phone and db.check_phone_exists(phone):
        raise ValueError("Phone number already registered")
    
    # Hash password
    password_hash = make_password(password)
    
    try:
        # Create tenant (autocommit)
        tenant = db.create_tenant(company_name)
        logger.info(f"✅ Tenant created: {tenant.id}")
        
        # Handle logo upload
        final_logo_path = None
        if logo_file:
            final_filename = f"logos/{tenant.id}_{logo_file.name}"
            final_logo_path = default_storage.save(final_filename, logo_file)
        
        # Create user (autocommit)
        user = db.create_user(
            username=username,
            email=email,
            password_hash=password_hash,
            company_name=company_name,
            phone=phone,
            selected_plan=selected_plan,
            tenant_id=tenant.id,
            logo_path=final_logo_path
        )
        logger.info(f"✅ User created with ID: {user.id}")
        
        # Verify user was saved
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user_exists = User.objects.filter(id=user.id).exists()
        logger.info(f"✅ User {user.id} exists in database: {user_exists}")
        
        if not user_exists:
            logger.error(f"❌ CRITICAL: User {user.id} was created but not found in database!")
            raise Exception(f"User {user.id} was not saved to database")
        
        # Seed default ledger groups
        try:
            db.seed_default_ledger_groups(tenant.id)
            logger.info(f"✅ Default groups seeded")
        except Exception as e:
            logger.warning(f"⚠️ Error seeding default groups: {e}")
        
        # Log successful registration
        logger.info(
            f"✅ [{timezone.now()}] New user registered - "
            f"Tenant: {tenant.id} ({company_name}) - "
            f"User: {user.username}"
        )
        print(f"\n{'='*80}")
        print(f"✅ NEW REGISTRATION - {timezone.now()}")
        print(f"Tenant ID: {tenant.id}")
        print(f"Company: {company_name}")
        print(f"User: {user.username}")
        print(f"Phone: {user.phone}")
        print(f"{'='*80}\n")
        
        # Auto-login: Generate JWT tokens
        refresh = MyTokenObtainPairSerializer.get_token(user)
        access_token = str(refresh.access_token)
        
        # Get permissions (Owner gets all)
        all_ids = get_all_permission_ids()
        permissions = get_permission_codes_from_ids(all_ids)
        
        logger.info(f"✅ Auto-login: Generated JWT token with {len(permissions)} permissions")
        
        # Build response data
        response_data = {
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
        
        logger.info(f"✅ Registration complete - User {user.id} successfully saved")
        return response_data
        
    except Exception as e:
        logger.error(f"❌ Error during registration: {e}")
        import traceback
        traceback.print_exc()
        raise
