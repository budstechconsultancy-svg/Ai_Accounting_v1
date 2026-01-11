import React, { useState, useEffect } from 'react';
import { httpClient } from '../../services';

interface PendingTransaction {
    date: string;
    referenceNumber: string;
    amount: number;
    receipt: number;
}

const PaymentVoucherSingle: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
    const [date, setDate] = useState('10-01-2026');
    const [voucherType, setVoucherType] = useState('Payment');
    const [voucherNumber, setVoucherNumber] = useState('Auto-generated');
    const [payFrom, setPayFrom] = useState('');
    const [payFromBalance, setPayFromBalance] = useState('₹0 Cr');
    const [payTo, setPayTo] = useState('');
    const [payToBalance, setPayToBalance] = useState('₹0 Dr');
    const [totalPayment, setTotalPayment] = useState(0);

    // Payment Voucher Configuration state
    const [paymentVoucherConfigs, setPaymentVoucherConfigs] = useState<any[]>([]);
    const [selectedPaymentConfig, setSelectedPaymentConfig] = useState<string>('');

    const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([
        { date: '15-12-2025', referenceNumber: 'PO/001', amount: 35000.00, receipt: 0 },
        { date: '20-12-2025', referenceNumber: 'PO/002', amount: 20000.00, receipt: 0 }
    ]);

    // Fetch payment voucher configurations on mount
    useEffect(() => {
        const fetchPaymentConfigs = async () => {
            try {
                console.log('Fetching payment voucher configurations...');
                const data = await httpClient.get<any[]>('/api/masters/voucher-configurations/?voucher_type=payments');
                console.log('All payment configs fetched:', data);

                // Filter to show ONLY payment configurations
                const paymentConfigs = data?.filter(config => config.voucher_type === 'payments') || [];
                console.log('Filtered payment configs:', paymentConfigs);

                setPaymentVoucherConfigs(paymentConfigs);
                // Auto-select first config if only one
                if (paymentConfigs && paymentConfigs.length === 1) {
                    setSelectedPaymentConfig(paymentConfigs[0].voucher_name);
                }
            } catch (error) {
                console.error('Error fetching payment voucher configurations:', error);
                setPaymentVoucherConfigs([]);
            }
        };
        fetchPaymentConfigs();
    }, []);

    // Generate voucher number when payment configuration is selected
    useEffect(() => {
        if (selectedPaymentConfig && paymentVoucherConfigs.length > 0) {
            const config = paymentVoucherConfigs.find(c => c.voucher_name === selectedPaymentConfig);
            if (config && config.enable_auto_numbering) {
                const paddedNum = String(config.current_number).padStart(config.required_digits, '0');
                const generatedNumber = `${config.prefix || ''}${paddedNum}${config.suffix || ''}`;
                setVoucherNumber(generatedNumber);
                console.log('Generated payment voucher number:', generatedNumber);
            } else {
                setVoucherNumber('Manual Input');
            }
        } else {
            setVoucherNumber('Auto-generated');
        }
    }, [selectedPaymentConfig, paymentVoucherConfigs]);

    const handlePay = (index: number) => {
        const updatedTransactions = [...pendingTransactions];
        updatedTransactions[index].receipt = updatedTransactions[index].amount;
        setPendingTransactions(updatedTransactions);
        calculateTotalPayment(updatedTransactions);
    };

    const calculateTotalPayment = (transactions: PendingTransaction[]) => {
        const total = transactions.reduce((sum, txn) => sum + txn.receipt, 0);
        setTotalPayment(total);
    };

    const handleCancel = () => {
        setDate('10-01-2026');
        setVoucherType('Payment');
        setPayFrom('');
        setPayTo('');
        setPendingTransactions(pendingTransactions.map(txn => ({ ...txn, receipt: 0 })));
        setTotalPayment(0);
    };

    const handlePostPayment = () => {
        alert('Post Payment functionality will be implemented with backend integration');
    };

    return (
        <div className="p-6">
            {/* Header Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'single'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    onClick={() => setActiveTab('single')}
                >
                    Payment Voucher - Single
                </button>
                <button
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'bulk'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    onClick={() => setActiveTab('bulk')}
                >
                    Payment Voucher - Bulk
                </button>
            </div>

            {/* Top Row: Date, Voucher Type, Voucher Number */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Voucher Type
                    </label>
                    <select
                        value={selectedPaymentConfig}
                        onChange={(e) => setSelectedPaymentConfig(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select</option>
                        {paymentVoucherConfigs.map((config) => (
                            <option key={config.id} value={config.voucher_name}>
                                {config.voucher_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Voucher Number
                    </label>
                    <input
                        type="text"
                        value={voucherNumber}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500"
                    />
                </div>
            </div>

            {/* Pay From and Pay To Row */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pay From
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={payFrom}
                            onChange={(e) => setPayFrom(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Pay From</option>
                            <option value="cash">Cash</option>
                            <option value="bank">Bank Account</option>
                            <option value="card">Credit Card</option>
                        </select>
                        <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-medium text-gray-700 min-w-[80px] text-center">
                            {payFromBalance}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pay To
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={payTo}
                            onChange={(e) => setPayTo(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Pay To</option>
                            <option value="vendor1">Vendor 1</option>
                            <option value="vendor2">Vendor 2</option>
                            <option value="supplier">Supplier</option>
                        </select>
                        <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-medium text-gray-700 min-w-[80px] text-center">
                            {payToBalance}
                        </div>
                        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium text-gray-700 transition-colors">
                            Advance
                        </button>
                    </div>
                </div>
            </div>

            {/* Pending Transactions Section */}
            <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Pending Transactions</h3>

                {payTo ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Reference Number
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Payment
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingTransactions.map((txn, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {txn.date}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {txn.referenceNumber}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 text-right">
                                            ₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handlePay(index)}
                                                className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                                            >
                                                Pay
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 text-right">
                                            {txn.receipt}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Total Payment */}
                        <div className="border-t border-gray-200 bg-white px-6 py-4 flex justify-end items-center gap-4">
                            <span className="text-sm font-semibold text-gray-700">Total Payment</span>
                            <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-bold text-gray-900 min-w-[120px] text-right">
                                {totalPayment}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500 border border-gray-200 rounded-lg">
                        <p className="text-base">
                            Please select a "Pay To" account to view pending transactions.
                        </p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={handleCancel}
                    className="px-8 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded text-gray-700 font-medium transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handlePostPayment}
                    className="px-8 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded transition-colors"
                >
                    Post Payment
                </button>
            </div>
        </div>
    );
};

export default PaymentVoucherSingle;
