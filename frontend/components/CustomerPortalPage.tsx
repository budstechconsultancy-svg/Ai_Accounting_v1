import React, { useState } from 'react';
import Icon from './Icon';

type CustomerPortalTab = 'DASHBOARD' | 'CUSTOMERS' | 'QUOTES' | 'INVOICES' | 'PAYMENTS' | 'SALES ORDERS' | 'TIMESHEETS' | 'STATEMENTS' | 'DOCUMENTS';

const CustomerPortalPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<CustomerPortalTab>('DASHBOARD');

    const tabs: CustomerPortalTab[] = ['DASHBOARD', 'CUSTOMERS', 'QUOTES', 'INVOICES', 'PAYMENTS', 'SALES ORDERS', 'TIMESHEETS', 'STATEMENTS', 'DOCUMENTS'];

    return (
        <div className="flex-1 bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Customer Portal</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage customer relationships, quotes, invoices, and payment tracking.</p>
                    </div>

                    {/* User Profile Section */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-semibold border border-purple-200">
                                A
                            </div>
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold border border-indigo-200">
                                B
                            </div>
                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 text-xs font-semibold border border-pink-200">
                                C
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold text-gray-700">Super User</span>
                            <span className="text-xs text-purple-600">ACTIVE MEMBER</span>
                        </div>
                        <div className="w-10 h-10 rounded bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
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
                                ? 'border-indigo-600 text-indigo-700'
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
                {activeTab === 'CUSTOMERS' && <CustomersContent />}
                {activeTab === 'QUOTES' && <QuotesContent />}
                {activeTab === 'INVOICES' && <InvoicesContent />}
                {activeTab === 'PAYMENTS' && <PaymentsContent />}
                {activeTab === 'SALES ORDERS' && <SalesOrdersContent />}
                {activeTab === 'TIMESHEETS' && <TimesheetsContent />}
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
                {/* Outstanding Invoices */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Outstanding Invoices</p>
                            <p className="text-2xl font-bold text-gray-900">₹0</p>
                            <button className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                                Pay Now →
                            </button>
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
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Last Payment Made */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Last Payment Made</p>
                            <p className="text-2xl font-bold text-gray-900">₹0</p>
                            <p className="text-xs text-gray-500 mt-1">No payments yet</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Pending Quotes */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Pending Quotes</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Outstanding Retainer Invoices */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Outstanding Retainer Invoices</p>
                            <p className="text-2xl font-bold text-gray-900">₹0</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Available Retainer Payments */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Available Retainer Payments</p>
                            <p className="text-2xl font-bold text-gray-900">₹0</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Pending Timesheets */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Pending Timesheets</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Feed and Account Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Icon name="activity" className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                    </div>

                    {/* Empty State */}
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Icon name="inbox" className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-gray-400 text-sm">No recent activity found.</p>
                    </div>
                </div>

                {/* Account Details Panel */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Icon name="user" className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-gray-900">My Details</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Company Name</p>
                            <p className="text-sm font-medium text-gray-900">Your Company</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Contact Person</p>
                            <p className="text-sm font-medium text-gray-900">-</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Email</p>
                            <p className="text-sm font-medium text-gray-900">-</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Phone</p>
                            <p className="text-sm font-medium text-gray-900">-</p>
                        </div>

                        <button className="w-full mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors">
                            Edit Details
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <button className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110">
                <Icon name="plus" className="w-6 h-6" />
            </button>
        </div>
    );
};

// Customers Content Component
const CustomersContent: React.FC = () => {
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Customer List</h2>
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search customers..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            {/* Add Customer Button */}
                            <button
                                onClick={() => setShowAddCustomerModal(true)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <Icon name="plus" className="w-4 h-4" />
                                Add Customer
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
                                    Customer Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Outstanding
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Portal Status
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
                                        <p className="text-gray-400 text-sm">No customers found.</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Customer Modal */}
            {showAddCustomerModal && (
                <AddCustomerModal onClose={() => setShowAddCustomerModal(false)} />
            )}
        </>
    );
};

// Add Customer Modal Component
const AddCustomerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [enablePortalAccess, setEnablePortalAccess] = useState(false);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add New Customer</h2>
                        <p className="text-sm text-gray-500 mt-1">Create a new customer profile and configure portal access.</p>
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
                        {/* Company Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                COMPANY NAME <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Acme Corp"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Contact Person */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                CONTACT PERSON
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. John Doe"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                EMAIL <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="e.g. contact@acme.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* GSTIN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                GSTIN
                            </label>
                            <input
                                type="text"
                                placeholder="15-digit code"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* PAN */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                PAN
                            </label>
                            <input
                                type="text"
                                placeholder="10-digit code"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ADDRESS
                        </label>
                        <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Enable Portal Access */}
                    <div className="mt-6 flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="portalAccess"
                            checked={enablePortalAccess}
                            onChange={(e) => setEnablePortalAccess(e.target.checked)}
                            className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                            <label htmlFor="portalAccess" className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                                <Icon name="zap" className="w-4 h-4 text-indigo-600" />
                                Enable Customer Portal Access
                            </label>
                            <p className="text-xs text-gray-500 mt-1">Allow customer to view quotes, invoices, and make payments online.</p>
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
                    <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
                        ADD CUSTOMER
                    </button>
                </div>
            </div>
        </div>
    );
};

