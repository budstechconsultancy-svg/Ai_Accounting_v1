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
        users = User.objects.select_related('tenant').all()
        
        subscriptions = []
        for user in users:
            if user.tenant:
                subscriptions.append({
                    'id': user.id,
                    'username': user.username,
                    'companyName': user.tenant.name if user.tenant else 'N/A',
                    'registrationDate': user.date_joined.isoformat() if hasattr(user, 'date_joined') else None,
                    'subscriptionPlan': user.selected_plan or 'Basic',
                    'subscriptionStartDate': user.date_joined.isoformat() if hasattr(user, 'date_joined') else None,
                    'subscriptionEndDate': None,  # TODO: Calculate based on plan
                    'totalUploads': 1000,  # TODO: Get from plan limits
                    'uploadsUsed': 0,  # TODO: Calculate from actual usage
                    'isActive': user.is_active,
                    'tenantId': str(user.tenant.id) if user.tenant else 'N/A',
                    'lastLogin': 'Never',  # TODO: Track last login timestamp
                })
        
        # Return array directly (frontend expects Array, not {success, subscriptions})
        return Response(subscriptions)
