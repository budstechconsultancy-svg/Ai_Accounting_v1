"""
Vouchers API Layer - HTTP Routing ONLY
NO business logic, NO RBAC, NO tenant validation.
Only HTTP handling - all logic delegated to flow.py
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounting.models import Voucher, JournalEntry
from accounting.serializers import VoucherSerializer, JournalEntrySerializer
from . import flow


# ============================================================================
# VOUCHER VIEWSET
# ============================================================================

class VoucherViewSet(viewsets.ModelViewSet):
    """
    Unified API endpoints for all voucher types.
    All logic delegated to flow layer.
    """
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    permission_classes = [IsAuthenticated]
    required_permission = 'ACCOUNTING_VOUCHERS'
    
    def get_queryset(self):
        """Delegate to flow layer with optional type filtering."""
        voucher_type = self.request.query_params.get('type')
        return flow.list_vouchers(self.request.user, voucher_type=voucher_type)
    
    def create(self, request, *args, **kwargs):
        """Delegate to flow layer."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        voucher = flow.create_voucher(request.user, serializer.validated_data)
        
        response_serializer = self.get_serializer(voucher)
        headers = self.get_success_headers(response_serializer.data)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk_create(self, request):
        """Create multiple vouchers at once - delegate to flow layer."""
        vouchers_data = request.data if isinstance(request.data, list) else [request.data]
        
        serializer = self.get_serializer(data=vouchers_data, many=True)
        serializer.is_valid(raise_exception=True)
        
        flow.bulk_create_vouchers(request.user, serializer.validated_data)
        
        return Response({'success': True, 'count': len(vouchers_data)}, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Delegate to flow layer."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        voucher = flow.update_voucher(
            request.user,
            instance.id,
            serializer.validated_data
        )
        
        response_serializer = self.get_serializer(voucher)
        return Response(response_serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Delegate to flow layer."""
        instance = self.get_object()
        flow.delete_voucher(request.user, instance.id)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================================================================
# JOURNAL ENTRY VIEWSET
# ============================================================================

class JournalEntryViewSet(viewsets.ModelViewSet):
    """
    API endpoints for journal entries.
    All logic delegated to flow layer.
    """
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]
    required_permission = 'ACCOUNTING_VOUCHERS'
    
    def get_queryset(self):
        """Delegate to flow layer."""
        return flow.list_journal_entries(self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Delegate to flow layer."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        entry = flow.create_journal_entry(request.user, serializer.validated_data)
        
        response_serializer = self.get_serializer(entry)
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
        
        entry = flow.update_journal_entry(
            request.user,
            instance.id,
            serializer.validated_data
        )
        
        response_serializer = self.get_serializer(entry)
        return Response(response_serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Delegate to flow layer."""
        instance = self.get_object()
        flow.delete_journal_entry(request.user, instance.id)
        return Response(status=status.HTTP_204_NO_CONTENT)
