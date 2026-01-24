from django.db import models
from core.models import BaseModel
from .models import MasterLedger

class VoucherSalesInvoiceDetails(BaseModel):
    """
    Sales Voucher - Invoice Details
    Header table for the sales voucher transaction.
    """
    # Date
    date = models.DateField(help_text="Voucher Date")
    
    # Invoice No (User entered or auto-generated)
    sales_invoice_no = models.CharField(max_length=50, help_text="Sales Invoice Number")
    
    # Customer
    customer_name = models.CharField(max_length=255, help_text="Customer Name as entered/selected")
    # Optional: Link to MasterLedger if meaningful, but frontend sends name string mostly
    # customer = models.ForeignKey(MasterLedger, on_delete=models.SET_NULL, null=True, blank=True)

    # Addresses
    bill_to = models.TextField(null=True, blank=True, help_text="Billing Address")
    ship_to = models.TextField(null=True, blank=True, help_text="Shipping Address")
    
    # Contact Info
    gstin = models.CharField(max_length=15, null=True, blank=True)
    contact = models.CharField(max_length=100, null=True, blank=True)
    
    # State/Tax Info
    tax_type = models.CharField(max_length=50, null=True, blank=True)
    state_type = models.CharField(
        max_length=20, 
        choices=[('within', 'Within State'), ('other', 'Other State'), ('export', 'Export')],
        default='within'
    )
    
    # Document
    supporting_document = models.FileField(upload_to='voucher_documents/sales/', null=True, blank=True)

    # Reference from Item Tab (logically header info)
    sales_order_no = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'voucher_sales_invoicedetails'
        verbose_name = "Voucher Sales Invoice Detail"


class VoucherSalesItems(BaseModel):
    """
    Sales Voucher - Items
    Detailed line items linked to the invoice.
    """
    invoice = models.ForeignKey(VoucherSalesInvoiceDetails, on_delete=models.CASCADE, related_name='items')
    
    item_code = models.CharField(max_length=100, null=True, blank=True)
    item_name = models.CharField(max_length=255, null=True, blank=True)
    hsn_sac = models.CharField(max_length=50, null=True, blank=True)
    qty = models.DecimalField(max_digits=18, decimal_places=4, default=0)
    uom = models.CharField(max_length=50, null=True, blank=True)
    item_rate = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    
    # Values
    taxable_value = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    igst = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    cgst = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    cess = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    invoice_value = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    
    # Extra
    sales_ledger = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'voucher_sales_items'
        verbose_name = "Voucher Sales Item"


class VoucherSalesPaymentDetails(BaseModel):
    """
    Sales Voucher - Payment Details
    Summary of payments and taxes.
    """
    invoice = models.OneToOneField(VoucherSalesInvoiceDetails, on_delete=models.CASCADE, related_name='payment_details')
    
    # Tax Summaries (from state)
    payment_taxable_value = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    payment_igst = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    payment_cgst = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    payment_sgst = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    payment_cess = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    payment_state_cess = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    payment_invoice_value = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    
    # Specific Payment Fields
    payment_tds = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    payment_tcs = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    payment_advance = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    payment_payable = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    
    # Notes
    posting_note = models.TextField(null=True, blank=True) # paymentPostingNote
    terms_conditions = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'voucher_sales_paymentdetails'
        verbose_name = "Voucher Sales Payment Detail"


