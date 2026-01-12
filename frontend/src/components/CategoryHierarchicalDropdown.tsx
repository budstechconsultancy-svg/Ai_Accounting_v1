import React, { useState, useEffect } from 'react';
import { httpClient } from '../services/httpClient';

interface CategoryOption {
    id: number;
    name: string;
    displayLabel: string;
    fullPath: string;
    level: number;
    parent: number | null;
    is_system: boolean;
}

interface CategoryHierarchicalDropdownProps {
    onSelect: (selection: {
        id: number;
        name: string;
        fullPath: string;
    }) => void;
    value?: string;
    excludeId?: number; // Exclude this category and its children (for edit mode)
}

export const CategoryHierarchicalDropdown: React.FC<CategoryHierarchicalDropdownProps> = ({
    onSelect,
    value,
    excludeId
}) => {
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedValue, setSelectedValue] = useState('');

    // Load categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await httpClient.get<any[]>('/api/inventory/categories/');

                // Build hierarchical options
                const options = buildCategoryOptions(response, excludeId);
                setCategories(options);
                setLoading(false);
            } catch (error) {
                console.error('Error loading categories:', error);
                setLoading(false);
            }
        };
        fetchCategories();
    }, [excludeId]);

    const buildCategoryOptions = (data: any[], excludeId?: number): CategoryOption[] => {
        // Filter out excluded category and its children
        const filtered = data.filter(cat => {
            if (excludeId && cat.id === excludeId) return false;
            // Check if any parent in the path is the excluded ID
            if (excludeId && cat.full_path && cat.full_path.includes(excludeId.toString())) return false;
            return true;
        });

        return filtered.map(cat => ({
            id: cat.id,
            name: cat.name,
            displayLabel: cat.full_path || cat.name,
            fullPath: cat.full_path || cat.name,
            level: cat.level || 0,
            parent: cat.parent,
            is_system: cat.is_system
        })).sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOption = categories.find(cat => cat.displayLabel === e.target.value);

        if (selectedOption) {
            setSelectedValue(e.target.value);
            onSelect({
                id: selectedOption.id,
                name: selectedOption.name,
                fullPath: selectedOption.fullPath
            });
        }
    };

    if (loading) {
        return <div className="text-gray-500 text-sm">Loading categories...</div>;
    }

    return (
        <div className="space-y-2">
            <select
                value={selectedValue}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            >
                <option value="">-- Select Parent Category --</option>
                {categories.map((option) => (
                    <option
                        key={option.id}
                        value={option.displayLabel}
                    >
                        {option.displayLabel}
                        {option.is_system && ' (System)'}
                    </option>
                ))}
            </select>
        </div>
    );
};
