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
# REGISTRATION INITIATE VIEW
# ============================================================================

class RegisterInitiateView(APIView):
    """
    Registration initiation endpoint.
    All logic delegated to flow layer.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle registration initiation."""
        serializer = RegisterInitiateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        try:
            # Delegate to flow layer
            result = flow.initiate_registration(
                username=data['username'],
                email=data.get('email', ''),
                password=data['password'],
                company_name=data['company_name'],
                phone=data['phone'],
                selected_plan=data['selected_plan'],
                logo_file=data.get('logo')
            )
            
            return Response(result, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ============================================================================
# CREATE USER VIEW
# ============================================================================

class CreateUserView(APIView):
    """
    User creation endpoint (complete registration).
    All logic delegated to flow layer.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle user creation."""
        serializer = CreateUserSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        phone = serializer.validated_data['phone']
        
        try:
            # Delegate to flow layer
            result = flow.complete_registration(phone)
            return Response(result, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'An error occurred during account creation: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
