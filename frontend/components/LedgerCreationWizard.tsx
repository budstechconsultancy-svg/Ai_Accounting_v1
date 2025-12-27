import React, { useState, useEffect } from 'react';
import Icon from './Icon';

interface HierarchyRow {
    id: number;
    type_of_business_1: string | null;
    financial_reporting_1: string | null;
    major_group_1: string | null;
    group_1: string | null;
    sub_group_1_1: string | null;
    sub_group_2_1: string | null;
    sub_group_3_1: string | null;
    ledger_1: string | null;
    custom_ledger?: string | null;  // 7th level for nested custom ledgers
    code: string | null;
    isCustom?: boolean; // Flag for tenant-specific ledgers
}

interface Ledger {
    id: number;
    name: string;
    category: string | null;
    group: string | null;
    sub_group_1: string | null;
    sub_group_2: string | null;
    sub_group_3: string | null;
    ledger_type: string | null;
    parent_ledger_id: number | null;
}

interface TreeNode {
    name: string;
    children: TreeNode[];
    level: number;
    isCustom?: boolean;
    ledgerId?: number;  // Store ledger ID for custom ledgers
    fullPath: {
        category: string | null;
        group: string | null;
        sub_group_1: string | null;
        sub_group_2: string | null;
        sub_group_3: string | null;
        ledger_type: string | null;
        parent_ledger_id?: number | null;
    };
}

interface LedgerCreationWizardProps {
    onCreateLedger: (data: {
        customName: string;
        group: string | null;
        category: string | null;
        sub_group_1: string | null;
        sub_group_2: string | null;
        sub_group_3: string | null;
        ledger_type: string | null;
        parent_ledger_id?: number | null;
    }) => void;
}

