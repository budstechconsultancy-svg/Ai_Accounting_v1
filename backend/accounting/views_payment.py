from rest_framework import viewsets, status
from rest_framework.response import Response
from .models_voucher_payment import VoucherPaymentSingle, VoucherPaymentBulk
from .serializers_payment import VoucherPaymentSingleSerializer, VoucherPaymentBulkSerializer

class VoucherPaymentSingleViewSet(viewsets.ModelViewSet):
    queryset = VoucherPaymentSingle.objects.all()
    serializer_class = VoucherPaymentSingleSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Filter by tenant_id if available on user
        if hasattr(user, 'tenant_id') and user.tenant_id:
            return self.queryset.filter(tenant_id=user.tenant_id)
        return self.queryset

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'tenant_id') and user.tenant_id:
            serializer.save(tenant_id=user.tenant_id)
        else:
            serializer.save()

class VoucherPaymentBulkViewSet(viewsets.ModelViewSet):
    queryset = VoucherPaymentBulk.objects.all()
    serializer_class = VoucherPaymentBulkSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'tenant_id') and user.tenant_id:
            return self.queryset.filter(tenant_id=user.tenant_id)
        return self.queryset
        
    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'tenant_id') and user.tenant_id:
            serializer.save(tenant_id=user.tenant_id)
        else:
            serializer.save()
