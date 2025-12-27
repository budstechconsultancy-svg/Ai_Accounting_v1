from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

# REMOVED: Permission models import - no longer using database tables for permissions
# from .permission_models import PermissionModule, PermissionSubmodule, RoleSubmodulePermission

class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        return self.create_user(username, password, **extra_fields)

class Tenant(models.Model):
    id = models.CharField(max_length=36, primary_key=True)
    name = models.CharField(max_length=200, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'tenants'

    def __str__(self):
        return self.name

# REMOVED: Role model - no longer using roles table
# class Role(models.Model):
#     name = models.CharField(max_length=100)
#     description = models.TextField(blank=True, null=True)
#     tenant_id = models.CharField(max_length=36, db_index=True)
#     is_system = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     class Meta:
#         db_table = 'roles'
#     def __str__(self):
#         return f"{self.name} ({self.tenant_id})"

class User(AbstractBaseUser):
    # Map to 'users' table strictly
    id = models.AutoField(primary_key=True) # Matches INT in DB
    username = models.CharField(max_length=100, unique=True)
    company_name = models.CharField(max_length=255, unique=True) # Schema NOT NULL
    email = models.CharField(max_length=255, blank=True, null=True, unique=True)
    # password provided by AbstractBaseUser
    selected_plan = models.CharField(max_length=50) # Schema NOT NULL
    logo_path = models.CharField(max_length=500, blank=True, null=True)
    tenant_id = models.CharField(max_length=36)  # Schema NOT NULL
    
    # OTP verification fields
    phone = models.CharField(max_length=15, blank=True, null=True)
    phone_verified = models.BooleanField(default=False)
    
    is_active = models.BooleanField(default=True) # Maps to TINYINT(1)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    # last_login provided by AbstractBaseUser
    
    login_status = models.CharField(max_length=20, default='Offline')
    last_activity = models.DateTimeField(null=True, blank=True)

    # REMOVED: roles field - Owner gets all permissions automatically
    # roles = models.ManyToManyField(Role, related_name='users', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['company_name']

    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return self.username

class TenantUser(AbstractBaseUser):
    """
    Represents usage/staff users created by the Owner.
    Stored strictly in 'tenant_users' table.
    """
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100, unique=True) # Global uniqueness for simpler login
    email = models.CharField(max_length=255, blank=True, null=True)
    tenant_id = models.CharField(max_length=36, db_index=True)
    
    is_active = models.BooleanField(default=True)
    
    # NEW: Store selected submodule IDs as JSON array
    # Example: [1, 5, 8] means user has access to permissions 1, 5, and 8
    selected_submodule_ids = models.JSONField(default=list, blank=True)
    
    # REMOVED: role field - no longer using roles table
    # role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='tenant_users')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'

    class Meta:
        db_table = 'tenant_users'

    def __str__(self):
        return f"{self.username} (Tenant User)"

# Abstract for common fields if useful, or just map directly.
class BaseModel(models.Model):
    # Schema tables usually have tenant_id.
    # We will use this mixin for convenience but specify db_table in children.
    tenant_id = models.CharField(max_length=36, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# 3. Company Details (Removed)
# 4. Company Information (Removed)

# 5. Company Informations (Comprehensive)
class CompanyFullInfo(BaseModel):
    # This is likely what CompanySettingsViewSet interacts with.
    company_name = models.CharField(max_length=255)
    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    country = models.CharField(max_length=100, default='India')
    phone = models.CharField(max_length=15, blank=True, null=True)
    mobile = models.CharField(max_length=15, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    website = models.CharField(max_length=255, blank=True, null=True)
    gstin = models.CharField(max_length=15, blank=True, null=True)
    pan = models.CharField(max_length=10, blank=True, null=True)
    cin = models.CharField(max_length=21, blank=True, null=True)
    tan = models.CharField(max_length=10, blank=True, null=True)
    business_type = models.CharField(max_length=50, blank=True, null=True)
    industry_type = models.CharField(max_length=100, blank=True, null=True)
    financial_year_start = models.DateField(null=True, blank=True)
    financial_year_end = models.DateField(null=True, blank=True)
    logo_path = models.CharField(max_length=500, blank=True, null=True)
    signature_path = models.CharField(max_length=500, blank=True, null=True)
    bank_name = models.CharField(max_length=255, blank=True, null=True)
    bank_account_no = models.CharField(max_length=20, blank=True, null=True)
    bank_ifsc = models.CharField(max_length=11, blank=True, null=True)
    bank_branch = models.CharField(max_length=255, blank=True, null=True)
    voucher_numbering = models.JSONField(null=True, blank=True)
    
    class Meta:
        db_table = 'company_informations'


# Pending Registration Model
class PendingRegistration(models.Model):
    """
    Temporary storage for registration data while waiting for OTP verification
    """
    phone = models.CharField(max_length=15, unique=True, db_index=True)
    username = models.CharField(max_length=100)
    email = models.CharField(max_length=255, blank=True, null=True)
    password_hash = models.CharField(max_length=255)  # Already hashed
    company_name = models.CharField(max_length=255)
    selected_plan = models.CharField(max_length=50)
    logo_path = models.CharField(max_length=500, blank=True, null=True)
    expires_at = models.DateTimeField()  # Auto-delete after 30 minutes
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'pending_registrations'
        indexes = [
            models.Index(fields=['phone']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"Pending: {self.username} ({self.phone})"


# OTP Verification Model (Simplified)

class OTP(models.Model):
    """Store OTP securely with expiry and usage tracking"""
    phone = models.CharField(max_length=15, db_index=True)
    otp_hash = models.CharField(max_length=255)  # Bcrypt hash of OTP
    expires_at = models.DateTimeField()  # Set to 5 minutes from creation
    is_used = models.BooleanField(default=False)
    attempt_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'otps'
        indexes = [
            models.Index(fields=['phone', 'is_used']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"OTP for {self.phone} - {'Used' if self.is_used else 'Active'}"
