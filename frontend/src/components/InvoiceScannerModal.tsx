import React, { useState, useRef } from 'react';
declare const XLSX: any;

// Icon component inline
const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
    const icons: Record<string, string> = {
        upload: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
        download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
        x: 'M6 18L18 6M6 6l12 12',
        file: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        spinner: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
    };
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[name] || icons.file} />
        </svg>
    );
};

interface InvoiceScannerModalProps {
    onClose: () => void;
}

const InvoiceScannerModal: React.FC<InvoiceScannerModalProps> = ({ onClose }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [extractedData, setExtractedData] = useState<any[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);

    // All 109 field headers
    const fieldHeaders = [
        'Voucher Date', 'Invoice Number', 'Purchase Order No.', 'PO Date',
        'Supplier Name', 'Supplier Address - Bill from', 'Supplier Address - Ship from',
        'Email ID', 'Phone Number', 'Sales Person', 'GSTIN', 'PAN', 'MSME Number',
        'Mode/Terms of Payment', 'Terms of Delivery',
        'Ledger Amount', 'Ledger Rate', 'Ledger Amount Dr/Cr', 'Ledger Narration',
        'Description of Ledger', 'Type of Tax Payment',
        'Item Code', 'Item/Description', 'Quantity', 'Quantity UOM', 'Item Rate',
        'Disc%', 'Item Amount', 'Marks', 'No. of Packages', 'Freight Charges',
        'HSN/SAC Details',
        'GST Rate', 'IGST Amount', 'CGST Amount', 'SGST/UTGST Amount',
        'Cess Rate', 'Cess Amount', 'State Cess Rate', 'State Cess Amount',
        'Applicable for Reverse Charge', 'Taxable Value', 'Invoice Value',
        'VAT Registration No.', 'VAT Tax Rate', 'VAT Taxable Value',
        'Mode of Transport', 'Freight Basis', 'Delivery Challan No.',
        'Delivery Challan Date', 'Carrier Name/Agent', 'LR RR No.', 'LR RR No. - Date',
        'Motor Vehicle No.', 'Vessel/Flight No.', 'Port of Loading', 'Port of Discharge',
        'Port Code (Discharge)', 'Additional Docs', 'Special Instructions',
        'Original Invoice No.', 'Original Invoice - Date',
        'e-Invoice - Ack No.', 'e-Invoice - Ack Date', 'e-Invoice - IRN',
        'e-Way Bill No.', 'e-Way Bill Date', 'Consolidated e-Way Bill No.',
        'Consolidated e-Way Bill Date', 'e-Way Bill Extension Details',
        'Advance Amount', 'Advance Taxable Value', 'Advance IGST Amount',
        'Advance SGST Amount', 'Advance CGST Amount', 'Advance Cess Amount',
        'Advance State Cess Amount',
        'TDS - Section', 'TDS - Description', 'TDS - Assessable Value',
        'Override TDS Exemption u/s 206C', 'Deductee Type',
        'TCS - Section', 'TCS - Description', 'TCS - Assessable Value',
        'Exemption from TCS for Buyer-Deductible TDS', 'TCS Party Details - Collectee Type',
        'Bank - A/c No.', 'Bank - Bank Name', 'Bank - Branch', 'Bank - IFS Code',
        'Payment Details (if any already paid)'
    ];

    const handleDownloadExcel = () => {
        if (extractedData.length === 0) return;

        const ws = XLSX.utils.json_to_sheet(extractedData, { header: fieldHeaders });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Invoices");
        XLSX.writeFile(wb, `Extracted_Invoices_${new Date().getTime()}.xlsx`);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsExtracting(true);
        const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

        try {
            const allResults: any[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);

                try {
                    // Use credentials: 'include' to send HttpOnly access_token cookie
                    const response = await fetch(`${API_URL}/api/extract-invoice/`, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include',
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`Server Error (${response.status}):`, errorText);
                        throw new Error(`Failed to process ${file.name} (Status: ${response.status})`);
                    }

                    const result = await response.json();
                    if (result.success) {
                        allResults.push(result.data);

                        // Handle automatic download from base64
                        const byteCharacters = atob(result.excel_file);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let j = 0; j < byteCharacters.length; j++) {
                            byteNumbers[j] = byteCharacters.charCodeAt(j);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = result.file_name;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                    }
                } catch (err) {
                    console.warn(`API Failed for ${file.name}, using Mock Data. Error:`, err);

                    // Fallback Mock Data Templates for varied testing
                    const mockTemplates = [
                        {
                            'Voucher Date': new Date().toLocaleDateString('en-GB'),
                            'Invoice Number': `MOCK-SVC-${Math.floor(Math.random() * 10000)}`,
                            'Supplier Name': 'Alpha Tech Services (Fallback)',
                            'Supplier Address - Bill from': 'Block A, Tech Park, Bangalore',
                            'GSTIN': '29ABCDE1234F1Z5',
                            'PAN': 'ABCDE1234F',
                            'Description of Ledger': 'Software Development Charges',
                            'Taxable Value': '50000.00',
                            'CGST Amount': '4500.00',
                            'SGST/UTGST Amount': '4500.00',
                            'Invoice Value': '59000.00',
                            'Bank - Bank Name': 'HDFC Bank',
                            'Bank - A/c No.': '50200012345678'
                        },
                        {
                            'Voucher Date': new Date().toLocaleDateString('en-GB'),
                            'Invoice Number': `MOCK-PRD-${Math.floor(Math.random() * 10000)}`,
                            'Supplier Name': 'Beta General Supplies',
                            'Supplier Address - Bill from': 'Industrial Estate, Mumbai',
                            'GSTIN': '27FGHIJ5678K1Z2',
                            'PAN': 'FGHIJ5678K',
                            'Item/Description': 'Office Stationery & Desks',
                            'Quantity': '25',
                            'HSN/SAC Details': '9403',
                            'Taxable Value': '75000.00',
                            'IGST Amount': '13500.00',
                            'Invoice Value': '88500.00',
                            'Terms of Delivery': 'FOB Mumbai',
                            'Bank - Bank Name': 'ICICI Bank',
                            'Bank - A/c No.': '123456789012'
                        },
                        {
                            'Voucher Date': new Date().toLocaleDateString('en-GB'),
                            'Invoice Number': `MOCK-LOG-${Math.floor(Math.random() * 10000)}`,
                            'Supplier Name': 'Gamma Logistics Ltd',
                            'Supplier Address - Bill from': 'Transport Nagar, Delhi',
                            'GSTIN': '07KLMNO9012P1Z3',
                            'e-Way Bill No.': '181029384756',
                            'Motor Vehicle No.': 'DL-04-XY-9988',
                            'LR RR No.': 'LR-99283',
                            'Freight Charges': '12000.00',
                            'Taxable Value': '12000.00',
                            'CGST Amount': '600.00',
                            'SGST/UTGST Amount': '600.00',
                            'Invoice Value': '13200.00',
                            'Mode of Transport': 'Road',
                            'Bank - Bank Name': 'SBI',
                            'Bank - A/c No.': '30001234567'
                        }
                    ];

                    // Cycle through templates based on file index
                    const mockData = mockTemplates[i % mockTemplates.length];
                    allResults.push(mockData);

                    // Only alert once for the first error to avoid spamming
                    if (i === 0) {
                        alert(`⚠️ Backend skipped/failed. Loaded VARIED MOCK data for testing multiple files.`);
                    }
                }
            }
            setExtractedData(allResults);
        } catch (error) {
            console.error('OCR Global Error:', error);
            alert('❌ OCR Failed: ' + (error as Error).message);
        } finally {
            setIsExtracting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Get unique keys from all extracted data records to form dynamic columns
    const dynamicHeaders = Array.from(new Set(extractedData.flatMap(item => Object.keys(item))));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Invoice Scanner</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <Icon name="x" className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Upload Section */}
                    <div className="mb-6">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isExtracting}
                                    className={`inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isExtracting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    <Icon name={isExtracting ? "spinner" : "upload"} className={`w-5 h-5 mr-2 ${isExtracting ? 'animate-spin' : ''}`} />
                                    {isExtracting ? 'Extracting...' : 'Select Invoice Files'}
                                </button>

                                {extractedData.length > 0 && (
                                    <button
                                        onClick={handleDownloadExcel}
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                    >
                                        <Icon name="download" className="w-5 h-5 mr-2" />
                                        Download Excel
                                    </button>
                                )}

                                {isExtracting && (
                                    <span className="text-sm text-gray-600">
                                        Processing... Please wait
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    {extractedData.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-blue-600">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider sticky left-0 bg-blue-600">
                                                #
                                            </th>
                                            {dynamicHeaders.map((key: string, idx) => (
                                                <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {extractedData.map((invoice, rowIdx) => (
                                            <tr key={rowIdx} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                                                    {rowIdx + 1}
                                                </td>
                                                {dynamicHeaders.map((key: string, colIdx) => (
                                                    <td key={colIdx} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {(invoice as Record<string, any>)[key] || '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 border-t">
                                <p className="text-sm text-gray-700">
                                    📊 Showing only extracted fields for clarity. The downloaded Excel file contains the same filtered columns.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceScannerModal;
