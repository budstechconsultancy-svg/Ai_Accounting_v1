import React, { useState } from 'react';
import Icon from '../../components/Icon';

type PayrollTab = 'DASHBOARD' | 'EMPLOYEES' | 'PAY RUNS' | 'SALARY TEMPLATES' | 'STATUTORY' | 'REPORTS';

const PayrollPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<PayrollTab>('DASHBOARD');

    const tabs: PayrollTab[] = ['DASHBOARD', 'EMPLOYEES', 'PAY RUNS', 'SALARY TEMPLATES', 'STATUTORY', 'REPORTS'];

    return (
        <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage employees, process pay runs, and handle statutory compliance.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                            <Icon name="plus" className="w-4 h-4" />
                            Process Pay Run
                        </button>
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
                                    ? 'border-green-600 text-green-700'
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
                {activeTab === 'EMPLOYEES' && <EmployeesContent />}
                {activeTab === 'PAY RUNS' && <PayRunsContent />}
                {activeTab === 'SALARY TEMPLATES' && <SalaryTemplatesContent />}
                {activeTab === 'STATUTORY' && <StatutoryContent />}
                {activeTab === 'REPORTS' && <ReportsContent />}
            </div>
        </div>
    );
};

// Dashboard Content
const DashboardContent: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Total Employees</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                            <Icon name="users" className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Monthly Payroll</p>
                            <p className="text-2xl font-bold text-gray-900">₹0</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Pending Pay Runs</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                            <Icon name="clock" className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Compliance Status</p>
                            <p className="text-sm font-semibold text-green-600 mt-2">Up to Date</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Icon name="check-circle" className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Payroll Activity</h2>
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Icon name="inbox" className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm">No payroll activity yet.</p>
                </div>
            </div>
        </div>
    );
};

// Employees Content
const EmployeesContent: React.FC = () => {
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Employee List</h2>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search employees..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium flex items-center gap-2"
                            >
                                <Icon name="plus" className="w-4 h-4" />
                                Add Employee
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                            <Icon name="users" className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-400 text-sm">No employees found.</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddModal && <AddEmployeeModal onClose={() => setShowAddModal(false)} />}
        </>
    );
};

// Add Employee Modal
const AddEmployeeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
                        <p className="text-sm text-gray-500 mt-1">Enter employee details and salary information.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <Icon name="x" className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                EMPLOYEE NAME <span className="text-red-500">*</span>
                            </label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">EMPLOYEE ID</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">EMAIL <span className="text-red-500">*</span></label>
                            <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">PHONE</label>
                            <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">DEPARTMENT</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">DESIGNATION</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">BASIC SALARY</label>
                            <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">PAN NUMBER</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">CANCEL</button>
                    <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium">ADD EMPLOYEE</button>
                </div>
            </div>
        </div>
    );
};

// Pay Runs Content
const PayRunsContent: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Pay Run History</h2>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium flex items-center gap-2">
                        <Icon name="plus" className="w-4 h-4" />
                        Create Pay Run
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pay Period</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Pay</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td colSpan={7} className="px-6 py-16 text-center">
                                <p className="text-gray-400 text-sm">No pay runs found.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Salary Templates Content
const SalaryTemplatesContent: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Salary Templates</h2>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium flex items-center gap-2">
                        <Icon name="plus" className="w-4 h-4" />
                        Create Template
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-gray-400 text-sm">No salary templates created yet.</p>
                </div>
            </div>
        </div>
    );
};

// Statutory Content
const StatutoryContent: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* EPF */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Employee Provident Fund (EPF)</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Employee Contribution</span>
                            <span className="text-sm font-medium">12%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Employer Contribution</span>
                            <span className="text-sm font-medium">12%</span>
                        </div>
                        <button className="w-full mt-4 px-4 py-2 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100">
                            Configure EPF
                        </button>
                    </div>
                </div>

                {/* ESI */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Employee State Insurance (ESI)</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Employee Contribution</span>
                            <span className="text-sm font-medium">0.75%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Employer Contribution</span>
                            <span className="text-sm font-medium">3.25%</span>
                        </div>
                        <button className="w-full mt-4 px-4 py-2 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100">
                            Configure ESI
                        </button>
                    </div>
                </div>

                {/* Professional Tax */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Professional Tax (PT)</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">State</span>
                            <span className="text-sm font-medium">Not Configured</span>
                        </div>
                        <button className="w-full mt-4 px-4 py-2 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100">
                            Configure PT
                        </button>
                    </div>
                </div>

                {/* LWF */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Labour Welfare Fund (LWF)</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Status</span>
                            <span className="text-sm font-medium">Not Configured</span>
                        </div>
                        <button className="w-full mt-4 px-4 py-2 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100">
                            Configure LWF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reports Content
const ReportsContent: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payroll Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
                    <h3 className="font-semibold text-gray-900 mb-1">Payroll Summary</h3>
                    <p className="text-xs text-gray-500">Monthly payroll overview</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
                    <h3 className="font-semibold text-gray-900 mb-1">Tax Summary</h3>
                    <p className="text-xs text-gray-500">EPF, ESI, PT deductions</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
                    <h3 className="font-semibold text-gray-900 mb-1">Employee Wise Report</h3>
                    <p className="text-xs text-gray-500">Individual salary details</p>
                </button>
            </div>
        </div>
    );
};

export default PayrollPage;
