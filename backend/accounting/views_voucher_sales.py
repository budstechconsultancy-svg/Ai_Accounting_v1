from rest_framework import viewsets, status
from rest_framework.response import Response
from .models_voucher_sales import VoucherSalesInvoiceDetails
from .serializers_voucher_sales import VoucherSalesInvoiceDetailsSerializer
from core.utils import TenantQuerysetMixin

class VoucherSalesViewSet(TenantQuerysetMixin, viewsets.ModelViewSet):
    queryset = VoucherSalesInvoiceDetails.objects.all().order_by('-date', '-created_at')
    serializer_class = VoucherSalesInvoiceDetailsSerializer

    def create(self, request, *args, **kwargs):
        # Override create to handle file uploads properly if mixed with JSON
        # If payload is multipart/form-data, DRF handles it but nested JSON fields might be sent as strings
        # Ideally frontend sends JSON for complex data or handles mapping
        return super().create(request, *args, **kwargs)
