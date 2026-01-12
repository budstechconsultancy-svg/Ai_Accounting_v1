// Vendor Portal - Master Configuration
import React, { useState, useEffect } from 'react';
import { httpClient } from '../../services/httpClient';
import { CategoryHierarchicalDropdown } from '../../components/CategoryHierarchicalDropdown';
import Icon from '../../components/Icon'; // Assuming Icon component exists

type VendorTab = 'Master' | 'Transaction' | 'Report';
type MasterSubTab = 'Category' | 'PO Settings' | 'Vendor Creation';

// Category Interface (Mirrors Inventory)
interface Category {
    id: number;
    name: string;
    parent: number | null;
    parent_name: string | null;
    is_system: boolean;
    is_active: boolean;
    description: string;
    display_order: number;
    full_path: string;
    level: number;
    subcategories_count: number;
}

// PO Series Interface
interface POSeries {
    id: number;
    name: string;
    category: string;
    prefix: string;
    suffix: string;
    auto_financial_year: boolean;
    digits: number;
    current_value: number;
    is_active: boolean;
}

const VendorPortalPage: React.FC = () => {
    // Tab State
    const [activeTab, setActiveTab] = useState<VendorTab>('Master');
    const [activeMasterSubTab, setActiveMasterSubTab] = useState<MasterSubTab>('Category');

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
    const [poCategory, setPoCategory] = useState('');
    const [poPrefix, setPoPrefix] = useState('');
    const [poSuffix, setPoSuffix] = useState('');
    const [poAutoYear, setPoAutoYear] = useState(true);
    const [poDigits, setPoDigits] = useState(4);

    // Fetch PO Series
    const fetchPOSeries = async () => {
        try {
            setLoadingPOSeries(true);
            const response = await httpClient.get('/api/vendors/po-series/');
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
        if (activeTab === 'Master' && activeMasterSubTab === 'PO Settings') {
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
        const payload = {
            name: poName,
            category: poCategory,
            prefix: poPrefix,
            suffix: poSuffix,
            auto_financial_year: poAutoYear,
            digits: poDigits,
            is_active: true
        };

        try {
            if (isEditModePO && selectedPOSeries) {
                await httpClient.put(`/api/vendors/po-series/${selectedPOSeries.id}/`, payload);
            } else {
                await httpClient.post('/api/vendors/po-series/', payload);
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
            await httpClient.delete(`/api/vendors/po-series/${id}/`);
            fetchPOSeries();
        } catch (error) {
            console.error('Error deleting PO Series:', error);
        }
    };

    const handleEditPO = (series: POSeries) => {
        setSelectedPOSeries(series);
        setPoName(series.name);
        setPoCategory(series.category);
        setPoPrefix(series.prefix);
        setPoSuffix(series.suffix);
        setPoAutoYear(series.auto_financial_year);
        setPoDigits(series.digits);
        setIsEditModePO(true);
    };

    const resetPOForm = () => {
        setPoName('');
        setPoCategory('');
        setPoPrefix('');
        setPoSuffix('');
        setPoAutoYear(true);
        setPoDigits(4);
        setIsEditModePO(false);
        setSelectedPOSeries(null);
    };

    // Fetch Categories
    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await httpClient.get('/api/inventory/categories/');
            // httpClient.get() returns the data directly, not wrapped in .data
            setCategories(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    };

    // Initial Load
    useEffect(() => {
        if (activeTab === 'Master' && activeMasterSubTab === 'Category') {
            fetchCategories();
        }
    }, [activeTab, activeMasterSubTab]);

    // Handle Form Submit
    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name: categoryName,
            parent: parentCategoryId,
            description: categoryDescription,
            is_active: true
        };

        try {
            if (isEditModeCategory && selectedCategory) {
                if (selectedCategory.is_system) {
                    alert('System categories cannot be edited.');
                    return;
                }
                await httpClient.put(`/api/inventory/categories/${selectedCategory.id}/`, payload);
            } else {
                await httpClient.post('/api/inventory/categories/', payload);
            }
            fetchCategories();
            resetCategoryForm();
        } catch (error: any) {
            console.error('Error saving category:', error);
            alert(error.response?.data?.error || 'Error saving category');
        }
    };

    // Handle Delete
    const handleDeleteCategory = async () => {
        if (!selectedCategory) return;
        if (selectedCategory.is_system) {
            alert('System categories cannot be deleted.');
            return;
        }
        if (!confirm(`Are you sure you want to delete "${selectedCategory.name}"?`)) return;

        try {
            await httpClient.delete(`/api/inventory/categories/${selectedCategory.id}/`);
            fetchCategories();
            resetCategoryForm();
        } catch (error: any) {
            console.error('Error deleting category:', error);
            alert(error.response?.data?.error || 'Error deleting category');
        }
    };

    // Helper: Reset Form
    const resetCategoryForm = () => {
        setCategoryName('');
        setParentCategoryId(null);
        setParentCategoryPath('');
        setCategoryDescription('');
        setIsEditModeCategory(false);
        setSelectedCategory(null);
    };

    // Helper: Select for Edit
    const handleEditClick = (category: Category) => {
        setSelectedCategory(category);
        setCategoryName(category.name);
        setParentCategoryId(category.parent);
        setParentCategoryPath(category.parent_name || ''); // This might need better path handling if dropdown expects path
        setCategoryDescription(category.description);
        setIsEditModeCategory(true);
    };

    // Filter Categories
    const filteredCategories = (categories || []).filter(cat =>
        cat && cat.name && cat.name.toLowerCase().includes((categorySearchQuery || '').toLowerCase())
    );

    return (
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
            {/* Header Removed */}

            {/* Main Content Area */}
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

                            <div className="bg-white rounded-lg shadow p-6">
                                {activeMasterSubTab === 'Category' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Left Column: Form */}
                                        <div className="lg:col-span-1 border-r border-gray-200 pr-0 lg:pr-8">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                                {isEditModeCategory ? 'Edit Category' : 'Create Category'}
                                            </h3>
                                            <form onSubmit={handleCategorySubmit} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Category Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={categoryName}
                                                        onChange={(e) => setCategoryName(e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                        placeholder="e.g. Raw Material"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Parent Category
                                                    </label>
                                                    <CategoryHierarchicalDropdown
                                                        onSelect={(selection) => {
                                                            setParentCategoryId(selection.id);
                                                            setParentCategoryPath(selection.fullPath);
                                                        }}
                                                        value={parentCategoryPath}
                                                        excludeId={isEditModeCategory ? selectedCategory?.id : undefined}
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Leave empty to create a root category (e.g. Fixed Assets).
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        value={categoryDescription}
                                                        onChange={(e) => setCategoryDescription(e.target.value)}
                                                        className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                        rows={3}
                                                    />
                                                </div>

                                                <div className="flex gap-3 pt-4">
                                                    <button
                                                        type="submit"
                                                        className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
                                                    >
                                                        {isEditModeCategory ? 'Update' : 'Create'}
                                                    </button>
                                                    {isEditModeCategory && (
                                                        <button
                                                            type="button"
                                                            onClick={resetCategoryForm}
                                                            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </form>

                                            {isEditModeCategory && selectedCategory && (
                                                <div className="mt-6 pt-6 border-t border-gray-200">
                                                    <h4 className="text-sm font-medium text-red-700 mb-2">Danger Zone</h4>
                                                    <button
                                                        type="button"
                                                        onClick={handleDeleteCategory}
                                                        disabled={selectedCategory.is_system}
                                                        className={`w-full px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white ${selectedCategory.is_system
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-red-600 hover:bg-red-700'
                                                            }`}
                                                    >
                                                        {selectedCategory.is_system ? 'System Category (Locked)' : 'Delete Category'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column: List */}
                                        <div className="lg:col-span-2">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-800">Existing Categories</h3>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Search..."
                                                        value={categorySearchQuery}
                                                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                                                        className="pl-8 pr-4 py-1 border border-gray-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500"
                                                    />
                                                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border border-gray-200 rounded-md overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200 max-h-96 overflow-y-auto">
                                                        {loadingCategories ? (
                                                            <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                                                        ) : filteredCategories.length === 0 ? (
                                                            <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">No categories found.</td></tr>
                                                        ) : (
                                                            filteredCategories.map(cat => (
                                                                <tr
                                                                    key={cat.id}
                                                                    className={`hover:bg-gray-50 ${selectedCategory?.id === cat.id ? 'bg-teal-50' : ''}`}
                                                                >
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        <div className="flex items-center">
                                                                            {/* Indentation for hierarchy visuals could go here */}
                                                                            <span style={{ paddingLeft: `${cat.level * 20}px` }}>
                                                                                {cat.level > 0 && <span className="text-gray-400 mr-2">└─</span>}
                                                                                {cat.name}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {cat.is_system ? (
                                                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                                System
                                                                            </span>
                                                                        ) : (
                                                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                                User
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                        <button
                                                                            onClick={() => handleEditClick(cat)}
                                                                            className="text-teal-600 hover:text-teal-900"
                                                                        >
                                                                            Edit
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

                                {activeMasterSubTab === 'PO Settings' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                                                        Category (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={poCategory}
                                                        onChange={(e) => setPoCategory(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                                        placeholder="e.g. Procurement"
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
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {loadingPOSeries ? (
                                                            <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
                                                        ) : poSeriesList.length === 0 ? (
                                                            <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">No series found.</td></tr>
                                                        ) : (
                                                            poSeriesList.map(series => (
                                                                <tr key={series.id} className="hover:bg-gray-50">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                        {series.name}
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
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendor Creation</h3>
                                        <p className="text-gray-600">Vendor onboarding form pending...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Transaction' && (
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendor Transactions</h3>
                        </div>
                    )}

                    {activeTab === 'Report' && (
                        <div className="p-6 bg-white rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendor Reports</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorPortalPage;
