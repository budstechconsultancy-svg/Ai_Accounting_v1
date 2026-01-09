from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.conf import settings
from .models import TenantUser

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(required=True)
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['email'] = getattr(user, 'email', '')
        token['company_name'] = getattr(user, 'company_name', '') or ''
        token['tenant_id'] = getattr(user, 'tenant_id', '')
        token['selected_plan'] = getattr(user, 'selected_plan', 'Free')

        # RBAC REMOVED: All users have full permissions
        # Check if user is superuser (all registered users are superusers)
        is_superuser = getattr(user, 'is_superuser', False)
        token['permissions'] = [] if not is_superuser else ['ALL']
        token['is_superuser'] = is_superuser

        if isinstance(user, TenantUser):
            token['user_type'] = 'tenant_user'
            token['is_owner'] = False
            token['submodule_ids'] = []
        else:
            token['user_type'] = 'owner'
            token['is_owner'] = True
            token['submodule_ids'] = []
        
        return token

    def validate(self, attrs):
        """Custom auth logic to support two tables (User and TenantUser)"""
        from django.contrib.auth import authenticate
        from rest_framework.exceptions import AuthenticationFailed

        username = attrs.get(self.username_field)
        password = attrs.get('password')
        email = attrs.get('email')

        # 1. Try standard auth (Owner) - only use username and password
        user = authenticate(username=username, password=password)
        
        # Check if Owner user is active
        if user is not None and not user.is_active:
            raise AuthenticationFailed('Your account has been deactivated. Please contact the administrator.')

        if user is None and username and password:
            try:
                candidate = TenantUser.objects.get(username=username)
                if candidate.check_password(password):
                    if candidate.is_active:
                        user = candidate
                    else:
                        raise AuthenticationFailed('Your account has been deactivated. Please contact the administrator.')
            except TenantUser.DoesNotExist:
                pass
        
        if user is None:
            raise AuthenticationFailed('No active account found with the given credentials')
        
        if email:
            user_email = getattr(user, 'email', '')
            if user_email != email:
                raise AuthenticationFailed('No active account found with the given credentials')

        self.user = user
        
        refresh = self.get_token(self.user)
        data = {}
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        # Add extra user info to the response
        user = self.user
        data['username'] = user.username
        data['email'] = getattr(user, 'email', '')
        data['tenant_id'] = getattr(user, 'tenant_id', '')
        data['company_name'] = getattr(user, 'company_name', '')
        
        # Include permissions and role in response
        token_data = self.get_token(user)
        data['permissions'] = token_data['permissions']
        data['submodule_ids'] = token_data['submodule_ids']
        data['role'] = 'OWNER' if token_data['is_owner'] else 'USER'
        
        return data
