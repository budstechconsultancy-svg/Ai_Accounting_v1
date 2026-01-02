import React, { useState, useCallback, useEffect } from 'react';
import type { Unit, StockItem, StockGroup } from '../src/types';
import Icon from './Icon';
import { validateHsnCode } from '../src/services/validationService';
import type { HsnValidationResult } from '../src/services/validationService';
import StockMassUploadModal from './StockMassUploadModal';
import InventoryReportsPage from './inventory-reports/InventoryReportsPage';


interface InventoryPageProps {
  units: Unit[];
  stockGroups: StockGroup[];
  stockItems: StockItem[];
  onAddUnit: (unit: Unit) => void;
  onAddStockGroup: (group: StockGroup) => void;
  onAddStockItem: (item: StockItem) => void;
  onUpdateStockItem?: (id: number, item: Partial<StockItem>) => void;
  onDeleteStockItem?: (id: number) => void;


  onUpdateStockGroup?: (id: number, group: Partial<StockGroup>) => void;
  onDeleteStockGroup?: (id: number) => void;

  onUpdateUnit?: (id: number, unit: Partial<Unit>) => void;
  onDeleteUnit?: (id: number) => void;

  onAddStockItems: (items: StockItem[]) => void; // New prop for mass upload
  permissions: string[];
}

type InventoryCategory = 'Operations' | 'Products' | 'Reporting' | 'Configuration';