class VoucherSalesDispatchDetails(BaseModel):
    """
    Sales Voucher - Dispatch Details
    Shipping and transport information.
    """
    invoice = models.OneToOneField(VoucherSalesInvoiceDetails, on_delete=models.CASCADE, related_name='dispatch_details')
    
    dispatch_from = models.TextField(null=True, blank=True)
    mode_of_transport = models.CharField(max_length=50, null=True, blank=True) # Road, Air, Sea, Rail, Courier
    dispatch_date = models.DateField(null=True, blank=True)
    dispatch_time = models.TimeField(null=True, blank=True)
    
    delivery_type = models.CharField(max_length=50, null=True, blank=True)
    self_third_party = models.CharField(max_length=255, null=True, blank=True) # selfThirdParty
    transporter_id = models.CharField(max_length=100, null=True, blank=True)
    transporter_name = models.CharField(max_length=255, null=True, blank=True)
    vehicle_no = models.CharField(max_length=50, null=True, blank=True)
    lr_gr_consignment = models.CharField(max_length=100, null=True, blank=True)
    
    dispatch_document = models.FileField(upload_to='voucher_documents/dispatch/', null=True, blank=True)

    # Mixed fields for Air/Sea/Rail (storing all possible columns as requested)
    # Air/Sea Upto Port
    upto_port_shipping_bill_no = models.CharField(max_length=100, null=True, blank=True)
    upto_port_shipping_bill_date = models.DateField(null=True, blank=True)
    upto_port_ship_port_code = models.CharField(max_length=50, null=True, blank=True)
    upto_port_origin = models.CharField(max_length=100, null=True, blank=True)
    
    # Air/Sea Beyond Port
    beyond_port_shipping_bill_no = models.CharField(max_length=100, null=True, blank=True)
    beyond_port_shipping_bill_date = models.DateField(null=True, blank=True)
    beyond_port_ship_port_code = models.CharField(max_length=50, null=True, blank=True)
    beyond_port_vessel_flight_no = models.CharField(max_length=100, null=True, blank=True)
    beyond_port_port_of_loading = models.CharField(max_length=100, null=True, blank=True)
    beyond_port_port_of_discharge = models.CharField(max_length=100, null=True, blank=True)
    beyond_port_final_destination = models.CharField(max_length=100, null=True, blank=True)
    beyond_port_origin_country = models.CharField(max_length=100, null=True, blank=True)
    beyond_port_dest_country = models.CharField(max_length=100, null=True, blank=True)
    
    # Rail Specifics (Prefixing with rail_ for clarity, though user said strict columns, I must infer mapping)
    # Re-using common fields if possible, but user asked for "exact column from frontend".
    # Frontend has specific state variables like railUptoPortDeliveryType.
    
    rail_upto_port_delivery_type = models.CharField(max_length=100, null=True, blank=True)
    rail_upto_port_transporter_id = models.CharField(max_length=100, null=True, blank=True)
    rail_upto_port_transporter_name = models.CharField(max_length=255, null=True, blank=True)
    
    rail_beyond_port_receipt_no = models.CharField(max_length=100, null=True, blank=True)
    rail_beyond_port_receipt_date = models.DateField(null=True, blank=True)
    rail_beyond_port_origin = models.CharField(max_length=100, null=True, blank=True)
    rail_beyond_port_origin_country = models.CharField(max_length=100, null=True, blank=True)
    rail_beyond_port_rail_no = models.CharField(max_length=100, null=True, blank=True)
    rail_beyond_port_station_loading = models.CharField(max_length=100, null=True, blank=True)
    rail_beyond_port_station_discharge = models.CharField(max_length=100, null=True, blank=True)
    rail_beyond_port_final_destination = models.CharField(max_length=100, null=True, blank=True)
    rail_beyond_port_dest_country = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'voucher_sales_dispatchdetails'
        verbose_name = "Voucher Sales Dispatch Detail"


class VoucherSalesEwayBill(BaseModel):
    """
    Sales Voucher - E-way Bill & E-Invoice Details
    """
    invoice = models.OneToOneField(VoucherSalesInvoiceDetails, on_delete=models.CASCADE, related_name='eway_bill_details')
    
    eway_bill_available = models.CharField(max_length=10, null=True, blank=True) # Yes/No
    eway_bill_no = models.CharField(max_length=50, null=True, blank=True)
    eway_bill_date = models.DateField(null=True, blank=True)
    validity_period = models.CharField(max_length=50, null=True, blank=True)
    distance = models.CharField(max_length=50, null=True, blank=True)
    
    # Extended EWB
    extension_date = models.DateField(null=True, blank=True)
    extended_ewb_no = models.CharField(max_length=50, null=True, blank=True)
    extension_reason = models.CharField(max_length=255, null=True, blank=True)
    from_place = models.CharField(max_length=100, null=True, blank=True)
    remaining_distance = models.CharField(max_length=50, null=True, blank=True)
    new_validity = models.CharField(max_length=50, null=True, blank=True)
    updated_vehicle_no = models.CharField(max_length=50, null=True, blank=True)
    
    # E-Invoice
    irn = models.CharField(max_length=255, null=True, blank=True)
    ack_no = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'voucher_sales_ewaybill'
        verbose_name = "Voucher Sales Eway Bill"
