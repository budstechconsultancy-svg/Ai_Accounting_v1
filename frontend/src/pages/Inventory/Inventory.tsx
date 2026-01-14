import React, { useState, useEffect } from 'react';
import { httpClient } from '../../services/httpClient';
import { InventoryCategoryWizard } from '../../components/InventoryCategoryWizard';
import CategoryHierarchicalDropdown from '../../components/CategoryHierarchicalDropdown';

// Interfaces
interface Location {
  id: number;
  name: string;
  location_type: string;
  location_type_display: string;
  address_line1: string;
  address_line2: string | null;
  address_line3: string | null;
  city: string;
  state: string;
  pincode: string;
  gstin: string | null;
}

interface Item {
  id: number;
  item_code: string;
  name: string;
  category: number;
  category_name: string;
  hsn_code: string | null;
  description: string;
  unit: string;
  has_multiple_units: boolean;
  alternative_unit: string | null;
  conversion_factor: string | null;
  gst_rate: string;
  rate: string;
  location: number | null;
  location_name: string | null;
  is_active: boolean;
}

const InventoryPage: React.FC = () => {
  // Top Level Tabs
  const tabs = ['Master', 'Operations', 'Reports'] as const;
  type Tab = typeof tabs[number];
  const [activeTab, setActiveTab] = useState<Tab>('Master');

  // Master Sub Tabs
  const masterSubTabs = ['Category', 'Location', 'Item Code'] as const;
  type MasterSubTab = typeof masterSubTabs[number];
  const [activeMasterSubTab, setActiveMasterSubTab] = useState<MasterSubTab>('Category');

  // --- Location State ---
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationName, setLocationName] = useState('');
  const [locationType, setLocationType] = useState('');
  const [isCustomLocationType, setIsCustomLocationType] = useState(false);
  const [customLocationTypeValue, setCustomLocationTypeValue] = useState('');
  const [locAddressLine1, setLocAddressLine1] = useState('');
  const [locAddressLine2, setLocAddressLine2] = useState('');
  const [locAddressLine3, setLocAddressLine3] = useState('');
  const [locCity, setLocCity] = useState('');
  const [locState, setLocState] = useState('');
  const [locPincode, setLocPincode] = useState('');
  const [locationGstin, setLocationGstin] = useState('');
  const [isEditModeLocation, setIsEditModeLocation] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  // --- Item State ---
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<number | null>(null);
  const [itemCategoryPath, setItemCategoryPath] = useState('');
  const [itemHsn, setItemHsn] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemUnit, setItemUnit] = useState('nos');
  const [itemHasMultipleUnits, setItemHasMultipleUnits] = useState(false);
  const [itemAltUnit, setItemAltUnit] = useState('');
  const [itemConversionFactor, setItemConversionFactor] = useState('');
  const [itemGstRate, setItemGstRate] = useState('0.00');
  const [itemRate, setItemRate] = useState('');
  const [itemLocation, setItemLocation] = useState<number | null>(null);
  const [isEditModeItem, setIsEditModeItem] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  // Constants
  const locationTypes = [
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'store', label: 'Store' },
    { value: 'godown', label: 'Godown' },
    { value: 'factory', label: 'Factory' },
    { value: 'office', label: 'Office' },
    { value: 'other', label: 'Other' }
  ];

  const unitOptions = [
    { value: 'nos', label: 'Numbers' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'gm', label: 'Grams' },
    { value: 'm', label: 'Meters' },
    { value: 'cm', label: 'Centimeters' },
    { value: 'l', label: 'Liters' },
    { value: 'ml', label: 'Milliliters' },
    { value: 'box', label: 'Box' },
    { value: 'pch', label: 'Pouch' },
    { value: 'set', label: 'Set' },
    { value: 'pcs', label: 'Pieces' },
    { value: 'doz', label: 'Dozen' },
    { value: 'bag', label: 'Bag' },
    { value: 'bdl', label: 'Bundle' },
    { value: 'can', label: 'Can' },
    { value: 'btl', label: 'Bottle' },
  ];

  // API Methods
  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const response = await httpClient.get<Location[]>('/api/inventory/locations/');
      setLocations(response);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchItems = async () => {
    try {
      setLoadingItems(true);
      const response = await httpClient.get<Item[]>('/api/inventory/items/');
      setItems(response);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  // Helper function for Creating Category from Wizard
  const handleCreateCategory = async (data: { category: string; group: string | null; subgroup: string | null }) => {
    try {
      if (data.group && data.subgroup) {
        // Try to ensure group exists if needed, or let backend handle it
        try {
          await httpClient.post('/api/inventory/master-categories/', {
            category: data.category,
            group: data.group,
            subgroup: null
          });
        } catch (e) {
          // Ignore if group already exists
        }
      }
      await httpClient.post('/api/inventory/master-categories/', data);
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  };

  // Effects
  useEffect(() => {
    if (activeTab === 'Master') {
      if (activeMasterSubTab === 'Location') {
        fetchLocations();
      } else if (activeMasterSubTab === 'Item Code') {
        fetchItems();
        fetchLocations(); // For dropdown
      }
    }
  }, [activeTab, activeMasterSubTab]);

  // Handlers - Location
  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalLocationType = isCustomLocationType ? customLocationTypeValue : locationType;
    if (!finalLocationType) {
      alert('Please specify a location type');
      return;
    }

    try {
      const data = {
        name: locationName,
        location_type: finalLocationType,
        address_line1: locAddressLine1,
        address_line2: locAddressLine2 || null,
        address_line3: locAddressLine3 || null,
        city: locCity,
        state: locState,
        pincode: locPincode,
        country: 'India',
        gstin: locationGstin || null
      };

      if (isEditModeLocation && selectedLocation) {
        await httpClient.put(`/api/inventory/locations/${selectedLocation.id}/`, data);
      } else {
        await httpClient.post('/api/inventory/locations/', data);
      }
      resetLocationForm();
      fetchLocations();
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Error saving location. Please try again.');
    }
  };

  const handleEditLocation = () => {
    if (!selectedLocation) return;
    setLocationName(selectedLocation.name);
    const predefinedType = locationTypes.find(t => t.value === selectedLocation.location_type);
    if (predefinedType) {
      setLocationType(selectedLocation.location_type);
      setIsCustomLocationType(false);
      setCustomLocationTypeValue('');
    } else {
      setLocationType('custom');
      setIsCustomLocationType(true);
      setCustomLocationTypeValue(selectedLocation.location_type);
    }
    setLocAddressLine1(selectedLocation.address_line1);
    setLocAddressLine2(selectedLocation.address_line2 || '');
    setLocAddressLine3(selectedLocation.address_line3 || '');
    setLocCity(selectedLocation.city);
    setLocState(selectedLocation.state);
    setLocPincode(selectedLocation.pincode);
    setLocationGstin(selectedLocation.gstin || '');
    setIsEditModeLocation(true);
  };

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return;
    if (!confirm(`Are you sure you want to delete "${selectedLocation.name}"?`)) return;
    try {
      await httpClient.delete(`/api/inventory/locations/${selectedLocation.id}/`);
      resetLocationForm();
      fetchLocations();
    } catch (error: any) {
      console.error('Error deleting location:', error);
      alert(error.response?.data?.error || 'Error deleting location');
    }
  };

  const resetLocationForm = () => {
    setLocationName('');
    setLocationType('');
    setIsCustomLocationType(false);
    setCustomLocationTypeValue('');
    setLocAddressLine1('');
    setLocAddressLine2('');
    setLocAddressLine3('');
    setLocCity('');
    setLocState('');
    setLocPincode('');
    setLocationGstin('');
    setIsEditModeLocation(false);
    setSelectedLocation(null);
  };

  // Handlers - Items
  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCategory) {
      alert('Please select a category');
      return;
    }
    try {
      const data = {
        item_code: itemCode,
        name: itemName,
        category: itemCategory,
        hsn_code: itemHsn || null,
        description: itemDescription,
        unit: itemUnit,
        has_multiple_units: itemHasMultipleUnits,
        alternative_unit: itemHasMultipleUnits ? itemAltUnit : null,
        conversion_factor: itemHasMultipleUnits && itemConversionFactor ? itemConversionFactor : null,
        gst_rate: itemGstRate,
        rate: itemRate || '0.00',
        location: itemLocation
      };
      if (isEditModeItem && selectedItem) {
        await httpClient.put(`/api/inventory/items/${selectedItem.id}/`, data);
      } else {
        await httpClient.post('/api/inventory/items/', data);
      }
      resetItemForm();
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item. Please try again.');
    }
  };

  const handleEditItem = () => {
    if (!selectedItem) return;
    setItemCode(selectedItem.item_code);
    setItemName(selectedItem.name);
    setItemCategory(selectedItem.category);
    setItemCategoryPath(selectedItem.category_name);
    setItemHsn(selectedItem.hsn_code || '');
    setItemDescription(selectedItem.description || '');
    setItemUnit(selectedItem.unit);
    setItemHasMultipleUnits(selectedItem.has_multiple_units);
    setItemAltUnit(selectedItem.alternative_unit || '');
    setItemConversionFactor(selectedItem.conversion_factor || '');
    setItemGstRate(selectedItem.gst_rate);
    setItemRate(selectedItem.rate);
    setItemLocation(selectedItem.location);
    setIsEditModeItem(true);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    if (!confirm(`Are you sure you want to delete "${selectedItem.name}"?`)) return;
    try {
      await httpClient.delete(`/api/inventory/items/${selectedItem.id}/`);
      resetItemForm();
      fetchItems();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      alert(error.response?.data?.error || 'Error deleting item');
    }
  };

  const resetItemForm = () => {
    setItemCode('');
    setItemName('');
    setItemCategory(null);
    setItemCategoryPath('');
    setItemHsn('');
    setItemDescription('');
    setItemUnit('nos');
    setItemHasMultipleUnits(false);
    setItemAltUnit('');
    setItemConversionFactor('');
    setItemGstRate('0.00');
    setItemRate('');
    setItemLocation(null);
    setIsEditModeItem(false);
    setSelectedItem(null);
  };

  // Renderers
  const renderLocation = () => {
    const filteredLocations = locations.filter(loc =>
      loc.name.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
      loc.city.toLowerCase().includes(locationSearchQuery.toLowerCase())
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Create/Edit Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">{isEditModeLocation ? 'Edit Location' : 'Create Location'}</h3>
          <form onSubmit={handleLocationSubmit} className="space-y-4">
            {/* ... Location inputs ... */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location Name <span className="text-red-500">*</span></label>
              <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Enter location name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location Type <span className="text-red-500">*</span></label>
              <select value={isCustomLocationType ? 'custom' : locationType} onChange={(e) => {
                const value = e.target.value;
                if (value === 'custom') { setIsCustomLocationType(true); setLocationType('custom'); }
                else { setIsCustomLocationType(false); setLocationType(value); setCustomLocationTypeValue(''); }
              }} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" required={!isCustomLocationType}>
                <option value="">Select location type</option>
                {locationTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                <option value="custom">+ Create New Type</option>
              </select>
              {isCustomLocationType && (
                <div className="mt-3">
                  <input type="text" value={customLocationTypeValue} onChange={(e) => setCustomLocationTypeValue(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Enter custom location type" required />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 <span className="text-red-500">*</span></label>
              <input type="text" value={locAddressLine1} onChange={(e) => setLocAddressLine1(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Building/Street/Area" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label><input type="text" value={locAddressLine2} onChange={(e) => setLocAddressLine2(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Landmark (Optional)" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Address Line 3</label><input type="text" value={locAddressLine3} onChange={(e) => setLocAddressLine3(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Additional Info (Optional)" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">City <span className="text-red-500">*</span></label><input type="text" value={locCity} onChange={(e) => setLocCity(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="City" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">State <span className="text-red-500">*</span></label><input type="text" value={locState} onChange={(e) => setLocState(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="State" required /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pincode <span className="text-red-500">*</span></label>
              <input type="text" value={locPincode} onChange={(e) => setLocPincode(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Pincode/Zip Code" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN (Optional)</label>
              <input type="text" value={locationGstin} onChange={(e) => setLocationGstin(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Enter GSTIN (15 characters)" maxLength={15} />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">{isEditModeLocation ? 'Update Location' : 'Create Location'}</button>
              {isEditModeLocation && <button type="button" onClick={resetLocationForm} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">Cancel</button>}
            </div>
          </form>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Existing Locations</h3>
            <input type="text" placeholder="Search locations..." value={locationSearchQuery} onChange={(e) => setLocationSearchQuery(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loadingLocations ? <p className="text-gray-500 text-center py-8">Loading...</p> : filteredLocations.length === 0 ? <p className="text-gray-500 text-center py-8">No locations</p> : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0"><tr><th className="px-6 py-3 w-12"></th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-6 py-3 text-right"></th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLocations.map(loc => {
                    const isSelected = selectedLocation?.id === loc.id;
                    return (
                      <tr key={loc.id} className={isSelected ? 'bg-teal-50' : ''}>
                        <td className="px-6 py-4"><input type="radio" checked={isSelected} onChange={() => setSelectedLocation(loc)} className="text-teal-600 focus:ring-teal-500" /></td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 cursor-pointer" onClick={() => setSelectedLocation(loc)}>{loc.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500"><span className="px-2 font-semibold rounded-full bg-blue-100 text-blue-800 text-xs">{loc.location_type_display}</span></td>
                        <td className="px-6 py-4 text-right">
                          {isSelected && (
                            <div className="inline-flex gap-2">
                              <button onClick={handleEditLocation} className="text-white bg-teal-600 px-2 py-1 rounded text-xs">Edit</button>
                              <button onClick={handleDeleteLocation} className="text-white bg-red-600 px-2 py-1 rounded text-xs">Del</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderItemCode = () => {
    const filteredItems = items.filter(item =>
      item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
      item.item_code.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
      (item.hsn_code && item.hsn_code.includes(itemSearchQuery))
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">{isEditModeItem ? 'Edit Item' : 'Create Item'}</h3>
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Code <span className="text-red-500">*</span></label><input type="text" value={itemCode} onChange={(e) => setItemCode(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Name <span className="text-red-500">*</span></label><input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" required /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
              <CategoryHierarchicalDropdown onSelect={(s) => { setItemCategory(s.id); setItemCategoryPath(s.fullPath); }} value={itemCategoryPath} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">HSN</label><input type="text" value={itemHsn} onChange={(e) => setItemHsn(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Rate</label><input type="number" step="0.01" value={itemRate} onChange={(e) => setItemRate(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Description</label><input type="text" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Unit</label><select value={itemUnit} onChange={(e) => setItemUnit(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">{unitOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
              <div className="flex items-center pt-8"><input type="checkbox" checked={itemHasMultipleUnits} onChange={(e) => setItemHasMultipleUnits(e.target.checked)} className="h-4 w-4 text-teal-600" /> <span className="ml-2 text-sm">Multiple Units</span></div>
            </div>
            {itemHasMultipleUnits && (
              <div className="p-3 bg-gray-50 border rounded-md flex gap-2 items-center text-sm">
                <span>1</span>
                <select value={itemAltUnit} onChange={(e) => setItemAltUnit(e.target.value)} className="border-gray-300 rounded-md shadow-sm"><option value="">Alt Unit</option>{unitOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
                <span>=</span>
                <input type="number" value={itemConversionFactor} onChange={(e) => setItemConversionFactor(e.target.value)} className="w-20 border-gray-300 rounded-md" placeholder="Factor" />
                <span>{unitOptions.find(u => u.value === itemUnit)?.label}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">GST %</label><input type="number" step="0.01" value={itemGstRate} onChange={(e) => setItemGstRate(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Location</label><select value={itemLocation || ''} onChange={(e) => setItemLocation(e.target.value ? Number(e.target.value) : null)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"><option value="">Select Location</option>{locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}</select></div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">{isEditModeItem ? 'Update Item' : 'Create Item'}</button>
              {isEditModeItem && <button type="button" onClick={resetItemForm} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">Cancel</button>}
            </div>
          </form>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Existing Items</h3>
            <input type="text" placeholder="Search items..." value={itemSearchQuery} onChange={(e) => setItemSearchQuery(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm" />
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loadingItems ? <p className="text-gray-500 text-center py-8">Loading...</p> : filteredItems.length === 0 ? <p className="text-gray-500 text-center py-8">No items</p> : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0"><tr><th className="px-6 py-3 w-12"></th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HSN</th><th className="px-6 py-3 text-right"></th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map(item => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <tr key={item.id} className={isSelected ? 'bg-teal-50' : ''}>
                        <td className="px-6 py-4"><input type="radio" checked={isSelected} onChange={() => setSelectedItem(item)} className="text-teal-600 focus:ring-teal-500" /></td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedItem(item)}>
                          <div className="text-sm font-medium text-gray-900">{item.item_code}</div>
                          <div className="text-sm text-gray-500">{item.name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{item.hsn_code || '-'}</td>
                        <td className="px-6 py-4 text-right">
                          {isSelected && (
                            <div className="inline-flex gap-2">
                              <button onClick={handleEditItem} className="text-white bg-teal-600 px-2 py-1 rounded text-xs">Edit</button>
                              <button onClick={handleDeleteItem} className="text-white bg-red-600 px-2 py-1 rounded text-xs">Del</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMaster = () => (
    <div>
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200" aria-label="Master Sub-tabs">
          {masterSubTabs.map((subTab) => (
            <button key={subTab} onClick={() => setActiveMasterSubTab(subTab)} className={`pb-3 px-6 text-sm font-medium transition-all relative ${activeMasterSubTab === subTab ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {subTab}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-0">
        {activeMasterSubTab === 'Category' && <InventoryCategoryWizard onCreateCategory={handleCreateCategory} />}
        {activeMasterSubTab === 'Location' && renderLocation()}
        {activeMasterSubTab === 'Item Code' && renderItemCode()}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
      </div>
      <div className="flex space-x-6 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-2 text-sm font-medium transition-colors ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>
      {activeTab === 'Master' && renderMaster()}
      {activeTab === 'Operations' && <div className="p-8 text-center text-gray-500">Operations Module</div>}
      {activeTab === 'Reports' && <div className="p-8 text-center text-gray-500">Reports Module</div>}
    </div>
  );
};

export default InventoryPage;
