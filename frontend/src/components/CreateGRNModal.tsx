
import React, { useState, useEffect } from 'react';

interface CreateGRNModalProps {
    onClose: () => void;
    onSave: (data: any) => void;
}

const CreateGRNModal: React.FC<CreateGRNModalProps> = ({ onClose, onSave }) => {
    const [seriesName, setSeriesName] = useState('');
    const [grnType, setGrnType] = useState('');
    const [prefix, setPrefix] = useState('');
    const [suffix, setSuffix] = useState('');
    const [year, setYear] = useState('');
    const [requiredDigits, setRequiredDigits] = useState('');
    const [preview, setPreview] = useState('');

    // Auto-generate preview
    useEffect(() => {
        // Logic: Prefix + Year + Suffix + (Digits placeholder)
        // Example: GRN2024/0001
        const digits = requiredDigits ? '0'.repeat(parseInt(requiredDigits) || 0) : '';
        // Construct preview based on common patterns, can be adjusted based on requirements
        // For now: {Prefix}{Year}{Suffix}{Digits}
        // Or maybe usually it's Prefix/Year/Sequence
        // Let's assume a simple concatenation for preview
        let previewStr = '';
        if (prefix) previewStr += prefix;
        if (year) previewStr += year;
        if (suffix) previewStr += suffix;
        if (digits) previewStr += digits.replace(/0/g, 'X'); // Use X to show digit placeholders

        setPreview(previewStr || 'Preview will auto-generate');
    }, [prefix, suffix, year, requiredDigits]);

    const handleSave = () => {
        if (!seriesName || !grnType || !year || !requiredDigits) {
            alert('Please fill in all required fields.');
            return;
        }
        onSave({
            seriesName,
            grnType,
            prefix,
            suffix,
            year,
            requiredDigits,
            preview
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Create GRN Series</h3>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* GRN Series Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            GRN Series Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={seriesName}
                            onChange={(e) => setSeriesName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                            placeholder="Enter GRN Series name"
                        />
                    </div>

                    {/* GRN Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            GRN Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={grnType}
                            onChange={(e) => setGrnType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                        >
                            <option value="">Select GRN Type</option>
                            <option value="Manual">Manual</option>
                            <option value="Automatic">Automatic</option>
                        </select>
                    </div>

                    {/* Prefix & Suffix */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
                            <input
                                type="text"
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 outline-none"
                                placeholder="e.g., GRN"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
                            <input
                                type="text"
                                value={suffix}
                                onChange={(e) => setSuffix(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 outline-none"
                                placeholder="e.g., /2024"
                            />
                        </div>
                    </div>

                    {/* Year & Required Digits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Year <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 outline-none"
                                placeholder="e.g., 2024"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Required Digits <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={requiredDigits}
                                onChange={(e) => setRequiredDigits(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 outline-none"
                                placeholder="e.g., 4"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                        <input
                            type="text"
                            value={preview}
                            readOnly
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 focus:outline-none"
                            placeholder="Preview will auto-generate"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none font-medium min-w-[100px]"
                    >
                        Save
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none font-medium min-w-[100px]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGRNModal;
