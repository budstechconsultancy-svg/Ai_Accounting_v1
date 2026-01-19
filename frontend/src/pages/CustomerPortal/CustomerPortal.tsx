import React, { useState, useEffect } from 'react';
import { httpClient } from '../../services/httpClient';
import CategoryHierarchicalDropdown from '../../components/CategoryHierarchicalDropdown';
import Icon from '../../components/Icon'; // Assuming Icon component exists
import CreateSalesQuotation from './CreateSalesQuotation';
import CreateSalesOrder from './CreateSalesOrder';
import { Eye, Mail, Filter, ChevronLeft, X } from 'lucide-react';

type MainTab = 'Masters' | 'Transactions' | 'Reports';
type MasterSubTab = 'Category' | 'Sales Quotation & Order' | 'Customer' | 'Long-term Contracts';

type TransactionSubTab = 'Sales Quotation' | 'Sales Order' | 'Sales' | 'Receipt';
type SalesQuotationSubTab = 'General Customer Quote' | 'Specific Customer Quote';
type SalesOrderSubTab = 'Pending & Cancelled' | 'Executed';
type SalesCategory = 'Stock-in-Trade' | 'Finished Goods' | 'Services';
type TransactionType = 'Sales' | 'Receipt' | 'Purchase' | 'Payment' | 'Debit Note' | 'Credit Note';
type PurchaseStatus = 'Paid' | 'Unpaid' | 'Partially Paid' | 'Approved';
type SalesStatus = 'Not Due' | 'Due' | 'Partially Received' | 'Received';

interface AgingData {
    customerId: string;
    customerCode: string;
    customerName: string;
    notDue: number;
    days0to45: number;
    days45to90: number;
    months6: number;
    year1: number;
}

interface LedgerEntry {
    id: string;
    date: string;
    postFrom: TransactionType;
    ledger: string;
    status: PurchaseStatus | SalesStatus;
    debit: number;
    credit: number;
    runningBalance: number;
}

interface Category {
    id: number;
    category: string;
    group: string | null;
    subgroup: string | null;
    full_path?: string;
    is_active: boolean;
    level?: number;
}

const CustomerPortalPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<MainTab>('Masters');
    const [activeMasterSubTab, setActiveMasterSubTab] = useState<MasterSubTab>('Category');
    const [activeTransactionSubTab, setActiveTransactionSubTab] = useState<TransactionSubTab>('Sales Quotation');
    const [activeSalesQuotationSubTab, setActiveSalesQuotationSubTab] = useState<SalesQuotationSubTab>('General Customer Quote');
    const [activeSalesOrderSubTab, setActiveSalesOrderSubTab] = useState<SalesOrderSubTab>('Pending & Cancelled');
    const [showCreateQuotation, setShowCreateQuotation] = useState(false);
    const [showCreateOrder, setShowCreateOrder] = useState(false);

    return (
        <div className="flex-1 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Customer Module</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage customers, categories, and sales transactions</p>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="bg-white border-b border-gray-200 px-8">
                <div className="flex gap-8">
                    {['Masters', 'Transactions', 'Reports'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as MainTab)}
                            className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                ? 'border-indigo-600 text-indigo-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="px-8 py-6">
                {activeTab === 'Masters' && (
                    <div>
                        {/* Sub-tabs for Masters */}
                        <div className="mb-6 bg-white p-2 rounded-lg inline-block shadow-sm">
                            <div className="flex space-x-2">
                                {['Category', 'Sales Quotation & Order', 'Customer', 'Long-term Contracts'].map((subTab) => (
                                    <button
                                        key={subTab}
                                        onClick={() => setActiveMasterSubTab(subTab as MasterSubTab)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeMasterSubTab === subTab
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {subTab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Masters Content */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px]">
                            {activeMasterSubTab === 'Category' && <CategoryContent />}
                            {activeMasterSubTab === 'Customer' && <CustomerContent />}
                            {activeMasterSubTab === 'Sales Quotation & Order' && <SalesOrderContent />}
                            {activeMasterSubTab === 'Long-term Contracts' && <LongTermContractsContent />}
                        </div>
                    </div>
                )}

                {activeTab === 'Transactions' && (
                    <div>
                        {/* Sub-tabs for Transactions */}
                        <div className="mb-6 bg-white p-2 rounded-lg inline-block shadow-sm">
                            <div className="flex space-x-2">
                                {['Sales Quotation', 'Sales Order', 'Sales', 'Receipt'].map((subTab) => (
                                    <button
                                        key={subTab}
                                        onClick={() => setActiveTransactionSubTab(subTab as TransactionSubTab)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTransactionSubTab === subTab
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {subTab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Transactions Content */}
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center min-h-[500px]">
                            {activeTransactionSubTab === 'Sales Quotation' && (
                                showCreateQuotation ? (
                                    <CreateSalesQuotation onCancel={() => setShowCreateQuotation(false)} />
                                ) : (
                                    <div className="text-left">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-medium text-gray-900">Sales Quotation</h3>
                                            <button
                                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                                                onClick={() => setShowCreateQuotation(true)}
                                            >
                                                Create Sales Quotation
                                            </button>
                                        </div>

                                        {/* Sub-tabs for Sales Quotation */}
                                        <div className="mb-6 bg-gray-50 p-2 rounded-lg inline-block border border-gray-200">
                                            <div className="flex space-x-2">
                                                {['General Customer Quote', 'Specific Customer Quote'].map((subTab) => (
                                                    <button
                                                        key={subTab}
                                                        onClick={() => setActiveSalesQuotationSubTab(subTab as SalesQuotationSubTab)}
                                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSalesQuotationSubTab === subTab
                                                            ? 'bg-white text-indigo-700 shadow-sm'
                                                            : 'text-gray-600 hover:bg-white/50'
                                                            }`}
                                                    >
                                                        {subTab}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Content for Sales Quotation Sub-tabs */}
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                                            {activeSalesQuotationSubTab === 'General Customer Quote' && (
                                                <div className="text-center">
                                                    <h4 className="text-md font-medium text-gray-900 mb-2">General Customer Quote</h4>
                                                    <p className="text-gray-500">General Customer Quote interface coming soon.</p>
                                                </div>
                                            )}
                                            {activeSalesQuotationSubTab === 'Specific Customer Quote' && (
                                                <div className="text-center">
                                                    <h4 className="text-md font-medium text-gray-900 mb-2">Specific Customer Quote</h4>
                                                    <p className="text-gray-500">Specific Customer Quote interface coming soon.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                            {activeTransactionSubTab === 'Sales Order' && (
                                showCreateOrder ? (
                                    <CreateSalesOrder onCancel={() => setShowCreateOrder(false)} />
                                ) : (
                                    <div className="text-left">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-medium text-gray-900">Sales Order</h3>
                                            <button
                                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                                                onClick={() => setShowCreateOrder(true)}
                                            >
                                                Create Sales Order
                                            </button>
                                        </div>

                                        {/* Sales Order Sub-tabs */}
                                        <div className="border-b border-gray-200 mb-6">
                                            <nav className="flex gap-8">
                                                {['Pending & Cancelled', 'Executed'].map((tab) => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setActiveSalesOrderSubTab(tab as SalesOrderSubTab)}
                                                        className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeSalesOrderSubTab === tab
                                                            ? 'border-indigo-600 text-indigo-700'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                                            }`}
                                                    >
                                                        {tab}
                                                    </button>
                                                ))}
                                            </nav>
                                        </div>

                                        {/* Pending & Cancelled Tab */}
                                        {activeSalesOrderSubTab === 'Pending & Cancelled' && (
                                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Sales Order #
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Sales Order Date
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Customer Reference Name
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Delivery Date
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Amount
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Status
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Actions
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {/* Sample Data Row - Pending */}
                                                            <tr className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    SO-2024-001
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    2024-01-15
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    Acme Corporation
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    2024-01-25
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    ₹45,000.00
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                        Pending
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                                                    <button className="text-indigo-600 hover:text-indigo-900">View</button>
                                                                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                                                                    <button className="text-red-600 hover:text-red-900">Cancel</button>
                                                                </td>
                                                            </tr>
                                                            {/* Sample Data Row - Cancelled */}
                                                            <tr className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    SO-2024-002
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    2024-01-10
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    Global Traders
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    2024-01-20
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    ₹32,500.00
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                                        Cancelled
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                                                    <button className="text-indigo-600 hover:text-indigo-900">View</button>
                                                                    <button className="text-gray-400 cursor-not-allowed" disabled>Edit</button>
                                                                    <button className="text-gray-400 cursor-not-allowed" disabled>Cancel</button>
                                                                </td>
                                                            </tr>
                                                            {/* Empty State */}
                                                            {false && (
                                                                <tr>
                                                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                                        No pending or cancelled sales orders found.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Executed Tab */}
                                        {activeSalesOrderSubTab === 'Executed' && (
                                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Sales Order #
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Sales Order Date
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Customer Reference Name
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Delivery Date
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Amount
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Action
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {/* Sample Data Row - Executed */}
                                                            <tr className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    SO-2024-003
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    2024-01-05
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    Tech Solutions Inc
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    2024-01-15
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    ₹78,500.00
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                    <button className="text-indigo-600 hover:text-indigo-900">View</button>
                                                                </td>
                                                            </tr>
                                                            {/* Empty State */}
                                                            {false && (
                                                                <tr>
                                                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                                        No executed sales orders found.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            )}
                            {activeTransactionSubTab === 'Sales' && (
                                <SalesContent />
                            )}
                            {activeTransactionSubTab === 'Receipt' && (
                                <ReceiptContent />
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'Reports' && (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <h3 className="text-lg font-medium text-gray-900">Reports</h3>
                        <p className="text-gray-500 mt-2">Reports dashboard interface coming soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// -- Mastery Sub-Components --

const CategoryContent: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryName, setCategoryName] = useState('');
    const [parentCategory, setParentCategory] = useState<{ id: number, fullPath: string } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const mockCategories: Category[] = [
                { id: 1, category: 'RAW MATERIAL', is_active: true, group: null, subgroup: null, full_path: 'RAW MATERIAL' },
                { id: 2, category: 'Work in Progress', is_active: true, group: null, subgroup: null, full_path: 'Work in Progress' },
                { id: 3, category: 'Finished goods', is_active: true, group: null, subgroup: null, full_path: 'Finished goods' },
                { id: 4, category: 'Stores and Spares', is_active: true, group: null, subgroup: null, full_path: 'Stores and Spares' },
                { id: 5, category: 'Packing Material', is_active: true, group: null, subgroup: null, full_path: 'Packing Material' },
                { id: 6, category: 'Stock in Trade', is_active: true, group: null, subgroup: null, full_path: 'Stock in Trade' },
            ];

            let data = mockCategories;
            try {
                // Attempt fetch but fallback to mock (wrapped to avoid breaking if backend fails)
                const response = await httpClient.get<Category[]>('/api/inventory/master-categories/');
                if (response && Array.isArray(response) && response.length > 0) {
                    data = response;
                }
            } catch (e) {
                console.log("Using mock categories as backend fetch failed or is empty");
            }

            // Add simplified full_path if not present or just accept as is
            const processed = data.map(c => ({
                ...c,
                full_path: c.full_path || [c.category, c.group, c.subgroup].filter(Boolean).join(' > ')
            }));
            setCategories(processed);
        } catch (error) {
            console.error('Error fetching categories', error);
            // Fallback to mock even in outer catch
            const mockCategories: Category[] = [
                { id: 1, category: 'RAW MATERIAL', is_active: true, group: null, subgroup: null, full_path: 'RAW MATERIAL' },
                { id: 2, category: 'Work in Progress', is_active: true, group: null, subgroup: null, full_path: 'Work in Progress' },
                { id: 3, category: 'Finished goods', is_active: true, group: null, subgroup: null, full_path: 'Finished goods' },
                { id: 4, category: 'Stores and Spares', is_active: true, group: null, subgroup: null, full_path: 'Stores and Spares' },
                { id: 5, category: 'Packing Material', is_active: true, group: null, subgroup: null, full_path: 'Packing Material' },
                { id: 6, category: 'Stock in Trade', is_active: true, group: null, subgroup: null, full_path: 'Stock in Trade' },
            ];
            setCategories(mockCategories);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!categoryName) return;
        try {
            // Simplified payload for creation
            const payload = {
                category: categoryName,
                // Map frontend structure to backend expectation. 
                // Assuming 'group' or 'parent' is the field for parent category ID.
                // Based on VendorPortal analysis, it might be more complex, but starting simple.
                parent: parentCategory?.id || null
            };

            // Note: Actual endpoint for creation might differ or require different fields
            await httpClient.post('/api/inventory/master-categories/', payload);
            setCategoryName('');
            setParentCategory(null);
            fetchCategories();
            alert('Category created successfully!');
        } catch (error) {
            console.error('Error creating category', error);
            alert('Failed to create category.');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Left Col: Select Category */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Category</h3>
                <p className="text-xs text-gray-500 mb-6">
                    Single click to select level. Double click to expand/collapse categories.
                    <br />
                    <span className="text-indigo-600">★ Blue items are your custom categories.</span>
                </p>

                <div className="space-y-3 pl-2">
                    {loading ? (
                        <p className="text-sm text-gray-500">Loading categories...</p>
                    ) : categories.length === 0 ? (
                        <p className="text-sm text-gray-500">No categories found.</p>
                    ) : (
                        categories.map((cat) => (
                            <div key={cat.id} className="flex items-center group cursor-pointer">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-3 group-hover:bg-indigo-500"></span>
                                <span className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                    {cat.full_path || cat.category}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Col: Create New Category */}
            <div className="border-l border-gray-100 pl-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Create new Category</h3>

                <div className="space-y-6 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Under</label>
                        <CategoryHierarchicalDropdown
                            onSelect={(selection) => setParentCategory(selection)}
                            value={parentCategory?.fullPath}
                            placeholder="Select parent category"
                            className="w-full"
                        />
                        <p className="text-xs text-indigo-500 mt-1 cursor-pointer hover:underline">Drop-down list of all existing categories</p>
                    </div>

                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

const CustomerContent: React.FC = () => {
    // State for view mode
    const [view, setView] = useState<'list' | 'create'>('list');
    const [activeTab, setActiveTab] = useState('Basic Details');

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');

    // State for vendor linking logic
    const [isVendor, setIsVendor] = useState(false);
    const [vendorSearchStatus, setVendorSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not-found'>('idle');
    const [linkVendor, setLinkVendor] = useState<boolean | null>(null);
    const [createVendor, setCreateVendor] = useState<boolean | null>(null);

    // State for GST Details
    const [isUnregistered, setIsUnregistered] = useState(false);
    const [gstInput, setGstInput] = useState('');
    const [selectedGSTINs, setSelectedGSTINs] = useState<string[]>([]);
    const [showBranchDetails, setShowBranchDetails] = useState(false);
    const [expandedBranches, setExpandedBranches] = useState<number[]>([1]); // Default first expanded
    const [showGstDropdown, setShowGstDropdown] = useState(false); // Dropdown visibility state
    const [addMultipleBranches, setAddMultipleBranches] = useState(false); // Toggle for multiple branches
    const [unregisteredBranches, setUnregisteredBranches] = useState([
        { id: 1, referenceName: '', address: '', contactPerson: '', email: '', contactNumber: '' }
    ]);
    const [productRows, setProductRows] = useState([
        { id: 1, itemCode: '', itemName: 'Auto-fetched', custItemCode: '', custItemName: '' }
    ]);
    const [statutoryDetails, setStatutoryDetails] = useState({
        msmeNo: '',
        fssaiNo: '',
        iecCode: '',
        eouStatus: 'Export Oriented Unit (EOU)', // Default
        tcsSection: '',
        tcsEnabled: false,
        tdsSection: '',
        tdsEnabled: false
    });
    const [bankAccounts, setBankAccounts] = useState<{
        id: number;
        accountNumber: string;
        bankName: string;
        ifscCode: string;
        branchName: string;
        swiftCode: string;
        associatedBranches: string[];
    }[]>([]);
    const [isAddingBank, setIsAddingBank] = useState(false);

    // T&C Details State
    const [termsDetails, setTermsDetails] = useState({
        creditPeriod: '',
        creditTerms: '',
        penaltyTerms: '',
        deliveryTerms: '',
        warrantyDetails: '',
        forceMajeure: '',
        disputeTerms: ''
    });

    // Helper to add a new bank account
    const handleAddBank = () => {
        setBankAccounts(prev => [
            ...prev,
            {
                id: Date.now(),
                accountNumber: '',
                bankName: '',
                ifscCode: '',
                branchName: '',
                swiftCode: '',
                associatedBranches: []
            }
        ]);
        setIsAddingBank(true); // Keep this if we use it to track "edit mode", but simplified logic might just rely on array length
    };

    const handleRemoveBank = (id: number) => {
        setBankAccounts(prev => prev.filter(acc => acc.id !== id));
        if (bankAccounts.length === 1) setIsAddingBank(false);
    };

    const handleBankChange = (id: number, field: string, value: any) => {
        setBankAccounts(prev => prev.map(acc =>
            acc.id === id ? { ...acc, [field]: value } : acc
        ));
    };

    // Mock Data for Items
    const mockItems = [
        { code: 'ITEM-001', name: 'Dell Latitude 3520 Laptop' },
        { code: 'ITEM-002', name: 'Logitech Wireless Mouse' },
        { code: 'ITEM-003', name: 'HP LaserJet Pro Printer' },
        { code: 'SERV-001', name: 'Annual Maintenance Contract' },
    ];

    const handleAddProductRow = () => {
        setProductRows(prev => [
            ...prev,
            { id: prev.length + 1, itemCode: '', itemName: 'Auto-fetched', custItemCode: '', custItemName: '' }
        ]);
    };

    const handleRemoveProductRow = (id: number) => {
        if (productRows.length > 1) {
            setProductRows(prev => prev.filter(row => row.id !== id));
        }
    };

    const handleProductRowChange = (id: number, field: string, value: string) => {
        setProductRows(prev => prev.map(row => {
            if (row.id === id) {
                const updatedRow = { ...row, [field]: value };
                if (field === 'itemCode') {
                    const item = mockItems.find(i => i.code === value);
                    updatedRow.itemName = item ? item.name : 'Auto-fetched';
                }
                return updatedRow;
            }
            return row;
        }));
    };

    // Mock GSTINs for dropdown
    // Mock GSTINs for dropdown
    const mockGSTINs = ['29ABCDE1234F1Z5', '27ABCDE1234F1Z5', '07ABCDE1234F1Z5'];

    // Mock Branch Data
    const mockBranches = [
        { id: 1, gstin: '29ABCDE1234F1Z5', address: '123, Industrial Area, Bangalore, Karnataka - 560001', defaultRef: 'Bangalore HO' },
        { id: 2, gstin: '27ABCDE1234F1Z5', address: '456, Textile Market, Surat, Gujarat - 395002', defaultRef: 'Surat Branch' },
    ];

    const handleGstSelect = (gstin: string) => {
        if (selectedGSTINs.includes(gstin)) {
            setSelectedGSTINs(prev => prev.filter(g => g !== gstin));
        } else {
            setSelectedGSTINs(prev => [...prev, gstin]);
            setGstInput(''); // Clear input on selection
        }
    };

    const handleFetchBranchDetails = () => {
        if (selectedGSTINs.length > 0) {
            setShowBranchDetails(true);
        }
    };

    const toggleBranchExpand = (id: number) => {
        setExpandedBranches(prev =>
            prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
        );
    };

    const handleVendorRadioChange = (isYes: boolean) => {
        setIsVendor(isYes);
        if (isYes) {
            setVendorSearchStatus('searching');
            // Simulate API Search
            setTimeout(() => {
                // For demonstration, randomly find a vendor or not, or default to found
                // Let's toggle based on randomly for now to show both, or just 'found'
                setVendorSearchStatus(Math.random() > 0.5 ? 'found' : 'not-found');
            }, 1000);
        } else {
            setVendorSearchStatus('idle');
            setLinkVendor(null);
            setCreateVendor(null);
        }
    };

    const handleAddManualBranch = () => {
        setUnregisteredBranches(prev => [...prev, {
            id: prev.length + 1,
            referenceName: '',
            address: '',
            contactPerson: '',
            email: '',
            contactNumber: ''
        }]);
        // Auto-expand the new branch
        setExpandedBranches(prev => [...prev, unregisteredBranches.length + 1]);
    };

    const handleManualBranchChange = (id: number, field: string, value: string) => {
        setUnregisteredBranches(prev => prev.map(branch =>
            branch.id === id ? { ...branch, [field]: value } : branch
        ));
    };

    // ... (mock data and filter logic)

    // ... (helper functions if any)

    if (view === 'create') {
        // ... (return statement until GST Details)
        // ...
    }






    // Mock Data matching the screenshot
    const [customers, setCustomers] = useState([
        { id: 1, category: 'Retail', code: 'CUST-001', name: 'Acme Corporation', status: 'Live' },
        { id: 2, category: 'Wholesale', code: 'CUST-002', name: 'Global Traders Pvt Ltd', status: 'Live' },
        { id: 3, category: 'Corporate', code: 'CUST-003', name: 'TechVision Solutions', status: 'Dormant' },
        { id: 4, category: 'Retail', code: 'CUST-004', name: 'Sunrise Enterprises', status: 'Live' },
        { id: 5, category: 'Wholesale', code: 'CUST-005', name: 'Metro Supplies Inc', status: 'Dormant' },
    ]);

    // Filter logic
    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || customer.status === statusFilter;
        const matchesCategory = categoryFilter === 'All Categories' || customer.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    if (view === 'create') {
        return (
            <div className="p-8">
                {/* ... (Header and Tabs) */}
                <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Customer</h3>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
                    {['Basic Details', 'GST Details', 'Products/Services', 'TDS & Other Statutory Details', 'Banking Info', 'Terms & Conditions'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Basic Details Content */}
                {activeTab === 'Basic Details' && (
                    <div className="max-w-6xl">
                        {/* ... (Basic Details Form Component) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

                            {/* Row 1 */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name <span className="text-red-500">*</span></label>
                                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Category</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-600 bg-white">
                                    <option>Select Category</option>
                                    <option>Retail</option>
                                    <option>Wholesale</option>
                                    <option>Corporate</option>
                                </select>
                            </div>

                            {/* Row 2 */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Code</label>
                                <input type="text" value="CUST-006" readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">PAN Number</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white" />
                            </div>

                            {/* Row 3 */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <input type="email" className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white" />
                            </div>

                            {/* Row 4 */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white" />
                            </div>
                            <div className="md:col-span-1"></div> {/* Spacer */}

                            {/* Radio Groups */}
                            <div className="md:col-span-2 border border-gray-200 rounded-md p-6 bg-gray-50/50">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Is this customer also a vendor?</label>
                                <div className="flex gap-6 mb-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="isVendor"
                                            checked={isVendor}
                                            onChange={() => handleVendorRadioChange(true)}
                                            className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                        />
                                        <span className="text-sm text-gray-700">Yes</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="isVendor"
                                            checked={!isVendor}
                                            onChange={() => handleVendorRadioChange(false)}
                                            className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                        />
                                        <span className="text-sm text-gray-700">No</span>
                                    </label>
                                </div>

                                {/* Dynamic Vendor Logic */}
                                {isVendor && (
                                    <div className="pl-4 border-l-2 border-indigo-200 space-y-4">
                                        {vendorSearchStatus === 'searching' && (
                                            <div className="flex items-center text-indigo-600 text-sm">
                                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Searching for existing vendors using PAN & Name...
                                            </div>
                                        )}

                                        {vendorSearchStatus === 'found' && (
                                            <div className="space-y-3 animate-fadeIn">
                                                <p className="text-sm font-semibold text-gray-800">
                                                    <span className="text-indigo-600">✓</span> Vendor found matching PAN/Name.
                                                </p>

                                                <div className="flex items-center gap-4">
                                                    <label className="text-sm text-gray-700">Link the customer to this vendor?</label>
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-1 cursor-pointer">
                                                            <input type="radio" name="linkVendor" checked={linkVendor === true} onChange={() => setLinkVendor(true)} className="text-indigo-600 w-4 h-4" />
                                                            <span className="text-sm">Yes</span>
                                                        </label>
                                                        <label className="flex items-center gap-1 cursor-pointer">
                                                            <input type="radio" name="linkVendor" checked={linkVendor === false} onChange={() => setLinkVendor(false)} className="text-indigo-600 w-4 h-4" />
                                                            <span className="text-sm">No</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {linkVendor === true && (
                                                    <div className="p-3 bg-indigo-50 rounded border border-indigo-100 text-sm text-indigo-800 font-medium">
                                                        Vendor Code: VEND-001 - Acme Supplies (Linked)
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {vendorSearchStatus === 'not-found' && (
                                            <div className="space-y-3 animate-fadeIn">
                                                <p className="text-sm text-amber-600 font-medium">
                                                    ⚠ No matching vendor found.
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <label className="text-sm text-gray-700">Create a Vendor?</label>
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-1 cursor-pointer">
                                                            <input type="radio" name="createVendor" checked={createVendor === true} onChange={() => setCreateVendor(true)} className="text-indigo-600 w-4 h-4" />
                                                            <span className="text-sm">Yes</span>
                                                        </label>
                                                        <label className="flex items-center gap-1 cursor-pointer">
                                                            <input type="radio" name="createVendor" checked={createVendor === false} onChange={() => setCreateVendor(false)} className="text-indigo-600 w-4 h-4" />
                                                            <span className="text-sm">No</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-3">TDS Applicable under GST?</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="tds" className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                                        <span className="text-sm text-gray-700">Yes</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="tds" defaultChecked className="text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                                        <span className="text-sm text-gray-700">No</span>
                                    </label>
                                </div>
                            </div>

                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-4 mt-12 border-t border-gray-200 pt-6">
                            <button onClick={() => setView('list')} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">Next</button>
                        </div>
                    </div>
                )}

                {/* GST Details Content */}
                {activeTab === 'GST Details' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-center mb-8">
                            <label className="flex items-center gap-2 cursor-pointer p-4 rounded-md hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={isUnregistered}
                                    onChange={(e) => setIsUnregistered(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Customer is Unregistered</span>
                            </label>
                        </div>

                        {/* Conditional Content based on Registration Status */}
                        {isUnregistered ? (
                            <div className="space-y-8 animate-fadeIn">
                                {/* Unregistered Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">GSTIN No.</label>
                                        <input
                                            type="text"
                                            value="NA"
                                            disabled
                                            className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                                        />
                                        <span className="absolute right-0 -top-6 text-xs text-indigo-500 font-medium italic">No GSTIN available</span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Taxpayer Type</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value="Unregistered"
                                                readOnly
                                                className="w-full px-4 py-2 border border-green-200 rounded-md bg-green-50 text-green-700 font-medium ring-1 ring-green-200"
                                            />
                                            <span className="absolute right-3 top-2.5 text-xs text-green-600">Auto-set</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Branch Configuration */}
                                <div>
                                    <div className="flex items-center gap-6 mb-6">
                                        <label className="text-sm font-semibold text-gray-700">Add Multiple Branches</label>
                                        <div className="flex bg-gray-100 p-1 rounded-md">
                                            <button
                                                onClick={() => setAddMultipleBranches(true)}
                                                className={`px-4 py-1 text-xs font-medium rounded ${addMultipleBranches ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => setAddMultipleBranches(false)}
                                                className={`px-4 py-1 text-xs font-medium rounded ${!addMultipleBranches ? 'bg-white text-gray-800 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>

                                    {!addMultipleBranches ? (
                                        // Single Branch - Simple Address
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Address <span className="text-red-500">*</span></label>
                                            <textarea
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                                placeholder="Enter Full Address"
                                                value={unregisteredBranches[0].address}
                                                onChange={(e) => handleManualBranchChange(1, 'address', e.target.value)}
                                            />
                                        </div>
                                    ) : (
                                        // Multiple Manual Branches
                                        <div className="space-y-4">
                                            {unregisteredBranches.map((branch, index) => {
                                                const isExpanded = expandedBranches.includes(branch.id);
                                                return (
                                                    <div key={branch.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                                        <div
                                                            className="flex items-center justify-between px-6 py-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                            onClick={() => toggleBranchExpand(branch.id)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-xs font-semibold text-gray-600">
                                                                    {index + 1}
                                                                </span>
                                                                <span className="font-semibold text-gray-800">
                                                                    {branch.referenceName || `Branch ${index + 1}`}
                                                                </span>
                                                            </div>
                                                            <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="md:col-span-2">
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Reference Name</label>
                                                                    <input
                                                                        type="text"
                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                                        value={branch.referenceName}
                                                                        onChange={(e) => handleManualBranchChange(branch.id, 'referenceName', e.target.value)}
                                                                        placeholder="e.g. Warehouse, Main Office"
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                                                                    <textarea
                                                                        rows={2}
                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                                                                        value={branch.address}
                                                                        onChange={(e) => handleManualBranchChange(branch.id, 'address', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Contact Person</label>
                                                                    <input
                                                                        type="text"
                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                                        value={branch.contactPerson}
                                                                        onChange={(e) => handleManualBranchChange(branch.id, 'contactPerson', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Contact Number</label>
                                                                    <input
                                                                        type="text"
                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                                        value={branch.contactNumber}
                                                                        onChange={(e) => handleManualBranchChange(branch.id, 'contactNumber', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                                                                    <input
                                                                        type="email"
                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                                        value={branch.email}
                                                                        onChange={(e) => handleManualBranchChange(branch.id, 'email', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            <button
                                                onClick={handleAddManualBranch}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <span>+</span> Add Another Branch
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Registered - Existing Flow
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">GSTIN No. <span className="text-red-500">*</span></label>
                                    <div className="flex gap-4 items-start">
                                        <div className="relative flex-1">

                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder={selectedGSTINs.length > 0 ? `${selectedGSTINs.length} selected... Type to add more` : "Enter or Select GSTIN"}
                                                value={gstInput}
                                                onChange={(e) => setGstInput(e.target.value)}
                                                onFocus={() => setShowGstDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowGstDropdown(false), 200)}
                                            />
                                            {/* Dropdown Simulation */}
                                            {showGstDropdown && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                                                    {mockGSTINs.map(gst => (
                                                        <div
                                                            key={gst}
                                                            className={`px-4 py-2 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 text-sm ${selectedGSTINs.includes(gst) ? 'bg-indigo-50/50' : ''}`}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault(); // Prevent input blur
                                                                handleGstSelect(gst);
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedGSTINs.includes(gst)}
                                                                readOnly
                                                                className="w-4 h-4 text-indigo-600 rounded"
                                                            />
                                                            <span className="text-gray-700">{gst}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={handleFetchBranchDetails}
                                                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 whitespace-nowrap"
                                            >
                                                Fetch branch details
                                            </button>
                                            <span className="text-[10px] text-indigo-500 text-center">from GST Portal & display here</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Branch Details List */}
                                {showBranchDetails && (
                                    <div className="space-y-4">
                                        {selectedGSTINs.map((gstin, index) => {
                                            const branch = mockBranches.find(b => b.gstin === gstin) || { address: 'Address not fetched', defaultRef: 'New Branch' };
                                            const isExpanded = expandedBranches.includes(index + 1);

                                            return (
                                                <div key={gstin} className="border border-indigo-100 rounded-lg overflow-hidden bg-white shadow-sm">
                                                    {/* Header */}
                                                    <div
                                                        className="flex items-center justify-between px-6 py-4 bg-indigo-50/50 cursor-pointer hover:bg-indigo-50"
                                                        onClick={() => toggleBranchExpand(index + 1)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-xs font-semibold text-gray-600">
                                                                {index + 1}
                                                            </span>
                                                            <span className="font-semibold text-gray-800">{branch.defaultRef}</span>
                                                        </div>
                                                        <span className="text-gray-400">
                                                            {isExpanded ? '▲' : '▼'}
                                                        </span>
                                                    </div>

                                                    {/* Expanded Content */}
                                                    {isExpanded && (
                                                        <div className="p-6 grid grid-cols-1 gap-6">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-500 mb-1">Address (Fetched)</label>
                                                                <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                                                                    {branch.address}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-500 mb-1">Reference Name</label>
                                                                <input type="text" defaultValue={branch.defaultRef} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Contact Person</label>
                                                                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Contact Number</label>
                                                                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                                                                <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer Buttons for GST Tab */}
                        <div className="flex justify-end gap-4 mt-12 border-t border-gray-200 pt-6">
                            <button onClick={() => setView('list')} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">Next</button>
                        </div>
                    </div>
                )}

                {/* Products/Services Content */}
                {activeTab === 'Products/Services' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                <div className="col-span-1">No</div>
                                <div className="col-span-3">Item Code <span className="text-red-500">*</span></div>
                                <div className="col-span-3">Item Name</div>
                                <div className="col-span-2">Customer Item Code</div>
                                <div className="col-span-2">Customer Item Name</div>
                                <div className="col-span-1 text-center">Action</div>
                            </div>

                            {/* Table Body */}
                            <div className="divide-y divide-gray-100">
                                {productRows.map((row, index) => (
                                    <div key={row.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                                        <div className="col-span-1 text-sm text-gray-500 font-medium">{index + 1}</div>
                                        <div className="col-span-3">
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                                                value={row.itemCode}
                                                onChange={(e) => handleProductRowChange(row.id, 'itemCode', e.target.value)}
                                            >
                                                <option value="">Select Item</option>
                                                {mockItems.map(item => (
                                                    <option key={item.code} value={item.code}>{item.code} - {item.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="text"
                                                readOnly
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
                                                placeholder="Auto-fetched"
                                                value={row.itemName}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                placeholder="Optional"
                                                value={row.custItemCode}
                                                onChange={(e) => handleProductRowChange(row.id, 'custItemCode', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                placeholder="Optional"
                                                value={row.custItemName}
                                                onChange={(e) => handleProductRowChange(row.id, 'custItemName', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <button
                                                onClick={() => handleRemoveProductRow(row.id)}
                                                disabled={productRows.length === 1}
                                                className={`p-2 rounded-full hover:bg-red-50 transition-colors ${productRows.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-500 cursor-pointer'}`}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add Row Button */}
                        <div className="mb-12">
                            <button
                                onClick={handleAddProductRow}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors shadow-sm border border-indigo-200"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
                            <button onClick={() => setView('list')} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">Next</button>
                        </div>
                    </div>
                )}

                {/* TDS & Other Statutory Details Content */}
                {activeTab === 'TDS & Other Statutory Details' && (
                    <div className="max-w-6xl mx-auto space-y-10">

                        {/* SECTION 1: STATUTORY INFORMATION */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-6">Statutory Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">MSME (Udyam) Registration Number</label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                            placeholder="UDYAM-XX-00-000000"
                                            value={statutoryDetails.msmeNo}
                                            onChange={(e) => setStatutoryDetails({ ...statutoryDetails, msmeNo: e.target.value })}
                                        />
                                        <button className="absolute right-2 p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-gray-100 transition-colors">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">FSSAI License Number</label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                            placeholder="14-digit License Number"
                                            value={statutoryDetails.fssaiNo}
                                            onChange={(e) => setStatutoryDetails({ ...statutoryDetails, fssaiNo: e.target.value })}
                                        />
                                        <button className="absolute right-2 p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-gray-100 transition-colors">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: IMPORT / EXPORT & COMPLIANCE */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-6">Import / Export & Compliance</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Import Export Code (IEC)</label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                            placeholder="10-DIGIT IEC CODE"
                                            value={statutoryDetails.iecCode}
                                            onChange={(e) => setStatutoryDetails({ ...statutoryDetails, iecCode: e.target.value })}
                                        />
                                        <button className="absolute right-2 p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-gray-100 transition-colors">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">EOU Status</label>
                                        <select
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                                            value={statutoryDetails.eouStatus}
                                            onChange={(e) => setStatutoryDetails({ ...statutoryDetails, eouStatus: e.target.value })}
                                        >
                                            <option>Export Oriented Unit (EOU)</option>
                                            <option>SEZ Unit</option>
                                            <option>STP Unit</option>
                                            <option>None</option>
                                        </select>
                                    </div>

                                    {/* Conditional Uploads for EOU/SEZ/STP */}
                                    {statutoryDetails.eouStatus !== 'None' && (
                                        <div className="flex gap-8 pl-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-500">Letter of Permission</span>
                                                <button className="p-1.5 border border-gray-200 rounded-md text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-gray-50 transition-colors">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-500">Green Card</span>
                                                <button className="p-1.5 border border-gray-200 rounded-md text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-gray-50 transition-colors">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: TAX CONFIGURATION */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-6">Tax Configuration</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* TCS Card */}
                                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50/30">
                                    <div className="flex justify-between items-start mb-4">
                                        <h5 className="font-semibold text-gray-800">TCS Configuration</h5>
                                        <span className="text-gray-400" title="Information">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Applicable Section</label>
                                            <select
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                                                value={statutoryDetails.tcsSection}
                                                onChange={(e) => setStatutoryDetails({ ...statutoryDetails, tcsSection: e.target.value })}
                                            >
                                                <option value="">Select TCS Section</option>
                                                <option value="206C(1H)">206C(1H) - Sale of Goods</option>
                                                <option value="Others">Others</option>
                                            </select>
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                checked={statutoryDetails.tcsEnabled}
                                                onChange={(e) => setStatutoryDetails({ ...statutoryDetails, tcsEnabled: e.target.checked })}
                                            />
                                            <span className="text-sm text-gray-700">Enable automatic TCS posting</span>
                                        </label>
                                    </div>
                                </div>

                                {/* TDS Card */}
                                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50/30">
                                    <div className="flex justify-between items-start mb-4">
                                        <h5 className="font-semibold text-gray-800">TDS Configuration</h5>
                                        <span className="text-gray-400" title="Information">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Receivable Section</label>
                                            <select
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                                                value={statutoryDetails.tdsSection}
                                                onChange={(e) => setStatutoryDetails({ ...statutoryDetails, tdsSection: e.target.value })}
                                            >
                                                <option value="">Select TDS Section</option>
                                                <option value="194Q">194Q - Purchase of Goods</option>
                                                <option value="194C">194C - Payments to Contractors</option>
                                            </select>
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                                checked={statutoryDetails.tdsEnabled}
                                                onChange={(e) => setStatutoryDetails({ ...statutoryDetails, tdsEnabled: e.target.checked })}
                                            />
                                            <span className="text-sm text-gray-700">Enable automatic TDS posting</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
                            <button onClick={() => setView('list')} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">Next</button>
                        </div>
                    </div>
                )}

                {/* Banking Info Content */}
                {activeTab === 'Banking Info' && (
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Info Banner */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                            <span className="text-yellow-500 mt-0.5">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            </span>
                            <p className="text-sm text-yellow-800">
                                <span className="font-semibold">Note:</span> Banking information is optional and primarily used for Sales Returns or refunds.
                            </p>
                        </div>

                        {/* Bank Accounts Section */}
                        {bankAccounts.length === 0 ? (
                            // Empty State
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                                <p className="text-gray-500 mb-6">No bank accounts added yet</p>
                                <button
                                    onClick={handleAddBank}
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                    + Add Bank Account
                                </button>
                            </div>
                        ) : (
                            // Detailed Card List
                            <div className="space-y-6">
                                {bankAccounts.map((account, index) => (
                                    <div key={account.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
                                            <h4 className="font-semibold text-gray-800">Bank Account {index + 1}</h4>
                                            <button
                                                onClick={() => handleRemoveBank(account.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Remove Bank Account"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            {/* Column 1 */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Bank Account Number</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter account number"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                        value={account.accountNumber}
                                                        onChange={(e) => handleBankChange(account.id, 'accountNumber', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">IFSC Code</label>
                                                    <input
                                                        type="text"
                                                        placeholder="ABCD0123456"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                        value={account.ifscCode}
                                                        onChange={(e) => handleBankChange(account.id, 'ifscCode', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">SWIFT Code</label>
                                                    <input
                                                        type="text"
                                                        placeholder="ENTER SWIFT CODE"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                        value={account.swiftCode}
                                                        onChange={(e) => handleBankChange(account.id, 'swiftCode', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Column 2 */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Bank Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter bank name"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                        value={account.bankName}
                                                        onChange={(e) => handleBankChange(account.id, 'bankName', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Branch Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter branch name"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                        value={account.branchName}
                                                        onChange={(e) => handleBankChange(account.id, 'branchName', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Full Width - Associate to Vendor Branch */}
                                        <div className="mb-2">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Associate to Vendor Branch</label>
                                            <select
                                                multiple
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm h-24 bg-white"
                                                value={account.associatedBranches}
                                                onChange={(e) => {
                                                    const selected = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                                                    handleBankChange(account.id, 'associatedBranches', selected);
                                                }}
                                            >
                                                <option value="Bangalore HO">Bangalore HO</option>
                                                <option value="City Branch">City Branch</option>
                                                <option value="Mumbai Branch">Mumbai Branch</option>
                                            </select>
                                            <p className="text-[10px] text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple branches</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Another Bank Button */}
                                <div>
                                    <button
                                        onClick={handleAddBank}
                                        className="px-4 py-2 border border-indigo-200 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center gap-2"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        Add Another Bank
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
                            <button onClick={() => setView('list')} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">Next</button>
                        </div>
                    </div>
                )}

                {/* Terms & Conditions Content */}
                {activeTab === 'Terms & Conditions' && (
                    <div className="max-w-6xl mx-auto space-y-6">

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Credit Period</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                placeholder="e.g., 30 Days"
                                value={termsDetails.creditPeriod}
                                onChange={(e) => setTermsDetails({ ...termsDetails, creditPeriod: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Credit Terms</label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                placeholder="Enter credit terms details"
                                value={termsDetails.creditTerms}
                                onChange={(e) => setTermsDetails({ ...termsDetails, creditTerms: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Penalty Terms</label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                placeholder="Enter penalty terms"
                                value={termsDetails.penaltyTerms}
                                onChange={(e) => setTermsDetails({ ...termsDetails, penaltyTerms: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Terms</label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                placeholder="Enter delivery terms"
                                value={termsDetails.deliveryTerms}
                                onChange={(e) => setTermsDetails({ ...termsDetails, deliveryTerms: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Warranty / Guarantee Details</label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                placeholder="Enter warranty or guarantee details"
                                value={termsDetails.warrantyDetails}
                                onChange={(e) => setTermsDetails({ ...termsDetails, warrantyDetails: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Force Majeure</label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                placeholder="Enter force majeure terms"
                                value={termsDetails.forceMajeure}
                                onChange={(e) => setTermsDetails({ ...termsDetails, forceMajeure: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Dispute and Redressal Terms</label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                placeholder="Enter dispute and redressal terms"
                                value={termsDetails.disputeTerms}
                                onChange={(e) => setTermsDetails({ ...termsDetails, disputeTerms: e.target.value })}
                            />
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-4 border-t border-gray-200 pt-6 mt-8">
                            <button onClick={() => setView('list')} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button
                                onClick={() => {
                                    alert('Customer Onboarded Successfully! (Mock)');
                                    setView('list');
                                }}
                                className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                Onboard Customer
                            </button>
                        </div>
                    </div>
                )}

                {activeTab !== 'Basic Details' && activeTab !== 'GST Details' && activeTab !== 'Products/Services' && activeTab !== 'TDS & Other Statutory Details' && activeTab !== 'Banking Info' && activeTab !== 'Terms & Conditions' && (
                    <div className="py-12 text-center text-gray-500 italic">
                        {activeTab} content coming soon.
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Customer Management</h3>
                <button
                    onClick={() => setView('create')}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <span>+</span> Create New Customer
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                <div className="md:col-span-8">
                    <input
                        type="text"
                        placeholder="Search by customer name or code..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="md:col-span-2">
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-700"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option>All Status</option>
                        <option>Live</option>
                        <option>Dormant</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-700"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option>All Categories</option>
                        <option>Retail</option>
                        <option>Wholesale</option>
                        <option>Corporate</option>
                    </select>
                </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">Showing {filteredCustomers.length} of {customers.length} customers</p>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORY</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CUSTOMER CODE</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CUSTOMER NAME</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.status === 'Live'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {customer.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button className={`hover:text-red-700 transition-colors ${customer.status === 'Live' ? 'text-gray-300 cursor-not-allowed' : 'text-red-500'
                                        }`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredCustomers.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">No customers found.</div>
                )}
            </div>
        </div>
    );
};

const SalesOrderContent: React.FC = () => {
    const [subTab, setSubTab] = useState<'Sales Quotation' | 'Sales Order'>('Sales Quotation');

    // Sales Quotation State
    const [sqForm, setSqForm] = useState({
        name: '',
        category: '',
        prefix: 'SQ/',
        suffix: '/24-25',
        autoYear: true,
        digits: 4
    });
    const [sqList] = useState([
        { id: 1, name: 'Retail Sales Quotation', category: 'Retail', prefix: 'SQ/RET...', suffix: '', digits: 4 },
        { id: 2, name: 'Wholesale SQ', category: 'Wholesale', prefix: 'SQ/WS...', suffix: '/24-25', digits: 4 },
    ]);

    // Sales Order State
    const [soForm, setSoForm] = useState({
        name: '',
        category: '',
        prefix: 'SO/',
        suffix: '/24-25',
        autoYear: true,
        digits: 4
    });
    const [soList] = useState([
        { id: 1, name: 'Retail Sales Order', category: 'Retail', displayDetails: 'SO/RET... (4 digits)', digits: 4 },
        { id: 2, name: 'Corporate SO', category: 'Corporate', displayDetails: 'SO/CORP... (5 digits)', digits: 5 },
    ]);

    const isSQ = subTab === 'Sales Quotation';
    const form = isSQ ? sqForm : soForm;
    const setForm = isSQ ? setSqForm : setSoForm;
    const list = isSQ ? sqList : soList;

    const handleChange = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const getPreview = () => {
        const yearPart = form.autoYear ? '/2026' : ''; // Mock year
        const numberPart = '0'.repeat(Math.max(0, form.digits - 1)) + '1';
        return `${form.prefix}${yearPart}${form.suffix}/${numberPart}`;
    };

    return (
        <div className="p-8">
            {/* Sub-tabs */}
            <div className="mb-8">
                <div className="bg-gray-50 p-1 rounded-lg inline-flex">
                    {['Sales Quotation', 'Sales Order'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSubTab(tab as any)}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${subTab === tab
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: New Series Form */}
                <div className="lg:col-span-4 space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
                        New {subTab} Series
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name of Series <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder={`e.g. Retail ${subTab}`}
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Category <span className="text-red-500">*</span></label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-600"
                            value={form.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                        >
                            <option value="">Select Category</option>
                            <option value="Retail">Retail</option>
                            <option value="Wholesale">Wholesale</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Distributor">Distributor</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Prefix</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={form.prefix}
                                onChange={(e) => handleChange('prefix', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Suffix</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={form.suffix}
                                onChange={(e) => handleChange('suffix', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div className="flex items-center pt-6">
                            <input
                                id="autoYear"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={form.autoYear}
                                onChange={(e) => handleChange('autoYear', e.target.checked)}
                            />
                            <label htmlFor="autoYear" className="ml-2 block text-sm text-gray-700">Auto Year</label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Digits</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={form.digits}
                                onChange={(e) => handleChange('digits', Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="bg-gray-100 rounded-md p-6 text-center">
                        <p className="text-xs uppercase text-gray-500 font-semibold mb-2">SAMPLE PREVIEW</p>
                        <p className="text-xl font-bold text-gray-800 font-mono">{getPreview()}</p>
                    </div>

                    <button className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors">
                        Save Series
                    </button>
                </div>

                {/* Right: Table */}
                <div className="lg:col-span-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Category {isSQ ? 'Sales Quote' : 'SO'} Series Preview</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORY</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DETAILS</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {list.map((series) => (
                                    <tr key={series.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{series.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{series.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {'displayDetails' in series ? series.displayDetails : `${series.prefix} (${series.digits} digits)`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {list.length === 0 && (
                            <div className="p-8 text-center text-gray-500 text-sm">No series found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LongTermContractsContent: React.FC = () => {
    const [view, setView] = useState<'list' | 'create'>('list');
    const [activeTab, setActiveTab] = useState('Basic Details');
    const [automateBilling, setAutomateBilling] = useState(false);

    // Products State
    const [contractProducts, setContractProducts] = useState([
        { id: 1, itemCode: '', itemName: 'Product Name', customerItemName: '', qtyMin: '', qtyMax: '', priceMin: '', priceMax: '', deviation: '' }
    ]);

    const handleAddProduct = () => {
        setContractProducts([...contractProducts, {
            id: contractProducts.length + 1,
            itemCode: '',
            itemName: 'Product Name',
            customerItemName: '',
            qtyMin: '',
            qtyMax: '',
            priceMin: '',
            priceMax: '',
            deviation: ''
        }]);
    };

    const handleRemoveProduct = (id: number) => {
        setContractProducts(contractProducts.filter(p => p.id !== id));
    };

    const handleProductChange = (id: number, field: string, value: string) => {
        setContractProducts(contractProducts.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    // Terms State
    const [terms, setTerms] = useState({
        paymentTerms: '',
        penaltyTerms: '',
        forceMajeure: '',
        terminationClause: '',
        disputeTerms: '',
        others: ''
    });

    // Mock Data
    const contracts = [
        { id: 1, contractNo: 'CT-2026-001', customerName: 'Acme Corporation', type: 'Rate Contract', validFrom: '2026-01-01', validTo: '2026-12-31' },
        { id: 2, contractNo: 'CT-2026-002', customerName: 'Tech Solutions Ltd', type: 'Service Contract', validFrom: '2026-02-01', validTo: '2027-01-31' },
        { id: 3, contractNo: 'CT-2026-003', customerName: 'Global Enterprises Inc', type: 'AMC', validFrom: '2026-03-01', validTo: '2027-02-28' },
        { id: 4, contractNo: 'CT-2025-045', customerName: 'Retail Chain Pvt Ltd', type: 'Rate Contract', validFrom: '2025-10-01', validTo: '2026-09-30' },
        { id: 5, contractNo: 'CT-2026-005', customerName: 'Manufacturing Co Ltd', type: 'Service Contract', validFrom: '2026-01-15', validTo: '2026-07-14' },
    ];

    const getBadgeStyle = (type: string) => {
        switch (type) {
            case 'Rate Contract': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
            case 'Service Contract': return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
            case 'AMC': return 'bg-green-100 text-green-700 hover:bg-green-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (view === 'create') {
        return (
            <div className="p-8">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Add New Contract</h3>
                    </div>

                    {/* Tabs */}
                    <div className="px-8 pt-6">
                        <nav className="flex space-x-8 border-b border-gray-200" aria-label="Tabs">
                            {['Basic Details', 'Products / Services', 'Terms & Conditions'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {activeTab === 'Basic Details' && (
                            <div className="max-w-4xl space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Contract Number <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                disabled
                                                value="CT-2026-224"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Contract Type <span className="text-red-500">*</span></label>
                                            <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white">
                                                <option value="">Select Type</option>
                                                <option value="Rate Contract">Rate Contract</option>
                                                <option value="Service Contract">Service Contract</option>
                                                <option value="AMC">AMC</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Contract Validity From <span className="text-red-500">*</span></label>
                                            <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400" />
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Name <span className="text-red-500">*</span></label>
                                            <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white">
                                                <option value="">Select Customer</option>
                                                <option value="1">Acme Corporation</option>
                                                <option value="2">Tech Solutions Ltd</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Branch <span className="text-red-500">*</span></label>
                                            <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white">
                                                <option value="">Select Branch</option>
                                                <option value="1">Bangalore HO</option>
                                                <option value="2">Pune Branch</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Contract Validity To <span className="text-red-500">*</span></label>
                                            <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Full Width Fields */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Attach Long-term Contract</label>
                                        <div className="border border-gray-300 rounded-md px-4 py-2 flex items-center gap-4 bg-white">
                                            <button className="px-3 py-1.5 border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 transition-colors flex items-center gap-2">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                                Choose File
                                            </button>
                                            <span className="text-xs text-gray-400">Supported formats: PDF, DOC (Max size: 10MB)</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="automate-billing"
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                            checked={automateBilling}
                                            onChange={(e) => setAutomateBilling(e.target.checked)}
                                        />
                                        <label htmlFor="automate-billing" className="text-sm font-semibold text-gray-700 select-none cursor-pointer">Automate Billing</label>
                                    </div>

                                    {/* Conditional Billing Configuration */}
                                    {automateBilling && (
                                        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50/50 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <h4 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Billing Configuration</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Bill Start Date <span className="text-red-500">*</span></label>
                                                    <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Billing Frequency <span className="text-red-500">*</span></label>
                                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white">
                                                        <option value="">Select Frequency</option>
                                                        <option value="Weekly">Weekly</option>
                                                        <option value="Monthly">Monthly</option>
                                                        <option value="Quarterly">Quarterly</option>
                                                        <option value="Half-Yearly">Half-Yearly</option>
                                                    </select>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Bill Period <span className="text-red-500">*</span></label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1">
                                                            <span className="text-xs text-gray-500 mb-1 block">From</span>
                                                            <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white" />
                                                        </div>
                                                        <span className="mt-5 text-gray-400">to</span>
                                                        <div className="flex-1">
                                                            <span className="text-xs text-gray-500 mb-1 block">To</span>
                                                            <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'Products / Services' && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">PRODUCTS / SERVICES</h4>
                                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">NO</th>
                                                <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">ITEM CODE</th>
                                                <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">ITEM NAME</th>
                                                <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">CUSTOMER ITEM NAME</th>
                                                <th colSpan={2} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">QUANTITY</th>
                                                <th colSpan={2} className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">PRICE</th>
                                                <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">ACCEPTABLE PRICE DEVIATION</th>
                                                <th rowSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">ACTIONS</th>
                                            </tr>
                                            <tr>
                                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-100">MIN</th>
                                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">MAX</th>
                                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-100">MIN</th>
                                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">MAX</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {contractProducts.map((product, index) => (
                                                <tr key={product.id}>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="relative">
                                                            <select
                                                                className="block w-full pl-3 pr-8 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                                                                value={product.itemCode}
                                                                onChange={(e) => handleProductChange(product.id, 'itemCode', e.target.value)}
                                                            >
                                                                <option value="">Select</option>
                                                                <option value="ITEM-001">ITEM-001</option>
                                                                <option value="ITEM-002">ITEM-002</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="text"
                                                            className="block w-full px-3 py-1.5 text-sm border-gray-300 rounded-md bg-gray-50 text-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
                                                            value={product.itemName}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="text"
                                                            className="block w-full px-3 py-1.5 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                            placeholder="Customer item name"
                                                            value={product.customerItemName}
                                                            onChange={(e) => handleProductChange(product.id, 'customerItemName', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-3 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            className="block w-full px-2 py-1.5 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-center"
                                                            value={product.qtyMin}
                                                            onChange={(e) => handleProductChange(product.id, 'qtyMin', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-3 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            className="block w-full px-2 py-1.5 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-center"
                                                            value={product.qtyMax}
                                                            onChange={(e) => handleProductChange(product.id, 'qtyMax', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-3 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            className="block w-full px-2 py-1.5 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-center"
                                                            value={product.priceMin}
                                                            onChange={(e) => handleProductChange(product.id, 'priceMin', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-3 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            className="block w-full px-2 py-1.5 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-center"
                                                            value={product.priceMax}
                                                            onChange={(e) => handleProductChange(product.id, 'priceMax', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="text"
                                                            className="block w-full px-3 py-1.5 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                            placeholder="e.g., ±5%"
                                                            value={product.deviation}
                                                            onChange={(e) => handleProductChange(product.id, 'deviation', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                                        <button
                                                            onClick={() => handleRemoveProduct(product.id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                            disabled={contractProducts.length === 1}
                                                        >
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button
                                    onClick={handleAddProduct}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    Add New Product
                                </button>
                            </div>
                        )}

                        {activeTab === 'Terms & Conditions' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Terms</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400 resize-none"
                                        placeholder="Enter payment terms"
                                        value={terms.paymentTerms}
                                        onChange={(e) => setTerms({ ...terms, paymentTerms: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Penalty Terms</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400 resize-none"
                                        placeholder="Enter penalty terms"
                                        value={terms.penaltyTerms}
                                        onChange={(e) => setTerms({ ...terms, penaltyTerms: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Force Majeure</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400 resize-none"
                                        placeholder="Enter force majeure details"
                                        value={terms.forceMajeure}
                                        onChange={(e) => setTerms({ ...terms, forceMajeure: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Termination Clause</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400 resize-none"
                                        placeholder="Enter termination clause"
                                        value={terms.terminationClause}
                                        onChange={(e) => setTerms({ ...terms, terminationClause: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Dispute & Redressal Terms</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400 resize-none"
                                        placeholder="Enter dispute resolution terms"
                                        value={terms.disputeTerms}
                                        onChange={(e) => setTerms({ ...terms, disputeTerms: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Others</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400 resize-none"
                                        placeholder="Any other terms"
                                        value={terms.others}
                                        onChange={(e) => setTerms({ ...terms, others: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab !== 'Basic Details' && activeTab !== 'Products / Services' && activeTab !== 'Terms & Conditions' && (
                            <div className="py-12 text-center text-gray-500 italic">
                                {activeTab} content coming soon.
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex justify-between border-t border-gray-200 mt-8 pt-6">
                            <button
                                onClick={() => setView('list')}
                                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <div className="flex gap-3">
                                {activeTab !== 'Basic Details' && (
                                    <button
                                        onClick={() => {
                                            if (activeTab === 'Terms & Conditions') setActiveTab('Products / Services');
                                            else if (activeTab === 'Products / Services') setActiveTab('Basic Details');
                                        }}
                                        className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (activeTab === 'Basic Details') setActiveTab('Products / Services');
                                        else if (activeTab === 'Products / Services') setActiveTab('Terms & Conditions');
                                        else if (activeTab === 'Terms & Conditions') {
                                            alert('Contract Created Successfully!');
                                            setView('list');
                                        }
                                    }}
                                    className={`px-8 py-2 text-white rounded-md text-sm font-medium transition-colors ${activeTab === 'Terms & Conditions' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                        }`}
                                >
                                    {activeTab === 'Terms & Conditions' ? 'Save' : 'Next'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Long-term Contracts</h3>
                    <p className="text-sm text-gray-500">Manage rate contracts and service contracts</p>
                </div>
                <button
                    onClick={() => setView('create')}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add New Contract
                </button>
            </div>

            {/* Contracts Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">CONTRACT NO</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">CUSTOMER REFERENCE NAME</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">CONTRACT TYPE</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">VALIDITY PERIOD</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {contracts.map((contract) => (
                            <tr key={contract.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{contract.contractNo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contract.customerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-default ${getBadgeStyle(contract.type)}`}>
                                        {contract.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 tabular-nums">
                                    {contract.validFrom} <span className="mx-2 text-gray-400">-</span> {contract.validTo}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex items-center justify-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button className="text-gray-500 hover:text-indigo-600 transition-colors" title="View/Edit Details">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {contracts.length === 0 && (
                    <div className="py-12 text-center text-gray-500 text-sm">No contracts found.</div>
                )}
            </div>
        </div>
    );
};

// Receipt Content Component
const ReceiptContent: React.FC = () => {
    const [showPostModal, setShowPostModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
    const [postFormData, setPostFormData] = useState({
        dateOfReceipt: '',
        methodOfReceipt: '',
        bankAccount: '',
        bankReferenceNo: ''
    });

    // Mock receipt data - sorted by most recent first
    const receipts = [
        {
            id: 1,
            date: '2026-01-18',
            customerRefName: 'Acme Corporation',
            voucherNo: 'RCP-2026-001',
            amount: 45000.00
        },
        {
            id: 2,
            date: '2026-01-17',
            customerRefName: 'Global Traders',
            voucherNo: 'RCP-2026-002',
            amount: 32500.00
        },
        {
            id: 3,
            date: '2026-01-16',
            customerRefName: 'Tech Solutions Inc',
            voucherNo: 'RCP-2026-003',
            amount: 78500.00
        },
        {
            id: 4,
            date: '2026-01-15',
            customerRefName: 'Sunrise Enterprises',
            voucherNo: 'RCP-2026-004',
            amount: 51200.00
        },
        {
            id: 5,
            date: '2026-01-14',
            customerRefName: 'Metro Supplies Inc',
            voucherNo: 'RCP-2026-005',
            amount: 29800.00
        }
    ];

    // Mock bank accounts - includes both Bank accounts and Bank OD/CC accounts
    const bankAccounts = [
        'HDFC Bank - Current Account ****1234',
        'ICICI Bank - Savings Account ****5678',
        'State Bank of India - Current Account ****9012',
        'Axis Bank OD Account - ****3456',
        'HDFC Bank CC Account - ****7890'
    ];

    const handlePostClick = (receipt: any) => {
        setSelectedReceipt(receipt);
        setPostFormData({
            dateOfReceipt: new Date().toISOString().split('T')[0], // Today's date
            methodOfReceipt: '',
            bankAccount: '',
            bankReferenceNo: ''
        });
        setShowPostModal(true);
    };

    const handleCloseModal = () => {
        setShowPostModal(false);
        setSelectedReceipt(null);
        setPostFormData({
            dateOfReceipt: '',
            methodOfReceipt: '',
            bankAccount: '',
            bankReferenceNo: ''
        });
    };

    const handleFormChange = (field: string, value: string) => {
        setPostFormData(prev => ({
            ...prev,
            [field]: value,
            // Clear bank-specific fields when switching to Cash
            ...(field === 'methodOfReceipt' && value === 'Cash' ? {
                bankAccount: '',
                bankReferenceNo: ''
            } : {})
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!postFormData.dateOfReceipt || !postFormData.methodOfReceipt) {
            alert('Please fill in all required fields');
            return;
        }

        if (postFormData.methodOfReceipt === 'Bank' && (!postFormData.bankAccount || !postFormData.bankReferenceNo)) {
            alert('Please fill in Bank Account and Bank Reference No for Bank payment method');
            return;
        }

        // Here you would typically make an API call to post the receipt
        console.log('Posting receipt:', {
            receipt: selectedReceipt,
            postData: postFormData
        });

        alert('Receipt posted successfully!');
        handleCloseModal();
    };

    return (
        <div className="text-left">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Receipt</h3>
            </div>

            {/* Receipt Listing Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer Reference Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Voucher No
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {receipts.map((receipt) => (
                                <tr key={receipt.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {receipt.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {receipt.customerRefName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {receipt.voucherNo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₹{receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handlePostClick(receipt)}
                                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                                        >
                                            Post
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {receipts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No receipts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Post Receipt Modal */}
            {showPostModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Post Receipt</h2>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="px-6 py-4">
                            <div className="space-y-4">
                                {/* Date of Receipt */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of Receipt <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={postFormData.dateOfReceipt}
                                        onChange={(e) => handleFormChange('dateOfReceipt', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                {/* Method of Receipt */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Method of Receipt <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={postFormData.methodOfReceipt}
                                        onChange={(e) => handleFormChange('methodOfReceipt', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        <option value="">Select method</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Bank">Bank</option>
                                    </select>
                                </div>

                                {/* Bank Account - Visible only when Bank is selected */}
                                {postFormData.methodOfReceipt === 'Bank' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bank Account <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={postFormData.bankAccount}
                                                onChange={(e) => handleFormChange('bankAccount', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                            >
                                                <option value="">Select bank account</option>
                                                {bankAccounts.map((account, index) => (
                                                    <option key={index} value={account}>
                                                        {account}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Includes Bank accounts and Bank OD/CC accounts
                                            </p>
                                        </div>

                                        {/* Bank Reference No - Visible only when Bank is selected */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bank Reference No <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={postFormData.bankReferenceNo}
                                                onChange={(e) => handleFormChange('bankReferenceNo', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Enter bank reference number"
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Customer Ledger View Component
interface CustomerLedgerViewProps {
    customer: { id: string; name: string };
    onBack: () => void;
}

const CustomerLedgerView: React.FC<CustomerLedgerViewProps> = ({ customer, onBack }) => {
    // State for filters
    const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [postFromFilter, setPostFromFilter] = useState<TransactionType | ''>('');
    const [ledgerFilter, setLedgerFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<PurchaseStatus | SalesStatus | ''>('');
    const [debitFilter, setDebitFilter] = useState('');
    const [creditFilter, setCreditFilter] = useState('');

    // Mock ledger data
    const mockLedgerData: LedgerEntry[] = [
        { id: '1', date: '2026-01-05', postFrom: 'Sales', ledger: 'INV-2026-001', status: 'Not Due', debit: 50000, credit: 0, runningBalance: 50000 },
        { id: '2', date: '2026-01-10', postFrom: 'Receipt', ledger: 'RCP-2026-001', status: 'Received', debit: 0, credit: 25000, runningBalance: 25000 },
        { id: '3', date: '2026-01-12', postFrom: 'Sales', ledger: 'INV-2026-002', status: 'Due', debit: 35000, credit: 0, runningBalance: 60000 },
        { id: '4', date: '2026-01-15', postFrom: 'Receipt', ledger: 'RCP-2026-002', status: 'Received', debit: 0, credit: 20000, runningBalance: 40000 },
        { id: '5', date: '2026-01-18', postFrom: 'Credit Note', ledger: 'CN-2026-001', status: 'Received', debit: 0, credit: 5000, runningBalance: 35000 },
    ];

    // Store original data for running balance calculation
    const [originalData] = useState(mockLedgerData);

    // Filter data based on current filters
    const getFilteredData = () => {
        return originalData.filter(entry => {
            if (dateFilter.start && entry.date < dateFilter.start) return false;
            if (dateFilter.end && entry.date > dateFilter.end) return false;
            if (postFromFilter && entry.postFrom !== postFromFilter) return false;
            if (ledgerFilter && !entry.ledger.toLowerCase().includes(ledgerFilter.toLowerCase())) return false;
            if (statusFilter && entry.status !== statusFilter) return false;
            if (debitFilter && entry.debit === 0) return false;
            if (creditFilter && entry.credit === 0) return false;
            return true;
        });
    };

    const filteredData = getFilteredData();
    const totalDebit = filteredData.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = filteredData.reduce((sum, entry) => sum + entry.credit, 0);

    const formatCurrency = (amount: number): string => {
        if (amount === 0) return '-';
        return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusBadgeColor = (status: string): string => {
        if (status === 'Paid') return 'bg-green-100 text-green-800';
        if (status === 'Unpaid') return 'bg-red-100 text-red-800';
        if (status === 'Partially Paid') return 'bg-yellow-100 text-yellow-800';
        if (status === 'Approved') return 'bg-blue-100 text-blue-800';
        if (status === 'Not Due') return 'bg-gray-100 text-gray-800';
        if (status === 'Due') return 'bg-orange-100 text-orange-800';
        if (status === 'Partially Received') return 'bg-yellow-100 text-yellow-800';
        if (status === 'Received') return 'bg-green-100 text-green-800';
        return 'bg-gray-100 text-gray-800';
    };

    const postFromOptions: TransactionType[] = ['Sales', 'Receipt', 'Purchase', 'Payment', 'Debit Note', 'Credit Note'];
    const statusOptions = ['Paid', 'Unpaid', 'Partially Paid', 'Approved', 'Not Due', 'Due', 'Partially Received', 'Received'];

    return (
        <div className="text-left">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    <span className="text-lg font-medium">{customer.name}</span>
                </button>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">Net Off</button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">Month View</button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span>Date</span>
                                        <div className="ml-2 relative group">
                                            <Filter className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600" />
                                            <div className="hidden group-hover:block absolute z-10 top-6 right-0 bg-white shadow-lg rounded-md p-3 w-48">
                                                <input type="date" value={dateFilter.start} onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })} className="w-full px-2 py-1 text-xs border rounded mb-2" placeholder="Start" />
                                                <input type="date" value={dateFilter.end} onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })} className="w-full px-2 py-1 text-xs border rounded" placeholder="End" />
                                            </div>
                                        </div>
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span>Post From</span>
                                        <div className="ml-2 relative group">
                                            <Filter className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600" />
                                            <div className="hidden group-hover:block absolute z-10 top-6 right-0 bg-white shadow-lg rounded-md p-2 w-40">
                                                <select value={postFromFilter} onChange={(e) => setPostFromFilter(e.target.value as TransactionType | '')} className="w-full px-2 py-1 text-xs border rounded">
                                                    <option value="">All</option>
                                                    {postFromOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span>Ledger</span>
                                        <div className="ml-2 relative group">
                                            <Filter className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600" />
                                            <div className="hidden group-hover:block absolute z-10 top-6 right-0 bg-white shadow-lg rounded-md p-2 w-40">
                                                <input type="text" value={ledgerFilter} onChange={(e) => setLedgerFilter(e.target.value)} placeholder="Search..." className="w-full px-2 py-1 text-xs border rounded" />
                                            </div>
                                        </div>
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span>Status</span>
                                        <div className="ml-2 relative group">
                                            <Filter className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600" />
                                            <div className="hidden group-hover:block absolute z-10 top-6 right-0 bg-white shadow-lg rounded-md p-2 w-40 max-h-60 overflow-y-auto">
                                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PurchaseStatus | SalesStatus | '')} className="w-full px-2 py-1 text-xs border rounded">
                                                    <option value="">All</option>
                                                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    <div className="flex items-center justify-end">
                                        <span>Debit</span>
                                        <div className="ml-2 relative group">
                                            <Filter className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600" />
                                            <div className="hidden group-hover:block absolute z-10 top-6 right-0 bg-white shadow-lg rounded-md p-2 w-32">
                                                <label className="flex items-center text-xs"><input type="checkbox" checked={!!debitFilter} onChange={(e) => setDebitFilter(e.target.checked ? 'show' : '')} className="mr-1" />Show only</label>
                                            </div>
                                        </div>
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    <div className="flex items-center justify-end">
                                        <span>Credit</span>
                                        <div className="ml-2 relative group">
                                            <Filter className="w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-600" />
                                            <div className="hidden group-hover:block absolute z-10 top-6 right-0 bg-white shadow-lg rounded-md p-2 w-32">
                                                <label className="flex items-center text-xs"><input type="checkbox" checked={!!creditFilter} onChange={(e) => setCreditFilter(e.target.checked ? 'show' : '')} className="mr-1" />Show only</label>
                                            </div>
                                        </div>
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Running Balance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100">{entry.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100">{entry.postFrom}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">{entry.ledger}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-100">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(entry.status)}`}>{entry.status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 border-r border-gray-100 font-medium">{formatCurrency(entry.debit)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 border-r border-gray-100 font-medium">{formatCurrency(entry.credit)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">{formatCurrency(entry.runningBalance)}</td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No ledger entries found.</td></tr>
                            )}
                        </tbody>
                        <tfoot className="bg-gray-100 font-semibold">
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-sm text-right text-gray-700">Totals:</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-bold border-l border-gray-200">{formatCurrency(totalDebit)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-bold border-l border-gray-200">{formatCurrency(totalCredit)}</td>
                                <td className="px-6 py-4 text-sm text-right text-gray-400 italic">(unchanged)</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Info */}
            <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p>• Running Balance values remain unchanged when filters are applied - they reflect the true sequential ledger balance.</p>
                <p>• Totals (Debit and Credit) update based on filtered visible rows.</p>
                <p>• All columns are filterable except Running Balance.</p>
            </div>
        </div>
    );
};

// Sales Content Component with Aging Buckets
const SalesContent: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<SalesCategory>('Stock-in-Trade');
    const [showLedgerView, setShowLedgerView] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<{ id: string, name: string } | null>(null);

    // Mock data for demonstration - same structure for all categories
    const getMockData = (category: SalesCategory): AgingData[] => {
        // In a real app, this would fetch data based on category
        const baseData: AgingData[] = [
            {
                customerId: '1',
                customerCode: 'CUST-001',
                customerName: 'Acme Corporation',
                notDue: 50000,
                days0to45: 25000,
                days45to90: 15000,
                months6: 10000,
                year1: 5000
            },
            {
                customerId: '2',
                customerCode: 'CUST-002',
                customerName: 'Global Traders Pvt Ltd',
                notDue: 75000,
                days0to45: 0,
                days45to90: 30000,
                months6: 0,
                year1: 12000
            },
            {
                customerId: '3',
                customerCode: 'CUST-003',
                customerName: 'TechVision Solutions',
                notDue: 0,
                days0to45: 45000,
                days45to90: 0,
                months6: 25000,
                year1: 0
            },
            {
                customerId: '4',
                customerCode: 'CUST-004',
                customerName: 'Sunrise Enterprises',
                notDue: 120000,
                days0to45: 35000,
                days45to90: 18000,
                months6: 8000,
                year1: 3000
            },
            {
                customerId: '5',
                customerCode: 'CUST-005',
                customerName: 'Metro Supplies Inc',
                notDue: 0,
                days0to45: 0,
                days45to90: 42000,
                months6: 15000,
                year1: 22000
            },
        ];

        return baseData;
    };

    const formatCurrency = (amount: number): string => {
        return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleViewCustomer = (customerId: string, customerName: string) => {
        // Navigate to Customer Ledger View
        setSelectedCustomer({ id: customerId, name: customerName });
        setShowLedgerView(true);
    };

    const handleBackToAging = () => {
        setShowLedgerView(false);
        setSelectedCustomer(null);
    };

    const handleSendMail = (customer: AgingData) => {
        // TODO: Auto-draft reminder email
        const totalDue = customer.days0to45 + customer.days45to90 + customer.months6 + customer.year1;
        alert(
            `Draft Reminder Email for ${customer.customerName}\n\n` +
            `Customer Code: ${customer.customerCode}\n` +
            `Total Outstanding: ${formatCurrency(totalDue)}\n\n` +
            `Aging Breakdown:\n` +
            `• 0-45 Days: ${formatCurrency(customer.days0to45)}\n` +
            `• 45-90 Days: ${formatCurrency(customer.days45to90)}\n` +
            `• 6 Months: ${formatCurrency(customer.months6)}\n` +
            `• 1 Year+: ${formatCurrency(customer.year1)}\n\n` +
            `This email would be editable before sending.`
        );
    };

    const categories: SalesCategory[] = ['Stock-in-Trade', 'Finished Goods', 'Services'];
    const currentData = getMockData(activeCategory);

    // Show ledger view if customer is selected
    if (showLedgerView && selectedCustomer) {
        return <CustomerLedgerView customer={selectedCustomer} onBack={handleBackToAging} />;
    }

    return (
        <div className="text-left">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Sales - Customer Aging</h3>
            </div>

            {/* Category Tabs */}
            <div className="mb-6 bg-gray-50 p-2 rounded-lg inline-block border border-gray-200">
                <div className="flex space-x-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeCategory === category
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-gray-600 hover:bg-white/50'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* All Categories Note */}
            <div className="mb-4 flex items-center text-sm text-emerald-600">
                <span className="mr-2">→</span>
                <span className="font-medium">All categories use the same table layout and behavior</span>
            </div>

            {/* Aging Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* Customer Information */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    Customer Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                    Customer Name
                                </th>

                                {/* Aging Buckets */}
                                <th colSpan={5} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-indigo-50 border-b border-gray-200">
                                    Amount - Due For
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                                    Actions
                                </th>
                            </tr>
                            <tr>
                                <th className="border-r border-gray-200"></th>
                                <th className="border-r border-gray-200"></th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-indigo-50 border-r border-gray-200">
                                    Not Due
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-indigo-50 border-r border-gray-200">
                                    0-45 Days
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-indigo-50 border-r border-gray-200">
                                    45-90 Days
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-indigo-50 border-r border-gray-200">
                                    &gt; 6 Months
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-indigo-50 border-r border-gray-200">
                                    &gt; 1 Year
                                </th>
                                <th className="border-l border-gray-200"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentData.map((customer) => (
                                <tr key={customer.customerId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">
                                        {customer.customerCode}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100">
                                        {customer.customerName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 border-r border-gray-100">
                                        {customer.notDue > 0 ? formatCurrency(customer.notDue) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 border-r border-gray-100">
                                        {customer.days0to45 > 0 ? formatCurrency(customer.days0to45) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 border-r border-gray-100">
                                        {customer.days45to90 > 0 ? formatCurrency(customer.days45to90) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 border-r border-gray-100">
                                        {customer.months6 > 0 ? formatCurrency(customer.months6) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 border-r border-gray-100">
                                        {customer.year1 > 0 ? formatCurrency(customer.year1) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border-l border-gray-100">
                                        <div className="flex items-center justify-center space-x-4">
                                            <button
                                                onClick={() => handleViewCustomer(customer.customerId, customer.customerName)}
                                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                title="View Customer Ledger"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleSendMail(customer)}
                                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                                title="Send Reminder Email"
                                            >
                                                <Mail className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {/* Empty State */}
                            {currentData.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        No sales aging data available for {activeCategory}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Notes */}
            <div className="mt-4 flex items-start space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1 text-indigo-600" />
                    <span>View icon → navigates to Customer Ledger filtered for selected customer</span>
                </div>
                <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1 text-blue-600" />
                    <span>Mail icon → auto-drafts reminder email with due amounts and aging breakup</span>
                </div>
            </div>
        </div>
    );
};

export default CustomerPortalPage;