const InventoryPage: React.FC<InventoryPageProps> = ({
  units, stockGroups, stockItems,
  onAddUnit, onAddStockGroup, onAddStockItem, onAddStockItems,
  onUpdateStockItem, onDeleteStockItem,
  onUpdateStockGroup, onDeleteStockGroup,
  onUpdateUnit, onDeleteUnit,
  permissions
}) => {
  const categories: { id: InventoryCategory; label: string; perm: string }[] = [
    { id: 'Operations', label: 'Operations', perm: 'INVENTORY_OPERATIONS' },
    { id: 'Products', label: 'Products', perm: 'INVENTORY_PRODUCTS' },
    { id: 'Reporting', label: 'Reporting', perm: 'INVENTORY_REPORTS' },
    { id: 'Configuration', label: 'Configuration', perm: 'INVENTORY_CONFIG' }
  ];

  // For backward compatibility while permissions are being updated
  const availableCategories = categories.filter(cat =>
    permissions.includes(cat.perm) || permissions.includes('INVENTORY') || permissions.includes('OWNER')
  );

  const [activeCategory, setActiveCategory] = useState<InventoryCategory>(availableCategories.length > 0 ? availableCategories[0].id : 'Operations');
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.find(c => c.id === activeCategory)) {
      setActiveCategory(availableCategories[0].id);
    }
  }, [permissions]);

  if (availableCategories.length === 0) {
    return <div className="p-8 text-center text-gray-500">You do not have permission to view any content in this module.</div>;
  }

  // Form states
  const [unitName, setUnitName] = useState('');
  const [unitSymbol, setUnitSymbol] = useState('');
  const [editingUnitId, setEditingUnitId] = useState<number | null>(null);

  const [groupName, setGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);

  const [itemName, setItemName] = useState('');
  const [itemUnit, setItemUnit] = useState('');
  const [itemGroup, setItemGroup] = useState('');
  const [hsn, setHsn] = useState('');
  const [gstRate, setGstRate] = useState<number>(18);
  const [quantity, setQuantity] = useState<number>(0);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  // HSN Validation State
  const [hsnValidation, setHsnValidation] = useState<HsnValidationResult | null>(null);
  const [isHsnLoading, setIsHsnLoading] = useState(false);
  const [isMassUploadOpen, setIsMassUploadOpen] = useState(false);

  const handleUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim() || !unitSymbol.trim()) return;

    if (editingUnitId && onUpdateUnit) {
      onUpdateUnit(editingUnitId, { name: unitName.trim(), symbol: unitSymbol.trim() });
      setEditingUnitId(null);
    } else {
      if (!units.find(u => u.name.toLowerCase() === unitName.trim().toLowerCase())) {
        onAddUnit({ name: unitName.trim(), symbol: unitSymbol.trim() });
      }
    }
    setUnitName('');
    setUnitSymbol('');
  };

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    if (editingGroupId && onUpdateStockGroup) {
      onUpdateStockGroup(editingGroupId, { name: groupName.trim() });
      setEditingGroupId(null);
    } else {
      if (!stockGroups.find(g => g.name.toLowerCase() === groupName.trim().toLowerCase()) && onAddStockGroup) {
        onAddStockGroup({ name: groupName.trim() });
      }
    }
    setGroupName('');
  };

  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isHsnValid = (hsnValidation?.status === 'valid' || hsnValidation?.status === 'mismatch');
    // Allow saving if no HSN entered or if HSN entered and validated (checking strictness)
    // Assuming UI disables button if invalid.

    if (itemName.trim() && itemUnit.trim() && itemGroup.trim()) {
      if (editingItemId && onUpdateStockItem) {
        onUpdateStockItem(editingItemId, {
          name: itemName.trim(),
          unit: itemUnit,
          group: itemGroup,
          hsn: hsn,
          gstRate: gstRate,
          quantity: quantity
        });
        setEditingItemId(null);
      } else {
        if (!stockItems.find(i => i.name.toLowerCase() === itemName.trim().toLowerCase())) {
          onAddStockItem({ name: itemName.trim(), unit: itemUnit, group: itemGroup, hsn: hsn, gstRate: gstRate, quantity: quantity });
        }
      }

      setItemName('');
      setItemUnit('');
      setItemGroup('');
      setHsn('');
      setGstRate(18);
      setQuantity(0);
      setHsnValidation(null);
    }
  };

  const handleEditItem = (item: StockItem) => {
    if (!item.id) return;
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemGroup(item.group);
    setItemUnit(item.unit);
    setHsn(item.hsn || '');
    setGstRate(item.gstRate || 18);
    setQuantity(item.quantity || 0);
  };

  const handleDeleteItemClick = (id?: number) => {
    if (id && onDeleteStockItem && window.confirm('Delete this stock item?')) {
      onDeleteStockItem(id);
    }
  };

  const handleHsnBlur = useCallback(async () => {
    if (!hsn) {
      setHsnValidation(null);
      return;
    }
    setIsHsnLoading(true);
    setHsnValidation(null);
    const result = await validateHsnCode(hsn, gstRate);
    setHsnValidation(result);
    setIsHsnLoading(false);
  }, [hsn, gstRate]);

  const renderItems = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">{editingItemId ? 'Update Stock Item' : 'Create Stock Item'}</h3>
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <div>
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input type="text" id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} className="form-input" required />
            </div>
            <div>
              <label htmlFor="itemGroup" className="block text-sm font-medium text-gray-700 mb-1">Group</label>
              <input type="text" id="itemGroup" list="stock-groups-datalist" value={itemGroup} onChange={(e) => setItemGroup(e.target.value)} className="form-input" required />
              <datalist id="stock-groups-datalist">
                {stockGroups.map(g => <option key={g.name} value={g.name} />)}
              </datalist>
            </div>
            <div>
              <label htmlFor="itemUnit" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input type="text" id="itemUnit" list="units-datalist" value={itemUnit} onChange={(e) => setItemUnit(e.target.value)} className="form-input" required />
              <datalist id="units-datalist">
                {units.map(u => <option key={u.name} value={u.name} />)}
              </datalist>
            </div>
            <div>
              <label htmlFor="hsn" className="block text-sm font-medium text-gray-700 mb-1">HSN/SAC Code</label>
              <div className="relative">
                <input
                  type="text"
                  id="hsn"
                  value={hsn}
                  onChange={(e) => {
                    setHsn(e.target.value);
                    setHsnValidation(null); // Reset validation on change
                  }}
                  onBlur={handleHsnBlur}
                  className="form-input pr-10"
                  placeholder="e.g. 8471"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {isHsnLoading && <Icon name="spinner" className="w-5 h-5 text-gray-400 animate-spin" />}
                  {hsnValidation && !isHsnLoading && (
                    hsnValidation.status === 'valid' ? <Icon name="check-circle" className="w-5 h-5 text-green-500" /> :
                      hsnValidation.status === 'invalid' ? <Icon name="x-circle" className="w-5 h-5 text-red-500" /> :
                        <Icon name="warning" className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
              </div>
              {hsnValidation && !isHsnLoading && <p className={`text-xs mt-1 ${hsnValidation.status === 'invalid' ? 'text-red-600' : hsnValidation.status === 'mismatch' ? 'text-yellow-600' : 'text-green-600'}`}>{hsnValidation.message}</p>}
            </div>
            <div>
              <label htmlFor="gstRate" className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
              <input
                type="number"
                id="gstRate"
                value={gstRate}
                onChange={(e) => {
                  setGstRate(parseFloat(e.target.value));
                  setHsnValidation(null); // Reset validation on change
                }}
                onBlur={handleHsnBlur}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="form-input"
                placeholder="e.g. 10"
              />
            </div>
            <div className="text-right">
              <button type="submit" className={`form-button disabled:bg-gray-400 ${editingItemId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`} disabled={!hsnValidation && hsn.length > 0 && !(hsnValidation && (hsnValidation.status === 'valid' || hsnValidation.status === 'mismatch'))}>
                <Icon name={editingItemId ? "save" : "plus"} className="w-4 h-4 mr-2" /> {editingItemId ? 'Update Item' : 'Create Item'}
              </button>
              {editingItemId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItemId(null);
                    setItemName('');
                    setItemUnit('');
                    setItemGroup('');
                    setHsn('');
                    setQuantity(0);
                    setHsnValidation(null);
                  }}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700 w-full block text-center"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock Items</h3>
            <button
              onClick={() => setIsMassUploadOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 border border-purple-200 text-sm font-semibold text-purple-700 rounded-md hover:bg-purple-100"
            >
              <Icon name="upload" className="w-4 h-4" />
              <span>Mass Upload</span>
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="table-header">Item Name</th>
                  <th className="table-header">Group</th>
                  <th className="table-header">HSN</th>
                  <th className="table-header">GST Rate</th>
                  <th className="table-header text-right">Quantity</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockItems.map(item => (
                  <tr key={item.name}>
                    <td className="table-cell font-medium">{item.name}</td>
                    <td className="table-cell text-gray-500">{item.group}</td>
                    <td className="table-cell text-gray-500 font-mono">{item.hsn}</td>
                    <td className="table-cell text-gray-500">{item.gstRate}%</td>
                    <td className="table-cell text-gray-500 font-mono text-right">{item.quantity || 0}</td>
                    <td className="table-cell text-right">
                      <button onClick={() => handleEditItem(item)} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteItemClick(item.id)} className="inline-flex items-center px-2 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUnitForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">{editingUnitId ? 'Update Unit' : 'Create Unit'}</h3>
          <form onSubmit={handleUnitSubmit} className="space-y-4">
            <div>
              <label htmlFor="unitName" className="block text-sm font-medium text-gray-700 mb-1">Unit Name</label>
              <input type="text" id="unitName" value={unitName} onChange={(e) => setUnitName(e.target.value)} className="form-input" required placeholder="e.g., Kilogram" />
            </div>
            <div>
              <label htmlFor="unitSymbol" className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
              <input type="text" id="unitSymbol" value={unitSymbol} onChange={(e) => setUnitSymbol(e.target.value)} className="form-input" required placeholder="e.g., Kg" />
            </div>
            <div className="text-right">
              <button type="submit" className={`form-button ${editingUnitId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                <Icon name={editingUnitId ? "save" : "plus"} className="w-4 h-4 mr-2" /> {editingUnitId ? 'Update Unit' : 'Create Unit'}
              </button>
              {editingUnitId && (
                <button type="button" onClick={() => { setEditingUnitId(null); setUnitName(''); setUnitSymbol(''); }} className="mt-2 w-full text-center text-sm text-gray-500">Cancel</button>
              )}
            </div>
          </form>
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Existing Units</h3>
          <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {units.map((u, idx) => (
              <li key={`unit-${u.id || u.name}-${idx}`} className="py-3 px-4 text-sm font-medium flex justify-between items-center">
                <span>{u.name} ({u.symbol})</span>
                <div>
                  <button onClick={() => { setEditingUnitId(u.id || null); setUnitName(u.name); setUnitSymbol(u.symbol || ''); }} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2">
                    Edit
                  </button>
                  <button onClick={() => { if (u.id && onDeleteUnit && window.confirm('Delete?')) onDeleteUnit(u.id); }} className="inline-flex items-center px-2 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSimpleMaster = (
    title: string, type: 'Group' | 'Unit', name: string, setName: (val: string) => void,
    handleSubmit: (e: React.FormEvent) => void, list: ({ name: string, id?: number })[],
    editingId: number | null, setEditingId: (id: number | null) => void,
    onEdit: (item: any) => void, onDelete: (id?: number) => void
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">{editingId ? `Update ${title}` : `Create ${title}`}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor={`${type}Name`} className="block text-sm font-medium text-gray-700 mb-1">{title} Name</label>
              <input type="text" id={`${type}Name`} value={name} onChange={(e) => setName(e.target.value)} className="form-input" required />
            </div>
            <div className="text-right">
              <button type="submit" className={`form-button ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                <Icon name={editingId ? "save" : "plus"} className="w-4 h-4 mr-2" /> {editingId ? `Update ${title}` : `Create ${title}`}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setName(''); }} className="mt-2 w-full text-center text-sm text-gray-500">Cancel</button>
              )}
            </div>
          </form>
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Existing {title}s</h3>
          <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {list.map((i, idx) => (
              <li key={`${type}-${i.id || i.name}-${idx}`} className="py-3 px-4 text-sm font-medium flex justify-between items-center">
                <span>{i.name}</span>
                <div>
                  <button onClick={() => { setEditingId(i.id || null); setName(i.name); }} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2">
                    Edit
                  </button>
                  <button onClick={() => { if (i.id && onDelete && window.confirm('Delete?')) onDelete(i.id); }} className="inline-flex items-center px-2 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Inventory Masters</h2>
      <style>{`
        .form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }
        .form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
        .form-button { display: inline-flex; items-center: center; justify-content: center; padding: 0.5rem 1rem; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); color: white; background-color: #2563eb; }
        .form-button:hover { background-color: #1d4ed8; }
        .table-header { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
        .table-cell { padding: 1rem 1.5rem; white-space: nowrap; font-size: 0.875rem; color: #111827; }
      `}</style>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Inventory Categories">
          {availableCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                // Reset activeTab to default for that category
                if (cat.id === 'Operations') setActiveTab('Overview');
                else if (cat.id === 'Products') setActiveTab('Products');
                else if (cat.id === 'Reporting') setActiveTab('Stock');
                else if (cat.id === 'Configuration') setActiveTab('Warehouses');
              }}
              className={`${activeCategory === cat.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-bold text-sm uppercase tracking-wider`}
            >
              {cat.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub-navigation for the active category */}
      <div className="mb-6 flex space-x-4">
        {activeCategory === 'Operations' && (
          <>
            <button onClick={() => setActiveTab('Overview')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'Overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Overview</button>
            <button onClick={() => setActiveTab('Transfers')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'Transfers' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Transfers</button>
            <button onClick={() => setActiveTab('Adjustments')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'Adjustments' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Physical Inventory</button>
          </>
        )}
        {activeCategory === 'Products' && (
          <>
            <button onClick={() => setActiveTab('Products')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'Products' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Products</button>
            <button onClick={() => setActiveTab('Variants')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'Variants' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Product Variants</button>
          </>
        )}
        {activeCategory === 'Reporting' && (
          <>
            <button onClick={() => setActiveTab('Stock')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'Stock' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Stock</button>
            <button onClick={() => setActiveTab('Moves')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'Moves' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Stock Moves</button>
            <button onClick={() => setActiveTab('Valuation')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'Valuation' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Valuation</button>
          </>
        )}
        {activeCategory === 'Configuration' && (
          <>
            <button onClick={() => setActiveTab('Warehouses')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'Warehouses' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Warehouses</button>
            <button onClick={() => setActiveTab('Locations')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'Locations' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Locations</button>
            <button onClick={() => setActiveTab('Units')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'Units' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Units</button>
            <button onClick={() => setActiveTab('Groups')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${activeTab === 'Groups' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>Product Groups</button>
          </>
        )}
      </div>

      {/* Operations Views */}
      {activeCategory === 'Operations' && activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Receipts</h4>
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-md">
              <span className="text-blue-700 font-medium">To Process</span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">5</span>
            </div>
            <button className="w-full mt-4 text-sm text-blue-600 font-medium hover:underline text-left">View Operation →</button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Internal Transfers</h4>
            <div className="flex justify-between items-center bg-orange-50 p-4 rounded-md">
              <span className="text-orange-700 font-medium">To Process</span>
              <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold">2</span>
            </div>
            <button className="w-full mt-4 text-sm text-orange-600 font-medium hover:underline text-left">View Operation →</button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Delivery Orders</h4>
            <div className="flex justify-between items-center bg-green-50 p-4 rounded-md">
              <span className="text-green-700 font-medium">To Process</span>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">12</span>
            </div>
            <button className="w-full mt-4 text-sm text-green-600 font-medium hover:underline text-left">View Operation →</button>
          </div>
        </div>
      )}

      {/* Products Views */}
      {activeCategory === 'Products' && activeTab === 'Products' && renderItems()}
      {activeCategory === 'Products' && activeTab === 'Variants' && (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-slate-200 text-center">
          <p className="text-gray-500 italic">No variants defined. Enable variants in settings to use this feature.</p>
        </div>
      )}

      {/* Reporting Views */}
      {activeCategory === 'Reporting' && <InventoryReportsPage />}

      {/* Configuration Views */}
      {activeCategory === 'Configuration' && activeTab === 'Units' && renderUnitForm()}
      {activeCategory === 'Configuration' && activeTab === 'Groups' && renderSimpleMaster('Stock Group', 'Group', groupName, setGroupName, handleGroupSubmit, stockGroups, editingGroupId, setEditingGroupId, () => { }, onDeleteStockGroup || (() => { }))}
      {activeCategory === 'Configuration' && activeTab === 'Warehouses' && (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-slate-200 text-center">
          <p className="text-gray-500 italic">Warehouse management coming soon. Using default Warehouse (WH).</p>
        </div>
      )}
      {activeCategory === 'Configuration' && activeTab === 'Locations' && (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-slate-200 text-center">
          <p className="text-gray-500 italic">Location hierarchy (WH/Stock, WH/Output) coming soon.</p>
        </div>
      )}

      {isMassUploadOpen && (
        <StockMassUploadModal
          onClose={() => setIsMassUploadOpen(false)}
          onComplete={onAddStockItems}
          units={units}
          stockGroups={stockGroups}
        />
      )}

    </div>
  );
};

export default InventoryPage;
