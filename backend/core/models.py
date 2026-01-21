from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

# REMOVED: Permission models import - no longer using database tables for permissions
# from .permission_models import PermissionModule, PermissionSubmodule, RoleSubmodulePermission

class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        
        # Registered users (owners) are superusers by default
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)
        
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

# ============================================================================
# NEW: Roles and Modules System
# ============================================================================

class Module(models.Model):
    """
    Represents a module/permission in the system.
    Hierarchical structure with parent-child relationships.
    """
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    parent_module_id = models.IntegerField(blank=True, null=True)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'modules'
        ordering = ['parent_module_id', 'display_order']
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class Role(models.Model):
    """
    Represents a role within a tenant.
    Each tenant can have multiple roles.
    """
    id = models.AutoField(primary_key=True)
    tenant_id = models.CharField(max_length=36, db_index=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'roles'
        constraints = [
            models.UniqueConstraint(
                fields=['tenant_id', 'name'],
                name='unique_role_per_tenant'
            )
        ]
    
    def __str__(self):
        return f"{self.name} (Tenant: {self.tenant_id})"


class RoleModule(models.Model):
    """
    Maps roles to modules with specific permissions.
    Defines what each role can do with each module.
    """
    id = models.AutoField(primary_key=True)
    role_id = models.IntegerField()
    module_id = models.IntegerField()
    can_view = models.BooleanField(default=True)
    can_create = models.BooleanField(default=False)
    can_edit = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'role_modules'
        constraints = [
            models.UniqueConstraint(
                fields=['role_id', 'module_id'],
                name='unique_role_module'
            )
        ]
        indexes = [
            models.Index(fields=['role_id'], name='idx_role_id'),
            models.Index(fields=['module_id'], name='idx_module_id'),
        ]
    
    def __str__(self):
        return f"Role {self.role_id} - Module {self.module_id}"

class User(AbstractBaseUser):
    # Map to 'users' table strictly
    id = models.BigAutoField(primary_key=True) # Matches BIGINT in DB
    username = models.CharField(max_length=100, unique=True)
    company_name = models.CharField(max_length=255, unique=True, null=True, blank=True) # Schema NOT NULL -> Nullable for migration
    email = models.CharField(max_length=255, blank=True, null=True, unique=True)
    # password provided by AbstractBaseUser
    selected_plan = models.CharField(max_length=50, null=True, blank=True) # Schema NOT NULL -> Nullable
    logo_path = models.CharField(max_length=500, blank=True, null=True)
    tenant_id = models.CharField(max_length=36, null=True, blank=True)  # Schema NOT NULL -> Nullable
    
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
    
    # NEW: Role assignment (replaces selected_submodule_ids)
    role_id = models.IntegerField(blank=True, null=True, db_index=True)
    
    # DEPRECATED: Keep for backward compatibility during migration
    # Will be removed after all users are migrated to roles
    selected_submodule_ids = models.JSONField(default=list, blank=True)
    
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
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

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





# ============================================================================
# NEW: User Activity Log
# ============================================================================
class UserActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    username = models.CharField(max_length=150, blank=True, null=True) # redundantly store in case user is deleted
    action = models.CharField(max_length=255) # e.g. "Create Voucher", "Login", "GET /api/vouchers/"
    method = models.CharField(max_length=10, blank=True, null=True) # GET, POST, etc
    path = models.CharField(max_length=255, blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.TextField(blank=True, null=True) # JSON string of additional info or request body
    timestamp = models.DateTimeField(auto_now_add=True)
    tenant_id = models.CharField(max_length=36, blank=True, null=True)

    class Meta:
        db_table = 'user_activity_logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.username} - {self.action} - {self.timestamp}"
