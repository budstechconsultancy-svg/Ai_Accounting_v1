"""
Masters API Layer - HTTP Routing ONLY
NO business logic, NO RBAC, NO tenant validation.
Only HTTP handling - all logic delegated to flow.py
"""

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from accounting.models import (
    MasterLedgerGroup, MasterLedger, MasterVoucherConfig, MasterHierarchyRaw
)
from accounting.serializers import (
    MasterLedgerGroupSerializer, MasterLedgerSerializer,
    MasterVoucherConfigSerializer, MasterHierarchyRawSerializer
)
from . import flow


# ============================================================================
# LEDGER GROUP VIEWSET
# ============================================================================

class MasterLedgerGroupViewSet(viewsets.ModelViewSet):
    """
    API endpoints for ledger groups.
    All logic delegated to flow layer.
    """
    queryset = MasterLedgerGroup.objects.all()
    serializer_class = MasterLedgerGroupSerializer
    permission_classes = [AllowAny]  # TEMPORARY: Disabled for development
    # permission_classes = [IsAuthenticated]
    required_permission = 'MASTERS_LEDGER_GROUPS'
    
    def get_queryset(self):
        """Delegate to flow layer."""
        if not self.request.user.is_authenticated:
            return MasterLedgerGroup.objects.none()
        return flow.list_ledger_groups(self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Delegate to flow layer."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        ledger_group = flow.create_ledger_group(request.user, serializer.validated_data)
        
        response_serializer = self.get_serializer(ledger_group)
        headers = self.get_success_headers(response_serializer.data)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def update(self, request, *args, **kwargs):
        """Delegate to flow layer."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        ledger_group = flow.update_ledger_group(
            request.user,
            instance.id,
            serializer.validated_data
        )
        
        response_serializer = self.get_serializer(ledger_group)
        return Response(response_serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Delegate to flow layer."""
        instance = self.get_object()
        flow.delete_ledger_group(request.user, instance.id)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================================================
# LEDGER VIEWSET
# ============================================================================

class MasterLedgerViewSet(viewsets.ModelViewSet):
    """
    API endpoints for ledgers.
    All logic delegated to flow layer.
    """
    queryset = MasterLedger.objects.all()
    serializer_class = MasterLedgerSerializer
    permission_classes = [AllowAny]  # TEMPORARY: Disabled for development
    # permission_classes = [IsAuthenticated]
    required_permission = 'MASTERS_LEDGERS'
    
    def get_queryset(self):
        """Delegate to flow layer."""
        if not self.request.user.is_authenticated:
            return MasterLedger.objects.none()
        return flow.list_ledgers(self.request.user)
    
    def list(self, request, *args, **kwargs):
        """Override list to delegate to flow layer."""
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            import logging
            logger = logging.getLogger('masters.api')
            logger.error(f"❌ Error in list: {type(e).__name__}: {str(e)}", exc_info=True)
            raise
    
    def create(self, request, *args, **kwargs):
        """Delegate to flow layer."""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            ledger = flow.create_ledger(request.user, serializer.validated_data)
            
            response_serializer = self.get_serializer(ledger)
            headers = self.get_success_headers(response_serializer.data)
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            import logging
            logger = logging.getLogger('masters.api')
            logger.error(f"❌ Error creating ledger: {type(e).__name__}: {str(e)}", exc_info=True)
            raise
    
    def update(self, request, *args, **kwargs):
        """Delegate to flow layer."""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            
            ledger = flow.update_ledger(
                request.user,
                instance.id,
                serializer.validated_data
            )
            
            response_serializer = self.get_serializer(ledger)
            return Response(response_serializer.data)
        except Exception as e:
            import logging
            logger = logging.getLogger('masters.api')
            logger.error(f"❌ Error updating ledger: {type(e).__name__}: {str(e)}", exc_info=True)
            raise
    
    def destroy(self, request, *args, **kwargs):
        """Delegate to flow layer."""
        instance = self.get_object()
        flow.delete_ledger(request.user, instance.id)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================================================
# VOUCHER CONFIG VIEWSET
# ============================================================================

class MasterVoucherConfigViewSet(viewsets.ModelViewSet):
    """
    API endpoints for voucher configurations.
    All logic delegated to flow layer.
    """
    queryset = MasterVoucherConfig.objects.all()
    serializer_class = MasterVoucherConfigSerializer
    permission_classes = [IsAuthenticated]
    required_permission = 'MASTERS_VOUCHER_CONFIG'
    
    def get_queryset(self):
        """Delegate to flow layer."""
        return flow.list_voucher_configs(self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Delegate to flow layer."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        config = flow.create_voucher_config(request.user, serializer.validated_data)
        
        response_serializer = self.get_serializer(config)
        headers = self.get_success_headers(response_serializer.data)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def update(self, request, *args, **kwargs):
        """Delegate to flow layer."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        config = flow.update_voucher_config(
            request.user,
            instance.id,
            serializer.validated_data
        )
        
        response_serializer = self.get_serializer(config)
        return Response(response_serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Delegate to flow layer."""
        instance = self.get_object()
        flow.delete_voucher_config(request.user, instance.id)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================================================
# HIERARCHY VIEWSET (Global - No Authentication)
# ============================================================================

class MasterHierarchyRawViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Global hierarchy data - no authentication required, no tenant filtering.
    All logic delegated to flow layer.
    """
    queryset = MasterHierarchyRaw.objects.all()
    serializer_class = MasterHierarchyRawSerializer
    permission_classes = [AllowAny]  # Global data, accessible to all
    
    def get_queryset(self):
        """Delegate to flow layer."""
        return flow.list_hierarchy_data()
