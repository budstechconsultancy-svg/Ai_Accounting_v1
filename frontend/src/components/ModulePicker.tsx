import React, { useState, useRef, useEffect } from 'react';
import { useModuleData } from '../src/hooks/useModuleData';
import type { UserTable } from '../types';

interface ModulePickerProps {
  selectedSubmoduleIds: number[];
  onChange: (selectedIds: number[]) => void;
  disabled?: boolean;
  className?: string;
}

const ModulePicker: React.FC<ModulePickerProps> = ({
  selectedSubmoduleIds,
  onChange,
  disabled = false,
  className = ''
}) => {
  const { userTables, userTablesLoading, userTablesError } = useModuleData();
  const [expandedTables, setExpandedTables] = useState<Set<number>>(new Set());
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  // Keyboard navigation
  const toggleAccordion = (tableId: number) => {
    setExpandedTables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tableId)) {
        newSet.delete(tableId);
      } else {
        newSet.add(tableId);
      }
      return newSet;
    });
  };

  const handleSubmoduleToggle = (submoduleId: number, checked: boolean) => {
    const newSelected = checked
      ? [...selectedSubmoduleIds, submoduleId]
      : selectedSubmoduleIds.filter(id => id !== submoduleId);
    onChange(newSelected);
  };

  const handleTableToggle = (table: UserTable, select: boolean) => {
    const submoduleIds = table.submodules.map(s => s.id);
    const newSelected = select
      ? [...new Set([...selectedSubmoduleIds, ...submoduleIds])]
      : selectedSubmoduleIds.filter(id => !submoduleIds.includes(id));
    onChange(newSelected);
  };

  const isTableFullySelected = (table: UserTable) => {
    const submoduleIds = table.submodules.map(s => s.id);
    return submoduleIds.every(id => selectedSubmoduleIds.includes(id));
  };

  const isTablePartiallySelected = (table: UserTable) => {
    const submoduleIds = table.submodules.map(s => s.id);
    const selectedCount = submoduleIds.filter(id => selectedSubmoduleIds.includes(id)).length;
    return selectedCount > 0 && selectedCount < submoduleIds.length;
  };

  const handleKeyDown = (e: React.KeyboardEvent, table: UserTable, type: string, submodule?: any) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (type === 'table') {
          toggleAccordion(table.id);
        } else if (type === 'submodule' && submodule) {
          handleSubmoduleToggle(submodule.id, !selectedSubmoduleIds.includes(submodule.id));
        }
        break;
      case 'ArrowDown':
        // Navigate to next item
        break;
      case 'ArrowUp':
        // Navigate to previous item
        break;
    }
  };

  if (userTablesLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading modules...</span>
      </div>
    );
  }

  if (userTablesError) {
    return (
      <div className={`text-center p-8 text-red-600 ${className}`}>
        <p>Failed to load modules: {userTablesError.message}</p>
        <button
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`module-picker ${className}`} role="region" aria-label="Module and Submodule Selection">
      <div className="space-y-2">
        {userTables.map((table) => (
          <div
            key={table.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
            role="group"
            aria-labelledby={`table-${table.id}`}
          >
            {/* Table Header */}
            <div
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => !disabled && toggleAccordion(table.id)}
              onKeyDown={(e) => handleKeyDown(e, table, undefined, 'table')}
              role="button"
              tabIndex={0}
              aria-expanded={expandedTables.has(table.id)}
              aria-controls={`submodules-${table.id}`}
              id={`table-${table.id}`}
            >
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  className="flex items-center space-x-3 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTableToggle(table, !isTableFullySelected(table));
                  }}
                  disabled={disabled}
                  aria-label={`${isTableFullySelected(table) ? 'Deselect' : 'Select'} all ${table.name} modules`}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isTableFullySelected(table)}
                      ref={(el) => {
                        if (el) el.indeterminate = isTablePartiallySelected(table);
                      }}
                      onChange={() => {}} // Handled by parent button
                      className="sr-only"
                      disabled={disabled}
                    />
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                      isTableFullySelected(table)
                        ? 'bg-blue-600 border-blue-600'
                        : isTablePartiallySelected(table)
                        ? 'bg-blue-200 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {isTableFullySelected(table) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {isTablePartiallySelected(table) && !isTableFullySelected(table) && (
                        <div className="w-2 h-0.5 bg-blue-600 rounded"></div>
                      )}
                    </div>
                  </div>
                </button>
                <div>
                  <h3 className="font-medium text-gray-900">{table.name}</h3>
                  {table.description && (
                    <p className="text-sm text-gray-600">{table.description}</p>
                  )}
                </div>
              </div>
              <button
                className={`transform transition-transform ${expandedTables.has(table.id) ? 'rotate-180' : ''}`}
                aria-label={expandedTables.has(table.id) ? 'Collapse' : 'Expand'}
                disabled={disabled}
              >
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Submodules */}
            {expandedTables.has(table.id) && (
              <div
                className="border-t border-gray-200 bg-white"
                id={`submodules-${table.id}`}
                role="group"
                aria-label={`${table.name} submodules`}
              >
                <div className="py-2">
                  {table.submodules.map((submodule) => (
                    <label
                      key={submodule.id}
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      onKeyDown={(e) => handleKeyDown(e, table, submodule, 'submodule')}
                      tabIndex={0}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubmoduleIds.includes(submodule.id)}
                        onChange={(e) => handleSubmoduleToggle(submodule.id, e.target.checked)}
                        disabled={disabled}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        aria-describedby={`submodule-${submodule.id}-desc`}
                      />
                      <div>
                        <span className="font-medium text-gray-900">{submodule.name}</span>
                        {submodule.description && (
                          <p
                            id={`submodule-${submodule.id}-desc`}
                            className="text-sm text-gray-600"
                          >
                            {submodule.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {userTables.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No modules available
        </div>
      )}
    </div>
  );
};

export default ModulePicker;
