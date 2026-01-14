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

interface MasterCategory {
    id: number;
    category: string;
    group: string | null;
    subgroup: string | null;
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
                const response = await httpClient.get<MasterCategory[]>('/api/inventory/master-categories/');

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

    const buildCategoryOptions = (data: MasterCategory[], excludeId?: number): CategoryOption[] => {
        // Transform flat master items into linear options list for dropdown
        // Note: The original generic recursiveness is lost, we map strictly to Category -> Group -> Subgroup levels

        const options: CategoryOption[] = [];

        data.forEach(item => {
            // Level 0: Category (We only add unique categories if we want them selectable, 
            // but effectively each row is a leaf node in this flat structure.
            // However, to mimic hierarchy, we construct tree.
            // Actually, for dropdown usage, usually we want to select the specific Item Master record.)

            // Current Approach: Just map each Master Record as a selectable option
            // Display label: Category > Group > Subgroup

            let label = item.category;
            if (item.group) label += ` > ${item.group}`;
            if (item.subgroup) label += ` > ${item.subgroup}`;

            options.push({
                id: item.id,
                name: item.subgroup || item.group || item.category,
                displayLabel: label,
                fullPath: label,
                level: item.subgroup ? 2 : (item.group ? 1 : 0),
                parent: null, // Logic not applicable in flat table
                is_system: false
            });
        });

        return options.sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
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
                <option value="">-- Select Category --</option>
                {categories.map((option) => (
                    <option
                        key={option.id}
                        value={option.displayLabel}
                    >
                        {option.displayLabel}
                    </option>
                ))}
            </select>
        </div>
    );
};
