"""
Customer Portal Models
Import models from database.py for Django compatibility
"""
from .database import (
    CustomerMaster,
    CustomerMasterCategory,
    CustomerMastersSalesQuotation,
    CustomerMasterCustomer,
    CustomerMasterCustomerBasicDetails,
    CustomerMasterCustomerGSTDetails,
    CustomerMasterCustomerTDS,
    CustomerMasterCustomerBanking,
    CustomerTransaction,
    CustomerSalesQuotation,
    CustomerSalesOrder,
    CustomerMasterCustomerProductService,
    CustomerMasterCustomerTermsCondition,
    CustomerMasterLongTermContractBasicDetail,
    CustomerMasterLongTermContractProductService,
    CustomerMasterLongTermContractTermsCondition
)

__all__ = [
    'CustomerMaster',
    'CustomerMasterCategory',
    'CustomerMastersSalesQuotation',
    'CustomerMasterCustomer',
    'CustomerMasterCustomerBasicDetails',
    'CustomerMasterCustomerGSTDetails',
    'CustomerMasterCustomerTDS',
    'CustomerMasterCustomerBanking',
    'CustomerTransaction',
    'CustomerSalesQuotation',
    'CustomerSalesOrder',
    'CustomerMasterCustomerProductService',
    'CustomerMasterCustomerTermsCondition',
    'CustomerMasterLongTermContractBasicDetail',
    'CustomerMasterLongTermContractProductService',
    'CustomerMasterLongTermContractTermsCondition'
]