export const LedgerCreationWizard: React.FC<LedgerCreationWizardProps> = ({ onCreateLedger }) => {
    const [hierarchyData, setHierarchyData] = useState<HierarchyRow[]>([]);
    const [tenantLedgers, setTenantLedgers] = useState<Ledger[]>([]);
    const [loading, setLoading] = useState(true);
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [customName, setCustomName] = useState('');

    // Convert tenant ledger to hierarchy row format
    const convertLedgerToHierarchy = (ledger: Ledger, allLedgers: Ledger[]): HierarchyRow => {
        // If this ledger has a parent, find the parent and use its hierarchy + name as ledger_type
        if (ledger.parent_ledger_id) {
            const parent = allLedgers.find(l => l.id === ledger.parent_ledger_id);
            if (parent) {
                return {
                    id: ledger.id,
                    type_of_business_1: null,
                    financial_reporting_1: null,
                    major_group_1: parent.category,
                    group_1: parent.group,
                    sub_group_1_1: parent.sub_group_1,
                    sub_group_2_1: parent.sub_group_2,
                    sub_group_3_1: parent.sub_group_3,
                    ledger_1: parent.name,  // Parent name becomes the "type"
                    custom_ledger: ledger.name,  // Child name goes here!
                    code: null,
                    isCustom: true
                };
            }
        }
        // Regular custom ledger (no parent)
        return {
            id: ledger.id,
            type_of_business_1: null,
            financial_reporting_1: null,
            major_group_1: ledger.category,
            group_1: ledger.group,
            sub_group_1_1: ledger.sub_group_1,
            sub_group_2_1: ledger.sub_group_2,
            sub_group_3_1: ledger.sub_group_3,
            ledger_1: ledger.name,
            custom_ledger: null,
            code: null,
            isCustom: true
        };
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both global hierarchy and tenant ledgers
                const [hierarchyRes, ledgersRes] = await Promise.all([
                    fetch('http://localhost:8000/api/hierarchy/'),
                    fetch('http://localhost:8000/api/masters/ledgers/', {
                        credentials: 'include' // Include cookies for authentication
                    })
                ]);

                if (!hierarchyRes.ok) throw new Error('Failed to fetch hierarchy');

                const globalHierarchy: HierarchyRow[] = await hierarchyRes.json();

                // Fetch tenant ledgers (may fail if not authenticated, that's ok)
                let ledgers: Ledger[] = [];
                if (ledgersRes.ok) {
                    ledgers = await ledgersRes.json();
                    setTenantLedgers(ledgers);
                }

                // Convert tenant ledgers to hierarchy format
                const customHierarchy = ledgers.map(ledger => convertLedgerToHierarchy(ledger, ledgers));

                // Merge global hierarchy with custom ledgers
                const mergedHierarchy = [...globalHierarchy, ...customHierarchy];
                setHierarchyData(mergedHierarchy);

                // Build tree structure
                const tree = buildTreeStructure(mergedHierarchy, ledgers);
                setTreeData(tree);

                setLoading(false);
            } catch (error) {
                console.error('Error loading data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const buildTreeStructure = (data: HierarchyRow[], ledgers: Ledger[]): TreeNode[] => {
        const tree: Map<string, TreeNode> = new Map();
        const ledgerIdToPath: Map<number, string> = new Map(); // Track ledger ID to tree path

        // First pass: Build tree from hierarchy data (excluding nested custom ledgers)
        data.forEach(row => {
            // Skip rows that represent nested custom ledgers (they have custom_ledger filled)
            if (row.custom_ledger) return;

            const levels = [
                { key: 'major_group_1', value: row.major_group_1, level: 0 },
                { key: 'group_1', value: row.group_1, level: 1 },
                { key: 'sub_group_1_1', value: row.sub_group_1_1, level: 2 },
                { key: 'sub_group_2_1', value: row.sub_group_2_1, level: 3 },
                { key: 'sub_group_3_1', value: row.sub_group_3_1, level: 4 },
                { key: 'ledger_1', value: row.ledger_1, level: 5 },
            ];

            let currentPath = '';
            let parentPath = '';

            levels.forEach((level, index) => {
                if (!level.value) return;

                parentPath = currentPath;
                currentPath = currentPath ? `${currentPath}>${level.value}` : level.value;

                if (!tree.has(currentPath)) {
                    const isCustomLedger = level.level === 5 && row.isCustom;
                    const ledgerId = isCustomLedger ? row.id : undefined;

                    const node: TreeNode = {
                        name: level.value,
                        children: [],
                        level: level.level,
                        isCustom: isCustomLedger,
                        ledgerId: ledgerId,
                        fullPath: {
                            category: row.major_group_1,
                            group: row.group_1,
                            sub_group_1: row.sub_group_1_1,
                            sub_group_2: row.sub_group_2_1,
                            sub_group_3: row.sub_group_3_1,
                            ledger_type: row.ledger_1,
                        }
                    };

                    tree.set(currentPath, node);

                    // Track ledger ID to path mapping for custom ledgers
                    if (ledgerId) {
                        ledgerIdToPath.set(ledgerId, currentPath);
                    }

                    if (parentPath && tree.has(parentPath)) {
                        const parent = tree.get(parentPath)!;
                        if (!parent.children.find(c => c.name === node.name)) {
                            parent.children.push(node);
                        }
                    }
                }
            });
        });

        // Second pass: Add nested custom ledgers as children of their parents
        ledgers.forEach(ledger => {
            if (ledger.parent_ledger_id) {
                const parentPath = ledgerIdToPath.get(ledger.parent_ledger_id);
                if (parentPath && tree.has(parentPath)) {
                    const parentNode = tree.get(parentPath)!;

                    // Create child node
                    const childNode: TreeNode = {
                        name: ledger.name,
                        children: [],
                        level: 6, // Nested custom ledger level
                        isCustom: true,
                        ledgerId: ledger.id,
                        fullPath: {
                            category: ledger.category,
                            group: ledger.group,
                            sub_group_1: ledger.sub_group_1,
                            sub_group_2: ledger.sub_group_2,
                            sub_group_3: ledger.sub_group_3,
                            ledger_type: ledger.ledger_type,
                            parent_ledger_id: ledger.parent_ledger_id
                        }
                    };

                    // Add to parent's children if not already there
                    if (!parentNode.children.find(c => c.name === childNode.name && c.ledgerId === childNode.ledgerId)) {
                        parentNode.children.push(childNode);
                    }

                    // Track this nested ledger's path for potential grandchildren
                    const childPath = `${parentPath}>${ledger.name}`;
                    tree.set(childPath, childNode);
                    ledgerIdToPath.set(ledger.id, childPath);
                }
            }
        });

        // Get root nodes (major groups)
        const roots: TreeNode[] = [];
        tree.forEach((node, path) => {
            if (!path.includes('>')) {
                roots.push(node);
            }
        });

        return roots.sort((a, b) => a.name.localeCompare(b.name));
    };

    const toggleNode = (nodePath: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodePath)) {
            newExpanded.delete(nodePath);
        } else {
            newExpanded.add(nodePath);
        }
        setExpandedNodes(newExpanded);
    };

    const selectNodeForPreview = (node: TreeNode) => {
        // Create a partial path based on the level clicked
        const partialPath = {
            category: node.level >= 0 ? node.fullPath.category : null,
            group: node.level >= 1 ? node.fullPath.group : null,
            sub_group_1: node.level >= 2 ? node.fullPath.sub_group_1 : null,
            sub_group_2: node.level >= 3 ? node.fullPath.sub_group_2 : null,
            sub_group_3: node.level >= 4 ? node.fullPath.sub_group_3 : null,
            ledger_type: node.level >= 5 ? node.fullPath.ledger_type : null,
            parent_ledger_id: node.isCustom && node.ledgerId ? node.ledgerId : null,  // If custom ledger, use its ID as parent
        };

        setSelectedNode({
            ...node,
            fullPath: partialPath
        });
    };

    const renderTree = (nodes: TreeNode[], parentPath = '', level = 0): React.ReactElement[] => {
        return nodes.map((node, index) => {
            const nodePath = parentPath ? `${parentPath}>${node.name}` : node.name;
            const isExpanded = expandedNodes.has(nodePath);
            const hasChildren = node.children.length > 0;
            const isSelected = selectedNode?.name === node.name &&
                selectedNode?.level === node.level &&
                JSON.stringify(selectedNode?.fullPath) === JSON.stringify(node.fullPath);

            return (
                <div key={nodePath} style={{ marginLeft: `${level * 20}px` }}>
                    <div
                        className={`flex items-center py-1.5 px-2 cursor-pointer hover:bg-gray-100 rounded transition-colors ${isSelected ? 'bg-blue-100 text-blue-700 font-medium border-l-2 border-blue-500' : ''
                            } ${node.isCustom ? 'text-blue-600' : ''}`}
                        onClick={() => selectNodeForPreview(node)}
                        onDoubleClick={() => {
                            if (hasChildren) {
                                toggleNode(nodePath);
                            }
                        }}
                    >
                        {hasChildren ? (
                            <span className="mr-1 text-gray-500 text-xs font-bold select-none">
                                {isExpanded ? '−' : '+'}
                            </span>
                        ) : (
                            <span className={`mr-1 text-xs ${node.isCustom ? 'text-blue-500' : 'text-gray-400'}`}>
                                {node.isCustom ? '★' : '•'}
                            </span>
                        )}
                        <span className={`text-sm select-none ${node.isCustom ? 'font-medium' : ''}`}>
                            {node.name}
                        </span>
                    </div>
                    {hasChildren && isExpanded && (
                        <div>
                            {renderTree(node.children, nodePath, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customName.trim() || !selectedNode) {
            alert('Please enter a ledger name and select a hierarchy level from the tree.');
            return;
        }

        const newLedgerData = {
            customName: customName,
            group: selectedNode.fullPath.group,
            category: selectedNode.fullPath.category,
            sub_group_1: selectedNode.fullPath.sub_group_1,
            sub_group_2: selectedNode.fullPath.sub_group_2,
            sub_group_3: selectedNode.fullPath.sub_group_3,
            ledger_type: selectedNode.fullPath.ledger_type,
            parent_ledger_id: selectedNode.fullPath.parent_ledger_id || null
        };

        // Call parent's onCreateLedger
        onCreateLedger(newLedgerData);

        // Reset form immediately
        setCustomName('');
        setSelectedNode(null);

        // Refetch data after a short delay to get the newly created ledger with real ID
        setTimeout(async () => {
            try {
                const [hierarchyRes, ledgersRes] = await Promise.all([
                    fetch('http://localhost:8000/api/hierarchy/'),
                    fetch('http://localhost:8000/api/masters/ledgers/', {
                        credentials: 'include'
                    })
                ]);

                if (hierarchyRes.ok && ledgersRes.ok) {
                    const globalHierarchy: HierarchyRow[] = await hierarchyRes.json();
                    const ledgers: Ledger[] = await ledgersRes.json();

                    setTenantLedgers(ledgers);
                    const customHierarchy = ledgers.map(ledger => convertLedgerToHierarchy(ledger, ledgers));
                    const mergedHierarchy = [...globalHierarchy, ...customHierarchy];
                    setHierarchyData(mergedHierarchy);

                    const tree = buildTreeStructure(mergedHierarchy, ledgers);
                    setTreeData(tree);
                }
            } catch (error) {
                console.error('Error refetching data:', error);
            }
        }, 500); // Wait 500ms for database to save
    };

    if (loading) return <div className="text-gray-500 text-sm">Loading hierarchy...</div>;

    return (
        <div className="bg-white rounded-lg border border-gray-200 space-y-4">
            <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Icon name="wand-sparkles" size={18} />
                    Create Ledger
                </h4>
            </div>

            <div className="px-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Ledger Type
                </label>
                <div className="border border-gray-300 rounded-md p-3 max-h-80 overflow-y-auto bg-gray-50">
                    {treeData.length > 0 ? (
                        renderTree(treeData)
                    ) : (
                        <div className="text-gray-500 text-sm">No hierarchy data available</div>
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    <strong>Single click</strong> to select any level. <strong>Double click</strong> to expand/collapse categories.
                    <br />
                    <span className="text-blue-600">★ Blue items</span> are your custom ledgers. Click them to create nested ledgers!
                </p>
            </div>

            {true && (
                <div className="px-4 pb-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-4">Ledger Preview</h5>

                        {/* Ledger Name Input */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                Ledger Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={customName}
                                onChange={e => setCustomName(e.target.value)}
                                placeholder="Enter ledger name"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                            />
                        </div>

                        {/* Hierarchy Details Grid - Only show fields with values */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Category */}
                            {selectedNode?.fullPath.category && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                        Category
                                    </label>
                                    <div className="text-sm font-medium text-gray-800">
                                        {selectedNode.fullPath.category}
                                    </div>
                                </div>
                            )}

                            {/* Group */}
                            {selectedNode?.fullPath.group && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                        Group
                                    </label>
                                    <div className="text-sm font-medium text-gray-800">
                                        {selectedNode.fullPath.group}
                                    </div>
                                </div>
                            )}

                            {/* Sub Group 1 */}
                            {selectedNode?.fullPath.sub_group_1 && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                        Sub Group 1
                                    </label>
                                    <div className="text-sm font-medium text-gray-800">
                                        {selectedNode.fullPath.sub_group_1}
                                    </div>
                                </div>
                            )}

                            {/* Sub Group 2 */}
                            {selectedNode?.fullPath.sub_group_2 && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                        Sub Group 2
                                    </label>
                                    <div className="text-sm font-medium text-gray-800">
                                        {selectedNode.fullPath.sub_group_2}
                                    </div>
                                </div>
                            )}

                            {/* Sub Group 3 */}
                            {selectedNode?.fullPath.sub_group_3 && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                        Sub Group 3
                                    </label>
                                    <div className="text-sm font-medium text-gray-800">
                                        {selectedNode.fullPath.sub_group_3}
                                    </div>
                                </div>
                            )}

                            {/* Ledger Type / Parent Ledger */}
                            {selectedNode?.fullPath.ledger_type && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                                        {selectedNode.isCustom ? 'Parent Ledger' : 'Ledger Type'}
                                    </label>
                                    <div className={`text-sm font-medium ${selectedNode.isCustom ? 'text-blue-600' : 'text-gray-800'}`}>
                                        {selectedNode.fullPath.ledger_type}
                                        {selectedNode.isCustom && ' ★'}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Create Button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!selectedNode || !customName.trim()}
                            className={`w-full px-4 py-2.5 rounded font-medium transition-colors ${selectedNode && customName.trim()
                                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {selectedNode?.isCustom ? 'Create Nested Ledger' : 'Create Ledger'}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};
