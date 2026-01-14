import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { httpClient } from '../services/httpClient';

interface MasterCategory {
    id: number;
    category: string;
    group: string | null;
    subgroup: string | null;
    is_active: boolean;
}

interface TreeNode {
    id: string; // Composite ID for tree tracking
    name: string;
    children: TreeNode[];
    level: number; // 0=Category, 1=Group, 2=Subgroup
    isSystem: boolean;
    data: {
        category: string;
        group: string | null;
        subgroup: string | null;
    };
}

interface InventoryCategoryWizardProps {
    onCreateCategory: (data: {
        category: string;
        group: string | null;
        subgroup: string | null;
    }) => Promise<void>;
}

// Hardcoded base categories (System Categories)
const SYSTEM_CATEGORIES = [
    'RAW MATERIAL',
    'Work in Progress',
    'Finished goods',
    'Stores and Spares',
    'Packing Material',
    'Stock in Trade'
];

export const InventoryCategoryWizard: React.FC<InventoryCategoryWizardProps> = ({ onCreateCategory }) => {
    const [loading, setLoading] = useState(false);
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [newGroupName, setNewGroupName] = useState('');
    const [newSubgroupName, setNewSubgroupName] = useState('');

    useEffect(() => {
        fetchMasterCategories();
    }, []);

    const fetchMasterCategories = async () => {
        try {
            setLoading(true);
            // Use httpClient for proper authentication and error handling
            const data = await httpClient.get<MasterCategory[]>('/api/inventory/master-categories/');
            buildTree(data);
        } catch (error) {
            console.error('Error loading master categories:', error);
            // Fallback to system categories if API fails
            buildTree([]);
        } finally {
            setLoading(false);
        }
    };

    const buildTree = (data: MasterCategory[]) => {
        const rootMap = new Map<string, TreeNode>();

        // 1. Initialize System Categories
        SYSTEM_CATEGORIES.forEach(catName => {
            rootMap.set(catName, {
                id: `root-${catName}`,
                name: catName,
                children: [],
                level: 0,
                isSystem: true,
                data: { category: catName, group: null, subgroup: null }
            });
        });

        // 2. Process fetched data to build hierarchy
        data.forEach(item => {
            const catName = item.category;

            // Ensure root category exists (even if not in SYSTEM_CATEGORIES, handling custom roots if allowed)
            if (!rootMap.has(catName)) {
                rootMap.set(catName, {
                    id: `root-${catName}`,
                    name: catName,
                    children: [],
                    level: 0,
                    isSystem: false, // Custom root
                    data: { category: catName, group: null, subgroup: null }
                });
            }

            const rootNode = rootMap.get(catName)!;

            // Handle three cases:
            // 1. Group with optional Subgroup
            // 2. Subgroup without Group (direct under category)
            // 3. Just Group (no subgroup)

            if (item.group) {
                // Case 1 & 3: Has a group
                let groupNode = rootNode.children.find(c => c.name === item.group);

                if (!groupNode) {
                    groupNode = {
                        id: `group-${catName}-${item.group}`,
                        name: item.group,
                        children: [],
                        level: 1,
                        isSystem: false,
                        data: { category: catName, group: item.group, subgroup: null }
                    };
                    rootNode.children.push(groupNode);
                }

                // Process Subgroup under Group
                if (item.subgroup) {
                    // Check if subgroup already exists to avoid duplicates
                    if (!groupNode.children.find(c => c.name === item.subgroup)) {
                        const subgroupNode: TreeNode = {
                            id: `sub-${catName}-${item.group}-${item.subgroup}`,
                            name: item.subgroup,
                            children: [],
                            level: 2,
                            isSystem: false,
                            data: { category: catName, group: item.group, subgroup: item.subgroup }
                        };
                        groupNode.children.push(subgroupNode);
                    }
                }
            } else if (item.subgroup) {
                // Case 2: Subgroup without Group (direct under category)
                // Check if subgroup already exists to avoid duplicates
                if (!rootNode.children.find(c => c.name === item.subgroup)) {
                    const subgroupNode: TreeNode = {
                        id: `sub-${catName}-null-${item.subgroup}`,
                        name: item.subgroup,
                        children: [],
                        level: 1, // Level 1 since it's directly under category
                        isSystem: false,
                        data: { category: catName, group: null, subgroup: item.subgroup }
                    };
                    rootNode.children.push(subgroupNode);
                }
            }
        });

        // Convert Map to Array and Sort
        const sortedRoots = Array.from(rootMap.values()).sort((a, b) => {
            // System categories first, then alphabetical
            const aSys = SYSTEM_CATEGORIES.indexOf(a.name);
            const bSys = SYSTEM_CATEGORIES.indexOf(b.name);
            if (aSys !== -1 && bSys !== -1) return aSys - bSys;
            if (aSys !== -1) return -1;
            if (bSys !== -1) return 1;
            return a.name.localeCompare(b.name);
        });

        // Sort children
        const sortChildren = (node: TreeNode) => {
            node.children.sort((a, b) => a.name.localeCompare(b.name));
            node.children.forEach(sortChildren);
        };
        sortedRoots.forEach(sortChildren);

        setTreeData(sortedRoots);
    };

    const toggleNode = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const selectNodeForPreview = (node: TreeNode) => {
        setSelectedNode(node);
        setNewGroupName('');
        setNewSubgroupName('');

        // Auto-expand if selecting a root/group to make workflow smoother
        if (!expandedNodes.has(node.id)) {
            toggleNode(node.id);
        }
    };

    const renderTree = (nodes: TreeNode[]): React.ReactElement[] => {
        return nodes.map((node) => {
            const isExpanded = expandedNodes.has(node.id);
            const hasChildren = node.children.length > 0;
            const isSelected = selectedNode?.id === node.id;

            return (
                <div key={node.id} style={{ marginLeft: `${node.level * 20}px` }}>
                    <div
                        className={`flex items-center py-1.5 px-2 cursor-pointer hover:bg-gray-100 rounded transition-colors ${isSelected ? 'bg-blue-100 text-blue-700 font-medium border-l-2 border-blue-500' : ''
                            } ${!node.isSystem && node.level === 0 ? 'text-blue-600' : ''}`}
                        onClick={() => selectNodeForPreview(node)}
                        onDoubleClick={() => {
                            if (hasChildren || node.level < 2) {
                                toggleNode(node.id);
                            }
                        }}
                    >
                        {hasChildren ? (
                            <span
                                className="mr-1 text-gray-500 text-xs font-bold select-none w-4 text-center hover:text-gray-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNode(node.id);
                                }}
                            >
                                {isExpanded ? '−' : '+'}
                            </span>
                        ) : (
                            <span className={`mr-1 text-xs w-4 text-center ${!node.isSystem ? 'text-blue-500' : 'text-gray-400'}`}>
                                {node.level === 0 ? (node.isSystem ? '•' : '★') : '•'}
                            </span>
                        )}

                        <span className={`text-sm select-none truncate ${!node.isSystem ? 'font-medium' : ''}`}>
                            {node.name}
                        </span>
                    </div>
                    {hasChildren && isExpanded && (
                        <div>
                            {renderTree(node.children)}
                        </div>
                    )}
                </div>
            );
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedNode) {
            alert('Please select a category.');
            return;
        }

        // Validation: At least one field (group or subgroup) must be filled
        if (selectedNode.level === 0 && !newGroupName.trim() && !newSubgroupName.trim()) {
            alert('Please enter either a Group Name or Subgroup Name (or both)');
            return;
        }

        if (selectedNode.level === 1 && !newSubgroupName.trim()) {
            // If selected Group, user MUST enter Subgroup
            alert('Please enter a Subgroup Name');
            return;
        }

        try {
            // Scenario 1: Selected Root (Category) -> Create Group and/or Subgroup
            if (selectedNode.level === 0) {
                await onCreateCategory({
                    category: selectedNode.data.category,
                    group: newGroupName.trim() || null,
                    subgroup: newSubgroupName.trim() || null
                });
            }
            // Scenario 2: Selected Group -> Create Subgroup
            else if (selectedNode.level === 1) {
                await onCreateCategory({
                    category: selectedNode.data.category,
                    group: selectedNode.data.group,
                    subgroup: newSubgroupName.trim()
                });
            }

            // Refresh tree
            fetchMasterCategories();

            // Clear inputs
            setNewGroupName('');
            setNewSubgroupName('');

            // Note: We don't auto-expand here because fetchMasterCategories replaces the tree nodes
            // Ideally we'd preserve expansion state but for now standard refresh is fine.

        } catch (error) {
            console.error("Error creating category:", error);
            alert("Failed to create. It might already exist.");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            <div className="px-6 pt-4 pb-3 flex items-center gap-2">
                <Icon name="local_offer" className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Create Category</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-5 px-6 pb-6 flex-1 min-h-0">
                {/* Left Panel: Category Tree */}
                <div className="w-full md:w-1/2 bg-white rounded-md shadow-sm border border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800 text-sm">Select Category</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Single click to select level. Double click to expand/collapse categories.</p>
                        <p className="text-xs text-blue-600 mt-1">★ Blue items are your custom categories.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3">
                        {loading ? (
                            <div className="text-center py-8 text-gray-400 text-sm">Loading hierarchy...</div>
                        ) : (
                            renderTree(treeData)
                        )}
                    </div>
                </div>

                {/* Right Panel: Creation Form */}
                <div className="w-full md:w-1/2 bg-white rounded-md shadow-sm border border-gray-200">
                    <div className="p-5">
                        <h3 className="font-semibold text-gray-800 text-sm mb-6">Category Preview</h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Logic for Creation Inputs based on Selection Level */}
                            <div className="space-y-5">

                                {/* 1. Category Display (Always Fixed) */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        CATEGORY
                                    </label>
                                    {selectedNode ? (
                                        <div className="text-gray-900 font-semibold text-base">
                                            {selectedNode.level === 0 ? selectedNode.name : selectedNode.data.category}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 font-normal text-sm italic">
                                            Select a category from the left
                                        </div>
                                    )}
                                </div>

                                {/* 2. Group Input/Display */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        GROUP
                                    </label>

                                    {selectedNode && selectedNode.level === 0 ? (
                                        // If Root selected, allow typing Group
                                        <input
                                            type="text"
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 bg-white text-gray-800 text-sm"
                                            placeholder="Enter Group Name"
                                            autoFocus
                                        />
                                    ) : selectedNode && selectedNode.level === 1 && selectedNode.data.group && !selectedNode.data.subgroup ? (
                                        // If GROUP (not subgroup) selected at level 1, display it
                                        <div className="text-gray-900 font-semibold text-base">
                                            {selectedNode.name}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value=""
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                                            placeholder="Enter Group Name"
                                            readOnly
                                        />
                                    )}
                                </div>

                                {/* 3. Subgroup Input */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        SUBGROUP
                                    </label>
                                    {selectedNode && selectedNode.level === 1 && !selectedNode.data.group && selectedNode.data.subgroup ? (
                                        <div className="text-gray-900 font-semibold text-base">
                                            {selectedNode.name}
                                        </div>
                                    ) : selectedNode && selectedNode.level === 2 ? (
                                        <div className="text-gray-900 font-semibold text-base">
                                            {selectedNode.name}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={newSubgroupName}
                                            onChange={(e) => setNewSubgroupName(e.target.value)}
                                            disabled={!selectedNode || selectedNode.level > 1}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-400 text-sm ${!selectedNode || selectedNode.level > 1
                                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                                : 'bg-white text-gray-800'
                                                }`}
                                            placeholder="Enter Subgroup Name (Optional - Create Group First)"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={!selectedNode}
                                    className={`w-full py-2.5 px-4 rounded font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 text-sm ${selectedNode
                                        ? 'bg-gray-300 text-gray-700 hover:bg-gray-400 cursor-pointer'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    Create Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
