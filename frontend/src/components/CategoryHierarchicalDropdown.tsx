import React, { useState, useEffect, useRef } from 'react';
import { httpClient } from '../services/httpClient';

interface Category {
    id: number;
    category: string;
    group: string | null;
    subgroup: string | null;
    full_path?: string;
    is_active: boolean;
}

interface DropdownProps {
    onSelect: (data: { id: number; fullPath: string }) => void;
    value?: string;
    excludeId?: number;
    placeholder?: string;
    className?: string;
}

const CategoryHierarchicalDropdown: React.FC<DropdownProps> = ({
    onSelect,
    value = '',
    excludeId,
    placeholder = 'Select Category',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchCategories();

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await httpClient.get<Category[]>('/api/inventory/master-categories/');
            // Process data to add full_path if missing
            const processed = data.map(c => ({
                ...c,
                full_path: [c.category, c.group, c.subgroup].filter(Boolean).join(' > ')
            }));
            setCategories(processed);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback mock data
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

    const filteredCategories = categories.filter(cat => {
        // Exclude specific ID if needed (for editing parent)
        if (excludeId && cat.id === excludeId) return false;

        // Search filter
        if (searchQuery) {
            return (cat.full_path || '').toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const handleSelect = (cat: Category) => {
        onSelect({
            id: cat.id,
            fullPath: cat.full_path || ''
        });
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-md cursor-pointer bg-white flex items-center justify-between hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
            >
                <span className={value ? 'text-gray-900' : 'text-gray-400'}>
                    {value || placeholder}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-white border-b border-gray-100">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-teal-500"
                            placeholder="Search..."
                            autoFocus
                        />
                    </div>

                    {loading ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">Loading...</div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">No categories found</div>
                    ) : (
                        <ul>
                            {filteredCategories.map((cat) => (
                                <li
                                    key={cat.id}
                                    onClick={() => handleSelect(cat)}
                                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-teal-50 ${value === cat.full_path ? 'bg-teal-100 text-teal-800' : 'text-gray-700'
                                        }`}
                                >
                                    {cat.full_path}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoryHierarchicalDropdown;
