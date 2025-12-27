import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

interface Submodule {
    id: number;
    name: string;
    code: string;
    description: string;
}

interface Module {
    id: number;
    name: string;
    code: string;
    icon: string;
    submodules: Submodule[];
}

interface Permission {
    submodule_id: number;
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
}

interface PermissionTreeSelectorProps {
    modules: Module[];
    permissions: Permission[];
    onChange: (permissions: Permission[]) => void;
    readOnly?: boolean;
    simpleMode?: boolean;
}

const PermissionTreeSelector: React.FC<PermissionTreeSelectorProps> = ({
    modules,
    permissions,
    onChange,
    readOnly = false,
    simpleMode = false
}) => {
    const [expandedModules, setExpandedModules] = useState<number[]>([]);

    const toggleModule = (moduleId: number) => {
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const getPermission = (submoduleId: number) => {
        return permissions.find(p => p.submodule_id === submoduleId) || {
            submodule_id: submoduleId,
            can_view: false,
            can_create: false,
            can_edit: false,
            can_delete: false
        };
    };

    const updatePermission = (submoduleId: number, field: keyof Permission, value: boolean) => {
        if (readOnly) return;

        const currentPerm = getPermission(submoduleId);
        const updatedPerm = { ...currentPerm, [field]: value };

        // Auto-enable view if any write permission is enabled
        if ((field === 'can_create' || field === 'can_edit' || field === 'can_delete') && value) {
            updatedPerm.can_view = true;
        }

        // Auto-disable write permissions if view is disabled
        if (field === 'can_view' && !value) {
            updatedPerm.can_create = false;
            updatedPerm.can_edit = false;
            updatedPerm.can_delete = false;
        }

        const otherPermissions = permissions.filter(p => p.submodule_id !== submoduleId);
        onChange([...otherPermissions, updatedPerm]);
    };

    const toggleAllSubmodulePermissions = (submoduleId: number, value: boolean) => {
        if (readOnly) return;

        const updatedPerm = {
            submodule_id: submoduleId,
            can_view: value,
            can_create: value,
            can_edit: value,
            can_delete: value
        };

        const otherPermissions = permissions.filter(p => p.submodule_id !== submoduleId);
        onChange([...otherPermissions, updatedPerm]);
    };

    // Helper to dynamically render Lucide icons
    const renderIcon = (iconName: string) => {
        // Map backend icon names to Lucide icons
        const iconMap: { [key: string]: any } = {
            'dashboard': Icons.LayoutDashboard,
            'book': Icons.BookOpen,
            'inventory_2': Icons.Package,
            'receipt_long': Icons.Receipt,
            'bar_chart': Icons.BarChart3,
            'smart_toy': Icons.Bot,
            'settings': Icons.Settings
        };

        const IconComponent = iconMap[iconName] || Icons.LayoutGrid;
        return <IconComponent className="w-5 h-5" />;
    };

    return (
        <div className="space-y-4">
            {modules.map((module) => (
                <div key={module.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    {/* Module Header */}
                    <div
                        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleModule(module.id)}
                    >
                        <div className="flex items-center gap-3">
                            {renderIcon(module.icon)}
                            <span className="font-semibold text-gray-700">{module.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                {module.submodules.length} submodules
                            </span>
                            {expandedModules.includes(module.id) ? (
                                <Icons.ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <Icons.ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                    </div>

                    {/* Submodules List */}
                    {expandedModules.includes(module.id) && (

                        <div className="p-4 space-y-3">
                            {!simpleMode && (
                                <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 border-b pb-2 mb-2">
                                    <div className="col-span-4 pl-2">SUBMODULE</div>
                                    <div className="col-span-8 flex justify-between px-4">
                                        <span className="w-16 text-center">VIEW</span>
                                        <span className="w-16 text-center">CREATE</span>
                                        <span className="w-16 text-center">EDIT</span>
                                        <span className="w-16 text-center">DELETE</span>
                                        <span className="w-16 text-center">ALL</span>
                                    </div>
                                </div>
                            )}

                            {module.submodules.map((submodule) => {
                                const perm = getPermission(submodule.id);
                                const allEnabled = perm.can_view && perm.can_create && perm.can_edit && perm.can_delete;

                                return (
                                    <div key={submodule.id} className={`${simpleMode ? 'flex justify-between' : 'grid grid-cols-12 gap-4'} items-center py-2 hover:bg-gray-50 rounded px-2 transition-colors`}>
                                        <div className={`${simpleMode ? '' : 'col-span-4'} font-medium text-gray-700 flex items-center gap-3`}>
                                            {simpleMode && (
                                                <input
                                                    type="checkbox"
                                                    checked={allEnabled}
                                                    onChange={(e) => toggleAllSubmodulePermissions(submodule.id, e.target.checked)}
                                                    disabled={readOnly}
                                                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                                />
                                            )}
                                            {submodule.name}
                                        </div>

                                        {!simpleMode && (
                                            <div className="col-span-8 flex justify-between px-4">
                                                {/* View */}
                                                <div className="w-16 flex justify-center">
                                                    <label className="cursor-pointer relative flex items-center justify-center p-2 rounded-full hover:bg-blue-50 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={perm.can_view}
                                                            onChange={(e) => updatePermission(submodule.id, 'can_view', e.target.checked)}
                                                            disabled={readOnly}
                                                            className="peer sr-only"
                                                        />
                                                        <div className={`w-5 h-5 border-2 rounded transition-all ${perm.can_view ? 'bg-blue-600 border-blue-600' : 'border-gray-300 peer-hover:border-blue-400'}`}>
                                                            {perm.can_view && <Icons.Check className="w-4 h-4 text-white" />}
                                                        </div>
                                                    </label>
                                                </div>

                                                {/* Create */}
                                                <div className="w-16 flex justify-center">
                                                    <label className="cursor-pointer relative flex items-center justify-center p-2 rounded-full hover:bg-green-50 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={perm.can_create}
                                                            onChange={(e) => updatePermission(submodule.id, 'can_create', e.target.checked)}
                                                            disabled={readOnly}
                                                            className="peer sr-only"
                                                        />
                                                        <div className={`w-5 h-5 border-2 rounded transition-all ${perm.can_create ? 'bg-green-600 border-green-600' : 'border-gray-300 peer-hover:border-green-400'}`}>
                                                            {perm.can_create && <Icons.Check className="w-4 h-4 text-white" />}
                                                        </div>
                                                    </label>
                                                </div>

                                                {/* Edit */}
                                                <div className="w-16 flex justify-center">
                                                    <label className="cursor-pointer relative flex items-center justify-center p-2 rounded-full hover:bg-yellow-50 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={perm.can_edit}
                                                            onChange={(e) => updatePermission(submodule.id, 'can_edit', e.target.checked)}
                                                            disabled={readOnly}
                                                            className="peer sr-only"
                                                        />
                                                        <div className={`w-5 h-5 border-2 rounded transition-all ${perm.can_edit ? 'bg-yellow-600 border-yellow-600' : 'border-gray-300 peer-hover:border-yellow-400'}`}>
                                                            {perm.can_edit && <Icons.Check className="w-4 h-4 text-white" />}
                                                        </div>
                                                    </label>
                                                </div>

                                                {/* Delete */}
                                                <div className="w-16 flex justify-center">
                                                    <label className="cursor-pointer relative flex items-center justify-center p-2 rounded-full hover:bg-red-50 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={perm.can_delete}
                                                            onChange={(e) => updatePermission(submodule.id, 'can_delete', e.target.checked)}
                                                            disabled={readOnly}
                                                            className="peer sr-only"
                                                        />
                                                        <div className={`w-5 h-5 border-2 rounded transition-all ${perm.can_delete ? 'bg-red-600 border-red-600' : 'border-gray-300 peer-hover:border-red-400'}`}>
                                                            {perm.can_delete && <Icons.Check className="w-4 h-4 text-white" />}
                                                        </div>
                                                    </label>
                                                </div>

                                                {/* Select All */}
                                                <div className="w-16 flex justify-center border-l pl-2">
                                                    <button
                                                        onClick={() => toggleAllSubmodulePermissions(submodule.id, !allEnabled)}
                                                        disabled={readOnly}
                                                        className={`p-1 rounded transition-colors ${allEnabled ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                                    >
                                                        <Icons.CheckCheck className="w-5 h-5" />
                                                    </button>
                                                </div>

                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PermissionTreeSelector;
