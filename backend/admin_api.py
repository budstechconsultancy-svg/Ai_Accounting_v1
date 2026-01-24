"""
Admin API for managing subscriptions across all tenants
"""
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from core.models import Tenant

User = get_user_model()


class SubscriptionsListView(views.APIView):
    """List all tenant subscriptions"""
    permission_classes = [AllowAny]  # TODO: Add proper admin authentication
    
    def get(self, request):
        # Get all users (not just superusers)
        users = User.objects.all()
        
        # Manually fetch tenants since tenant_id is a CharField, not a ForeignKey
        tenants = {t.id: t for t in Tenant.objects.all()}
        
        subscriptions = []
        for user in users:
            # Find the tenant for this user
            tenant_id = getattr(user, 'tenant_id', None)
            tenant = tenants.get(tenant_id) if tenant_id else None
            
            if tenant:
                subscriptions.append({
                    'id': user.id,
                    'username': user.username,
                    'companyName': tenant.name if tenant else 'N/A',
                    'registrationDate': user.created_at.isoformat() if hasattr(user, 'created_at') else None,
                    'subscriptionPlan': user.selected_plan or 'Basic',
                    'subscriptionStartDate': user.created_at.isoformat() if hasattr(user, 'created_at') else None,
                    'subscriptionEndDate': None,  # TODO: Calculate based on plan
                    'totalUploads': 1000,  # TODO: Get from plan limits
                    'uploadsUsed': 0,  # TODO: Calculate from actual usage
                    'isActive': user.is_active,
                    'tenantId': str(tenant.id) if tenant else 'N/A',
                    'lastLogin': user.last_login.isoformat() if user.last_login else 'Never',
                })
        
        # Return array directly (frontend expects Array, not {success, subscriptions})
        return Response(subscriptions)
