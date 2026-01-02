// Vendor Portal - Complete Implementation
import React, { useState } from 'react';
import Icon from './Icon';

type VendorPortalTab = 'DASHBOARD' | 'VENDORS' | 'PURCHASE ORDERS' | 'BILLS' | 'PAYMENTS' | 'STATEMENTS' | 'DOCUMENTS';

const VendorPortalPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<VendorPortalTab>('DASHBOARD');

    const tabs: VendorPortalTab[] = ['DASHBOARD', 'VENDORS', 'PURCHASE ORDERS', 'BILLS', 'PAYMENTS', 'STATEMENTS', 'DOCUMENTS'];

    return (
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Vendor Portal</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage vendor relationships, compliance, and settlement workflows.</p>
                    </div>

                    {/* User Profile Section */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold border border-blue-200">
                                A
                            </div>
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-semibold border border-purple-200">
                                B
                            </div>
                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 text-xs font-semibold border border-pink-200">
                                C
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold text-gray-700">Super User</span>
                            <span className="text-xs text-blue-600">ACTIVE MEMBER</span>
                        </div>
                        <div className="w-10 h-10 rounded bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
                            CA
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200 px-8">
                <div className="flex gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="px-8 py-6">
                {activeTab === 'DASHBOARD' && <DashboardContent />}
                {activeTab === 'VENDORS' && <VendorsContent />}
                {activeTab === 'PURCHASE ORDERS' && <PurchaseOrdersContent />}
                {activeTab === 'BILLS' && <BillsContent />}
                {activeTab === 'PAYMENTS' && <PaymentsContent />}
                {activeTab === 'STATEMENTS' && <StatementsContent />}
                {activeTab === 'DOCUMENTS' && <DocumentsContent />}
            </div>
        </div>
    );
};

// Dashboard Content Component
const DashboardContent: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Outstanding Bills */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Outstanding Bills</p>
                            <p className="text-2xl font-bold text-gray-900">₹0</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Available Credits */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Available Credits</p>
                            <p className="text-2xl font-bold text-gray-900">₹0</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Last Payment */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Last Payment</p>
                            <p className="text-2xl font-bold text-gray-900">₹0</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Active POs */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Active POs</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Feed and Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vendor Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Icon name="activity" className="w-5 h-5 text-teal-600" />
                        <h2 className="text-lg font-bold text-gray-900">Vendor Activity Feed</h2>
                    </div>

                    {/* Empty State */}
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Icon name="inbox" className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-gray-400 text-sm">No recent vendor activity found.</p>
                    </div>
                </div>

                {/* Insights Panel */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Icon name="lightbulb" className="w-5 h-5 text-teal-600" />
                        <h2 className="text-lg font-bold text-gray-900">Insights</h2>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            AI models are analyzing your vendor engagement patterns. Automated replenishment suggestions will appear here.
                        </p>

                        {/* PRO TIP */}
                        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <div className="w-6 h-6 rounded bg-teal-600 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">💡</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-teal-900 uppercase mb-1">PRO TIP</p>
                                    <p className="text-sm text-teal-800">
                                        Link your bank account to enable automatic reconciliation for vendor payments.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <button className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110">
                <Icon name="upload" className="w-6 h-6" />
            </button>
        </div>
    );
};

// Vendors Content Component
const VendorsContent: React.FC = () => {
    const [showAddVendorModal, setShowAddVendorModal] = useState(false);

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Connected Vendors</h2>
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            {/* Add Vendor Button */}
                            <button
                                onClick={() => setShowAddVendorModal(true)}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <Icon name="plus" className="w-4 h-4" />
                                Add Vendor
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vendor Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Outstanding
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Portal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* Empty State Row */}
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                            <Icon name="users" className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-400 text-sm">No connected vendors found.</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Vendor Modal */}
            {showAddVendorModal && (
                <AddVendorModal onClose={() => setShowAddVendorModal(false)} />
            )}
        </>
    );
};

// Add Vendor Modal Component
const AddVendorModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [enableSelfService, setEnableSelfService] = useState(false);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Business Partner Setup</h2>
                        <p className="text-sm text-gray-500 mt-1">Onboard new vendor or modify existing parameters.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <Icon name="x" className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Business Legal Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                BUSINESS LEGAL NAME <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Acme Corp"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        {/* Contact Person */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                CONTACT PERSON
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. John"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        {/* Business Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                BUSINESS EMAIL <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="e.g. info@acme.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                PHONE NUMBER <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                placeholder="e.g. +91 90000 00000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        {/* GSTIN ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                GSTIN ID
                            </label>
                            <input
                                type="text"
                                placeholder="15-digit code"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        {/* TAX ID (PAN) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                TAX ID (PAN)
                            </label>
                            <input
                                type="text"
                                placeholder="10-digit code"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Business Address */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            BUSINESS ADDRESS
                        </label>
                        <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                    </div>

                    {/* Enable Vendor Self-Service */}
                    <div className="mt-6 flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="selfService"
                            checked={enableSelfService}
                            onChange={(e) => setEnableSelfService(e.target.checked)}
                            className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <div className="flex-1">
                            <label htmlFor="selfService" className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                                <Icon name="zap" className="w-4 h-4 text-teal-600" />
                                Enable Vendor Self-Service
                            </label>
                            <p className="text-xs text-gray-500 mt-1">Allow vendor to view their transactions digitally.</p>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        CANCEL
                    </button>
                    <button className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm font-medium transition-colors">
                        ONBOARD VENDOR
                    </button>
                </div>
            </div>
        </div>
    );
};

