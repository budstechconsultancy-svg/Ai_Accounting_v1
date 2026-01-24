import React, { useState } from 'react';

interface ItemRow {
    id: number;
    itemCode: string;
    itemName: string;
    hsnSac: string;
    qty: string;
    uom: string;
    itemRate: string;
    taxableValue: string;
    igst: string;
    cgst: string;
    cess: string;
    invoiceValue: string;
    salesLedger: string;
    description: string;
}

const SalesVoucher: React.FC = () => {
    const [activeTab, setActiveTab] = useState('invoice');

    // Invoice Details State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [salesInvoiceNo, setSalesInvoiceNo] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [billTo, setBillTo] = useState('');
    const [shipTo, setShipTo] = useState('');
    const [gstin, setGstin] = useState('');
    const [contact, setContact] = useState('');
    const [taxType, setTaxType] = useState('');
    const [stateType, setStateType] = useState<'within' | 'other' | 'export'>('within');
    const [supportingDocument, setSupportingDocument] = useState<File | null>(null);

    // Item & Tax Details State
    const [salesOrderNo, setSalesOrderNo] = useState('');
    const [itemRows, setItemRows] = useState<ItemRow[]>([
        {
            id: 1,
            itemCode: '',
            itemName: '',
            hsnSac: '',
            qty: '',
            uom: '',
            itemRate: '',
            taxableValue: '',
            igst: '',
            cgst: '',
            cess: '',
            invoiceValue: '',
            salesLedger: '',
            description: ''
        }
    ]);

    // Payment Details State
    const [paymentTaxableValue, setPaymentTaxableValue] = useState('0.00');
    const [paymentIgst, setPaymentIgst] = useState('0.00');
    const [paymentCgst, setPaymentCgst] = useState('0.00');
    const [paymentSgst, setPaymentSgst] = useState('0.00');
    const [paymentCess, setPaymentCess] = useState('0.00');
    const [paymentStateCess, setPaymentStateCess] = useState('0.00');
    const [paymentInvoiceValue, setPaymentInvoiceValue] = useState('0.00');
    const [paymentTds, setPaymentTds] = useState('0.00');
    const [paymentTcs, setPaymentTcs] = useState('0.00');
    const [paymentAdvance, setPaymentAdvance] = useState('0.00');
    const [paymentPayable, setPaymentPayable] = useState('0.00');
    const [paymentPostingNote, setPaymentPostingNote] = useState('');
    const [advanceReferences, setAdvanceReferences] = useState<Array<{
        id: number;
        date: string;
        refNo: string;
        amount: string;
        appliedNow: boolean;
    }>>([]);
    const [termsConditions, setTermsConditions] = useState('');

    // Dispatch Details State
    const [skipDispatch, setSkipDispatch] = useState(false);
    const [dispatchFrom, setDispatchFrom] = useState('');
    const [modeOfTransport, setModeOfTransport] = useState('Road');
    const [dispatchDate, setDispatchDate] = useState('');
    const [dispatchTime, setDispatchTime] = useState('');
    const [deliveryType, setDeliveryType] = useState('');
    const [selfThirdParty, setSelfThirdParty] = useState('');
    const [transporterId, setTransporterId] = useState('');
    const [transporterName, setTransporterName] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [lrGrConsignment, setLrGrConsignment] = useState('');
    const [dispatchDocument, setDispatchDocument] = useState<File | null>(null);

    // Port Details (for Air/Sea transport)
    const [uptoPortShippingBillNo, setUptoPortShippingBillNo] = useState('');
    const [uptoPortShippingBillDate, setUptoPortShippingBillDate] = useState('');
    const [uptoPortShipPortCode, setUptoPortShipPortCode] = useState('');
    const [uptoPortOrigin, setUptoPortOrigin] = useState('');
    const [beyondPortShippingBillNo, setBeyondPortShippingBillNo] = useState('');
    const [beyondPortShippingBillDate, setBeyondPortShippingBillDate] = useState('');
    const [beyondPortShipPortCode, setBeyondPortShipPortCode] = useState('');
    const [beyondPortVesselFlightNo, setBeyondPortVesselFlightNo] = useState('');
    const [beyondPortPortOfLoading, setBeyondPortPortOfLoading] = useState('');
    const [beyondPortPortOfDischarge, setBeyondPortPortOfDischarge] = useState('');
    const [beyondPortFinalDestination, setBeyondPortFinalDestination] = useState('');
    const [beyondPortOriginCountry, setBeyondPortOriginCountry] = useState('');
    const [beyondPortDestCountry, setBeyondPortDestCountry] = useState('');

    // Rail Details (for Rail transport)
    const [railUptoPortDeliveryType, setRailUptoPortDeliveryType] = useState('');
    const [railUptoPortTransporterId, setRailUptoPortTransporterId] = useState('');
    const [railUptoPortTransporterName, setRailUptoPortTransporterName] = useState('');
    const [railBeyondPortRailwayReceiptNo, setRailBeyondPortRailwayReceiptNo] = useState('');
    const [railBeyondPortRailwayReceiptDate, setRailBeyondPortRailwayReceiptDate] = useState('');
    const [railBeyondPortOrigin, setRailBeyondPortOrigin] = useState('');
    const [railBeyondPortOriginCountry, setRailBeyondPortOriginCountry] = useState('');
    const [railBeyondPortRailNo, setRailBeyondPortRailNo] = useState('');
    const [railBeyondPortStationOfLoading, setRailBeyondPortStationOfLoading] = useState('');
    const [railBeyondPortStationOfDischarge, setRailBeyondPortStationOfDischarge] = useState('');
    const [railBeyondPortFinalDestination, setRailBeyondPortFinalDestination] = useState('');
    const [railBeyondPortDestCountry, setRailBeyondPortDestCountry] = useState('');

    // E-Invoice & E-way Bill Details State
    const [ewayBillAvailable, setEwayBillAvailable] = useState('Yes');
    const [ewayBillNo, setEwayBillNo] = useState('');
    const [ewayBillDate, setEwayBillDate] = useState('');
    const [validityPeriod, setValidityPeriod] = useState('');
    const [distance, setDistance] = useState('');

    // Extended E-way Bill
    const [extensionDate, setExtensionDate] = useState('');
    const [extendedEwbNo, setExtendedEwbNo] = useState('');
    const [extensionReason, setExtensionReason] = useState('');
    const [fromPlace, setFromPlace] = useState('');
    const [remainingDistance, setRemainingDistance] = useState('');
    const [newValidity, setNewValidity] = useState('');
    const [updatedVehicleNo, setUpdatedVehicleNo] = useState('');

    // E-Invoice
    const [irn, setIrn] = useState('');
    const [ackNo, setAckNo] = useState('');

    const tabs = [
        { id: 'invoice', label: 'Invoice Details' },
        { id: 'item_tax', label: 'Item & Tax Details' },
        { id: 'payment', label: 'Payment Details' },
        { id: 'dispatch', label: 'Dispatch Details' },
        { id: 'einvoice', label: 'E-Invoice & E-way Bill Details' }
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSupportingDocument(file);
        }
    };

    // Item Row Handlers
    const handleItemRowChange = (id: number, field: keyof ItemRow, value: string) => {
        setItemRows(itemRows.map(row => {
            if (row.id === id) {
                const updatedRow = { ...row, [field]: value };

                // Auto-calculate taxable value when qty or item rate changes
                if (field === 'qty' || field === 'itemRate') {
                    const qty = parseFloat(field === 'qty' ? value : updatedRow.qty) || 0;
                    const rate = parseFloat(field === 'itemRate' ? value : updatedRow.itemRate) || 0;
                    updatedRow.taxableValue = (qty * rate).toFixed(2);

                    // Recalculate invoice value
                    const taxableVal = parseFloat(updatedRow.taxableValue) || 0;
                    const igst = parseFloat(updatedRow.igst) || 0;
                    const cgst = parseFloat(updatedRow.cgst) || 0;
                    const cess = parseFloat(updatedRow.cess) || 0;
                    updatedRow.invoiceValue = (taxableVal + igst + cgst + cess).toFixed(2);
                }

                // Auto-calculate invoice value when tax fields change
                if (field === 'igst' || field === 'cgst' || field === 'cess') {
                    const taxableVal = parseFloat(updatedRow.taxableValue) || 0;
                    const igst = parseFloat(updatedRow.igst) || 0;
                    const cgst = parseFloat(updatedRow.cgst) || 0;
                    const cess = parseFloat(updatedRow.cess) || 0;
                    updatedRow.invoiceValue = (taxableVal + igst + cgst + cess).toFixed(2);
                }

                return updatedRow;
            }
            return row;
        }));
    };

    const handleAddItemRow = () => {
        const newRow: ItemRow = {
            id: itemRows.length + 1,
            itemCode: '',
            itemName: '',
            hsnSac: '',
            qty: '',
            uom: '',
            itemRate: '',
            taxableValue: '',
            igst: '',
            cgst: '',
            cess: '',
            invoiceValue: '',
            salesLedger: '',
            description: ''
        };
        setItemRows([...itemRows, newRow]);
    };

    const handleDeleteItemRow = (id: number) => {
        if (itemRows.length > 1) {
            setItemRows(itemRows.filter(row => row.id !== id));
        }
    };

    const handleDeleteSelectedItems = () => {
        // This would delete selected items based on checkboxes
        // For now, we'll keep at least one row
        if (itemRows.length > 1) {
            setItemRows([itemRows[0]]);
        }
    };

    const calculateTotals = () => {
        const totals = itemRows.reduce((acc, row) => {
            return {
                taxableValue: acc.taxableValue + (parseFloat(row.taxableValue) || 0),
                igst: acc.igst + (parseFloat(row.igst) || 0),
                cgst: acc.cgst + (parseFloat(row.cgst) || 0),
                cess: acc.cess + (parseFloat(row.cess) || 0),
                invoiceValue: acc.invoiceValue + (parseFloat(row.invoiceValue) || 0)
            };
        }, { taxableValue: 0, igst: 0, cgst: 0, cess: 0, invoiceValue: 0 });

        return totals;
    };

    const handleNext = () => {
        // Validation
        if (!date || !salesInvoiceNo || !customerName) {
            alert('Please fill in all required fields');
            return;
        }
        // Move to next tab
        setActiveTab('item_tax');
    };

    return (
        <div className="w-full">
            {/* Tabs Section - Underline Style */}
            <div className="border-b border-gray-200 mb-6">
                <div className="flex flex-wrap gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                pb-3 text-sm font-medium transition-colors duration-200 relative
                                ${activeTab === tab.id
                                    ? 'text-teal-600 border-b-2 border-teal-600'
                                    : 'text-gray-600 hover:text-gray-800'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Section */}
            <div className="min-h-[400px] bg-white">
                {activeTab === 'invoice' && (
                    <div className="space-y-6">
                        {/* Row 1: Date, Sales Invoice No, Customer Name, Upload Document */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sales Invoice No. <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={salesInvoiceNo}
                                    onChange={(e) => setSalesInvoiceNo(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Enter invoice number"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Search or enter customer name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Supporting Document
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="supporting-doc"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('supporting-doc')?.click()}
                                        className="w-full h-24 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex flex-col items-center justify-center gap-1"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="text-xs">Upload Supporting Document</span>
                                    </button>
                                    {supportingDocument && (
                                        <p className="mt-1 text-xs text-green-600">✓ {supportingDocument.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Bill To and Ship To */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bill to (Full Address)
                                </label>
                                <textarea
                                    value={billTo}
                                    onChange={(e) => setBillTo(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 resize-none"
                                    rows={6}
                                    placeholder="Enter billing address"
                                />
                                <div className="mt-3 space-y-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">GSTIN</label>
                                        <input
                                            type="text"
                                            value={gstin}
                                            onChange={(e) => setGstin(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                                            placeholder="Enter GSTIN"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Contact</label>
                                        <input
                                            type="text"
                                            value={contact}
                                            onChange={(e) => setContact(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
                                            placeholder="Enter contact number"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ship to
                                </label>
                                <textarea
                                    value={shipTo}
                                    onChange={(e) => setShipTo(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 resize-none"
                                    rows={6}
                                    placeholder="Enter shipping address (editable format)"
                                />
                            </div>
                        </div>

                        {/* Row 3: Tax Type and State Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tax Type
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setStateType('within')}
                                        className={`w-full px-4 py-2 border rounded-md transition-colors ${stateType === 'within'
                                            ? 'bg-white border-gray-400 text-gray-800 font-medium'
                                            : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                                            }`}
                                    >
                                        Within State
                                    </button>
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setStateType('other')}
                                        className={`w-full px-4 py-2 border rounded-md transition-colors ${stateType === 'other'
                                            ? 'bg-white border-gray-400 text-gray-800 font-medium'
                                            : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                                            }`}
                                    >
                                        Other State
                                    </button>
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setStateType('export')}
                                        className={`w-full px-4 py-2 border rounded-md transition-colors ${stateType === 'export'
                                            ? 'bg-yellow-100 border-yellow-400 text-gray-800 font-medium'
                                            : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                                            }`}
                                    >
                                        Export
                                    </button>
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('item_tax')}
                                        className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        NEXT
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>


                    </div>
                )}

                {activeTab === 'item_tax' && (
                    <div className="space-y-6">
                        {/* Sales Order Selection */}
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                Sales Order/Quotation No.
                            </label>
                            <select
                                value={salesOrderNo}
                                onChange={(e) => setSalesOrderNo(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="">Select Sales Order</option>
                                <option value="SO-001">SO-001</option>
                                <option value="SO-002">SO-002</option>
                            </select>
                            <button
                                type="button"
                                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-md transition-colors font-medium"
                            >
                                X
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-md transition-colors font-medium"
                            >
                                ✓
                            </button>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full">
                                <thead className="bg-blue-500 text-white">
                                    <tr>
                                        <th className="px-3 py-2 text-xs font-semibold text-center border-r border-blue-400">S. No.</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-center border-r border-blue-400">Item Code</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-center border-r border-blue-400">Item Name</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-center border-r border-blue-400">HSN/SAC</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-center border-r border-blue-400">Qty</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-center border-r border-blue-400">UOM</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-center border-r border-blue-400">Item Rate</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-center border-r border-blue-400">Taxable Value</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-center border-r border-blue-400">IGST</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-center border-r border-blue-400">CGST</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-center border-r border-blue-400">CESS</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-center border-r border-blue-400">Invoice Value</th>
                                        <th className="px-3 py-2 text-xs font-semibold text-center">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemRows.map((row, index) => (
                                        <React.Fragment key={row.id}>
                                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-2 py-2 text-center text-sm border-r border-gray-200">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                                    />
                                                    <span className="ml-2">{index + 1}</span>
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={row.itemCode}
                                                        onChange={(e) => handleItemRowChange(row.id, 'itemCode', e.target.value)}
                                                        className="w-full px-2 py-1 border-0 focus:ring-1 focus:ring-teal-500 rounded text-sm"
                                                        placeholder="Item code"
                                                    />
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={row.itemName}
                                                        onChange={(e) => handleItemRowChange(row.id, 'itemName', e.target.value)}
                                                        className="w-full px-2 py-1 border-0 focus:ring-1 focus:ring-teal-500 rounded text-sm"
                                                        placeholder="Item name"
                                                    />
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={row.hsnSac}
                                                        onChange={(e) => handleItemRowChange(row.id, 'hsnSac', e.target.value)}
                                                        className="w-full px-2 py-1 border-0 focus:ring-1 focus:ring-teal-500 rounded text-sm"
                                                        placeholder="HSN/SAC"
                                                    />
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-200">
                                                    <input
                                                        type="number"
                                                        value={row.qty}
                                                        onChange={(e) => handleItemRowChange(row.id, 'qty', e.target.value)}
                                                        className="w-20 px-2 py-1 border-0 focus:ring-1 focus:ring-teal-500 rounded text-sm"
                                                        placeholder="Qty"
                                                    />
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={row.uom}
                                                        onChange={(e) => handleItemRowChange(row.id, 'uom', e.target.value)}
                                                        className="w-20 px-2 py-1 border-0 focus:ring-1 focus:ring-teal-500 rounded text-sm"
                                                        placeholder="UOM"
                                                    />
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-200">
                                                    <input
                                                        type="number"
                                                        value={row.itemRate}
                                                        onChange={(e) => handleItemRowChange(row.id, 'itemRate', e.target.value)}
                                                        className="w-24 px-2 py-1 border-0 focus:ring-1 focus:ring-teal-500 rounded text-sm"
                                                        placeholder="Rate"
                                                    />
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={row.taxableValue}
                                                        readOnly
                                                        className="w-24 px-2 py-1 bg-gray-50 border-0 rounded text-sm"
                                                    />
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-200">
                                                    <input
                                                        type="number"
                                                        value={row.igst}
                                                        onChange={(e) => handleItemRowChange(row.id, 'igst', e.target.value)}
                                                        className="w-20 px-2 py-1 border-0 focus:ring-1 focus:ring-teal-500 rounded text-sm"
                                                        placeholder="IGST"
                                                    />
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-200">
                                                    <input
                                                        type="number"
                                                        value={row.cgst}
                                                        onChange={(e) => handleItemRowChange(row.id, 'cgst', e.target.value)}
                                                        className="w-20 px-2 py-1 border-0 focus:ring-1 focus:ring-teal-500 rounded text-sm"
                                                        placeholder="CGST"
                                                    />
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-200">
                                                    <input
                                                        type="number"
                                                        value={row.cess}
                                                        onChange={(e) => handleItemRowChange(row.id, 'cess', e.target.value)}
                                                        className="w-20 px-2 py-1 border-0 focus:ring-1 focus:ring-teal-500 rounded text-sm"
                                                        placeholder="CESS"
                                                    />
                                                </td>
                                                <td className="px-2 py-2 border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={row.invoiceValue}
                                                        readOnly
                                                        className="w-28 px-2 py-1 bg-gray-50 border-0 rounded text-sm font-medium"
                                                    />
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteItemRow(row.id)}
                                                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete this item"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                            {/* Sales Ledger and Description Row */}
                                            <tr className="border-b border-gray-200 bg-gray-50">
                                                <td colSpan={4} className="px-2 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs font-medium text-gray-700 whitespace-nowrap">Sales Ledger:</label>
                                                        <input
                                                            type="text"
                                                            value={row.salesLedger}
                                                            onChange={(e) => handleItemRowChange(row.id, 'salesLedger', e.target.value)}
                                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-teal-500"
                                                            placeholder="Select sales ledger"
                                                        />
                                                    </div>
                                                </td>
                                                <td colSpan={9} className="px-2 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs font-medium text-gray-700 whitespace-nowrap">Description:</label>
                                                        <input
                                                            type="text"
                                                            value={row.description}
                                                            onChange={(e) => handleItemRowChange(row.id, 'description', e.target.value)}
                                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-teal-500"
                                                            placeholder="Enter description"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    ))}

                                    {/* Totals Row */}
                                    <tr className="bg-gray-100 font-semibold border-t-2 border-gray-300">
                                        <td colSpan={7} className="px-3 py-2 text-right text-sm">Total:</td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="text"
                                                value={calculateTotals().taxableValue.toFixed(2)}
                                                readOnly
                                                className="w-24 px-2 py-1 bg-white border border-gray-300 rounded text-sm font-semibold text-center"
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="text"
                                                value={calculateTotals().igst.toFixed(2)}
                                                readOnly
                                                className="w-20 px-2 py-1 bg-white border border-gray-300 rounded text-sm font-semibold text-center"
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="text"
                                                value={calculateTotals().cgst.toFixed(2)}
                                                readOnly
                                                className="w-20 px-2 py-1 bg-white border border-gray-300 rounded text-sm font-semibold text-center"
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="text"
                                                value={calculateTotals().cess.toFixed(2)}
                                                readOnly
                                                className="w-20 px-2 py-1 bg-white border border-gray-300 rounded text-sm font-semibold text-center"
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="text"
                                                value={calculateTotals().invoiceValue.toFixed(2)}
                                                readOnly
                                                className="w-28 px-2 py-1 bg-white border border-gray-300 rounded text-sm font-semibold text-center"
                                            />
                                        </td>
                                        <td className="px-2 py-2"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleAddItemRow}
                                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Row
                            </button>

                            <div className="flex items-center gap-4">

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('payment')}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2 font-medium"
                                >
                                    NEXT
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'payment' && (
                    <div className="space-y-6">
                        {/* Tax Summary Table */}
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-r border-gray-300">Taxable Value</th>
                                        <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-r border-gray-300">IGST</th>
                                        <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-r border-gray-300">CGST</th>
                                        <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-r border-gray-300">SGST/UTGST</th>
                                        <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-r border-gray-300">Cess</th>
                                        <th className="px-4 py-2 text-sm font-semibold text-gray-700">State Cess</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white">
                                        <td className="px-4 py-3 border-r border-gray-300">
                                            <input
                                                type="text"
                                                value={calculateTotals().taxableValue.toFixed(2)}
                                                readOnly
                                                className="w-full px-2 py-1 bg-gray-50 border-0 rounded text-sm text-center"
                                            />
                                        </td>
                                        <td className="px-4 py-3 border-r border-gray-300">
                                            <input
                                                type="text"
                                                value={calculateTotals().igst.toFixed(2)}
                                                readOnly
                                                className="w-full px-2 py-1 bg-gray-50 border-0 rounded text-sm text-center"
                                            />
                                        </td>
                                        <td className="px-4 py-3 border-r border-gray-300">
                                            <input
                                                type="text"
                                                value={calculateTotals().cgst.toFixed(2)}
                                                readOnly
                                                className="w-full px-2 py-1 bg-gray-50 border-0 rounded text-sm text-center"
                                            />
                                        </td>
                                        <td className="px-4 py-3 border-r border-gray-300">
                                            <input
                                                type="text"
                                                value={paymentSgst}
                                                readOnly
                                                className="w-full px-2 py-1 bg-gray-50 border-0 rounded text-sm text-center"
                                            />
                                        </td>
                                        <td className="px-4 py-3 border-r border-gray-300">
                                            <input
                                                type="text"
                                                value={calculateTotals().cess.toFixed(2)}
                                                readOnly
                                                className="w-full px-2 py-1 bg-gray-50 border-0 rounded text-sm text-center"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={paymentStateCess}
                                                readOnly
                                                className="w-full px-2 py-1 bg-gray-50 border-0 rounded text-sm text-center"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Payment Summary */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Invoice Value
                                    </label>
                                    <input
                                        type="text"
                                        value={calculateTotals().invoiceValue.toFixed(2)}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-right"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        TDS/TCS
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentTds}
                                        onChange={(e) => setPaymentTds(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-right"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Advance
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentAdvance}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-right"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payable
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentPayable}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-right font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Posting Note:
                                    </label>
                                    <textarea
                                        value={paymentPostingNote}
                                        onChange={(e) => setPaymentPostingNote(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 resize-none"
                                        rows={6}
                                        placeholder="Enter posting notes..."
                                    />
                                </div>
                            </div>

                            {/* Middle Column - Advance References */}
                            <div className="border border-gray-300 rounded-lg p-4 bg-blue-50">
                                <div className="space-y-3">
                                    <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-700">
                                        <div className="text-center">Date</div>
                                        <div className="text-center">Advance Ref. No.</div>
                                        <div className="text-center">Amount</div>
                                        <div className="text-center">Applied Now</div>
                                    </div>

                                    {advanceReferences.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 text-sm">
                                            No advance references available
                                        </div>
                                    ) : (
                                        advanceReferences.map((ref) => (
                                            <div key={ref.id} className="grid grid-cols-4 gap-2">
                                                <input
                                                    type="date"
                                                    value={ref.date}
                                                    readOnly
                                                    className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                                                />
                                                <select
                                                    value={ref.refNo}
                                                    className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                                                >
                                                    <option value="">Select</option>
                                                    <option value={ref.refNo}>{ref.refNo}</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    value={ref.amount}
                                                    readOnly
                                                    className="px-2 py-1 border border-gray-300 rounded text-xs bg-white text-center"
                                                />
                                                <div className="flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={ref.appliedNow}
                                                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Edit Master */}
                            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
                                        >
                                            Terms & Conditions
                                        </button>
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors text-sm font-medium shadow-sm"
                                        >
                                            Edit Masters
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Edit Here</label>
                                        <textarea
                                            value={termsConditions}
                                            onChange={(e) => setTermsConditions(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-gray-800 resize-none bg-white"
                                            rows={8}
                                            placeholder="Enter terms and conditions..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveTab('dispatch')}
                                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors flex items-center gap-2 font-medium"
                            >
                                NEXT
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'dispatch' && (
                    <div className="space-y-6">
                        {/* Skip Button */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setSkipDispatch(true);
                                    setActiveTab('einvoice');
                                }}
                                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors font-medium"
                            >
                                Skip
                            </button>
                        </div>

                        {/* Main Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                {/* Dispatch From */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dispatch From
                                    </label>
                                    <textarea
                                        value={dispatchFrom}
                                        onChange={(e) => setDispatchFrom(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 resize-none"
                                        rows={3}
                                        placeholder="Warehouse (If connected with the inventory module) / Location (As full address with Pincode)"
                                    />
                                </div>

                                {/* Mode of Transport */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mode of Transport
                                    </label>
                                    <select
                                        value={modeOfTransport}
                                        onChange={(e) => setModeOfTransport(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white"
                                    >
                                        <option value="Road">Road</option>
                                        <option value="Air">Air</option>
                                        <option value="Sea">Sea</option>
                                        <option value="Rail">Rail</option>
                                        <option value="Courier">Courier</option>
                                    </select>
                                </div>

                                {/* Dispatch Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dispatch Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dispatchDate}
                                        onChange={(e) => setDispatchDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>

                                {/* Dispatch Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dispatch Time
                                    </label>
                                    <input
                                        type="time"
                                        value={dispatchTime}
                                        onChange={(e) => setDispatchTime(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>

                                {/* Upload Document */}
                                <div className="mt-6">
                                    <input
                                        type="file"
                                        id="dispatch-doc"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setDispatchDocument(file);
                                        }}
                                        className="hidden"
                                        accept=".jpg,.jpeg,.pdf"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('dispatch-doc')?.click()}
                                        className="w-full h-40 border-2 border-dashed border-gray-300 hover:border-teal-500 bg-gray-50 hover:bg-teal-50 text-gray-600 rounded-lg transition-colors flex flex-col items-center justify-center gap-2"
                                    >
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="text-sm font-medium">UPLOAD DOCUMENT</span>
                                        {dispatchDocument && (
                                            <span className="text-xs mt-2 text-teal-600 font-medium">✓ {dispatchDocument.name}</span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                {/* Delivery Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Delivery Type
                                    </label>
                                    <select
                                        value={deliveryType}
                                        onChange={(e) => {
                                            setDeliveryType(e.target.value);
                                            // If Courier is selected, disable other fields
                                            if (e.target.value === 'Courier') {
                                                setTransporterId('');
                                                setTransporterName('');
                                                setVehicleNo('');
                                                setLrGrConsignment('');
                                            }
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white"
                                    >
                                        <option value="">Select</option>
                                        <option value="Self">Self</option>
                                        <option value="Third Party">Third Party</option>
                                        <option value="Courier">Courier</option>
                                    </select>
                                </div>

                                {/* Self/Third Party/Courier */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Self/Third Party/Courier
                                    </label>
                                    <input
                                        type="text"
                                        value={selfThirdParty}
                                        onChange={(e) => setSelfThirdParty(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        placeholder="Enter details"
                                    />
                                </div>

                                {/* Transporter ID/GSTIN */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Transporter ID/GSTIN
                                    </label>
                                    <input
                                        type="text"
                                        value={transporterId}
                                        onChange={(e) => setTransporterId(e.target.value)}
                                        disabled={deliveryType === 'Courier'}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Editable with numerics and alphabet"
                                    />
                                </div>

                                {/* Transporter Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Transporter Name
                                    </label>
                                    <input
                                        type="text"
                                        value={transporterName}
                                        onChange={(e) => setTransporterName(e.target.value)}
                                        disabled={deliveryType === 'Courier'}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Editable with numerics and alphabet"
                                    />
                                </div>

                                {/* Vehicle No. */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vehicle No.
                                    </label>
                                    <input
                                        type="text"
                                        value={vehicleNo}
                                        onChange={(e) => setVehicleNo(e.target.value)}
                                        disabled={deliveryType === 'Courier'}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Editable with numerics and alphabet"
                                    />
                                </div>

                                {/* LR/GR/Consignment */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        LR/GR/Consignment
                                    </label>
                                    <input
                                        type="text"
                                        value={lrGrConsignment}
                                        onChange={(e) => setLrGrConsignment(e.target.value)}
                                        disabled={deliveryType === 'Courier'}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Editable with numerics and alphabet"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Conditional Port Details for Air/Sea */}
                        {(modeOfTransport === 'Air' || modeOfTransport === 'Sea') && (
                            <div className="space-y-6 mt-6">
                                {/* UPTO PORT Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">UPTO PORT</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Shipping Bill No.
                                                </label>
                                                <input
                                                    type="text"
                                                    value={uptoPortShippingBillNo}
                                                    onChange={(e) => setUptoPortShippingBillNo(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ship/Port Code
                                                </label>
                                                <input
                                                    type="text"
                                                    value={uptoPortShipPortCode}
                                                    onChange={(e) => setUptoPortShipPortCode(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Shipping Bill Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={uptoPortShippingBillDate}
                                                    onChange={(e) => setUptoPortShippingBillDate(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Origin
                                                </label>
                                                <input
                                                    type="text"
                                                    value={uptoPortOrigin}
                                                    onChange={(e) => setUptoPortOrigin(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="City"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* BEYOND PORT Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">BEYOND PORT</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Shipping Bill No.
                                                </label>
                                                <input
                                                    type="text"
                                                    value={beyondPortShippingBillNo}
                                                    onChange={(e) => setBeyondPortShippingBillNo(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ship/Port Code
                                                </label>
                                                <input
                                                    type="text"
                                                    value={beyondPortShipPortCode}
                                                    onChange={(e) => setBeyondPortShipPortCode(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Port of Loading
                                                </label>
                                                <input
                                                    type="text"
                                                    value={beyondPortPortOfLoading}
                                                    onChange={(e) => setBeyondPortPortOfLoading(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Final Destination
                                                </label>
                                                <input
                                                    type="text"
                                                    value={beyondPortFinalDestination}
                                                    onChange={(e) => setBeyondPortFinalDestination(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="City"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Origin
                                                </label>
                                                <input
                                                    type="text"
                                                    value={beyondPortOriginCountry}
                                                    onChange={(e) => setBeyondPortOriginCountry(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="Country"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Shipping Bill Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={beyondPortShippingBillDate}
                                                    onChange={(e) => setBeyondPortShippingBillDate(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Vessel/Flight No.
                                                </label>
                                                <input
                                                    type="text"
                                                    value={beyondPortVesselFlightNo}
                                                    onChange={(e) => setBeyondPortVesselFlightNo(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Port of Discharge
                                                </label>
                                                <input
                                                    type="text"
                                                    value={beyondPortPortOfDischarge}
                                                    onChange={(e) => setBeyondPortPortOfDischarge(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Dest. Country
                                                </label>
                                                <input
                                                    type="text"
                                                    value={beyondPortDestCountry}
                                                    onChange={(e) => setBeyondPortDestCountry(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="Country"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Conditional Rail Details */}
                        {modeOfTransport === 'Rail' && (
                            <div className="space-y-6 mt-6">
                                {/* UPTO PORT Section for Rail */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">UPTO PORT</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Delivery Type
                                                </label>
                                                <input
                                                    type="text"
                                                    value={railUptoPortDeliveryType}
                                                    onChange={(e) => setRailUptoPortDeliveryType(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="Self/Third Party"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Transporter Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={railUptoPortTransporterName}
                                                    onChange={(e) => setRailUptoPortTransporterName(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Transporter ID/GSTIN
                                                </label>
                                                <input
                                                    type="text"
                                                    value={railUptoPortTransporterId}
                                                    onChange={(e) => setRailUptoPortTransporterId(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* BEYOND PORT Section for Rail */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">BEYOND PORT</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Railway Receipt No.
                                                </label>
                                                <input
                                                    type="text"
                                                    value={railBeyondPortRailwayReceiptNo}
                                                    onChange={(e) => setRailBeyondPortRailwayReceiptNo(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Origin
                                                </label>
                                                <input
                                                    type="text"
                                                    value={railBeyondPortOrigin}
                                                    onChange={(e) => setRailBeyondPortOrigin(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="City"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Rail No.
                                                </label>
                                                <input
                                                    type="text"
                                                    value={railBeyondPortRailNo}
                                                    onChange={(e) => setRailBeyondPortRailNo(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Station of Loading
                                                </label>
                                                <input
                                                    type="text"
                                                    value={railBeyondPortStationOfLoading}
                                                    onChange={(e) => setRailBeyondPortStationOfLoading(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Final Destination
                                                </label>
                                                <input
                                                    type="text"
                                                    value={railBeyondPortFinalDestination}
                                                    onChange={(e) => setRailBeyondPortFinalDestination(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="City"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Railway Receipt Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={railBeyondPortRailwayReceiptDate}
                                                    onChange={(e) => setRailBeyondPortRailwayReceiptDate(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Origin Country
                                                </label>
                                                <input
                                                    type="text"
                                                    value={railBeyondPortOriginCountry}
                                                    onChange={(e) => setRailBeyondPortOriginCountry(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="Country"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Station of Discharge
                                                </label>
                                                <input
                                                    type="text"
                                                    value={railBeyondPortStationOfDischarge}
                                                    onChange={(e) => setRailBeyondPortStationOfDischarge(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Dest. Country
                                                </label>
                                                <input
                                                    type="text"
                                                    value={railBeyondPortDestCountry}
                                                    onChange={(e) => setRailBeyondPortDestCountry(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="Country"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveTab('einvoice')}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2 font-medium"
                            >
                                NEXT
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'einvoice' && (
                    <div className="space-y-6">
                        {/* E-way Bill Section */}
                        <div className="border-b border-gray-300 pb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">E-way Bill</h3>
                                <button
                                    type="button"
                                    className="px-4 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors text-sm"
                                >
                                    +
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Eway Bill - Available
                                        </label>
                                        <input
                                            type="text"
                                            value={ewayBillAvailable}
                                            onChange={(e) => setEwayBillAvailable(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                            placeholder="Yes/No"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Eway Bill No.
                                        </label>
                                        <input
                                            type="text"
                                            value={ewayBillNo}
                                            onChange={(e) => setEwayBillNo(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Eway Bill Date
                                        </label>
                                        <input
                                            type="date"
                                            value={ewayBillDate}
                                            onChange={(e) => setEwayBillDate(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Validity Period
                                        </label>
                                        <input
                                            type="text"
                                            value={validityPeriod}
                                            onChange={(e) => setValidityPeriod(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Distance (KM)
                                        </label>
                                        <input
                                            type="text"
                                            value={distance}
                                            onChange={(e) => setDistance(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extended E-way Bill Section */}
                        <div className="border-b border-gray-300 pb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Extended E-way Bill</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Extension Date
                                        </label>
                                        <input
                                            type="date"
                                            value={extensionDate}
                                            onChange={(e) => setExtensionDate(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Extended EWB No.
                                        </label>
                                        <input
                                            type="text"
                                            value={extendedEwbNo}
                                            onChange={(e) => setExtendedEwbNo(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Extension Reason
                                        </label>
                                        <input
                                            type="text"
                                            value={extensionReason}
                                            onChange={(e) => setExtensionReason(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            From Place
                                        </label>
                                        <input
                                            type="text"
                                            value={fromPlace}
                                            onChange={(e) => setFromPlace(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Remaining Distance
                                        </label>
                                        <input
                                            type="text"
                                            value={remainingDistance}
                                            onChange={(e) => setRemainingDistance(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            New Validity
                                        </label>
                                        <input
                                            type="text"
                                            value={newValidity}
                                            onChange={(e) => setNewValidity(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Updated Vehicle No.
                                        </label>
                                        <input
                                            type="text"
                                            value={updatedVehicleNo}
                                            onChange={(e) => setUpdatedVehicleNo(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* E-Invoice Section */}
                        <div className="pb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">E-Invoice</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        IRN
                                    </label>
                                    <input
                                        type="text"
                                        value={irn}
                                        onChange={(e) => setIrn(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ack. No.
                                    </label>
                                    <input
                                        type="text"
                                        value={ackNo}
                                        onChange={(e) => setAckNo(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors font-medium"
                            >
                                Post & Close
                            </button>
                            <button
                                type="button"
                                className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors font-medium"
                            >
                                Post & Print/Email
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesVoucher;