// Quotes Content Component
const QuotesContent: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState('All Status');

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Quotes</h2>
                    <div className="flex items-center gap-3">
                        {/* Status Filter Dropdown */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none pr-10 bg-white"
                            >
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>Accepted</option>
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
                                Quote #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
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
                                    <p className="text-gray-400 text-sm">No quotes found.</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Invoices Content Component
const InvoicesContent: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState('All Invoices');

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Invoices</h2>
                    <div className="flex items-center gap-3">
                        {/* Status Filter Dropdown */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none pr-10 bg-white"
                            >
                                <option>All Invoices</option>
                                <option>Paid</option>
                                <option>Unpaid</option>
                                <option>Overdue</option>
                                <option>Retainer Invoices</option>
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
                                Invoice #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
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
                                    <p className="text-gray-400 text-sm">No invoices found.</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
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
                    <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
                    <div className="flex items-center gap-3">
                        {/* Filter Dropdown */}
                        <div className="relative">
                            <select className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none pr-10 bg-white">
                                <option>All Payments</option>
                                <option>Invoice Payments</option>
                                <option>Retainer Payments</option>
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
                                Payment #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Method
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
                                    <p className="text-gray-400 text-sm">No payments recorded.</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Sales Orders Content Component
const SalesOrdersContent: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Sales Orders</h2>
                    <div className="flex items-center gap-3">
                        {/* Filter Dropdown */}
                        <div className="relative">
                            <select className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none pr-10 bg-white">
                                <option>All Orders</option>
                                <option>Pending</option>
                                <option>Fulfilled</option>
                                <option>Cancelled</option>
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
                                Order #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
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
                                    <p className="text-gray-400 text-sm">No sales orders found.</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Timesheets Content Component
const TimesheetsContent: React.FC = () => {
    const [activeSubTab, setActiveSubTab] = useState<'PROJECTS' | 'APPROVALS'>('PROJECTS');

    return (
        <div className="space-y-6">
            {/* Sub-tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200 px-6">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveSubTab('PROJECTS')}
                            className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${activeSubTab === 'PROJECTS'
                                ? 'border-indigo-600 text-indigo-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Projects
                        </button>
                        <button
                            onClick={() => setActiveSubTab('APPROVALS')}
                            className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${activeSubTab === 'APPROVALS'
                                ? 'border-indigo-600 text-indigo-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Timesheet Approvals
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeSubTab === 'PROJECTS' ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <Icon name="briefcase" className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 text-sm">No active projects found.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <Icon name="clock" className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 text-sm">No pending timesheet approvals.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Statements Content Component
const StatementsContent: React.FC = () => {
    const [dateRange, setDateRange] = useState('This Month');

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Generate Statement of Accounts</h2>

            <div className="max-w-md space-y-4">
                {/* Date Range Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date Range
                    </label>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option>This Month</option>
                        <option>Last Month</option>
                        <option>This Quarter</option>
                        <option>Last Quarter</option>
                        <option>This Year</option>
                        <option>Custom Range</option>
                    </select>
                </div>

                {/* Generate Button */}
                <button className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
                    Generate Statement
                </button>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Icon name="info" className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-indigo-900 font-medium">About Statements</p>
                            <p className="text-xs text-indigo-700 mt-1">
                                A statement of accounts shows all transactions between you and your organization over a selected period, including outstanding balances.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Documents Content Component
const DocumentsContent: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Shared Documents</h2>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                        <Icon name="upload" className="w-4 h-4" />
                        Upload Document
                    </button>
                </div>
            </div>

            {/* Document Upload Area */}
            <div className="p-12">
                <input
                    type="file"
                    id="documentUpload"
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            console.log('File selected:', e.target.files[0].name);
                        }
                    }}
                />
                <label
                    htmlFor="documentUpload"
                    className="flex flex-col items-center justify-center text-center cursor-pointer"
                >
                    <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                        <svg
                            className="w-10 h-10 text-indigo-600"
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
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Documents</h3>
                    <p className="text-sm text-gray-500">Share documents with your organization.</p>
                </label>
            </div>

            {/* Documents List */}
            <div className="p-6 border-t border-gray-200">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Icon name="file-text" className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm">No documents uploaded yet.</p>
                </div>
            </div>
        </div>
    );
};

export default CustomerPortalPage;
