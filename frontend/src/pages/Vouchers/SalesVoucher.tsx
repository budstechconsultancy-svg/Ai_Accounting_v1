import React, { useState, useEffect } from 'react';
import Icon from '../../components/Icon';
import { apiService } from '../../services';

interface SalesVoucherProps {
    onClose?: () => void;
}

interface ReceiptVoucherType {
    id: number;
    name: string;
    code: string;
    prefix: string;
    suffix: string;
    current_number: number;
    required_digits: number;
    enable_auto_numbering: boolean;

}

interface Customer {
    id: number;
    name: string;
    gstin: string;
    state: string;
}

interface CustomerAddress {
    bill_to_address: string;
    bill_to_gstin: string;
    bill_to_contact: string;
    bill_to_state: string;
    bill_to_country: string;
    ship_to_address: string;
    ship_to_state: string;
    ship_to_country: string;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

const SalesVoucher: React.FC<SalesVoucherProps> = ({ onClose }) => {
    // Tab state
    const [currentTab, setCurrentTab] = useState(1);

    // Form state - Invoice Details Tab
    const [date, setDate] = useState(getTodayDate());
    const [voucherTypes, setVoucherTypes] = useState<ReceiptVoucherType[]>([]);
    const [selectedVoucherType, setSelectedVoucherType] = useState<number | null>(null);
    const [salesInvoiceNumber, setSalesInvoiceNumber] = useState('Auto-generated');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
    const [customerAddress, setCustomerAddress] = useState<CustomerAddress | null>(null);
    const [shipToAddress, setShipToAddress] = useState('');
    const [taxType, setTaxType] = useState<'within_state' | 'other_state' | 'export'>('within_state');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch voucher types on mount
    useEffect(() => {
        fetchVoucherTypes();
        fetchCustomers();
    }, []);

    const fetchVoucherTypes = async () => {
        try {
            const types = await apiService.getReceiptVoucherTypes('sales');
            setVoucherTypes(types);

            // Auto-select if only one type
            if (types.length === 1) {
                const firstType = types[0];
                setSelectedVoucherType(firstType.id);

                // Auto-set invoice number for single type
                if (firstType.enable_auto_numbering) {
                    const paddedNum = String(firstType.current_number).padStart(firstType.required_digits, '0');
                    setSalesInvoiceNumber(`${firstType.prefix || ''}${paddedNum}${firstType.suffix || ''}`);
                }
            }
        } catch (err) {
            console.error('Error fetching voucher types:', err);
            setError('Failed to load voucher types');
        }
    };

    const fetchCustomers = async () => {
        try {
            const customerList = await apiService.getSalesCustomers();
            setCustomers(customerList);
        } catch (err) {
            console.error('Error fetching customers:', err);
            setError('Failed to load customers');
        }
    };

    const handleCustomerChange = async (customerId: number) => {
        setSelectedCustomer(customerId);

        try {
            // Fetch customer address
            const address = await apiService.getCustomerAddress(customerId);
            setCustomerAddress(address);
            setShipToAddress(address.ship_to_address);

            // Determine tax type
            const taxTypeResult = await apiService.determineTaxType(
                '', // User state will be fetched from company settings in API
                address.bill_to_state,
                address.bill_to_country
            );
            setTaxType(taxTypeResult.tax_type);
        } catch (err) {
            console.error('Error fetching customer address:', err);
            setError('Failed to load customer address');
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const validFiles: File[] = [];
        const invalidFiles: string[] = [];

        Array.from(files).forEach((file: File) => {
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext === 'jpg' || ext === 'jpeg' || ext === 'pdf') {
                validFiles.push(file);
            } else {
                invalidFiles.push(file.name);
            }
        });

        if (invalidFiles.length > 0) {
            alert(`Invalid file types: ${invalidFiles.join(', ')}. Only JPG, JPEG, and PDF files are allowed.`);
        }

        setUploadedFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        // Validate current tab
        if (currentTab === 1) {
            if (!date) {
                alert('Please select a date');
                return;
            }
            if (!selectedVoucherType) {
                alert('Please select a voucher type');
                return;
            }
            if (!selectedCustomer) {
                alert('Please select a customer');
                return;
            }
        }

        if (currentTab === 2) {
            if (items.length === 0) {
                alert('Please add at least one item');
                return;
            }
            if (!salesLedger) {
                alert('Please select a Sales Ledger');
                return;
            }
            if (isDeleting || selectedItemIds.size > 0) {
                alert('Please complete or cancel the delete action before proceeding');
                return;
            }
        }

        // Move to next tab
        if (currentTab < 5) {
            setCurrentTab(currentTab + 1);
        }
    };

    const handlePrevious = () => {
        if (currentTab > 1) {
            setCurrentTab(currentTab - 1);
        }
    };

    const renderTabButtons = () => {
        const tabs = [
            { id: 1, label: 'Invoice Details' },
            { id: 2, label: 'Item & Tax Details' },
            { id: 3, label: 'Payment Details' },
            { id: 4, label: 'Dispatch Details' },
            { id: 5, label: 'E-Invoice & E-way Bill Details' }
        ];

        return (
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setCurrentTab(tab.id)}
                        className={`px-4 py-2 rounded-md whitespace-nowrap transition-colors ${currentTab === tab.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        );
    };

    const renderInvoiceDetailsTab = () => (
        <div className="space-y-6">
            {/* Row 1: Date, Voucher Name, Sales Invoice No */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="form-label">Date *</label>
                    <input
                        type="date"
                        value={date}
                        max={getTodayDate()}
                        onChange={e => setDate(e.target.value)}
                        className="form-input"
                    />
                    <p className="text-xs text-gray-500 mt-1">Future dates not allowed</p>
                </div>

                <div>
                    <label className="form-label">Voucher Name *</label>
                    <select
                        value={selectedVoucherType || ''}
                        onChange={e => {
                            const newId = Number(e.target.value);
                            setSelectedVoucherType(newId);

                            // Auto-generate invoice number based on selected type
                            const selectedType = voucherTypes.find(t => t.id === newId);
                            if (selectedType && selectedType.enable_auto_numbering) {
                                const paddedNum = String(selectedType.current_number).padStart(selectedType.required_digits, '0');
                                setSalesInvoiceNumber(`${selectedType.prefix || ''}${paddedNum}${selectedType.suffix || ''}`);
                            } else {
                                setSalesInvoiceNumber('Manual Input');
                            }
                        }}
                        className="form-input"
                        disabled={voucherTypes.length === 1}
                    >
                        <option value="">Select Voucher Type</option>
                        {voucherTypes.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="form-label">Sales Invoice No.</label>
                    <input
                        type="text"
                        value={salesInvoiceNumber}
                        readOnly
                        className="form-input bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
                </div>
            </div>

            {/* Row 2: Customer Name */}
            <div>
                <label className="form-label">Customer Name *</label>
                <div className="flex gap-2">
                    <select
                        value={selectedCustomer || ''}
                        onChange={e => handleCustomerChange(Number(e.target.value))}
                        className="form-input flex-1"
                    >
                        <option value="">Select Customer</option>
                        {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                                {customer.name}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className="btn-secondary whitespace-nowrap"
                        onClick={() => alert('Add Customer functionality to be implemented')}
                    >
                        <Icon name="plus" className="w-4 h-4 mr-1" />
                        Add Customer
                    </button>
                </div>
            </div>

            {/* Row 3: Upload Supporting Document */}
            <div>
                <label className="form-label">Upload Supporting Document</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center cursor-pointer"
                    >
                        <Icon name="upload" className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, JPEG, PDF only</p>
                    </label>

                    {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <span className="text-sm text-gray-700">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Icon name="trash" className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Row 4: Bill To and Ship To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="form-label">Bill To (Full Address)</label>
                    <textarea
                        value={customerAddress?.bill_to_address || ''}
                        readOnly
                        className="form-input bg-gray-100 cursor-not-allowed h-32 resize-none"
                        placeholder="Select a customer to view address"
                    />
                    {customerAddress && (
                        <div className="mt-2 text-sm text-gray-600">
                            <p>GSTIN: {customerAddress.bill_to_gstin || 'N/A'}</p>
                            <p>Contact: {customerAddress.bill_to_contact || 'N/A'}</p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="form-label">Ship To Address</label>
                    <textarea
                        value={shipToAddress}
                        onChange={e => setShipToAddress(e.target.value)}
                        className="form-input h-32 resize-none"
                        placeholder="Edit shipping address if different"
                    />
                    <p className="text-xs text-gray-500 mt-1">Editable, does not update customer master</p>
                </div>
            </div>

            {/* Row 5: Tax Type */}
            <div>
                <label className="form-label">Tax Type</label>
                <div className="flex gap-4">
                    <div className={`flex-1 p-4 rounded-lg border-2 ${taxType === 'within_state' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                checked={taxType === 'within_state'}
                                readOnly
                                className="mr-2"
                            />
                            <span className="font-medium">Within State</span>
                        </div>
                    </div>
                    <div className={`flex-1 p-4 rounded-lg border-2 ${taxType === 'other_state' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                checked={taxType === 'other_state'}
                                readOnly
                                className="mr-2"
                            />
                            <span className="font-medium">Other State</span>
                        </div>
                    </div>
                    <div className={`flex-1 p-4 rounded-lg border-2 ${taxType === 'export' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                checked={taxType === 'export'}
                                readOnly
                                className="mr-2"
                            />
                            <span className="font-medium">Export</span>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Auto-determined based on customer address</p>
            </div>
        </div>
    );

    // Items & Tax Details Tab State
    const [salesOrders, setSalesOrders] = useState<any[]>([]);
    const [selectedSalesOrders, setSelectedSalesOrders] = useState<any[]>([]);
    const [activeSalesOrderTab, setActiveSalesOrderTab] = useState<number | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());
    const [salesLedger, setSalesLedger] = useState<string>('');
    const [salesLedgers, setSalesLedgers] = useState<any[]>([]);
    const [description, setDescription] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSalesOrderSelect = (orderId: string) => {
        const order = salesOrders.find(o => o.id === orderId);
        if (order && !selectedSalesOrders.find(o => o.id === orderId)) {
            const newSelectedOrders = [...selectedSalesOrders, order];
            setSelectedSalesOrders(newSelectedOrders);
            setActiveSalesOrderTab(order.id);
            // Load items from this sales order
            loadItemsFromSalesOrder(order);
        }
    };

    const loadItemsFromSalesOrder = (order: any) => {
        // Simulate loading items from sales order
        const orderItems = order.items || [];
        setItems(orderItems.map((item: any, index: number) => ({
            id: Date.now() + index,
            sNo: items.length + index + 1,
            salesOrderNumber: order.number,
            itemCode: item.itemCode,
            itemName: item.itemName,
            hsnSac: item.hsnSac,
            uqc: item.uqc,
            quantity: item.quantity,
            maxQuantity: item.quantity, // Sales order quantity limit
            itemRate: item.rate,
            taxableValue: item.quantity * item.rate,
            taxRate: item.taxRate || 18,
            cgst: 0,
            sgst: 0,
            igst: 0,
            cess: 0,
            cessRate: item.cessRate || 0,
            invoiceValue: 0,
            isFromSalesOrder: true
        })));
    };

    const calculateTaxes = (item: any) => {
        const taxableValue = item.quantity * item.itemRate;
        const taxAmount = (taxableValue * item.taxRate) / 100;

        let cgst = 0, sgst = 0, igst = 0;

        if (taxType === 'within_state') {
            cgst = taxAmount / 2;
            sgst = taxAmount / 2;
        } else if (taxType === 'other_state' || taxType === 'export') {
            igst = taxAmount;
        }

        const cess = (cgst + sgst + igst) * (item.cessRate / 100);
        const invoiceValue = taxableValue + cgst + sgst + igst + cess;

        return {
            taxableValue,
            cgst,
            sgst,
            igst,
            cess,
            invoiceValue
        };
    };

    const handleQuantityChange = (itemId: number, newQuantity: number) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === itemId) {
                // Validate against sales order quantity
                if (item.isFromSalesOrder && newQuantity > item.maxQuantity) {
                    alert(`Quantity cannot exceed Sales Order quantity of ${item.maxQuantity}`);
                    return item;
                }

                const taxes = calculateTaxes({ ...item, quantity: newQuantity });
                return {
                    ...item,
                    quantity: newQuantity,
                    ...taxes
                };
            }
            return item;
        }));
    };

    const handleItemSelect = (itemId: number) => {
        setSelectedItemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleDeleteItems = () => {
        if (selectedItemIds.size === 0) {
            alert('Please select items to delete');
            return;
        }

        setIsDeleting(true);
        setItems(prevItems => {
            const remainingItems = prevItems.filter(item => !selectedItemIds.has(item.id));
            // Renumber S.No
            return remainingItems.map((item, index) => ({
                ...item,
                sNo: index + 1
            }));
        });
        setSelectedItemIds(new Set());
        setIsDeleting(false);
    };

    const handleAddNewItem = () => {
        const newItem = {
            id: Date.now(),
            sNo: items.length + 1,
            salesOrderNumber: activeSalesOrderTab ? selectedSalesOrders.find(o => o.id === activeSalesOrderTab)?.number : '',
            itemCode: '',
            itemName: '',
            hsnSac: '',
            uqc: '',
            quantity: 1,
            maxQuantity: 999999,
            itemRate: 0,
            taxableValue: 0,
            taxRate: 18,
            cgst: 0,
            sgst: 0,
            igst: 0,
            cess: 0,
            cessRate: 0,
            invoiceValue: 0,
            isFromSalesOrder: false
        };
        setItems([...items, newItem]);
    };

    const calculateTotals = () => {
        return items.reduce((acc, item) => ({
            taxableValue: acc.taxableValue + item.taxableValue,
            cgst: acc.cgst + item.cgst,
            sgst: acc.sgst + item.sgst,
            igst: acc.igst + item.igst,
            cess: acc.cess + item.cess,
            invoiceValue: acc.invoiceValue + item.invoiceValue
        }), {
            taxableValue: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            cess: 0,
            invoiceValue: 0
        });
    };

    const totals = calculateTotals();

    const renderItemsTab = () => (
        <div className="space-y-6">
            {/* Sales Order / Quotation Selection */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className="form-label">Sales Order / Quotation Number *</label>
                    <select
                        className="form-input"
                        onChange={(e) => handleSalesOrderSelect(e.target.value)}
                        value=""
                    >
                        <option value="">Select Sales Order / Quotation</option>
                        {salesOrders.map(order => (
                            <option key={order.id} value={order.id}>
                                {order.number} - {order.customerName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Horizontal Tabs for Selected Sales Orders */}
                {selectedSalesOrders.length > 0 && (
                    <div className="flex gap-2">
                        {selectedSalesOrders.map(order => (
                            <button
                                key={order.id}
                                onClick={() => setActiveSalesOrderTab(order.id)}
                                className={`px-4 py-2 rounded-md border-2 transition-colors ${activeSalesOrderTab === order.id
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                                    }`}
                            >
                                {order.number}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Item Grid */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-2 py-3 text-xs font-semibold text-gray-700 border-r">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedItemIds(new Set(items.map(i => i.id)));
                                            } else {
                                                setSelectedItemIds(new Set());
                                            }
                                        }}
                                        checked={selectedItemIds.size === items.length && items.length > 0}
                                    />
                                </th>
                                <th className="px-3 py-3 text-xs font-semibold text-gray-700 border-r">S.No</th>
                                <th className="px-3 py-3 text-xs font-semibold text-gray-700 border-r">Sales Order No.</th>
                                <th className="px-3 py-3 text-xs font-semibold text-gray-700 border-r">Item Code</th>
                                <th className="px-3 py-3 text-xs font-semibold text-gray-700 border-r">Item Name</th>
                                <th className="px-3 py-3 text-xs font-semibold text-gray-700 border-r">HSN/SAC</th>
                                <th className="px-3 py-3 text-xs font-semibold text-gray-700 border-r">UQC</th>
                                <th className="px-3 py-3 text-xs font-semibold text-gray-700 border-r">Quantity</th>
                                <th className="px-3 py-3 text-xs font-semibold text-gray-700 border-r">Item Rate</th>
                                <th className="px-3 py-3 text-xs font-semibold text-gray-700 border-r">Taxable Value</th>
                                <th className="px-3 py-3 text-xs font-semibold text-gray-700 border-r">CGST</th>
                                <th className="px-3 py-3 text-xs font-semibold text-gray-700 border-r">SGST</th>
                                <th className="px-3 py-3 text-xs font-semibold text-gray-700 border-r">IGST</th>
                                <th className="px-3 py-3 text-xs font-semibold text-gray-700 border-r">CESS</th>
                                <th className="px-3 py-3 text-xs font-semibold text-gray-700">Invoice Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id} className="border-t hover:bg-gray-50">
                                    <td className="px-2 py-2 border-r text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedItemIds.has(item.id)}
                                            onChange={() => handleItemSelect(item.id)}
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-700 border-r text-center">{item.sNo}</td>
                                    <td className="px-3 py-2 text-sm text-gray-700 border-r">
                                        <input
                                            type="text"
                                            value={item.salesOrderNumber}
                                            readOnly
                                            className="w-full px-2 py-1 text-sm bg-gray-50 border-0 cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border-r">
                                        <input
                                            type="text"
                                            value={item.itemCode}
                                            readOnly={item.isFromSalesOrder}
                                            className={`w-full px-2 py-1 text-sm border rounded ${item.isFromSalesOrder ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                                                }`}
                                        />
                                    </td>
                                    <td className="px-3 py-2 border-r">
                                        <input
                                            type="text"
                                            value={item.itemName}
                                            readOnly
                                            className="w-full px-2 py-1 text-sm bg-gray-50 border-0 cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border-r">
                                        <input
                                            type="text"
                                            value={item.hsnSac}
                                            readOnly
                                            className="w-full px-2 py-1 text-sm bg-gray-50 border-0 cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border-r">
                                        <input
                                            type="text"
                                            value={item.uqc}
                                            readOnly
                                            className="w-full px-2 py-1 text-sm bg-gray-50 border-0 cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border-r">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item.id, parseFloat(e.target.value) || 0)}
                                            className="w-20 px-2 py-1 text-sm border rounded text-right"
                                            min="0"
                                            max={item.maxQuantity}
                                        />
                                    </td>
                                    <td className="px-3 py-2 border-r">
                                        <input
                                            type="number"
                                            value={item.itemRate.toFixed(2)}
                                            readOnly
                                            className="w-24 px-2 py-1 text-sm bg-gray-50 border-0 cursor-not-allowed text-right"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border-r">
                                        <input
                                            type="text"
                                            value={item.taxableValue.toFixed(2)}
                                            readOnly
                                            className="w-28 px-2 py-1 text-sm bg-gray-50 border-0 cursor-not-allowed text-right font-semibold"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border-r">
                                        <input
                                            type="text"
                                            value={item.cgst.toFixed(2)}
                                            readOnly
                                            className="w-24 px-2 py-1 text-sm bg-gray-50 border-0 cursor-not-allowed text-right"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border-r">
                                        <input
                                            type="text"
                                            value={item.sgst.toFixed(2)}
                                            readOnly
                                            className="w-24 px-2 py-1 text-sm bg-gray-50 border-0 cursor-not-allowed text-right"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border-r">
                                        <input
                                            type="text"
                                            value={item.igst.toFixed(2)}
                                            readOnly
                                            className="w-24 px-2 py-1 text-sm bg-gray-50 border-0 cursor-not-allowed text-right"
                                        />
                                    </td>
                                    <td className="px-3 py-2 border-r">
                                        <input
                                            type="text"
                                            value={item.cess.toFixed(2)}
                                            readOnly
                                            className="w-24 px-2 py-1 text-sm bg-gray-50 border-0 cursor-not-allowed text-right"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <input
                                            type="text"
                                            value={item.invoiceValue.toFixed(2)}
                                            readOnly
                                            className="w-28 px-2 py-1 text-sm bg-blue-50 border-0 cursor-not-allowed text-right font-bold text-blue-700"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-100 border-t-2">
                            <tr>
                                <td colSpan={9} className="px-3 py-3 text-sm font-bold text-right">Total:</td>
                                <td className="px-3 py-3 text-sm font-bold text-right border-l">{totals.taxableValue.toFixed(2)}</td>
                                <td className="px-3 py-3 text-sm font-bold text-right border-l">{totals.cgst.toFixed(2)}</td>
                                <td className="px-3 py-3 text-sm font-bold text-right border-l">{totals.sgst.toFixed(2)}</td>
                                <td className="px-3 py-3 text-sm font-bold text-right border-l">{totals.igst.toFixed(2)}</td>
                                <td className="px-3 py-3 text-sm font-bold text-right border-l">{totals.cess.toFixed(2)}</td>
                                <td className="px-3 py-3 text-sm font-bold text-right border-l text-blue-700">{totals.invoiceValue.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleAddNewItem}
                    className="btn-secondary"
                >
                    <Icon name="plus" className="w-4 h-4 mr-1" />
                    Add Item
                </button>
                <button
                    onClick={handleDeleteItems}
                    disabled={selectedItemIds.size === 0}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    <Icon name="trash" className="w-4 h-4 mr-1" />
                    Delete Selected ({selectedItemIds.size})
                </button>
            </div>

            {/* Sales Ledger and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                    <label className="form-label">Sales Ledger *</label>
                    <select
                        value={salesLedger}
                        onChange={(e) => setSalesLedger(e.target.value)}
                        className="form-input"
                    >
                        <option value="">Select Sales Ledger</option>
                        {salesLedgers.map(ledger => (
                            <option key={ledger.id} value={ledger.id}>
                                {ledger.name}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Only Income group ledgers</p>
                </div>

                <div>
                    <label className="form-label">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => {
                            if (e.target.value.length <= 200) {
                                setDescription(e.target.value);
                            }
                        }}
                        className="form-input resize-none"
                        rows={3}
                        maxLength={200}
                        placeholder="Enter description (max 200 characters)"
                    />
                    <p className="text-xs text-gray-500 mt-1">{description.length}/200 characters</p>
                </div>
            </div>
        </div>
    );

    // Payment Details Tab State
    const [paymentTerms, setPaymentTerms] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [modeOfPayment, setModeOfPayment] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [branchName, setBranchName] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [transactionDate, setTransactionDate] = useState('');
    const [chequeNumber, setChequeNumber] = useState('');
    const [chequeDate, setChequeDate] = useState('');
    const [termsAndConditions, setTermsAndConditions] = useState('');

    const renderPaymentTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Terms</h3>

                    <div>
                        <label className="form-label">Payment Terms</label>
                        <select
                            value={paymentTerms}
                            onChange={(e) => setPaymentTerms(e.target.value)}
                            className="form-input"
                        >
                            <option value="">Select Payment Terms</option>
                            <option value="immediate">Immediate</option>
                            <option value="net_15">Net 15 Days</option>
                            <option value="net_30">Net 30 Days</option>
                            <option value="net_45">Net 45 Days</option>
                            <option value="net_60">Net 60 Days</option>
                            <option value="net_90">Net 90 Days</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div>
                        <label className="form-label">Mode of Payment</label>
                        <select
                            value={modeOfPayment}
                            onChange={(e) => setModeOfPayment(e.target.value)}
                            className="form-input"
                        >
                            <option value="">Select Mode</option>
                            <option value="cash">Cash</option>
                            <option value="cheque">Cheque</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="upi">UPI</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="debit_card">Debit Card</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Bank Details Section */}
                    <div className="pt-4 border-t">
                        <h4 className="text-md font-semibold text-gray-700 mb-3">Bank Details</h4>

                        <div className="space-y-3">
                            <div>
                                <label className="form-label">Bank Name</label>
                                <input
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    className="form-input"
                                    placeholder="Enter bank name"
                                />
                            </div>

                            <div>
                                <label className="form-label">Account Number</label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="form-input"
                                    placeholder="Enter account number"
                                />
                            </div>

                            <div>
                                <label className="form-label">IFSC Code</label>
                                <input
                                    type="text"
                                    value={ifscCode}
                                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                                    className="form-input"
                                    placeholder="Enter IFSC code"
                                    maxLength={11}
                                />
                            </div>

                            <div>
                                <label className="form-label">Branch Name</label>
                                <input
                                    type="text"
                                    value={branchName}
                                    onChange={(e) => setBranchName(e.target.value)}
                                    className="form-input"
                                    placeholder="Enter branch name"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction Details</h3>

                    {modeOfPayment === 'bank_transfer' || modeOfPayment === 'upi' ? (
                        <>
                            <div>
                                <label className="form-label">Transaction ID</label>
                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    className="form-input"
                                    placeholder="Enter transaction ID"
                                />
                            </div>

                            <div>
                                <label className="form-label">Transaction Date</label>
                                <input
                                    type="date"
                                    value={transactionDate}
                                    onChange={(e) => setTransactionDate(e.target.value)}
                                    className="form-input"
                                    max={getTodayDate()}
                                />
                            </div>
                        </>
                    ) : null}

                    {modeOfPayment === 'cheque' ? (
                        <>
                            <div>
                                <label className="form-label">Cheque Number</label>
                                <input
                                    type="text"
                                    value={chequeNumber}
                                    onChange={(e) => setChequeNumber(e.target.value)}
                                    className="form-input"
                                    placeholder="Enter cheque number"
                                />
                            </div>

                            <div>
                                <label className="form-label">Cheque Date</label>
                                <input
                                    type="date"
                                    value={chequeDate}
                                    onChange={(e) => setChequeDate(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </>
                    ) : null}

                    {/* Terms and Conditions */}
                    <div className="pt-4 border-t">
                        <h4 className="text-md font-semibold text-gray-700 mb-3">Terms & Conditions</h4>
                        <textarea
                            value={termsAndConditions}
                            onChange={(e) => setTermsAndConditions(e.target.value)}
                            className="form-input resize-none"
                            rows={8}
                            placeholder="Enter terms and conditions for this invoice..."
                        />
                    </div>
                </div>
            </div>

            {/* Summary Section */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-md font-semibold text-blue-900 mb-3">Payment Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-gray-600">Total Amount</p>
                        <p className="text-lg font-bold text-gray-900">₹{totals.invoiceValue.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Payment Terms</p>
                        <p className="text-sm font-semibold text-gray-800">{paymentTerms || 'Not Set'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Due Date</p>
                        <p className="text-sm font-semibold text-gray-800">{dueDate || 'Not Set'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Payment Mode</p>
                        <p className="text-sm font-semibold text-gray-800">{modeOfPayment || 'Not Set'}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Dispatch Details Tab State
    const [transporterName, setTransporterName] = useState('');
    const [transporterId, setTransporterId] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [driverName, setDriverName] = useState('');
    const [driverContact, setDriverContact] = useState('');
    const [lrNumber, setLrNumber] = useState('');
    const [lrDate, setLrDate] = useState('');
    const [dispatchDate, setDispatchDate] = useState('');
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [dispatchRemarks, setDispatchRemarks] = useState('');

    const renderDispatchTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Transporter Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Transporter Details</h3>

                    <div>
                        <label className="form-label">Transporter Name</label>
                        <input
                            type="text"
                            value={transporterName}
                            onChange={(e) => setTransporterName(e.target.value)}
                            className="form-input"
                            placeholder="Enter transporter name"
                        />
                    </div>

                    <div>
                        <label className="form-label">Transporter ID</label>
                        <input
                            type="text"
                            value={transporterId}
                            onChange={(e) => setTransporterId(e.target.value)}
                            className="form-input"
                            placeholder="Enter transporter ID"
                        />
                    </div>

                    <div>
                        <label className="form-label">Vehicle Number</label>
                        <input
                            type="text"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                            className="form-input"
                            placeholder="e.g., MH12AB1234"
                        />
                    </div>

                    <div>
                        <label className="form-label">Driver Name</label>
                        <input
                            type="text"
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            className="form-input"
                            placeholder="Enter driver name"
                        />
                    </div>

                    <div>
                        <label className="form-label">Driver Contact</label>
                        <input
                            type="tel"
                            value={driverContact}
                            onChange={(e) => setDriverContact(e.target.value)}
                            className="form-input"
                            placeholder="Enter contact number"
                            maxLength={10}
                        />
                    </div>
                </div>

                {/* Right Column - Shipping Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Details</h3>

                    <div>
                        <label className="form-label">LR Number</label>
                        <input
                            type="text"
                            value={lrNumber}
                            onChange={(e) => setLrNumber(e.target.value)}
                            className="form-input"
                            placeholder="Lorry Receipt Number"
                        />
                    </div>

                    <div>
                        <label className="form-label">LR Date</label>
                        <input
                            type="date"
                            value={lrDate}
                            onChange={(e) => setLrDate(e.target.value)}
                            className="form-input"
                            max={getTodayDate()}
                        />
                    </div>

                    <div>
                        <label className="form-label">Dispatch Date</label>
                        <input
                            type="date"
                            value={dispatchDate}
                            onChange={(e) => setDispatchDate(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div>
                        <label className="form-label">Expected Delivery Date</label>
                        <input
                            type="date"
                            value={expectedDeliveryDate}
                            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                            className="form-input"
                            min={dispatchDate || getTodayDate()}
                        />
                    </div>

                    <div>
                        <label className="form-label">Shipping Address</label>
                        <textarea
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            className="form-input resize-none"
                            rows={4}
                            placeholder="Enter complete shipping address"
                        />
                    </div>
                </div>
            </div>

            {/* Dispatch Remarks */}
            <div>
                <label className="form-label">Dispatch Remarks</label>
                <textarea
                    value={dispatchRemarks}
                    onChange={(e) => setDispatchRemarks(e.target.value)}
                    className="form-input resize-none"
                    rows={3}
                    placeholder="Any special instructions or remarks for dispatch..."
                />
            </div>

            {/* Dispatch Summary */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-md font-semibold text-green-900 mb-3">Dispatch Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-gray-600">Transporter</p>
                        <p className="text-sm font-semibold text-gray-800">{transporterName || 'Not Set'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Vehicle Number</p>
                        <p className="text-sm font-semibold text-gray-800">{vehicleNumber || 'Not Set'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Dispatch Date</p>
                        <p className="text-sm font-semibold text-gray-800">{dispatchDate || 'Not Set'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Expected Delivery</p>
                        <p className="text-sm font-semibold text-gray-800">{expectedDeliveryDate || 'Not Set'}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // E-Invoice & E-way Bill Tab State
    const [eInvoiceEnabled, setEInvoiceEnabled] = useState(false);
    const [irn, setIrn] = useState('');
    const [ackNo, setAckNo] = useState('');
    const [ackDate, setAckDate] = useState('');
    const [eInvoiceQrCode, setEInvoiceQrCode] = useState('');
    const [eWayBillEnabled, setEWayBillEnabled] = useState(false);
    const [eWayBillNo, setEWayBillNo] = useState('');
    const [eWayBillDate, setEWayBillDate] = useState('');
    const [eWayBillValidUpto, setEWayBillValidUpto] = useState('');
    const [distance, setDistance] = useState('');
    const [transportMode, setTransportMode] = useState('');
    const [vehicleType, setVehicleType] = useState('');



    const renderEInvoiceTab = () => (
        <div className="max-w-4xl mx-auto space-y-8 py-6">
            {/* E-Invoice Details Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">E-Invoice Details</h3>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={eInvoiceEnabled}
                            onChange={(e) => setEInvoiceEnabled(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Enable E-Invoice</span>
                    </label>
                </div>

                <div className="text-center py-12">
                    <p className="text-gray-600 text-base">
                        Enable E-Invoice to generate IRN and QR code
                    </p>
                </div>
            </div>

            {/* E-Way Bill Details Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">E-Way Bill Details</h3>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={eWayBillEnabled}
                            onChange={(e) => setEWayBillEnabled(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Enable E-Way Bill</span>
                    </label>
                </div>

                <div className="text-center py-12">
                    <p className="text-gray-600 text-base">
                        Enable E-Way Bill for goods transportation
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Required for consignments above ₹50,000
                    </p>
                </div>
            </div>

            {/* Important Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 0 11-2 0 1 1 0 012 0zm-1-8a1 0 00-1 1v3a1 0 002 0V6a1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <h4 className="text-base font-semibold text-yellow-900 mb-3">Important Information</h4>
                        <ul className="space-y-2 text-sm text-yellow-800">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>E-Invoice is mandatory for businesses with turnover above ₹5 crores</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>E-Way Bill is required for goods movement above ₹50,000</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Both can be generated after saving the voucher</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Ensure all invoice details are correct before generation</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Sales / Receipt Voucher</h2>
                {onClose && (
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <Icon name="x" className="w-6 h-6" />
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {renderTabButtons()}

            <div className="min-h-[500px]">
                {currentTab === 1 && renderInvoiceDetailsTab()}
                {currentTab === 2 && renderItemsTab()}
                {currentTab === 3 && renderPaymentTab()}
                {currentTab === 4 && renderDispatchTab()}
                {currentTab === 5 && renderEInvoiceTab()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
                <button
                    onClick={handlePrevious}
                    disabled={currentTab === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Icon name="chevron-left" className="w-4 h-4 mr-1" />
                    Previous
                </button>

                {currentTab < 5 ? (
                    <button
                        onClick={handleNext}
                        disabled={currentTab === 2 && (isDeleting || selectedItemIds.size > 0)}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                        <Icon name="chevron-right" className="w-4 h-4 ml-1" />
                    </button>
                ) : (
                    <button
                        onClick={() => alert('Save functionality to be implemented')}
                        className="btn-primary"
                    >
                        <Icon name="save" className="w-4 h-4 mr-1" />
                        Save Voucher
                    </button>
                )}
            </div>
        </div>
    );
};

export default SalesVoucher;
