"""
Customer Portal API
Handles all API endpoints for customer portal functionality
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import (
    CustomerMaster,
    CustomerMasterCategory,
    CustomerMastersSalesQuotation,
    CustomerMasterCustomer,
    CustomerTransaction,
    CustomerSalesQuotation,
    CustomerSalesOrder,
    CustomerMasterLongTermContractBasicDetail
)
from .serializers import (
    CustomerMasterSerializer,
    CustomerMasterCategorySerializer,
    CustomerMastersSalesQuotationSerializer,
    CustomerMasterCustomerSerializer,
    CustomerTransactionSerializer,
    CustomerSalesQuotationSerializer,
    CustomerSalesOrderSerializer,
    CustomerMasterLongTermContractBasicDetailSerializer,
    CustomerMasterLongTermContractProductServiceSerializer,
    CustomerMasterLongTermContractTermsConditionSerializer
)


class CustomerMasterViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Customer Master operations
    Handles CRUD operations for customer records
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CustomerMasterSerializer
    
    def get_queryset(self):
        """Filter customers by tenant"""
        user = self.request.user
        tenant_id = getattr(user, 'tenant_id', None)
        if tenant_id:
            return CustomerMaster.objects.filter(tenant_id=tenant_id, is_deleted=False)
        return CustomerMaster.objects.none()
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Soft delete a customer"""
        customer = self.get_object()
        customer.is_deleted = True
        customer.save()
        return Response({'status': 'customer deactivated'})


class CustomerCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Customer Category operations
    Manages customer categorization with hierarchy (Category -> Group -> Subgroup)
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CustomerMasterCategorySerializer
    
    def get_queryset(self):
        """Filter categories by tenant"""
        user = self.request.user
        tenant_id = getattr(user, 'tenant_id', None)
        if tenant_id:
            return CustomerMasterCategory.objects.filter(tenant_id=tenant_id, is_active=True)
        return CustomerMasterCategory.objects.none()

    def perform_create(self, serializer):
        """Set tenant_id when creating category"""
        user = self.request.user
        tenant_id = getattr(user, 'tenant_id', None)
        if not tenant_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'User does not have a tenant_id.'})
        serializer.save(tenant_id=tenant_id)


class CustomerMastersSalesQuotationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Customer Masters Sales Quotation Series operations
    Manages sales quotation series configuration
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CustomerMastersSalesQuotationSerializer
    
    def get_queryset(self):
        """Filter sales quotation series by tenant"""
        user = self.request.user
        tenant_id = getattr(user, 'tenant_id', None)
        if tenant_id:
            return CustomerMastersSalesQuotation.objects.filter(tenant_id=tenant_id, is_deleted=False)
        return CustomerMastersSalesQuotation.objects.none()
    
    def perform_create(self, serializer):
        """Set tenant_id and created_by when creating"""
        user = self.request.user
        tenant_id = getattr(user, 'tenant_id', None)
        
        if not tenant_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'User does not have a tenant_id. Please contact administrator.'})
        
        serializer.save(
            tenant_id=tenant_id,
            created_by=user.username if hasattr(user, 'username') else None
        )
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Soft delete a sales quotation series"""
        series = self.get_object()
        series.is_deleted = True
        series.save()
        return Response({'status': 'sales quotation series deactivated'})
    
    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Preview the next quotation number without incrementing"""
        series = self.get_object()
        next_number = series.current_number + 1
        number_str = str(next_number).zfill(series.required_digits)
        preview_number = f"{series.prefix}{number_str}{series.suffix}"
        return Response({
            'preview': preview_number,
            'current_number': series.current_number,
            'next_number': next_number
        })


class CustomerMasterCustomerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Customer Master Customer operations
    Handles Create New Customer form submissions
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CustomerMasterCustomerSerializer
    
    def get_queryset(self):
        """Filter customers by tenant"""
        user = self.request.user
        tenant_id = getattr(user, 'tenant_id', None)
        if tenant_id:
            return CustomerMasterCustomer.objects.filter(tenant_id=tenant_id, is_deleted=False)
        return CustomerMasterCustomer.objects.none()
    
    def perform_create(self, serializer):
        """Set tenant_id and created_by when creating"""
        user = self.request.user
        tenant_id = getattr(user, 'tenant_id', None)
        
        if not tenant_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'User does not have a tenant_id. Please contact administrator.'})
        
        serializer.save(
            tenant_id=tenant_id,
            created_by=user.username if hasattr(user, 'username') else None
        )
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Soft delete a customer"""
        customer = self.get_object()
        customer.is_deleted = True
        customer.save()
        return Response({'status': 'customer deactivated'})


class CustomerTransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Customer Transaction operations
    Handles customer transaction records
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CustomerTransactionSerializer
    
    def get_queryset(self):
        """Filter transactions by tenant"""
        user = self.request.user
        tenant_id = getattr(user, 'tenant_id', None)
        if tenant_id:
            return CustomerTransaction.objects.filter(tenant_id=tenant_id)
        return CustomerTransaction.objects.none()
    
    @action(detail=False, methods=['get'])
    def by_customer(self, request):
        """Get all transactions for a specific customer"""
        customer_id = request.query_params.get('customer_id')
        if not customer_id:
            return Response(
                {'error': 'customer_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        transactions = self.get_queryset().filter(customer_id=customer_id)
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)


class CustomerSalesQuotationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Sales Quotation operations
    Manages customer sales quotations
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CustomerSalesQuotationSerializer
    
    def get_queryset(self):
        """Filter quotations by tenant"""
        user = self.request.user
        tenant_id = getattr(user, 'tenant_id', None)
        if tenant_id:
            return CustomerSalesQuotation.objects.filter(tenant_id=tenant_id)
        return CustomerSalesQuotation.objects.none()
    
    @action(detail=True, methods=['post'])
    def convert_to_order(self, request, pk=None):
        """Convert quotation to sales order"""
        quotation = self.get_object()
        
        with transaction.atomic():
            # Create sales order from quotation
            order = CustomerSalesOrder.objects.create(
                tenant_id=quotation.tenant_id,
                customer_id=quotation.customer_id,
                quotation_reference=quotation.quotation_number,
                # Copy other relevant fields
            )
            
            quotation.status = 'converted'
            quotation.save()
        
        return Response({
            'status': 'quotation converted to order',
            'order_id': order.id
        })


class CustomerSalesOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Sales Order operations
    Manages customer sales orders
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CustomerSalesOrderSerializer
    
    def get_queryset(self):
        """Filter orders by tenant"""
        user = self.request.user
        tenant_id = getattr(user, 'tenant_id', None)
        if tenant_id:
            return CustomerSalesOrder.objects.filter(tenant_id=tenant_id)
        return CustomerSalesOrder.objects.none()


# TODO: Uncomment when CustomerMasterLongTermContract model is created
# class CustomerMasterLongTermContractViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet for Customer Master Long-term Contracts
#     Manages long-term contracts including rate contracts, service contracts, and AMC
#     """
#     permission_classes = [IsAuthenticated]
#     serializer_class = CustomerMasterLongTermContractSerializer
#     
#     def get_queryset(self):
#         """Filter contracts by tenant"""
#         user = self.request.user
#         tenant_id = getattr(user, 'tenant_id', None)
#         if tenant_id:
#             return CustomerMasterLongTermContract.objects.filter(tenant_id=tenant_id, is_deleted=False)
#         return CustomerMasterLongTermContract.objects.none()
#     
#     def perform_create(self, serializer):
#         """Set tenant_id and created_by when creating"""
#         user = self.request.user
#         tenant_id = getattr(user, 'tenant_id', None)
#         
#         if not tenant_id:
#             from rest_framework.exceptions import ValidationError
#             raise ValidationError({'error': 'User does not have a tenant_id. Please contact administrator.'})
#         
#         serializer.save(
#             tenant_id=tenant_id,
#             created_by=user.username if hasattr(user, 'username') else None
#         )
#     
#     @action(detail=True, methods=['post'])
#     def deactivate(self, request, pk=None):
#         """Soft delete a contract"""
#         contract = self.get_object()
#         contract.is_deleted = True
#         contract.save()
#         return Response({'status': 'contract deactivated'})



class CustomerMasterLongTermContractViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Customer Master Long-term Contracts
    Manages long-term contracts including rate contracts, service contracts, and AMC
    Handles saving to three separate tables: BasicDetail, ProductServices, and TermsCondition
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CustomerMasterLongTermContractBasicDetailSerializer
    
    def get_queryset(self):
        """Filter contracts by tenant"""
        user = self.request.user
        tenant_id = getattr(user, 'tenant_id', None)
        if tenant_id:
            return CustomerMasterLongTermContractBasicDetail.objects.filter(tenant_id=tenant_id, is_deleted=False)
        return CustomerMasterLongTermContractBasicDetail.objects.none()
    
    def perform_create(self, serializer):
        """
        Set tenant_id and created_by when creating
        Save data to all three tables: BasicDetail, ProductServices, and TermsCondition
        """
        user = self.request.user
        tenant_id = getattr(user, 'tenant_id', None)
        
        if not tenant_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': 'User does not have a tenant_id. Please contact administrator.'})
        
        # Save basic details
        basic_detail = serializer.save(
            tenant_id=tenant_id,
            created_by=user.username if hasattr(user, 'username') else None
        )
        
        # Save products/services if provided
        products_data = self.request.data.get('products_services', [])
        if products_data:
            from .models import CustomerMasterLongTermContractProductService
            for product in products_data:
                CustomerMasterLongTermContractProductService.objects.create(
                    tenant_id=tenant_id,
                    contract_basic_detail=basic_detail,
                    item_code=product.get('item_code'),
                    item_name=product.get('item_name'),
                    customer_item_name=product.get('customer_item_name'),
                    qty_min=product.get('qty_min'),
                    qty_max=product.get('qty_max'),
                    price_min=product.get('price_min'),
                    price_max=product.get('price_max'),
                    acceptable_price_deviation=product.get('acceptable_price_deviation'),
                    created_by=user.username if hasattr(user, 'username') else None
                )
        
        # Save terms & conditions if provided
        terms_data = self.request.data.get('terms_conditions', {})
        if terms_data:
            from .models import CustomerMasterLongTermContractTermsCondition
            CustomerMasterLongTermContractTermsCondition.objects.create(
                tenant_id=tenant_id,
                contract_basic_detail=basic_detail,
                payment_terms=terms_data.get('payment_terms'),
                penalty_terms=terms_data.get('penalty_terms'),
                force_majeure=terms_data.get('force_majeure'),
                termination_clause=terms_data.get('termination_clause'),
                dispute_terms=terms_data.get('dispute_terms'),
                others=terms_data.get('others'),
                created_by=user.username if hasattr(user, 'username') else None
            )
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Soft delete a contract"""
        contract = self.get_object()
        contract.is_deleted = True
        contract.save()
        return Response({'status': 'contract deactivated'})
