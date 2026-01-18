// Vendor Portal - Master Configuration
import React, { useState, useEffect } from 'react';
import { httpClient } from '../../services/httpClient';
import CategoryHierarchicalDropdown from '../../components/CategoryHierarchicalDropdown';
import { InventoryCategoryWizard } from '../../components/InventoryCategoryWizard';

type VendorTab = 'Master' | 'Transaction' | 'Report';
type MasterSubTab = 'Category' | 'PO Settings' | 'Vendor Creation' | 'Basic Details' | 'GST Details' | 'Products/Services' | 'TDS & Other Statutory' | 'Banking Info' | 'Terms & Conditions';
type TransactionSubTab = 'Purchase Orders' | 'Procurement' | 'Payment';
type POSubTab = 'Dashboard' | 'Create PO' | 'Pending PO' | 'Executed PO';
type CreatePOSubTab = 'Draft PO' | 'Pending for Approval' | 'Mail PO';
type ProcurementSubTab = 'Dashboard' | 'Raw Material' | 'Stock-in Trade' | 'Consumables' | 'Stores & Spares' | 'Services';

// Category Interface (Mirrors Inventory)
interface Category {
    id: number;
    category: string;
    group: string | null;
    subgroup: string | null;
    is_active: boolean;
    full_path: string;
    tenant_id: string;
    created_at: string;
    updated_at: string;
}

// PO Series Interface
interface POSeries {
    id: number;
    name: string;
    category: number; // Category ID
    category_name?: string; // Category name (read-only from API)
    category_path?: string; // Full category path (read-only from API)
    prefix: string;
    suffix: string;
    auto_year: boolean;  // Changed from auto_financial_year
    digits: number;
    current_number: number;  // Changed from current_value
    is_active: boolean;
}

// Vendor Basic Detail Interface
interface VendorBasicDetail {
    id: number;
    tenant_id: string;
    vendor_code: string;
    vendor_name: string;
    pan_no?: string;
    contact_person?: string;
    email: string;
    contact_no: string;
    is_also_customer: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const VendorPortalPage: React.FC = () => {
    // Tab State
    const [activeTab, setActiveTab] = useState<VendorTab>('Master');
    const [activeMasterSubTab, setActiveMasterSubTab] = useState<MasterSubTab>('Category');
    const [activeTransactionSubTab, setActiveTransactionSubTab] = useState<TransactionSubTab>('Purchase Orders');
    const [activePOSubTab, setActivePOSubTab] = useState<POSubTab>('Dashboard');
    const [activeCreatePOSubTab, setActiveCreatePOSubTab] = useState<CreatePOSubTab>('Draft PO');
    const [activeProcurementSubTab, setActiveProcurementSubTab] = useState<ProcurementSubTab>('Dashboard');

    // Category Management State
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isEditModeCategory, setIsEditModeCategory] = useState(false);

