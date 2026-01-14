import React, { useState } from 'react';
import { httpClient } from '../../services/httpClient';
import { InventoryCategoryWizard } from '../../components/InventoryCategoryWizard';

/**
 * Inventory Page Component
 * Restored layout with Master, Operations, Reports tabs.
 */
const InventoryPage: React.FC = () => {
  // Top Level Tabs
  const tabs = ['Master', 'Operations', 'Reports'] as const;
  type Tab = typeof tabs[number];
  const [activeTab, setActiveTab] = useState<Tab>('Master');

  // Master Sub Tabs
  const masterSubTabs = ['Category', 'Location', 'Item Code'] as const;
  type MasterSubTab = typeof masterSubTabs[number];
  const [activeMasterSubTab, setActiveMasterSubTab] = useState<MasterSubTab>('Category');

  // Handle Create Category (from Wizard)
  const handleCreateCategory = async (data: { category: string; group: string | null; subgroup: string | null }) => {
    try {
      if (data.group && data.subgroup) {
        try {
          await httpClient.post('/api/inventory/master-categories/', {
            category: data.category,
            group: data.group,
            subgroup: null
          });
        } catch (e) {
          // Ignore error if group already exists
        }
      }
      await httpClient.post('/api/inventory/master-categories/', data);
      console.log("Category created successfully");
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  };

  const renderMaster = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
        {/* Sub-tabs Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-4">
          {masterSubTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMasterSubTab(tab)}
              className={`pb-3 px-6 text-sm font-medium transition-all relative ${activeMasterSubTab === tab
                ? 'text-green-600 border-b-2 border-green-600' // Using Green to match "before" style if applicable, or default primary
                : 'text-gray-500 hover:text-gray-700'
                }`}
              style={activeMasterSubTab === tab ? { borderColor: '#10B981', color: '#047857' } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-0">
          {activeMasterSubTab === 'Category' && (
            <div>
              <InventoryCategoryWizard
                onCreateCategory={handleCreateCategory}
              />
            </div>
          )}
          {activeMasterSubTab === 'Location' && (
            <div className="p-8 text-center text-gray-500">
              <p>Location Management module is ready to be implemented.</p>
            </div>
          )}
          {activeMasterSubTab === 'Item Code' && (
            <div className="p-8 text-center text-gray-500">
              <p>Item Code Management module is ready to be implemented.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
        </div>
      </div>

      {/* Top Tabs */}
      <div className="flex space-x-6 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium transition-colors ${activeTab === tab
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {activeTab === 'Master' && renderMaster()}
      {activeTab === 'Operations' && <div className="p-8 text-center text-gray-500">Operations Module</div>}
      {activeTab === 'Reports' && <div className="p-8 text-center text-gray-500">Reports Module</div>}
    </div>
  );
};

export default InventoryPage;