// Purchase Orders Content Component
const PurchaseOrdersContent: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState('All Status');

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Purchase Orders</h2>
                    <div className="flex items-center gap-3">
                        {/* Status Filter Dropdown */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none pr-10 bg-white"
                            >
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>Approved</option>
                                <option>Declined</option>
                            </select>
                            <Icon name="chevron-down" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {/* Download Button */}
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                            <Icon name="download" className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                PO #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vendor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Empty State Row */}
                        <tr>
                            <td colSpan={6} className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-gray-400 text-sm">No purchase orders found.</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Bills Content Component
const BillsContent: React.FC = () => {
    const [selectedVendor, setSelectedVendor] = useState('');

    return (
        <div className="space-y-6">
            {/* Vendor Selector */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
                    Target Vendor for Upload
                </label>
                <select
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                    <option value="">Select a vendor...</option>
                    <option value="vendor1">Vendor 1</option>
                    <option value="vendor2">Vendor 2</option>
                </select>
            </div>

            {/* Direct Invoice Upload */}
            <div className="bg-white rounded-lg shadow-sm p-12">
                <input
                    type="file"
                    id="invoiceUpload"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            console.log('File selected:', e.target.files[0].name);
                            // Handle file upload here
                        }
                    }}
                />
                <label
                    htmlFor="invoiceUpload"
                    className="flex flex-col items-center justify-center text-center cursor-pointer"
                >
                    <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                        <svg
                            className="w-10 h-10 text-teal-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Direct Invoice Upload</h3>
                    <p className="text-sm text-gray-500">Upload vendor bills for automatic extraction & verification.</p>
                </label>
            </div>

            {/* Inbound Liabilities Table */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Inbound Liabilities</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bill #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vendor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Due Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Manage
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* Empty State Row */}
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <p className="text-gray-400 text-sm">No outstanding bills in the system.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Payments Content Component
const PaymentsContent: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Settlement Ledger</h2>
                    <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Icon name="download" className="w-4 h-4" />
                        Download History
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                DATE
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                REF #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                VENDOR
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                METHOD
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                DEBIT AMOUNT
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                VIEW
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Empty State Row */}
                        <tr>
                            <td colSpan={6} className="px-6 py-16 text-center">
                                <p className="text-gray-400 text-sm">No transaction records found.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Statements Content Component
const StatementsContent: React.FC = () => {
    const [selectedVendor, setSelectedVendor] = useState('');
    const [fiscalWindow, setFiscalWindow] = useState('Current Financial Year');

    return (
        <div className="space-y-6">
            {/* Selection Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {/* Select Portfolio */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
                            SELECT PORTFOLIO
                        </label>
                        <select
                            value={selectedVendor}
                            onChange={(e) => setSelectedVendor(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                            <option value="">Pick a vendor...</option>
                            <option value="vendor1">Vendor 1</option>
                            <option value="vendor2">Vendor 2</option>
                        </select>
                    </div>

                    {/* Fiscal Window */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
                            FISCAL WINDOW
                        </label>
                        <select
                            value={fiscalWindow}
                            onChange={(e) => setFiscalWindow(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                            <option value="Current Financial Year">Current Financial Year</option>
                            <option value="Previous Financial Year">Previous Financial Year</option>
                            <option value="Custom Range">Custom Range</option>
                        </select>
                    </div>

                    {/* Process Summary Button */}
                    <div>
                        <button className="w-full px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md text-sm font-medium transition-colors">
                            PROCESS SUMMARY
                        </button>
                    </div>
                </div>
            </div>

            {/* Ledger Extraction Engine - Empty State */}
            <div className="bg-white rounded-lg shadow-sm p-16">
                <div className="flex flex-col items-center justify-center text-center">
                    {/* Document Icon */}
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-300 uppercase mb-2">
                        LEDGER EXTRACTION ENGINE
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-400 max-w-md">
                        Select vendor and reporting window to generate a fiscal summary statement.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Documents Content Component
const DocumentsContent: React.FC = () => {
    const [selectedVendor, setSelectedVendor] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            console.log('Files selected:', files);
            // Handle file upload logic here
            setShowUploadModal(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* Context Vendor Selector */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">
                        CONTEXT VENDOR
                    </label>
                    <select
                        value={selectedVendor}
                        onChange={(e) => setSelectedVendor(e.target.value)}
                        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                        <option value="">Select a vendor...</option>
                        <option value="vendor1">Vendor 1</option>
                        <option value="vendor2">Vendor 2</option>
                    </select>
                </div>

                {/* Compliance & Legal Vault */}
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Compliance & Legal Vault</h2>
                                <p className="text-sm text-gray-600 mt-1">Verified repository for contracts, PAN, and KYC documents.</p>
                            </div>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Icon name="upload" className="w-4 h-4" />
                                Upload Asset
                            </button>
                        </div>
                    </div>

                    {/* Empty State */}
                    <div className="p-16">
                        <div className="flex flex-col items-center justify-center text-center">
                            <p className="text-sm text-gray-400 uppercase tracking-wide">
                                SAFE IS EMPTY
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Icon name="x" className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-8">
                            <input
                                type="file"
                                id="documentUpload"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                multiple
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <label
                                htmlFor="documentUpload"
                                className="flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-teal-500 transition-colors"
                            >
                                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                                    <Icon name="upload" className="w-8 h-8 text-teal-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Click to upload documents
                                </h3>
                                <p className="text-sm text-gray-500">
                                    PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                                </p>
                            </label>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Placeholder Content for Other Tabs
const PlaceholderContent: React.FC<{ title: string }> = ({ title }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Icon name="inbox" className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">This section is under development.</p>
            </div>
        </div>
    );
};

export default VendorPortalPage;
