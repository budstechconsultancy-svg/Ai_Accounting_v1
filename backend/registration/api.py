"""
Registration API Layer - HTTP Routing ONLY
NO business logic, NO RBAC, NO tenant validation.
Only HTTP handling - all logic delegated to flow.py
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from core.serializers import RegisterInitiateSerializer, CreateUserSerializer
from . import flow


# ============================================================================
# DIRECT REGISTRATION VIEW (NO OTP)
# ============================================================================

class DirectRegisterView(APIView):
    """
    Direct registration endpoint - creates user immediately without OTP.
    All logic delegated to flow layer.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle direct registration."""
        # Get data from request
        data = request.data
        
        # Basic validation
        required_fields = ['username', 'password', 'company_name', 'selected_plan']
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {'error': f'{field} is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            # Delegate to flow layer
            result = flow.direct_registration(
                username=data['username'],
                email=data.get('email', ''),
                password=data['password'],
                company_name=data['company_name'],
                phone=data.get('phone', ''),
                selected_plan=data['selected_plan'],
                logo_file=request.FILES.get('logo')
            )
            
            return Response(result, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'An error occurred during registration: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
