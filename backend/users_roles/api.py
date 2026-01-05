"""
Users & Roles API Layer - HTTP Routing ONLY
NO business logic, NO RBAC, NO tenant validation.
Only HTTP handling - all logic delegated to flow.py
"""

from rest_framework import views, viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from . import flow
from core.rbac import get_all_modules


# ============================================================================
# USER MANAGEMENT
# ============================================================================

class SettingsUsersView(views.APIView):
    """
    API endpoints for tenant user management.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id=None):
        """List all tenant users or get specific user details."""
        try:
            if user_id:
                # TODO: Implement get single user detail if needed by frontend
                # For now, just listing all is what was working before
                # But to avoid error, we accept the arg.
                # If valid user_id passed, maybe filter logic or flow.get_user?
                pass 
                
            users = flow.list_tenant_users(request.user)
            if user_id:
                # Simple filter if fetching specific user from the list
                users = [u for u in users if str(u['id']) == str(user_id)]
                if not users:
                     return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
                return Response(users[0])
                
            return Response({'users': users})
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create a new tenant user with role/permissions."""
        try:
            data = request.data.copy()
            if 'name' in data:
                data['username'] = data['name']
                
            flow.create_tenant_user(request.user, data)
            return Response({'success': True})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, user_id=None):
        """Update tenant user details/role."""
        try:
            data = request.data.copy()
            # ID priority: URL param > Body param
            target_id = user_id or data.get('id') or data.get('userId')
            
            if not target_id:
                return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            if 'name' in data:
                data['username'] = data['name']
            
            flow.update_tenant_user(request.user, target_id, data)
            return Response({'success': True})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
    def delete(self, request, user_id=None):
        """Delete a tenant user."""
        try:
            # ID priority: URL param > Body param
            target_id = user_id or request.data.get('id')
            
            if not target_id:
                return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)
            
            flow.delete_tenant_user(request.user, target_id)
            return Response({'success': True})
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# ROLE MANAGEMENT
# ============================================================================

class RolesViewSet(viewsets.ViewSet):
    """
    API endpoints for Role management.
    Handles listing, creating, updating, and deleting roles.
    """
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """List all roles."""
        try:
            roles = flow.list_roles(request.user)
            # Serialize
            data = [{
                'id': r.id, 
                'name': r.name, 
                'description': r.description,
                'is_system': r.is_system
            } for r in roles]
            return Response(data)
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
            
    def retrieve(self, request, pk=None):
        """Get role details with permissions."""
        try:
            role, permissions = flow.get_role_details(request.user, pk)
            return Response({
                'id': role.id,
                'name': role.name,
                'description': role.description,
                'is_system': role.is_system,
                'permissions': permissions
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
            
    def create(self, request):
        """Create a new role."""
        try:
            role = flow.create_role(request.user, request.data)
            return Response({'id': role.id, 'success': True})
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
    def update(self, request, pk=None):
        """Update a role."""
        try:
            flow.update_role(request.user, pk, request.data)
            return Response({'success': True})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
    def destroy(self, request, pk=None):
        """Delete a role."""
        try:
            flow.delete_role(request.user, pk)
            return Response({'success': True})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)


# ============================================================================
# MODULES / SCHEMA
# ============================================================================

class ModulesView(views.APIView):
    """
    API endpoint to list all available modules.
    Used for building the permission tree in UI.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all modules hierarchy."""
        modules = get_all_modules()
        return Response(modules)
