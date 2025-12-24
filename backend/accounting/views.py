from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.utils import TenantQuerysetMixin, IsTenantMember
from .models import (
    MasterLedgerGroup, MasterLedger, MasterVoucherConfig,
    Voucher, JournalEntry
)
from .serializers import (
    MasterLedgerGroupSerializer, MasterLedgerSerializer, MasterVoucherConfigSerializer,
    VoucherSerializer, JournalEntrySerializer
)

# ============================================================================
# MASTER VIEWSETS
# ============================================================================

class MasterLedgerGroupViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    queryset = MasterLedgerGroup.objects.all()
    serializer_class = MasterLedgerGroupSerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    required_permission = 'MASTERS_LEDGER_GROUPS'


class MasterLedgerViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    queryset = MasterLedger.objects.all()
    serializer_class = MasterLedgerSerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    required_permission = 'MASTERS_LEDGERS'


class MasterVoucherConfigViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    queryset = MasterVoucherConfig.objects.all()
    serializer_class = MasterVoucherConfigSerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    required_permission = 'MASTERS_VOUCHER_CONFIG'


# ============================================================================
# VOUCHER VIEWSETS - Unified
# ============================================================================

class VoucherViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    """Unified viewset for all voucher types"""
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    required_permission = 'ACCOUNTING_VOUCHERS'
    
    def get_queryset(self):
        """Filter by type if provided in query params"""
        queryset = super().get_queryset()
        voucher_type = self.request.query_params.get('type')
        if voucher_type:
            queryset = queryset.filter(type=voucher_type)
        return queryset
    
    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk_create(self, request):
        """Create multiple vouchers at once"""
        vouchers_data = request.data if isinstance(request.data, list) else [request.data]
        
        serializer = self.get_serializer(data=vouchers_data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({'success': True, 'count': len(vouchers_data)}, status=status.HTTP_201_CREATED)


class JournalEntryViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated, IsTenantMember]
    required_permission = 'ACCOUNTING_VOUCHERS'