    // Category Form State
    const [categoryName, setCategoryName] = useState('');
    const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);
    const [parentCategoryPath, setParentCategoryPath] = useState<string>('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [categorySearchQuery, setCategorySearchQuery] = useState('');

    // PO Settings State
    const [poSeriesList, setPoSeriesList] = useState<POSeries[]>([]);
    const [loadingPOSeries, setLoadingPOSeries] = useState(false);
    const [selectedPOSeries, setSelectedPOSeries] = useState<POSeries | null>(null);
    const [isEditModePO, setIsEditModePO] = useState(false);

    // PO Form Field State
    const [poName, setPoName] = useState('');
    const [poCategoryId, setPoCategoryId] = useState<number | null>(null);
    const [poCategoryPath, setPoCategoryPath] = useState('');
    const [poPrefix, setPoPrefix] = useState('');
    const [poSuffix, setPoSuffix] = useState('');
    const [poAutoYear, setPoAutoYear] = useState(true);
    const [poDigits, setPoDigits] = useState(4);

    // Products/Services State
    interface VendorItem {
        id: number;
        hsnSacCode: string;
        itemCode: string;
        itemName: string;
        supplierItemCode: string;
        supplierItemName: string;
    }

    // Create PO Modal State
    const [showCreatePOModal, setShowCreatePOModal] = useState(false);
    const [createPOForm, setCreatePOForm] = useState({
        poSeriesName: '',
        poNumber: '',
        vendorName: '',
        branch: '',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        emailAddress: '',
        contractNo: '',
        receiveBy: '',
        receiveAt: '',
        deliveryTerms: ''
    });

    // PO Items State
    interface POItem {
        id: number;
        itemCode: string;
        itemName: string;
        supplierItemCode: string;
        quantity: string;
        negotiatedRate: string;
        finalRate: string;
        taxableValue: string;
        gst: string;
        netValue: string;
    }

    const [poItems, setPOItems] = useState<POItem[]>([
        {
            id: 1,
            itemCode: '',
            itemName: '',
            supplierItemCode: '',
            quantity: '',
            negotiatedRate: '',
            finalRate: '',
            taxableValue: '',
            gst: '',
            netValue: ''
        }
    ]);

    // View PO Modal State
    const [showViewPOModal, setShowViewPOModal] = useState(false);
    const [selectedPO, setSelectedPO] = useState<any>(null);
    const [isEditingPO, setIsEditingPO] = useState(false);



    // Purchase Order Data State
    interface PurchaseOrder {
        id: number;
        poNumber: string;
        poDate: string;
        vendorName: string;
        address: string;
        status: 'Draft' | 'Pending Approval' | 'Approved' | 'Mailed' | 'Closed';
    }

    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
        { id: 1, poNumber: 'PO-2023-001', poDate: '2023-10-26', vendorName: 'Tech Solutions Inc.', address: '123 Innovation Dr, Tech City', status: 'Draft' },
        { id: 2, poNumber: 'PO-2023-002', poDate: '2023-10-27', vendorName: 'Global Supplies Ltd.', address: '456 Logistics Way, Port Town', status: 'Pending Approval' },
        { id: 3, poNumber: 'PO-2023-003', poDate: '2023-10-28', vendorName: 'Quality Materials Co.', address: '789 Industrial Park, Mfg Zone', status: 'Approved' },
        { id: 4, poNumber: 'PO-2023-004', poDate: '2023-10-29', vendorName: 'Office Depot', address: '101 Corporate Blvd, Biz Dist', status: 'Mailed' },
        { id: 5, poNumber: 'PO-2023-005', poDate: '2023-10-30', vendorName: 'Fast Track Logistics', address: '222 Speedy Ln, Transit Hub', status: 'Approved' },
        { id: 6, poNumber: 'PO-2023-006', poDate: '2023-10-15', vendorName: 'Old World Imports', address: '88 Antiques Rd, Old Town', status: 'Closed' },
        { id: 7, poNumber: 'PO-2023-007', poDate: '2023-10-18', vendorName: 'Modern Systems', address: '99 Future St, New City', status: 'Closed' },
    ]);

    // PO Item Handlers
    const handleAddPOItem = () => {
        const newItem: POItem = {
            id: poItems.length + 1,
            itemCode: '',
            itemName: '',
            supplierItemCode: '',
            quantity: '',
            negotiatedRate: '',
            finalRate: '',
            taxableValue: '',
            gst: '',
            netValue: ''
        };
        setPOItems([...poItems, newItem]);
    };

    const handleRemovePOItem = (id: number) => {
        if (poItems.length > 1) {
            setPOItems(poItems.filter(item => item.id !== id));
        }
    };

    const handlePOItemChange = (id: number, field: keyof POItem, value: string) => {
        setPOItems(poItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleCreatePOFormChange = (field: string, value: string) => {
        setCreatePOForm({ ...createPOForm, [field]: value });
    };

    const handleSubmitPO = async () => {
        try {
            console.log('=== Creating Purchase Order ===');
            console.log('PO Form:', createPOForm);
            console.log('PO Items:', poItems);

            // Prepare items data
            const items = poItems.map(item => ({
                item_code: item.itemCode,
                item_name: item.itemName,
                supplier_item_code: item.supplierItemCode,
                quantity: parseFloat(item.quantity) || 0,
                uom: 'PCS', // Default unit, can be made dynamic
                negotiated_rate: parseFloat(item.negotiatedRate) || 0,
                final_rate: parseFloat(item.finalRate) || 0,
                taxable_value: parseFloat(item.taxableValue) || 0,
                gst_rate: parseFloat(item.gst) || 0,
                gst_amount: (parseFloat(item.taxableValue) || 0) * (parseFloat(item.gst) || 0) / 100,
                invoice_value: parseFloat(item.netValue) || 0
            }));

            // Prepare PO payload
            const payload = {
                po_series_id: createPOForm.poSeriesName ? parseInt(createPOForm.poSeriesName) : null,
                vendor_id: createPOForm.vendorName ? parseInt(createPOForm.vendorName) : null,
                vendor_name: createPOForm.vendorName,
                branch: createPOForm.branch,
                address_line1: createPOForm.addressLine1,
                address_line2: createPOForm.addressLine2,
                address_line3: createPOForm.addressLine3,
                city: createPOForm.city,
                state: createPOForm.state,
                country: createPOForm.country,
                pincode: createPOForm.pincode,
                email_address: createPOForm.emailAddress,
                contract_no: createPOForm.contractNo,
                receive_by: createPOForm.receiveBy || null,
                receive_at: createPOForm.receiveAt,
                delivery_terms: createPOForm.deliveryTerms,
                items: items
            };

            console.log('Payload:', payload);

            // Send to API
            const response = await httpClient.post('/api/vendors/purchase-orders/', payload);

            console.log('✅ PO created successfully:', response);

            const poNumber = (response as any)?.data?.data?.po_number || (response as any)?.data?.po_number || 'Generated';
            alert(`Purchase Order created successfully! PO Number: ${poNumber}`);


            // Reset form
            setCreatePOForm({
                poSeriesName: '',
                poNumber: '',
                vendorName: '',
                branch: '',
                addressLine1: '',
                addressLine2: '',
                addressLine3: '',
                city: '',
                state: '',
                country: '',
                pincode: '',
                emailAddress: '',
                contractNo: '',
                receiveBy: '',
                receiveAt: '',
                deliveryTerms: ''
            });

            setPOItems([{
                id: 1,
                itemCode: '',
                itemName: '',
                supplierItemCode: '',
                quantity: '',
                negotiatedRate: '',
                finalRate: '',
                taxableValue: '',
                gst: '',
                netValue: ''
            }]);

            setShowCreatePOModal(false);

        } catch (error: any) {
            console.error('❌ Error creating PO:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.errors || error.message || 'Error creating Purchase Order';
            alert(`Error: ${JSON.stringify(errorMessage)}`);
        }
    };

    const handleViewPO = (po: any) => {
        setSelectedPO(po);
        setShowViewPOModal(true);
        setIsEditingPO(false);
    };

    const handleEditPODetails = () => {
        setIsEditingPO(true);
    };

    const handleSavePODetails = () => {
        // Handle save logic here
        console.log('Saving PO:', selectedPO);
        setIsEditingPO(false);
        // In real implementation, you would call an API to save the changes
    };

    const handleCancelEditPO = () => {
        setIsEditingPO(false);
        // Optionally reload the original PO data here
    };


    // Banking Information State
    interface BankAccount {
        id: number;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
        branchName: string;
        swiftCode: string;
        vendorBranch: string;
        accountType: 'Savings' | 'Current';
    }

    // Procurement Aging Data Interface
    interface ProcurementItem {
        id: number;
        vendorCode: string;
        vendorName: string;
        amount: string;
        status: 'Pending' | 'Paid' | 'Overdue';
    }

    interface AgingBucket {
        id: string;
        label: string;
        items: ProcurementItem[];
    }

    // Ledger Entry Interface
    interface LedgerEntry {
        id: number;
        date: string;
        takenFrom: 'Purchase' | 'Payment' | 'Sales' | 'Receipt';
        ledger: string;
        status: 'Paid' | 'Unpaid' | 'Partially Paid';
        debit: number;
        credit: number;
        runningBalance: number;
    }

    const [expandedAgingBucket, setExpandedAgingBucket] = useState<string | null>('0-90');
    const [selectedProcurementVendor, setSelectedProcurementVendor] = useState<ProcurementItem | null>(null);
    const [isMonthView, setIsMonthView] = useState(false);

    // Mock Ledger Data (filtered by vendor in real app)
    const mockLedgerEntries: LedgerEntry[] = [
        { id: 1, date: '2023-10-28', takenFrom: 'Purchase', ledger: 'Purchase A/c', status: 'Unpaid', debit: 45000, credit: 0, runningBalance: 45000 },
        { id: 2, date: '2023-10-25', takenFrom: 'Payment', ledger: 'HDFC Bank', status: 'Paid', debit: 0, credit: 15000, runningBalance: 30000 },
        { id: 3, date: '2023-10-20', takenFrom: 'Purchase', ledger: 'Purchase A/c', status: 'Partially Paid', debit: 12000, credit: 0, runningBalance: 42000 },
        { id: 4, date: '2023-10-15', takenFrom: 'Receipt', ledger: 'Cash', status: 'Paid', debit: 0, credit: 5000, runningBalance: 37000 },
        { id: 5, date: '2023-10-10', takenFrom: 'Sales', ledger: 'Sales A/c', status: 'Paid', debit: 0, credit: 2000, runningBalance: 35000 },
    ].map(item => ({
        ...item,
        takenFrom: item.takenFrom as LedgerEntry['takenFrom'],
        status: item.status as LedgerEntry['status']
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const mockMonthlySummary = [
        { month: 'January', debit: 10000, credit: 5000, closingBalance: 5000 },
        { month: 'February', debit: 20000, credit: 15000, closingBalance: 10000 },
        { month: 'March', debit: 15000, credit: 20000, closingBalance: 5000 },
        { month: 'April', debit: 0, credit: 0, closingBalance: 5000 },
        { month: 'May', debit: 5000, credit: 0, closingBalance: 10000 },
        { month: 'June', debit: 0, credit: 0, closingBalance: 10000 },
        { month: 'July', debit: 30000, credit: 10000, closingBalance: 30000 },
        { month: 'August', debit: 0, credit: 0, closingBalance: 30000 },
        { month: 'September', debit: 12000, credit: 12000, closingBalance: 30000 },
        { month: 'October', debit: 57000, credit: 22000, closingBalance: 65000 },
        { month: 'November', debit: 0, credit: 0, closingBalance: 65000 },
        { month: 'December', debit: 0, credit: 0, closingBalance: 65000 },
    ];

    const procurementAgingData: AgingBucket[] = [
        {
            id: '0-90',
            label: '0 - 90 days',
            items: [
                { id: 1, vendorCode: 'VEN-001', vendorName: 'Alpha Raw Materials', amount: '₹ 45,000', status: 'Pending' },
                { id: 2, vendorCode: 'VEN-005', vendorName: 'Beta Supplies', amount: '₹ 12,500', status: 'Pending' },
                { id: 3, vendorCode: 'VEN-012', vendorName: 'Gamma Corp', amount: '₹ 78,000', status: 'Overdue' },
            ]
        },
        {
            id: '90-180',
            label: '90 days - 6 months',
            items: [
                { id: 4, vendorCode: 'VEN-003', vendorName: 'Delta Industries', amount: '₹ 1,20,000', status: 'Pending' },
            ]
        },
        { id: '180-365', label: '6 months - 1 year', items: [] },
        { id: '1y-2y', label: '1 year - 2 years', items: [] },
        { id: '2y+', label: 'More than 2 years', items: [] },
    ];

    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
        { id: 1, accountNumber: '', bankName: '', ifscCode: '', branchName: '', swiftCode: '', vendorBranch: '', accountType: 'Savings' }
    ]);

    const handleAddBank = () => {
        const newBank: BankAccount = {
            id: bankAccounts.length + 1,
            accountNumber: '',
            bankName: '',
            ifscCode: '',
            branchName: '',
            swiftCode: '',
            vendorBranch: '',
            accountType: 'Savings'
        };
        setBankAccounts([...bankAccounts, newBank]);
    };

    // Remove bank account
    const handleRemoveBank = (id: number) => {
        if (bankAccounts.length > 1) {
            setBankAccounts(bankAccounts.filter(bank => bank.id !== id));
        }
    };

    // Update bank field
    const handleBankChange = (id: number, field: keyof BankAccount, value: string) => {
        setBankAccounts(bankAccounts.map(bank =>
            bank.id === id ? { ...bank, [field]: value } : bank
        ));
    };


    // Vendor Basic Details State
    const [vendorCode, setVendorCode] = useState('');
    const [vendorName, setVendorName] = useState('');
    const [panNo, setPanNo] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [vendorEmail, setVendorEmail] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [isAlsoCustomer, setIsAlsoCustomer] = useState(false);

    // Handle Basic Details Form Submit
    const handleBasicDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('=== Basic Details Form Submit ===');
        console.log('Vendor Name:', vendorName);
        console.log('Email:', vendorEmail);
        console.log('Contact No:', contactNo);

        // Validation
        if (!vendorName || !vendorEmail || !contactNo) {
            alert('Please fill in all required fields (Vendor Name, Email, Contact No)');
            return;
        }

        const payload = {
            vendor_code: vendorCode || undefined, // Optional, will be auto-generated if empty
            vendor_name: vendorName,
            pan_no: panNo || undefined,
            contact_person: contactPerson || undefined,
            email: vendorEmail,
            contact_no: contactNo,
            is_also_customer: isAlsoCustomer
        };

        console.log('Payload:', payload);

        try {
            const response: VendorBasicDetail = await httpClient.post('/api/vendors/basic-details/', payload);
            console.log('✅ Vendor created successfully:', response);

            setCreatedVendorId(response.id); // Save ID for next steps
            alert(`Vendor created successfully! Vendor Code: ${response.vendor_code}\nNow please fill GST Details.`);

            // Switch to GST Details tab automatically
            setActiveMasterSubTab('GST Details');

            // Reset form
            setVendorCode('');
            setVendorName('');
            setPanNo('');
            setContactPerson('');
            setVendorEmail('');
            setContactNo('');
            setIsAlsoCustomer(false);

        } catch (error: any) {
            console.error('❌ Error creating vendor:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error creating vendor';
            alert(errorMessage);
        }
    };


    // Vendor GST Details State
    const [gstin, setGstin] = useState('');
    const [gstRegistrationType, setGstRegistrationType] = useState('regular');
    const [legalName, setLegalName] = useState('');
    const [tradeName, setTradeName] = useState('');
    const [createdVendorId, setCreatedVendorId] = useState<number | null>(() => {
        const saved = localStorage.getItem('currentVendorId');
        return saved ? parseInt(saved) : null;
    });

    // Persist vendor ID
    useEffect(() => {
        if (createdVendorId) {
            localStorage.setItem('currentVendorId', createdVendorId.toString());
        }
    }, [createdVendorId]);

    // TDS & Other Statutory Details State
    const [msmeUdyamNo, setMsmeUdyamNo] = useState('');
    const [fssaiLicenseNo, setFssaiLicenseNo] = useState('');
    const [importExportCode, setImportExportCode] = useState('');
    const [eouStatus, setEouStatus] = useState('');
    const [tdsSectionApplicable, setTdsSectionApplicable] = useState('');
    const [enableAutomaticTdsPosting, setEnableAutomaticTdsPosting] = useState(false);

    // Handle TDS Details Form Submit
    const handleTDSDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('=== TDS Details Form Submit ===');

        if (!createdVendorId) {
            alert('Please complete Basic Details first to create the vendor.');
            return;
        }

        const payload = {
            vendor_basic_detail: createdVendorId,
            tds_section_applicable: tdsSectionApplicable || undefined,
            enable_automatic_tds_posting: enableAutomaticTdsPosting,
            msme_udyam_no: msmeUdyamNo || undefined,
            fssai_license_no: fssaiLicenseNo || undefined,
            import_export_code: importExportCode || undefined,
            eou_status: eouStatus || undefined
        };

        console.log('TDS Payload:', payload);

        try {
            const response = await httpClient.post('/api/vendors/tds-details/', payload);
            console.log('✅ TDS details saved:', response);
            alert('TDS Details saved successfully!');

            // Move to next tab or reset
            setMsmeUdyamNo('');
            setFssaiLicenseNo('');
            setImportExportCode('');
            setEouStatus('');
            setTdsSectionApplicable('');
            setEnableAutomaticTdsPosting(false);

            // Move to next tab
            setActiveMasterSubTab('Banking Info');

        } catch (error: any) {
            console.error('❌ Error saving TDS details:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error saving TDS details';
            alert(errorMessage);
        }
    };


    // Handle Banking Details Submit
    const handleBankingDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('=== Banking Details Submit ===');

        if (!createdVendorId) {
            alert('Please complete Basic Details first to create the vendor.');
            return;
        }

        const payload = bankAccounts.map(bank => ({
            vendor_basic_detail: createdVendorId,
            bank_account_no: bank.accountNumber,
            bank_name: bank.bankName,
            ifsc_code: bank.ifscCode,
            branch_name: bank.branchName,
            swift_code: bank.swiftCode,
            vendor_branch: bank.vendorBranch,
            account_type: bank.accountType.toLowerCase().replace(' ', '_'),
            is_active: true
        }));

        try {
            const response = await httpClient.post('/api/vendors/banking-details/', payload);
            console.log('✅ Banking details saved:', response);
            alert('Banking Details saved successfully!');
            setActiveMasterSubTab('Terms & Conditions');
        } catch (error: any) {
            console.error('❌ Error saving Banking details:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error saving Banking details';
            alert(errorMessage);
        }
    };

    // Terms & Conditions State
    const [creditLimit, setCreditLimit] = useState('');
    const [creditPeriod, setCreditPeriod] = useState('');
    const [creditTerms, setCreditTerms] = useState('');
    const [penaltyTerms, setPenaltyTerms] = useState('');
    const [deliveryTerms, setDeliveryTerms] = useState('');
    const [warrantyGuaranteeDetails, setWarrantyGuaranteeDetails] = useState('');
    const [forceMajeure, setForceMajeure] = useState('');
    const [disputeRedressalTerms, setDisputeRedressalTerms] = useState('');

    // Handle Terms & Conditions Submit
    const handleTermsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('=== Terms & Conditions Submit ===');

        if (!createdVendorId) {
            alert('Please complete Basic Details first to create the vendor.');
            return;
        }

        const payload = {
            vendor_basic_detail: createdVendorId,
            credit_limit: creditLimit ? parseFloat(creditLimit) : undefined,
            credit_period: creditPeriod || undefined,
            credit_terms: creditTerms || undefined,
            penalty_terms: penaltyTerms || undefined,
            delivery_terms: deliveryTerms || undefined,
            warranty_guarantee_details: warrantyGuaranteeDetails || undefined,
            force_majeure: forceMajeure || undefined,
            dispute_redressal_terms: disputeRedressalTerms || undefined
        };

        try {
            const response = await httpClient.post('/api/vendors/terms/', payload);
            console.log('✅ Terms & Conditions saved:', response);
            alert('Vendor onboarded successfully! All details have been saved.');

            // Reset form
            setCreditLimit('');
            setCreditPeriod('');
            setCreditTerms('');
            setPenaltyTerms('');
            setDeliveryTerms('');
            setWarrantyGuaranteeDetails('');
            setForceMajeure('');
            setDisputeRedressalTerms('');

            // Clear vendor ID from localStorage
            localStorage.removeItem('currentVendorId');
            setCreatedVendorId(null);

            // Optionally redirect to vendor list or reset to Basic Details tab
            setActiveMasterSubTab('Basic Details');

        } catch (error: any) {
            console.error('❌ Error saving Terms & Conditions:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error saving Terms & Conditions';
            alert(errorMessage);
        }
    };

    // Product Services State
    interface ProductServiceItem {
        id: number;
        hsnSacCode: string;
        itemCode: string;
        itemName: string;
        supplierItemCode: string;
        supplierItemName: string;
    }

    const [items, setItems] = useState<ProductServiceItem[]>([
        { id: 1, hsnSacCode: '', itemCode: '', itemName: '', supplierItemCode: '', supplierItemName: '' },
        { id: 2, hsnSacCode: '', itemCode: '', itemName: '', supplierItemCode: '', supplierItemName: '' },
    ]);

    const handleAddItem = () => {
        setItems([...items, {
            id: items.length + 1,
            hsnSacCode: '',
            itemCode: '',
            itemName: '',
            supplierItemCode: '',
            supplierItemName: ''
        }]);
    };

    const handleRemoveItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleItemChange = (id: number, field: keyof ProductServiceItem, value: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    // Update createdVendorId when basic details are saved
    useEffect(() => {
        // This is where you'd normally persist the vendor ID if moving between tabs
        // For now we rely on the user completing the flow sequentially
    }, []);

    // Handle GST Details Form Submit
    const handleGSTDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('=== GST Details Form Submit ===');

        if (!gstin) {
            alert('GSTIN is required');
            return;
        }

        // Basic validation logic... we'll assume we have the vendor ID from previous step
        // For this demo, we'll need to know which vendor we're attaching this to.
        // In a real flow, the basic details response would provide the ID.

        // Since we don't have the vendor ID stored in a convenient way yet, let's assume 
        // we're attaching to the most recently created one or fail gracefully.
        // For now, let's just create the record without a link if ID is missing (for testing)
        // or prompt the user.

        // However, the backend requires a vendor_basic_detail link (optional in generic create but logic might require it)
        // Let's rely on the user having just created a vendor.

        const payload = {
            vendor_basic_detail: createdVendorId, // Might be null if refreshed
            gstin: gstin,
            gst_registration_type: gstRegistrationType,
            legal_name: legalName,
            trade_name: tradeName
        };

        try {
            const response = await httpClient.post('/api/vendors/gst-details/', payload);
            console.log('✅ GST details saved:', response);
            alert('GST Details saved successfully!');

            // Move to next tab or reset
            setGstin('');
            setLegalName('');
            setTradeName('');
            setGstRegistrationType('regular');

        } catch (error: any) {
            console.error('❌ Error saving GST details:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error saving GST details';
            alert(errorMessage);
        }
    };

    // Handle Product Services Submit
    const handleProductServicesSubmit = async () => {
        console.log('=== Product Services Submit ===');

        if (!createdVendorId) {
            alert('Please complete Basic Details first to create the vendor.');
            return;
        }

        if (items.length === 0) {
            alert('Please add at least one item.');
            return;
        }

        // Validate items
        const invalidItems = items.filter(item => !item.itemName || !item.itemName.trim());
        if (invalidItems.length > 0) {
            alert('Item Name is required for all items.');
            return;
        }

        // Prepare payload
        const payload = items.map(item => ({
            vendor_basic_detail: createdVendorId,
            hsn_sac_code: item.hsnSacCode,
            item_code: item.itemCode,
            item_name: item.itemName,
            supplier_item_code: item.supplierItemCode,
            supplier_item_name: item.supplierItemName,
            is_active: true
        }));

        try {
            const response = await httpClient.post('/api/vendors/product-services/', payload);
            console.log('✅ Product Services saved:', response);
            alert('Product/Services saved successfully!');
            setActiveMasterSubTab('Banking Info'); // Move to next tab
        } catch (error: any) {
            console.error('❌ Error saving Product Services:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error saving Product Services';
            alert(errorMessage);
        }
    };


    // Category Management Handlers
    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await httpClient.get('/api/inventory/master-categories/');
            setCategories(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryName) {
            alert('Category name is required');
            return;
        }

        const payload = {
            category: categoryName,
            group: parentCategoryPath || null,
            subgroup: categoryDescription || null,
            is_active: true
        };

        try {
            if (isEditModeCategory && selectedCategory) {
                await httpClient.put(`/api/inventory/master-categories/${selectedCategory.id}/`, payload);
                alert('Category updated successfully!');
            } else {
                await httpClient.post('/api/inventory/master-categories/', payload);
                alert('Category created successfully!');
            }
            fetchCategories();
            resetCategoryForm();
        } catch (error: any) {
            console.error('Error saving category:', error);
            alert(error.response?.data?.error || 'Error saving category');
        }
    };

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setCategoryName(category.category);
        setParentCategoryPath(category.group || '');
        setCategoryDescription(category.subgroup || '');
        setIsEditModeCategory(true);
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await httpClient.delete(`/api/inventory/master-categories/${id}/`);
            alert('Category deleted successfully!');
            fetchCategories();
        } catch (error: any) {
            console.error('Error deleting category:', error);
            alert(error.response?.data?.error || 'Error deleting category');
        }
    };

    const resetCategoryForm = () => {
        setCategoryName('');
        setParentCategoryId(null);
        setParentCategoryPath('');
        setCategoryDescription('');
        setIsEditModeCategory(false);
        setSelectedCategory(null);
    };

    // Fetch PO Series
    const fetchPOSeries = async () => {
        try {
            setLoadingPOSeries(true);
            const response = await httpClient.get('/api/vendors/po-settings/');
            // httpClient.get() returns the data directly, not wrapped in .data
            setPoSeriesList(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching PO Series:', error);
            setPoSeriesList([]);
        } finally {
            setLoadingPOSeries(false);
        }
    };

    // Load on tab switch
    useEffect(() => {
        if (activeTab === 'Master' && activeMasterSubTab === 'Category') {
            fetchCategories();
        } else if (activeTab === 'Master' && activeMasterSubTab === 'PO Settings') {
            fetchPOSeries();
        }
    }, [activeTab, activeMasterSubTab]);

    // Derived Preview
    const getPreview = () => {
        const yearPart = poAutoYear ? '/2024' : ''; // Mock year
        const numPart = '0'.repeat(Math.max(0, poDigits - 1)) + '1';
        return `${poPrefix}${yearPart}${poSuffix}/${numPart}`;
    };

    // Handle PO Submit
    const handlePOSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!poCategoryId) {
            alert('Please select a category');
            return;
        }

        const payload = {
            name: poName,
            category: poCategoryId,
            prefix: poPrefix,
            suffix: poSuffix,
            auto_year: poAutoYear,
            digits: poDigits,
            is_active: true
        };

        try {
            if (isEditModePO && selectedPOSeries) {
                await httpClient.put(`/api/vendors/po-settings/${selectedPOSeries.id}/`, payload);
            } else {
                await httpClient.post('/api/vendors/po-settings/', payload);
            }
            fetchPOSeries();
            resetPOForm();
        } catch (error: any) {
            console.error('Error saving PO Series:', error);
            alert(error.response?.data?.error || 'Error saving PO Series');
        }
    };

    const handleDeletePO = async (id: number) => {
        if (!confirm('Are you sure you want to delete this series?')) return;
        try {
            await httpClient.delete(`/api/vendors/po-settings/${id}/`);
            fetchPOSeries();
        } catch (error) {
            console.error('Error deleting PO Series:', error);
        }
    };

    const handleEditPO = (series: POSeries) => {
        setSelectedPOSeries(series);
        setPoName(series.name);
        setPoCategoryId(series.category);
        setPoCategoryPath(series.category_path || '');
        setPoPrefix(series.prefix);
        setPoSuffix(series.suffix);
        setPoAutoYear(series.auto_year);
        setPoDigits(series.digits);
        setIsEditModePO(true);
    };

    const resetPOForm = () => {
        setPoName('');
        setPoCategoryId(null);
        setPoCategoryPath('');
        setPoPrefix('');
        setPoSuffix('');
        setPoAutoYear(true);
        setPoDigits(4);
        setIsEditModePO(false);
        setSelectedPOSeries(null);
    };

    return (
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
            <div className="px-8 py-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Vendor Portal</h2>

                {/* Main Tabs */}
                <div className="mb-6">
                    <nav className="flex space-x-8 border-b border-gray-200" aria-label="Vendor Portal Tabs">
                        {['Master', 'Transaction', 'Report'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as VendorTab)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {activeTab === 'Master' && (
                        <div>
                            {/* Sub-tabs */}
                            <div className="mb-6">
                                <nav className="flex space-x-8 border-b border-gray-200">
                                    {['Category', 'PO Settings', 'Vendor Creation'].map((subTab) => (
                                        <button
                                            key={subTab}
                                            onClick={() => setActiveMasterSubTab(subTab as MasterSubTab)}
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeMasterSubTab === subTab
                                                ? 'border-teal-500 text-teal-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            {subTab}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="bg-white rounded-lg shadow p-0 overflow-hidden">

                                {activeMasterSubTab === 'Category' && (
                                    <InventoryCategoryWizard
                                        apiEndpoint="/api/vendors/categories/"
                                        onCreateCategory={async (data) => {
                                            try {
                                                await httpClient.post('/api/vendors/categories/', {
                                                    category: data.category,
                                                    group: data.group,
                                                    subgroup: data.subgroup,
                                                    is_active: true
                                                });
                                                alert('Category created successfully!');
                                            } catch (error: any) {
                                                console.error('Error creating category:', error);
                                                throw error;
                                            }
                                        }}
                                    />
                                )}

                                {activeMasterSubTab === 'PO Settings' && (
                                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Left Box: Form (Questions) */}
                                        <div className="lg:col-span-1 border-r border-gray-200 pr-0 lg:pr-8">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                                {isEditModePO ? 'Edit Series' : 'New PO Series'}
                                            </h3>
                                            <form onSubmit={handlePOSubmit} className="space-y-4">
                                                {/* Name */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Name of PO Series <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={poName}
                                                        onChange={(e) => setPoName(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="e.g. Standard PO"
                                                        required
                                                    />
                                                </div>

                                                {/* Category */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Category <span className="text-red-500">*</span>
                                                    </label>
                                                    <CategoryHierarchicalDropdown
                                                        onSelect={(selection) => {
                                                            setPoCategoryId(selection.id);
                                                            setPoCategoryPath(selection.fullPath);
                                                        }}
                                                        value={poCategoryPath}
                                                    />
                                                </div>

                                                {/* Prefix & Suffix */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
                                                        <input
                                                            type="text"
                                                            value={poPrefix}
                                                            onChange={(e) => setPoPrefix(e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                            placeholder="PO/"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
                                                        <input
                                                            type="text"
                                                            value={poSuffix}
                                                            onChange={(e) => setPoSuffix(e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                            placeholder="/24-25"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Year & Digits */}
                                                <div className="grid grid-cols-2 gap-4 items-center">
                                                    <div className="flex items-center mt-6">
                                                        <input
                                                            id="poAutoYear"
                                                            type="checkbox"
                                                            checked={poAutoYear}
                                                            onChange={(e) => setPoAutoYear(e.target.checked)}
                                                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor="poAutoYear" className="ml-2 block text-sm text-gray-700">
                                                            Auto Year
                                                        </label>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Digits</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="10"
                                                            value={poDigits}
                                                            onChange={(e) => setPoDigits(Number(e.target.value))}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Preview Box */}
                                                <div className="bg-gray-100 p-3 rounded-md text-center">
                                                    <span className="text-xs text-gray-500 uppercase font-semibold">Sample Preview</span>
                                                    <div className="text-lg font-mono font-bold text-gray-700 mt-1">
                                                        {getPreview()}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-3 pt-4">
                                                    <button
                                                        type="submit"
                                                        className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
                                                    >
                                                        {isEditModePO ? 'Update Series' : 'Save Series'}
                                                    </button>
                                                    {isEditModePO && (
                                                        <button
                                                            type="button"
                                                            onClick={resetPOForm}
                                                            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </form>
                                        </div>

                                        {/* Right Box: Existing Locations (Existing Series) */}
                                        <div className="lg:col-span-2">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Series</h3>
                                            <div className="border border-gray-200 rounded-md overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {loadingPOSeries ? (
                                                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                                                        ) : poSeriesList.length === 0 ? (
                                                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No series found.</td></tr>
                                                        ) : (
                                                            poSeriesList.map(series => (
                                                                <tr key={series.id} className="hover:bg-gray-50">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                        {series.name}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {series.category_path || series.category_name || '-'}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {/* Show summary of config */}
                                                                        {series.prefix}...{series.suffix} ({series.digits} digits)
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                        <button
                                                                            onClick={() => handleEditPO(series)}
                                                                            className="text-teal-600 hover:text-teal-900 mr-4"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeletePO(series.id)}
                                                                            className="text-red-600 hover:text-red-900"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeMasterSubTab === 'Vendor Creation' && (
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendor Creation</h3>
                                        <p className="text-gray-600">Select a tab below to configure vendor details:</p>
                                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {['Basic Details', 'GST Details', 'Products/Services', 'TDS & Other Statutory', 'Banking Info', 'Terms & Conditions'].map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveMasterSubTab(tab as MasterSubTab)}
                                                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-left"
                                                >
                                                    <div className="font-medium text-gray-900">{tab}</div>
                                                    <div className="text-xs text-gray-500 mt-1">Configure {tab.toLowerCase()}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeMasterSubTab === 'Basic Details' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Basic Details</h3>
                                        <form className="space-y-6" onSubmit={handleBasicDetailsSubmit}>
                                            {/* Row 1: Vendor Code and Vendor Name */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Vendor Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={vendorCode}
                                                        onChange={(e) => setVendorCode(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="Auto-generated or manual"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Vendor Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={vendorName}
                                                        onChange={(e) => setVendorName(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="Enter vendor name"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 2: PAN No. and Contact Person */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        PAN No.
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={panNo}
                                                        onChange={(e) => setPanNo(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="AAAAA0000A"
                                                        maxLength={10}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Contact Person
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={contactPerson}
                                                        onChange={(e) => setContactPerson(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="Primary contact name"
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 3: Email address and Contact No */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Email address <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={vendorEmail}
                                                        onChange={(e) => setVendorEmail(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="vendor@example.com"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Contact No <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={contactNo}
                                                        onChange={(e) => setContactNo(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="+91 XXXXX XXXXX"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Vendor-Customer Linking Section */}
                                            <div className="border-t border-gray-200 pt-6 mt-6">
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                                        Is this vendor also a customer?
                                                    </label>
                                                    <div className="flex gap-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsAlsoCustomer(true)}
                                                            className={`px-6 py-2 border-2 rounded-md focus:outline-none focus:ring-2 ${isAlsoCustomer
                                                                ? 'border-teal-500 text-teal-600 bg-teal-50 ring-teal-500'
                                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300'
                                                                }`}
                                                        >
                                                            Yes
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsAlsoCustomer(false)}
                                                            className={`px-6 py-2 border-2 rounded-md focus:outline-none focus:ring-2 ${!isAlsoCustomer
                                                                ? 'border-teal-500 text-teal-600 bg-teal-50 ring-teal-500'
                                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300'
                                                                }`}
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                    <p className="mt-2 text-xs text-gray-500">
                                                        If "Yes" is clicked, search for customer using PAN No & Vendor Name
                                                    </p>
                                                </div>

                                                {/* Customer Link Section (shown when Yes is clicked) */}
                                                <div className="hidden mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                Link the vendor to this customer:
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button
                                                                type="button"
                                                                className="flex-1 px-4 py-2 border-2 border-teal-500 text-teal-600 rounded-md hover:bg-teal-50 focus:outline-none"
                                                            >
                                                                Yes
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none"
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            <span className="font-medium">Customer Code - Customer Name</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* No Customer Found Section */}
                                                <div className="hidden mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                                    <div className="space-y-3">
                                                        <p className="text-sm text-gray-700">
                                                            No customer found with matching PAN No & Vendor Name
                                                        </p>
                                                        <div className="flex gap-3">
                                                            <button
                                                                type="button"
                                                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
                                                            >
                                                                Create a Customer
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                                            >
                                                                Skip
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
                                                >
                                                    Save & Continue
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeMasterSubTab === 'GST Details' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-6">GST Details</h3>
                                        <form className="space-y-6" onSubmit={handleGSTDetailsSubmit}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        GSTIN <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={gstin}
                                                        onChange={(e) => setGstin(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="22AAAAA0000A1Z5"
                                                        maxLength={15}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        GST Registration Type
                                                    </label>
                                                    <select
                                                        value={gstRegistrationType}
                                                        onChange={(e) => setGstRegistrationType(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    >
                                                        <option value="regular">Regular</option>
                                                        <option value="composition">Composition</option>
                                                        <option value="unregistered">Unregistered</option>
                                                        <option value="consumer">Consumer</option>
                                                        <option value="overseas">Overseas</option>
                                                        <option value="special_economic_zone">Special Economic Zone</option>
                                                        <option value="deemed_export">Deemed Export</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Legal Name (As per GST)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={legalName}
                                                        onChange={(e) => setLegalName(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="Legal business name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Trade Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={tradeName}
                                                        onChange={(e) => setTradeName(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="Trade/Brand name"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
                                                >
                                                    Save & Continue
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeMasterSubTab === 'TDS & Other Statutory' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-6">TDS & Other Statutory Details</h3>
                                        <form onSubmit={handleTDSDetailsSubmit} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        MSME Udyam No
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={msmeUdyamNo}
                                                        onChange={(e) => setMsmeUdyamNo(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="MSME Udyam Registration Number"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        FSSAI License No
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={fssaiLicenseNo}
                                                        onChange={(e) => setFssaiLicenseNo(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="FSSAI License Number"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Import Export Code (IEC)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={importExportCode}
                                                        onChange={(e) => setImportExportCode(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="Import Export Code"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        EOU Status
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={eouStatus}
                                                        onChange={(e) => setEouStatus(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="Export Oriented Unit Status"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        TDS Section Applicable
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={tdsSectionApplicable}
                                                        onChange={(e) => setTdsSectionApplicable(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="TDS Section Applicable"
                                                    />
                                                </div>
                                            </div>

                                            {/* Enable automatic TDS Posting Checkbox */}
                                            <div className="flex items-center gap-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    id="enableAutomaticTDS"
                                                    checked={enableAutomaticTdsPosting}
                                                    onChange={(e) => setEnableAutomaticTdsPosting(e.target.checked)}
                                                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                                />
                                                <label htmlFor="enableAutomaticTDS" className="text-sm font-medium text-gray-700">
                                                    Enable automatic TDS Posting
                                                </label>
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
                                                >
                                                    Save & Continue
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // Reset form
                                                        setMsmeUdyamNo('');
                                                        setFssaiLicenseNo('');
                                                        setImportExportCode('');
                                                        setEouStatus('');
                                                        setTdsSectionApplicable('');
                                                        setEnableAutomaticTdsPosting(false);
                                                    }}
                                                    className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}


                                {activeMasterSubTab === 'Products/Services' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Products/Services</h3>
                                        <div className="space-y-6">
                                            {/* Table for Items */}
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full border border-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                                                No
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                                                HSN | SAC Code
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                                                Item Code
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                                                Item Name
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                                                Supplier Item Code
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200">
                                                                Supplier Item Name
                                                            </th>
                                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                                Action
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {items.map((item, index) => (
                                                            <tr key={item.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                                                    {index + 1}.
                                                                </td>
                                                                <td className="px-4 py-3 border-r border-gray-200">
                                                                    <input
                                                                        type="text"
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-teal-500 focus:border-teal-500"
                                                                        placeholder="HSN | SAC Code"
                                                                        value={item.hsnSacCode}
                                                                        onChange={(e) => handleItemChange(item.id, 'hsnSacCode', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 border-r border-gray-200">
                                                                    <input
                                                                        type="text"
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-teal-500 focus:border-teal-500"
                                                                        placeholder="Item Code"
                                                                        value={item.itemCode}
                                                                        onChange={(e) => handleItemChange(item.id, 'itemCode', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 border-r border-gray-200">
                                                                    <input
                                                                        type="text"
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-teal-500 focus:border-teal-500"
                                                                        placeholder="Item Name"
                                                                        value={item.itemName}
                                                                        onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 border-r border-gray-200">
                                                                    <input
                                                                        type="text"
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-teal-500 focus:border-teal-500"
                                                                        placeholder="Supplier Code"
                                                                        value={item.supplierItemCode}
                                                                        onChange={(e) => handleItemChange(item.id, 'supplierItemCode', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 border-r border-gray-200">
                                                                    <input
                                                                        type="text"
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-teal-500 focus:border-teal-500"
                                                                        placeholder="Supplier Item Name"
                                                                        value={item.supplierItemName}
                                                                        onChange={(e) => handleItemChange(item.id, 'supplierItemName', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        {/* Edit Button */}
                                                                        <button
                                                                            type="button"
                                                                            className="text-blue-600 hover:text-blue-900"
                                                                            title="Edit item"
                                                                        >
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                            </svg>
                                                                        </button>
                                                                        {/* Save Button */}
                                                                        <button
                                                                            type="button"
                                                                            className="text-green-600 hover:text-green-900"
                                                                            title="Save item"
                                                                        >
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        </button>
                                                                        {/* Delete Button */}
                                                                        <button
                                                                            type="button"
                                                                            className="text-red-600 hover:text-red-900"
                                                                            title="Delete item"
                                                                            onClick={() => handleRemoveItem(item.id)}
                                                                        >
                                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Add More Button */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 px-4 py-2 border-2 border-teal-500 text-teal-600 rounded-full hover:bg-teal-50 focus:outline-none"
                                                    onClick={handleAddItem}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    <span className="text-sm font-medium">Add More Items</span>
                                                </button>
                                            </div>

                                            {/* Next Button */}
                                            <div className="flex justify-end pt-4">
                                                <button
                                                    type="button"
                                                    onClick={handleProductServicesSubmit}
                                                    className="px-8 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeMasterSubTab === 'Banking Info' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Banking Information</h3>
                                        <form onSubmit={handleBankingDetailsSubmit} className="space-y-6">
                                            <div className="space-y-8">
                                                {bankAccounts.map((bank, index) => (
                                                    <div key={bank.id} className={`space-y-6 ${index > 0 ? 'pt-8 border-t border-gray-200' : ''}`}>
                                                        {index > 0 && (
                                                            <div className="flex justify-between items-center">
                                                                <h4 className="text-md font-medium text-gray-900">Bank Account #{index + 1}</h4>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveBank(bank.id)}
                                                                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Bank account No.
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                                placeholder="Enter bank account number"
                                                                value={bank.accountNumber}
                                                                onChange={(e) => handleBankChange(bank.id, 'accountNumber', e.target.value)}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Bank Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                                placeholder="Enter bank name"
                                                                value={bank.bankName}
                                                                onChange={(e) => handleBankChange(bank.id, 'bankName', e.target.value)}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                IFSC Code
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                                placeholder="Enter IFSC Code"
                                                                maxLength={11}
                                                                value={bank.ifscCode}
                                                                onChange={(e) => handleBankChange(bank.id, 'ifscCode', e.target.value)}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Branch Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                                placeholder="Enter branch name"
                                                                value={bank.branchName}
                                                                onChange={(e) => handleBankChange(bank.id, 'branchName', e.target.value)}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Swift Code
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                                placeholder="Enter Swift Code (for international transactions)"
                                                                value={bank.swiftCode}
                                                                onChange={(e) => handleBankChange(bank.id, 'swiftCode', e.target.value)}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Associate to a vendor branch
                                                            </label>
                                                            <select
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                                value={bank.vendorBranch}
                                                                onChange={(e) => handleBankChange(bank.id, 'vendorBranch', e.target.value)}
                                                            >
                                                                <option value="">Select vendor branch</option>
                                                                <option value="branch1">Main Branch</option>
                                                                <option value="branch2">Regional Office - North</option>
                                                                <option value="branch3">Regional Office - South</option>
                                                            </select>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Drop-down list of reference Names to select with option to multiple branches. Do not show if only one GSTIN & place of business is available.
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add Another Bank Button */}
                                            <div className="pt-2">
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 px-4 py-2 border-2 border-teal-500 text-teal-600 rounded-md hover:bg-teal-50 focus:outline-none"
                                                    onClick={handleAddBank}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    <span className="text-sm font-medium">Another Bank</span>
                                                </button>
                                            </div>

                                            {/* Next Button */}
                                            <div className="flex justify-end gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    className="px-8 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeMasterSubTab === 'Terms & Conditions' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Terms & Conditions</h3>
                                        <form onSubmit={handleTermsSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Credit Limit
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={creditLimit}
                                                    onChange={(e) => setCreditLimit(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Credit Period
                                                </label>
                                                <input
                                                    type="text"
                                                    value={creditPeriod}
                                                    onChange={(e) => setCreditPeriod(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="Enter credit period (e.g., 30 days, 60 days)"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Credit Terms
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={creditTerms}
                                                    onChange={(e) => setCreditTerms(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="Enter credit terms and conditions..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Penalty Terms
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={penaltyTerms}
                                                    onChange={(e) => setPenaltyTerms(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="Enter penalty terms for late payments or breaches..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Delivery Terms
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={deliveryTerms}
                                                    onChange={(e) => setDeliveryTerms(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="Delivery terms, lead time, shipping conditions..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Warranty / Guarantee Details
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={warrantyGuaranteeDetails}
                                                    onChange={(e) => setWarrantyGuaranteeDetails(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="Enter warranty and guarantee terms..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Force Majeure
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={forceMajeure}
                                                    onChange={(e) => setForceMajeure(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="Enter force majeure clauses..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Dispute and Redressal Terms
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={disputeRedressalTerms}
                                                    onChange={(e) => setDisputeRedressalTerms(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="Enter dispute resolution and redressal terms..."
                                                />
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
                                                >
                                                    Onboard Vendor
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // Reset form
                                                        setCreditLimit('');
                                                        setCreditPeriod('');
                                                        setCreditTerms('');
                                                        setPenaltyTerms('');
                                                        setDeliveryTerms('');
                                                        setWarrantyGuaranteeDetails('');
                                                        setForceMajeure('');
                                                        setDisputeRedressalTerms('');
                                                    }}
                                                    className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Transaction' && (
                        <div>
                            {/* Sub-tabs for Transaction */}
                            <div className="mb-6">
                                <nav className="flex space-x-8 border-b border-gray-200">
                                    {['Purchase Orders', 'Procurement', 'Payment'].map((subTab) => (
                                        <button
                                            key={subTab}
                                            onClick={() => setActiveTransactionSubTab(subTab as TransactionSubTab)}
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTransactionSubTab === subTab
                                                ? 'border-teal-500 text-teal-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            {subTab}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-6 bg-white rounded-lg shadow">
                                {activeTransactionSubTab === 'Purchase Orders' && (
                                    <div>
                                        {activePOSubTab === 'Dashboard' && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Orders</h3>
                                                <p className="text-gray-600 mb-6">Select an option to manage purchase orders:</p>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {['Create PO', 'Pending PO', 'Executed PO'].map((tab) => (
                                                        <button
                                                            key={tab}
                                                            onClick={() => setActivePOSubTab(tab as POSubTab)}
                                                            className="p-6 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-left group"
                                                        >
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className={`p-3 rounded-full ${tab === 'Create PO' ? 'bg-blue-100 text-blue-600' :
                                                                    tab === 'Pending PO' ? 'bg-orange-100 text-orange-600' :
                                                                        'bg-green-100 text-green-600'
                                                                    }`}>
                                                                    {/* Icons based on tab */}
                                                                    {tab === 'Create PO' && (
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                                    )}
                                                                    {tab === 'Pending PO' && (
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                    )}
                                                                    {tab === 'Executed PO' && (
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                    )}
                                                                </div>
                                                                <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                            </div>
                                                            <div className="font-semibold text-gray-900 text-lg">{tab}</div>
                                                            <div className="text-sm text-gray-500 mt-2">
                                                                {tab === 'Create PO' ? 'Create new purchase orders' :
                                                                    tab === 'Pending PO' ? 'View and manage pending orders' :
                                                                        'History of completed orders'}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {activePOSubTab !== 'Dashboard' && (
                                            <div>
                                                <div className="flex items-center gap-4 mb-6">
                                                    <button
                                                        onClick={() => setActivePOSubTab('Dashboard')}
                                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                        title="Back to Dashboard"
                                                    >
                                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                                    </button>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-800">{activePOSubTab}</h3>
                                                        <p className="text-sm text-gray-500">Manage your {activePOSubTab.toLowerCase()} details here.</p>
                                                    </div>
                                                </div>

                                                {/* Content Placeholders */}
                                                {activePOSubTab === 'Create PO' && (
                                                    <div>
                                                        {/* Create PO Button */}
                                                        <div className="mb-6">
                                                            <button
                                                                onClick={() => setShowCreatePOModal(true)}
                                                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors">
                                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                </svg>
                                                                Create PO
                                                            </button>
                                                        </div>

                                                        {/* Sub-tabs for Create PO */}
                                                        <div className="mb-6">
                                                            <nav className="flex space-x-8 border-b border-gray-200">
                                                                {['Pending for Approval', 'Mail PO'].map((tab) => (
                                                                    <button
                                                                        key={tab}
                                                                        onClick={() => setActiveCreatePOSubTab(tab as CreatePOSubTab)}
                                                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeCreatePOSubTab === tab
                                                                            ? 'border-teal-500 text-teal-600'
                                                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                                            }`}
                                                                    >
                                                                        {tab}
                                                                    </button>
                                                                ))}
                                                            </nav>
                                                        </div>

                                                        {/* Content for Create PO Sub-tabs */}
                                                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">

                                                            {activeCreatePOSubTab === 'Pending for Approval' && (
                                                                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                                                                    <table className="min-w-full divide-y divide-gray-200">
                                                                        <thead className="bg-orange-50">
                                                                            <tr>
                                                                                <th className="px-6 py-3 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">PO#</th>
                                                                                <th className="px-6 py-3 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">PO Date</th>
                                                                                <th className="px-6 py-3 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Vendor Name</th>
                                                                                <th className="px-6 py-3 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Address</th>
                                                                                <th className="px-6 py-3 text-right text-xs font-semibold text-orange-800 uppercase tracking-wider">Action</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                            {purchaseOrders.filter(po => po.status === 'Pending Approval').length === 0 ? (
                                                                                <tr>
                                                                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                                                        No purchase orders pending approval.
                                                                                    </td>
                                                                                </tr>
                                                                            ) : (
                                                                                purchaseOrders.filter(po => po.status === 'Pending Approval').map((po) => (
                                                                                    <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.poNumber}</td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.poDate}</td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{po.vendorName}</td>
                                                                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={po.address}>{po.address}</td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                                            <button
                                                                                                onClick={() => handleViewPO(po)}
                                                                                                className="text-blue-600 hover:text-blue-900"
                                                                                                title="View PO"
                                                                                            >
                                                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                                                </svg>
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                            {activeCreatePOSubTab === 'Mail PO' && (
                                                                <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                                                                    <table className="min-w-full divide-y divide-gray-200">
                                                                        <thead className="bg-blue-50">
                                                                            <tr>
                                                                                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">PO#</th>
                                                                                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">PO Date</th>
                                                                                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Vendor Name</th>
                                                                                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider">Address</th>
                                                                                <th className="px-6 py-3 text-right text-xs font-semibold text-blue-800 uppercase tracking-wider">Action</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                            {purchaseOrders.filter(po => po.status === 'Approved').length === 0 ? (
                                                                                <tr>
                                                                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                                                        No approved purchase orders found.
                                                                                    </td>
                                                                                </tr>
                                                                            ) : (
                                                                                purchaseOrders.filter(po => po.status === 'Approved').map((po) => (
                                                                                    <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.poNumber}</td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.poDate}</td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{po.vendorName}</td>
                                                                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={po.address}>{po.address}</td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                                            <button className="text-indigo-600 hover:text-indigo-900 mr-3" title="Mail PO">
                                                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleViewPO(po)}
                                                                                                className="text-blue-600 hover:text-blue-900"
                                                                                                title="View">
                                                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {activePOSubTab === 'Pending PO' && (
                                                    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-amber-50">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">PO#</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">PO Date</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">Vendor Name</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">Address</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-amber-800 uppercase tracking-wider">Status</th>
                                                                    <th className="px-6 py-3 text-right text-xs font-semibold text-amber-800 uppercase tracking-wider">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {purchaseOrders.filter(po => po.status === 'Mailed').length === 0 ? (
                                                                    <tr>
                                                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                                            No pending purchase orders found (Mailed).
                                                                        </td>
                                                                    </tr>
                                                                ) : (
                                                                    purchaseOrders.filter(po => po.status === 'Mailed').map((po) => (
                                                                        <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.poNumber}</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.poDate}</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{po.vendorName}</td>
                                                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={po.address}>{po.address}</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                                                                    {po.status}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                                <button className="text-blue-600 hover:text-blue-900" title="View">
                                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                                {activePOSubTab === 'Executed PO' && (
                                                    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-green-50">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">PO#</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">PO Date</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">Vendor Name</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">Address</th>
                                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-green-800 uppercase tracking-wider">Status</th>
                                                                    <th className="px-6 py-3 text-right text-xs font-semibold text-green-800 uppercase tracking-wider">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {purchaseOrders.filter(po => po.status === 'Closed').length === 0 ? (
                                                                    <tr>
                                                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                                            No executed purchase orders found (Closed).
                                                                        </td>
                                                                    </tr>
                                                                ) : (
                                                                    purchaseOrders.filter(po => po.status === 'Closed').map((po) => (
                                                                        <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.poNumber}</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.poDate}</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{po.vendorName}</td>
                                                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={po.address}>{po.address}</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                                                                    {po.status}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                                <button className="text-blue-600 hover:text-blue-900" title="View">
                                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeTransactionSubTab === 'Procurement' && (
                                    <div>
                                        {activeProcurementSubTab === 'Dashboard' ? (
                                            <div>
                                                <div className="mb-8">
                                                    <h2 className="text-2xl font-bold text-gray-800">Procurement</h2>
                                                    <p className="text-sm text-gray-500 mt-1">Select a procurement category to manage.</p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {[
                                                        { name: 'Raw Material', desc: 'Manage raw material procurement', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> },
                                                        { name: 'Stock-in Trade', desc: 'Manage stock-in trade items', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /> },
                                                        { name: 'Consumables', desc: 'Manage consumable items', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /> },
                                                        { name: 'Stores & Spares', desc: 'Manage stores and spares', icon: <g><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></g> },
                                                        { name: 'Services', desc: 'Manage service procurement', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
                                                    ].map((item) => (
                                                        <button
                                                            key={item.name}
                                                            onClick={() => setActiveProcurementSubTab(item.name as ProcurementSubTab)}
                                                            className="p-6 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:shadow-lg transition-all duration-200 text-left group bg-white"
                                                        >
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        {item.icon}
                                                                    </svg>
                                                                </div>
                                                                <svg className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </div>
                                                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-teal-600 transition-colors">{item.name}</h3>
                                                            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                {selectedProcurementVendor ? (
                                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                                            <div className="flex items-center space-x-4">
                                                                <button onClick={() => setSelectedProcurementVendor(null)} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                                                </button>
                                                                <h2 className="text-xl font-bold text-gray-800">{selectedProcurementVendor.vendorName}</h2>
                                                            </div>
                                                            <button
                                                                onClick={() => setIsMonthView(!isMonthView)}
                                                                className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium text-gray-700"
                                                            >
                                                                {isMonthView ? 'Bill-wise View' : 'Month View'}
                                                            </button>
                                                        </div>
                                                        <div className="overflow-x-auto">
                                                            {isMonthView ? (
                                                                <table className="min-w-full divide-y divide-gray-200">
                                                                    <thead className="bg-gray-50">
                                                                        <tr>
                                                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                                                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Debit</th>
                                                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Credit</th>
                                                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Closing balance</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                                        {mockMonthlySummary.map((item) => (
                                                                            <tr key={item.month} className="hover:bg-gray-50 transition-colors">
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.month}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.debit > 0 ? item.debit.toLocaleString('en-IN') : '-'}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.credit > 0 ? item.credit.toLocaleString('en-IN') : '-'}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.closingBalance.toLocaleString('en-IN')}Cr</td>
                                                                            </tr>
                                                                        ))}
                                                                        <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                                                                            <td className="px-6 py-4 text-left text-sm text-gray-900 uppercase">Total</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 border-t-2 border-gray-400">
                                                                                {mockMonthlySummary.reduce((acc, curr) => acc + curr.debit, 0).toLocaleString('en-IN')}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600 border-t-2 border-gray-400">
                                                                                {mockMonthlySummary.reduce((acc, curr) => acc + curr.credit, 0).toLocaleString('en-IN')}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            ) : (
                                                                <table className="min-w-full divide-y divide-gray-200">
                                                                    <thead className="bg-gray-50">
                                                                        <tr>
                                                                            {['Date', 'Taken from', 'Ledger', 'Status', 'Debit', 'Credit', 'Running balance'].map((header) => (
                                                                                <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider align-top">
                                                                                    <div className="mb-2">{header}</div>
                                                                                    <input
                                                                                        type="text"
                                                                                        placeholder={`Filter ${header}`}
                                                                                        className="block w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 py-1 px-2"
                                                                                    />
                                                                                </th>
                                                                            ))}
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                                        {mockLedgerEntries.map((entry) => (
                                                                            <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.date}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.takenFrom}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.ledger}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                                        ${entry.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                                                            entry.status === 'Unpaid' ? 'bg-red-100 text-red-800' :
                                                                                                'bg-yellow-100 text-yellow-800'}`}>
                                                                                        {entry.status}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.debit > 0 ? entry.debit.toLocaleString('en-IN') : '-'}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.credit > 0 ? entry.credit.toLocaleString('en-IN') : '-'}</td>
                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.runningBalance.toLocaleString('en-IN')}Cr</td>
                                                                            </tr>
                                                                        ))}
                                                                        {/* Totals Footer */}
                                                                        <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                                                                            <td colSpan={4} className="px-6 py-4 text-right text-sm text-gray-900 uppercase">Total</td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t-2 border-gray-400">
                                                                                {mockLedgerEntries.reduce((acc, curr) => acc + curr.debit, 0).toLocaleString('en-IN')}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t-2 border-gray-400">
                                                                                {mockLedgerEntries.reduce((acc, curr) => acc + curr.credit, 0).toLocaleString('en-IN')}
                                                                            </td>
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-6">
                                                            <div>
                                                                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                                                                    <button onClick={() => setActiveProcurementSubTab('Dashboard')} className="hover:text-teal-600 hover:underline">
                                                                        Procurement
                                                                    </button>
                                                                    <span>/</span>
                                                                    <span className="text-teal-600 font-medium">{activeProcurementSubTab}</span>
                                                                </div>
                                                                <h2 className="text-2xl font-bold text-gray-800">{activeProcurementSubTab}</h2>
                                                                <p className="text-sm text-gray-500">Manage {activeProcurementSubTab.toLowerCase()} details here.</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setActiveProcurementSubTab('Dashboard')}
                                                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                                            >
                                                                Back to Dashboard
                                                            </button>
                                                        </div>
                                                        <div className="space-y-4">
                                                            {procurementAgingData.map((bucket) => (
                                                                <div key={bucket.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                                                    <button
                                                                        onClick={() => setExpandedAgingBucket(expandedAgingBucket === bucket.id ? null : bucket.id)}
                                                                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                                                    >
                                                                        <div className="flex items-center space-x-3">
                                                                            <svg className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${expandedAgingBucket === bucket.id ? 'rotate-0' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                            </svg>
                                                                            <span className="font-semibold text-gray-800 text-lg">{bucket.label}</span>
                                                                        </div>
                                                                        {bucket.items.length > 0 && (
                                                                            <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{bucket.items.length} items</span>
                                                                        )}
                                                                    </button>
                                                                    {expandedAgingBucket === bucket.id && (
                                                                        <div className="border-t border-gray-200">
                                                                            {bucket.items.length > 0 ? (
                                                                                <div className="overflow-x-auto">
                                                                                    <table className="min-w-full divide-y divide-gray-200">
                                                                                        <thead className="bg-gray-50">
                                                                                            <tr>
                                                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Code</th>
                                                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Name</th>
                                                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                                            {bucket.items.map((item) => (
                                                                                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vendorCode}</td>
                                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vendorName}</td>
                                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.amount}</td>
                                                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                                                                            }`}>
                                                                                                            {item.status}
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                                                        <button
                                                                                                            onClick={() => setSelectedProcurementVendor(item)}
                                                                                                            className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full"
                                                                                                            title="View Ledger"
                                                                                                        >
                                                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                                                        </button>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            ))}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="p-8 text-center text-gray-500 bg-white">
                                                                                    No items found in this period.
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeTransactionSubTab === 'Payment' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment</h3>
                                        <p className="text-gray-500">Manage payments here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Report' && (
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendor Reports</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* Create PO Modal */}
            {showCreatePOModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-8 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white mb-20">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Create PO</h3>
                            <button
                                onClick={() => setShowCreatePOModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Form Fields */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">PO Series Name</label>
                                    <select
                                        value={createPOForm.poSeriesName}
                                        onChange={(e) => handleCreatePOFormChange('poSeriesName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">Select Vendor Settings</option>
                                        <option value="series1">Series 1</option>
                                        <option value="series2">Series 2</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Show as "New PO" when clicked "New"</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">PO #</label>
                                    <input
                                        type="text"
                                        value={createPOForm.poNumber}
                                        onChange={(e) => handleCreatePOFormChange('poNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="Automated Series"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name</label>
                                    <select
                                        value={createPOForm.vendorName}
                                        onChange={(e) => handleCreatePOFormChange('vendorName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">Select Vendor</option>
                                        <option value="vendor1">Vendor 1</option>
                                        <option value="vendor2">Vendor 2</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                                    <select
                                        value={createPOForm.branch}
                                        onChange={(e) => handleCreatePOFormChange('branch', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">Select Branch</option>
                                        <option value="branch1">Branch 1</option>
                                        <option value="branch2">Branch 2</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Reference Name in Vendor Master</p>
                                </div>


                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                                    <input
                                        type="text"
                                        value={createPOForm.addressLine1}
                                        onChange={(e) => handleCreatePOFormChange('addressLine1', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="Autofill using branch"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                                    <input
                                        type="text"
                                        value={createPOForm.addressLine2}
                                        onChange={(e) => handleCreatePOFormChange('addressLine2', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 3</label>
                                    <input
                                        type="text"
                                        value={createPOForm.addressLine3}
                                        onChange={(e) => handleCreatePOFormChange('addressLine3', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        value={createPOForm.city}
                                        onChange={(e) => handleCreatePOFormChange('city', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                    <input
                                        type="text"
                                        value={createPOForm.state}
                                        onChange={(e) => handleCreatePOFormChange('state', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                    <input
                                        type="text"
                                        value={createPOForm.country}
                                        onChange={(e) => handleCreatePOFormChange('country', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                                    <input
                                        type="text"
                                        value={createPOForm.pincode}
                                        onChange={(e) => handleCreatePOFormChange('pincode', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={createPOForm.emailAddress}
                                        onChange={(e) => handleCreatePOFormChange('emailAddress', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contract No</label>
                                    <input
                                        type="text"
                                        value={createPOForm.contractNo}
                                        onChange={(e) => handleCreatePOFormChange('contractNo', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>

                            {/* Items Section */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-lg font-semibold text-gray-900">Items</h4>
                                    <button
                                        onClick={handleAddPOItem}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Item
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier Item Code</th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negotiated Rate</th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Rate</th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Value</th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST</th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Value</th>
                                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {poItems.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.itemCode}
                                                            onChange={(e) => handlePOItemChange(item.id, 'itemCode', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                            placeholder="Pull from vendor"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.itemName}
                                                            onChange={(e) => handlePOItemChange(item.id, 'itemName', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.supplierItemCode}
                                                            onChange={(e) => handlePOItemChange(item.id, 'supplierItemCode', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.quantity}
                                                            onChange={(e) => handlePOItemChange(item.id, 'quantity', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                            placeholder="Qty+UoC"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.negotiatedRate}
                                                            onChange={(e) => handlePOItemChange(item.id, 'negotiatedRate', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.finalRate}
                                                            onChange={(e) => handlePOItemChange(item.id, 'finalRate', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                            placeholder="Manual entry"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.taxableValue}
                                                            onChange={(e) => handlePOItemChange(item.id, 'taxableValue', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                            placeholder="Quantity x"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.gst}
                                                            onChange={(e) => handlePOItemChange(item.id, 'gst', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={item.netValue}
                                                            onChange={(e) => handlePOItemChange(item.id, 'netValue', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <button
                                                            onClick={() => handleRemovePOItem(item.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            disabled={poItems.length === 1}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Totals Section */}
                            <div className="grid grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Taxable Value</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Tax</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Value</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 font-semibold"
                                    />
                                </div>
                            </div>

                            {/* Additional Fields */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Receive by</label>
                                    <input
                                        type="date"
                                        value={createPOForm.receiveBy}
                                        onChange={(e) => handleCreatePOFormChange('receiveBy', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Calendar option to select date</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Receive at</label>
                                    <select
                                        value={createPOForm.receiveAt}
                                        onChange={(e) => handleCreatePOFormChange('receiveAt', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">Select Location</option>
                                        <option value="warehouse1">Warehouse 1</option>
                                        <option value="warehouse2">Warehouse 2</option>
                                        <option value="store1">Store 1</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Drop-down of locations from Inventory Module</p>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery terms</label>
                                    <textarea
                                        value={createPOForm.deliveryTerms}
                                        onChange={(e) => handleCreatePOFormChange('deliveryTerms', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="Enter delivery terms and conditions"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 pt-6 border-t">
                                <button
                                    onClick={() => setShowCreatePOModal(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitPO}
                                    className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                                >
                                    Create PO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View PO Details Modal */}
            {showViewPOModal && selectedPO && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-8 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white mb-20">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Purchase Order Details</h3>
                            <button
                                onClick={() => setShowViewPOModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* PO Header Information */}
                            <div className="bg-blue-50 p-6 rounded-lg">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">PO Number</label>
                                        <p className="text-lg font-bold text-blue-900">{selectedPO.poNumber}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">PO Date</label>
                                        <p className="text-gray-900">{selectedPO.poDate}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${selectedPO.status === 'Pending Approval'
                                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                                            }`}>
                                            {selectedPO.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Vendor Information */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h4>
                                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                                        <p className="text-gray-900">{selectedPO.vendorName}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <p className="text-gray-900">{selectedPO.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items Section - Placeholder */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Items</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-600 text-center py-4">
                                        Item details will be displayed here when connected to backend
                                    </p>
                                </div>
                            </div>

                            {/* Totals Section - Placeholder */}
                            <div className="grid grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg border-t-2 border-gray-300">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Taxable Value</label>
                                    <p className="text-lg font-semibold text-gray-900">₹ 0.00</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Tax</label>
                                    <p className="text-lg font-semibold text-gray-900">₹ 0.00</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Value</label>
                                    <p className="text-lg font-bold text-blue-900">₹ 0.00</p>
                                </div>
                            </div>

                            {/* Additional Information - Placeholder */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
                                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Receive By</label>
                                        <p className="text-gray-900">-</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Receive At</label>
                                        <p className="text-gray-900">-</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Terms</label>
                                        <p className="text-gray-900">-</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between pt-6 border-t">
                                <div className="flex space-x-4">
                                    {/* Show Edit button only for Pending Approval status when not editing */}
                                    {!isEditingPO && selectedPO.status === 'Pending Approval' && (
                                        <button
                                            onClick={handleEditPODetails}
                                            className="px-6 py-2 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {/* Show Cancel and Save when editing */}
                                    {isEditingPO && (
                                        <>
                                            <button
                                                onClick={handleCancelEditPO}
                                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSavePODetails}
                                                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                                            >
                                                Save
                                            </button>
                                        </>
                                    )}
                                    {/* Show Cancel button only for Approved status when not editing */}
                                    {!isEditingPO && selectedPO.status === 'Approved' && (
                                        <button
                                            onClick={() => setShowViewPOModal(false)}
                                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setShowViewPOModal(false)}
                                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Close
                                    </button>
                                    {!isEditingPO && selectedPO.status === 'Pending Approval' && (
                                        <button
                                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            Approve PO
                                        </button>
                                    )}
                                    {!isEditingPO && selectedPO.status === 'Approved' && (
                                        <button
                                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Mail PO
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorPortalPage;
