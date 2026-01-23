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
  const masterSubTabs = ['Category', 'Location', 'Inventory Items', 'GRN & Issue Slip'] as const;
  type MasterSubTab = typeof masterSubTabs[number];
  const [activeMasterSubTab, setActiveMasterSubTab] = useState<MasterSubTab>('Category');

  // GRN & Issue Slip Sub Tabs
  const grnIssueSlipSubTabs = ['GRN', 'Issue Slip'] as const;
  type GRNIssueSlipSubTab = typeof grnIssueSlipSubTabs[number];
  const [activeGRNIssueSlipSubTab, setActiveGRNIssueSlipSubTab] = useState<GRNIssueSlipSubTab>('GRN');

  // --- Location State ---
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationName, setLocationName] = useState('');
  const [locationType, setLocationType] = useState('');
  const [isCustomLocationType, setIsCustomLocationType] = useState(false);
  const [customLocationTypeValue, setCustomLocationTypeValue] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
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

  // --- GRN Series State ---
  const [grnSeriesName, setGrnSeriesName] = useState('');
  const [grnType, setGrnType] = useState('');
  const [grnPrefix, setGrnPrefix] = useState('');
  const [grnSuffix, setGrnSuffix] = useState('');
  const [grnYear, setGrnYear] = useState('');
  const [grnRequiredDigits, setGrnRequiredDigits] = useState('');
  const [grnPreview, setGrnPreview] = useState('');
  const [isEditModeGRNSeries, setIsEditModeGRNSeries] = useState(false);
  const [grnSeriesList, setGrnSeriesList] = useState<any[]>([]);
  const [selectedGrnSeries, setSelectedGrnSeries] = useState<any>(null);
  const [loadingGrnSeries, setLoadingGrnSeries] = useState(false);

  // --- Issue Slip Series State ---
  const [issueSlipSeriesName, setIssueSlipSeriesName] = useState('');
  const [issueSlipType, setIssueSlipType] = useState('');
  const [issueSlipPrefix, setIssueSlipPrefix] = useState('');
  const [issueSlipSuffix, setIssueSlipSuffix] = useState('');
  const [issueSlipYear, setIssueSlipYear] = useState('');
  const [issueSlipRequiredDigits, setIssueSlipRequiredDigits] = useState('');
  const [issueSlipPreview, setIssueSlipPreview] = useState('');
  const [isEditModeIssueSlipSeries, setIsEditModeIssueSlipSeries] = useState(false);
  const [issueSlipSeriesList, setIssueSlipSeriesList] = useState<any[]>([]);
  const [selectedIssueSlipSeries, setSelectedIssueSlipSeries] = useState<any>(null);
  const [loadingIssueSlipSeries, setLoadingIssueSlipSeries] = useState(false);

  // --- Inventory Items State ---
  const [selectedItemDetail, setSelectedItemDetail] = useState<any>(null);
  const [itemSearchQuery2, setItemSearchQuery2] = useState('');
  const [inventoryItems, setInventoryItems] = useState<any[]>([
    { id: 1, itemCode: 'IT001', itemName: 'Product A', category: 'Electronics', hsnCode: '8471', gstRate: '18%', uom: 'Nos', rate: 1500 },
    { id: 2, itemCode: 'IT002', itemName: 'Product B', category: 'Furniture', hsnCode: '9403', gstRate: '18%', uom: 'Nos', rate: 5000 },
    { id: 3, itemCode: 'IT003', itemName: 'Product C', category: 'Textiles', hsnCode: '6204', gstRate: '5%', uom: 'Mtr', rate: 250 },
  ]);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isVendorSpecificItemCode, setIsVendorSpecificItemCode] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [availableSubgroups, setAvailableSubgroups] = useState<any[]>([]);

  // --- Operations State ---
  const [selectedItemForOps, setSelectedItemForOps] = useState<any>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [showIssueSlipForm, setShowIssueSlipForm] = useState(false);
  const [issueSlipTab, setIssueSlipTab] = useState<'job-work' | 'inter-unit' | 'location-change'>('job-work');
  const [issueSlipNumber, setIssueSlipNumber] = useState('');
  const [issueSlipDate, setIssueSlipDate] = useState('');
  const [issueSlipTime, setIssueSlipTime] = useState('');
  const [goodsFromLocation, setGoodsFromLocation] = useState('');
  const [goodsToLocation, setGoodsToLocation] = useState('');
  const [issueSlipItems, setIssueSlipItems] = useState<any[]>([{ itemCode: '', itemName: '', uom: '', quantity: '', rate: '', value: 0 }]);
  const [postingNote, setPostingNote] = useState('');
  const [showDeliveryChallan, setShowDeliveryChallan] = useState(false);
  const [showEWayBill, setShowEWayBill] = useState(false);
  const [operationsStockData, setOperationsStockData] = useState<any[]>([
    { id: 1, category: 'Electronics', subCategory: 'Mobile', itemCode: 'IT001', itemName: 'Product A', uom: 'Nos', openingQty: 100, openingValue: 150000, inwardQty: 50, inwardValue: 75000, outwardQty: 30, outwardValue: 45000, closingQty: 120, closingValue: 180000 },
    { id: 2, category: 'Furniture', subCategory: 'Chairs', itemCode: 'IT002', itemName: 'Product B', uom: 'Nos', openingQty: 200, openingValue: 1000000, inwardQty: 100, inwardValue: 500000, outwardQty: 50, outwardValue: 250000, closingQty: 250, closingValue: 1250000 },
    { id: 3, category: 'Textiles', subCategory: 'Fabric', itemCode: 'IT003', itemName: 'Product C', uom: 'Mtr', openingQty: 1000, openingValue: 250000, inwardQty: 500, inwardValue: 125000, outwardQty: 300, outwardValue: 75000, closingQty: 1200, closingValue: 300000 },
  ]);

  // Constants
  const locationTypes = [
    { value: 'company_premises', label: 'Company Premises' },
    { value: 'job_worker_location', label: 'Job Worker Location' },
    { value: 'customer_location', label: 'Customer Location' },
    { value: 'vendor_location', label: 'Vendor Location' },
    { value: 'agent_location', label: 'Agent Location' },
    { value: 'distributor_location', label: 'Distributor Location' },
    { value: 'customs_warehouse', label: 'Customs Warehouse' },
    { value: 'other_third_party', label: 'Other Third-Party Location' },
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
    setVendorName('');
    setCustomerName('');
    setLocationAddress('');
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
    setVendorName('');
    setCustomerName('');
    setLocationAddress('');
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

  const handleDeleteItem = (itemId: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventoryItems(inventoryItems.filter(item => item.id !== itemId));
      if (selectedItemDetail?.id === itemId) {
        setSelectedItemDetail(null);
      }
    }
  };

  const handleEditItemOpen = (item: any) => {
    setEditFormData({ ...item, isEditMode: true });
    setSelectedItemDetail({ ...item, isEditMode: true });
  };

  const handleSaveItem = () => {
    if (editFormData?.id) {
      // Update existing item
      setInventoryItems(inventoryItems.map(item =>
        item.id === editFormData.id ? { ...editFormData } : item
      ));
    } else {
      // Create new item
      const newItem = {
        ...editFormData,
        id: Math.max(...inventoryItems.map(i => i.id), 0) + 1
      };
      setInventoryItems([...inventoryItems, newItem]);
    }
    setSelectedItemDetail(null);
    setEditFormData(null);
  };

  const handleFormChange = (field: string, value: any) => {
    setEditFormData({
      ...editFormData,
      [field]: value
    });
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
              <select value={locationType} onChange={(e) => {
                const value = e.target.value;
                setLocationType(value);
              }} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" required>
                <option value="">Select location type</option>
                {locationTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
              {isCustomLocationType && (
                <div className="mt-3">
                  <input type="text" value={customLocationTypeValue} onChange={(e) => setCustomLocationTypeValue(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Enter custom location type" required />
                </div>
              )}
            </div>

            {/* Conditional fields based on location type */}
            {(locationType === 'vendor_location' || locationType === 'agent_location' || locationType === 'distributor_location') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor/Agent Name <span className="text-red-500">*</span></label>
                <select value={vendorName} onChange={(e) => setVendorName(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" required>
                  <option value="">Select vendor/agent</option>
                  <option value="vendor1">Vendor 1</option>
                  <option value="vendor2">Vendor 2</option>
                </select>
              </div>
            )}

            {(locationType === 'customer_location' || locationType === 'customs_warehouse' || locationType === 'other_third_party') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name <span className="text-red-500">*</span></label>
                <select value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" required>
                  <option value="">Select customer</option>
                  <option value="customer1">Customer 1</option>
                  <option value="customer2">Customer 2</option>
                </select>
              </div>
            )}

            {/* Location Address - conditional based on type */}
            {(locationType === 'company_premises' || locationType === 'vendor_location' || locationType === 'agent_location' || locationType === 'distributor_location') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location Address <span className="text-red-500">*</span></label>
                <select value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select address</option>
                  <option value="address1">Address 1</option>
                  <option value="address2">Address 2</option>
                </select>
              </div>
            )}

            {/* Manual address entry for Customer Location and Other types */}
            {(locationType === 'customer_location' || locationType === 'customs_warehouse' || locationType === 'other_third_party') && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
                  📌 Manual Address Entry
                </div>
              </>
            )}

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

  const handleAddIssueSlipItem = () => {
    setIssueSlipItems([...issueSlipItems, { itemCode: '', itemName: '', uom: '', quantity: '', rate: '', value: 0 }]);
  };

  const handleRemoveIssueSlipItem = (index: number) => {
    setIssueSlipItems(issueSlipItems.filter((_, i) => i !== index));
  };

  const handleIssueSlipItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...issueSlipItems];
    updatedItems[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(updatedItems[index].quantity) || 0;
      const rate = parseFloat(updatedItems[index].rate) || 0;
      updatedItems[index].value = qty * rate;
    }
    setIssueSlipItems(updatedItems);
  };

  const getTotalValue = () => {
    return issueSlipItems.reduce((sum, item) => sum + (item.value || 0), 0);
  };

  const renderOperations = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {!showItemDetail ? (
          <>
            {/* Stock Movement Main View */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Stock Movement Summary</h2>

              {/* Top Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowIssueSlipForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
                >
                  ➕ Add New Issue Slip
                </button>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  ➕ Add New GRN
                </button>
              </div>

              {/* Stock Movement Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase"><input type="text" placeholder="Category" className="w-20 px-2 py-1 border rounded text-xs" /></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase"><input type="text" placeholder="Sub-Cat" className="w-20 px-2 py-1 border rounded text-xs" /></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase"><input type="text" placeholder="Item Code" className="w-20 px-2 py-1 border rounded text-xs" /></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase"><input type="text" placeholder="Item Name" className="w-24 px-2 py-1 border rounded text-xs" /></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase"><input type="text" placeholder="UOM" className="w-16 px-2 py-1 border rounded text-xs" /></th>
                      <th colSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Opening Stock</th>
                      <th colSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Inward</th>
                      <th colSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Outward</th>
                      <th colSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Closing Stock</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Action</th>
                    </tr>
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Qty</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Value</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Qty</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Value</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Qty</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Value</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Qty</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Value</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {operationsStockData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.subCategory}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.itemCode}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.uom}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{item.openingQty}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">₹{item.openingValue}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{item.inwardQty}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">₹{item.inwardValue}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{item.outwardQty}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">₹{item.outwardValue}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{item.closingQty}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">₹{item.closingValue}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedItemForOps(item);
                              setShowItemDetail(true);
                            }}
                            className="text-teal-600 hover:text-teal-800 font-medium text-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Item Detail - GRN & Issue Slip View */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedItemForOps.itemCode} - {selectedItemForOps.itemName}
                </h2>
                <button
                  onClick={() => {
                    setShowItemDetail(false);
                    setSelectedItemForOps(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Item Code</p>
                    <p className="font-semibold text-gray-900">{selectedItemForOps.itemCode}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Item Name</p>
                    <p className="font-semibold text-gray-900">{selectedItemForOps.itemName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Category</p>
                    <p className="font-semibold text-gray-900">{selectedItemForOps.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Sub-Category</p>
                    <p className="font-semibold text-gray-900">{selectedItemForOps.subCategory}</p>
                  </div>
                </div>
              </div>

              {/* GRN & Issue Slip Transactions Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase"><input type="text" placeholder="Date" className="w-20 px-2 py-1 border rounded text-xs" /></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase"><input type="text" placeholder="Particulars" className="w-32 px-2 py-1 border rounded text-xs" /></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase"><input type="text" placeholder="Ref No" className="w-20 px-2 py-1 border rounded text-xs" /></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase"><input type="text" placeholder="Location" className="w-24 px-2 py-1 border rounded text-xs" /></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase"><input type="text" placeholder="UOM" className="w-16 px-2 py-1 border rounded text-xs" /></th>
                      <th colSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Opening Stock</th>
                      <th colSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Inward</th>
                      <th colSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Outward</th>
                      <th colSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Closing Stock</th>
                    </tr>
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th></th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Qty</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Value</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Qty</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Value</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Qty</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Value</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Qty</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-600">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-500">GRN-001</td>
                      <td className="px-4 py-3 text-sm text-gray-500">Purchase from Vendor</td>
                      <td className="px-4 py-3 text-sm text-gray-500">REF-2024-001</td>
                      <td className="px-4 py-3 text-sm text-gray-500">Main Store</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{selectedItemForOps.uom}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">100</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">₹150000</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">50</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">₹75000</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">0</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">₹0</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">150</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-500">₹225000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Issue Slip Form Modal */}
        {showIssueSlipForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-lg shadow-xl w-full h-[90vh] max-w-7xl flex flex-col">
              <div className="bg-white border-b border-gray-200 p-5 flex justify-between items-center shrink-0">
                <h3 className="text-2xl font-bold text-gray-900">Create Issue Slip</h3>
                <button
                  onClick={() => setShowIssueSlipForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto flex-1">
                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-200">
                  {(['job-work', 'inter-unit', 'location-change'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setIssueSlipTab(tab)}
                      className={`px-6 py-3 font-semibold text-base border-b-3 ${issueSlipTab === tab
                        ? 'border-teal-600 text-teal-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                        }`}
                    >
                      {tab === 'job-work' ? 'Job-work' : tab === 'inter-unit' ? 'Inter-unit' : 'Location Change'}
                    </button>
                  ))}
                </div>

                {/* Basic Details */}
                <div className="grid grid-cols-4 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Slip No</label>
                    <input
                      type="text"
                      value={issueSlipNumber}
                      onChange={(e) => setIssueSlipNumber(e.target.value)}
                      placeholder="Auto/Manual"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={issueSlipDate}
                      onChange={(e) => setIssueSlipDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={issueSlipTime}
                      onChange={(e) => setIssueSlipTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option>Draft</option>
                      <option>Posted</option>
                    </select>
                  </div>
                </div>

                {/* Location Details */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Goods Sent From</label>
                    <input
                      type="text"
                      value={goodsFromLocation}
                      onChange={(e) => setGoodsFromLocation(e.target.value)}
                      placeholder="Select location"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Goods Sent To</label>
                    <input
                      type="text"
                      value={goodsToLocation}
                      onChange={(e) => setGoodsToLocation(e.target.value)}
                      placeholder="Select location"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-gray-700">Items</label>
                    <button
                      onClick={handleAddIssueSlipItem}
                      className="text-teal-600 hover:text-teal-800 text-sm font-semibold"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="overflow-x-auto border border-gray-300 rounded text-sm">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Item Code</th>
                          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Item Name</th>
                          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">UOM</th>
                          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Qty</th>
                          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Rate</th>
                          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Value</th>
                          <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {issueSlipItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2"><input type="text" value={item.itemCode} onChange={(e) => handleIssueSlipItemChange(index, 'itemCode', e.target.value)} placeholder="Code" className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                            <td className="px-3 py-2"><input type="text" value={item.itemName} onChange={(e) => handleIssueSlipItemChange(index, 'itemName', e.target.value)} placeholder="Name" className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                            <td className="px-3 py-2"><input type="text" value={item.uom} onChange={(e) => handleIssueSlipItemChange(index, 'uom', e.target.value)} placeholder="UOM" className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                            <td className="px-3 py-2"><input type="number" value={item.quantity} onChange={(e) => handleIssueSlipItemChange(index, 'quantity', e.target.value)} placeholder="Qty" className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                            <td className="px-3 py-2"><input type="number" value={item.rate} onChange={(e) => handleIssueSlipItemChange(index, 'rate', e.target.value)} placeholder="Rate" className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                            <td className="px-3 py-2 text-sm font-medium">₹{item.value.toFixed(2)}</td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => handleRemoveIssueSlipItem(index)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 text-right text-sm font-bold text-gray-900">
                    Total Value: ₹{getTotalValue().toFixed(2)}
                  </div>
                </div>

                {/* Posting Note */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Posting Note</label>
                  <textarea
                    value={postingNote}
                    onChange={(e) => setPostingNote(e.target.value)}
                    placeholder="Enter posting note..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end border-t border-gray-200 pt-5">
                  <button
                    onClick={() => setShowDeliveryChallan(true)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-semibold text-sm"
                  >
                    Delivery Challan
                  </button>
                  <button
                    onClick={() => setShowEWayBill(true)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-semibold text-sm"
                  >
                    E-Way Bill
                  </button>
                  <button
                    onClick={() => setShowIssueSlipForm(false)}
                    className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 font-semibold text-sm"
                  >
                    Post & Close
                  </button>
                  <button
                    onClick={() => setShowIssueSlipForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-semibold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Challan Modal */}
        {showDeliveryChallan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Delivery Challan Details</h3>
                <button
                  onClick={() => setShowDeliveryChallan(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dispatch Address</label>
                    <input type="text" placeholder="Address" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dispatch Date</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end border-t border-gray-200 pt-4">
                  <button
                    onClick={() => setShowDeliveryChallan(false)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 font-medium text-sm"
                  >
                    Save & Close
                  </button>
                  <button
                    onClick={() => setShowDeliveryChallan(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* E-Way Bill Modal */}
        {showEWayBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">E-Way Bill Details</h3>
                <button
                  onClick={() => setShowEWayBill(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number</label>
                    <input type="text" placeholder="Vehicle No" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Till</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end border-t border-gray-200 pt-4">
                  <button
                    onClick={() => setShowEWayBill(false)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 font-medium text-sm"
                  >
                    Save & Close
                  </button>
                  <button
                    onClick={() => setShowEWayBill(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderItemCode = () => {
    // Mock data for demonstration
    const mockItems = [
      { id: 1, itemCode: 'IT001', itemName: 'Product A', category: 'Electronics', hsnCode: '8471', gstRate: '18%', uom: 'Nos', rate: '1500' },
      { id: 2, itemCode: 'IT002', itemName: 'Product B', category: 'Furniture', hsnCode: '9403', gstRate: '18%', uom: 'Nos', rate: '5000' },
      { id: 3, itemCode: 'IT003', itemName: 'Product C', category: 'Textiles', hsnCode: '6204', gstRate: '5%', uom: 'Mtr', rate: '250' },
    ];

    return (
      <div className="space-y-6">
        {/* Header with Buttons */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Inventory Items</h3>
            <div className="flex gap-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                📥 Upload Excel
              </button>
              <button
                onClick={() => {
                  setSelectedItemDetail({ isNew: true });
                  setEditFormData({ isNew: true, itemCode: '', itemName: '', description: '', category: '', uom: '', rate: '', hsnCode: '', gstRate: '' });
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
              >
                ➕ Add Item
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search items..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HSN Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.itemCode}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.itemName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.hsnCode}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.gstRate}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.uom}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">₹{item.rate}</td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <button
                        onClick={() => handleEditItemOpen(item)}
                        className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Item Detail View */}
        {selectedItemDetail && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">{selectedItemDetail.isNew ? 'Create New Item' : selectedItemDetail.isEditMode ? 'Edit Item' : 'View Item'}</h3>
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4">
              {/* Item Code & Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Code</label>
                  <input
                    type="text"
                    value={editFormData?.itemCode || ''}
                    onChange={(e) => handleFormChange('itemCode', e.target.value)}
                    disabled={!editFormData?.isNew && !editFormData?.isEditMode}
                    placeholder="Enter item code"
                    className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                  <input
                    type="text"
                    value={editFormData?.itemName || ''}
                    onChange={(e) => handleFormChange('itemName', e.target.value)}
                    disabled={!editFormData?.isNew && !editFormData?.isEditMode}
                    placeholder="Enter item name"
                    className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Description</label>
                <input
                  type="text"
                  value={editFormData?.description || ''}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  disabled={!editFormData?.isNew && !editFormData?.isEditMode}
                  placeholder="Enter item description"
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Category & Subgroup */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <CategoryHierarchicalDropdown
                    onlyRoots={true}
                    onSelect={async (selection) => {
                      handleFormChange('category', selection.id);
                      handleFormChange('categoryPath', selection.fullPath);
                      setSelectedCategoryId(selection.id);

                      // Fetch subgroups for the selected category
                      try {
                        // Fetch all categories and filter for subgroups
                        const response = await httpClient.get('/api/inventory/master-categories/');
                        const allCategories = Array.isArray(response) ? response : [];

                        console.log('All categories:', allCategories);
                        console.log('Selected category ID:', selection.id);
                        console.log('Selected category fullPath:', selection.fullPath);

                        // Find the selected category record
                        const selectedCat = allCategories.find((cat: any) => cat.id === selection.id);
                        console.log('Selected category record:', selectedCat);

                        // Filter to get subgroups based on the hierarchy
                        let subgroups: any[] = [];

                        if (selectedCat) {
                          if (selectedCat.subgroup) {
                            // Level 2: Subgroup selected -> No children
                            subgroups = [];
                          } else if (selectedCat.group) {
                            // Level 1: Group selected -> Show its contents (Subgroups)
                            subgroups = allCategories.filter((cat: any) =>
                              cat.category === selectedCat.category &&
                              cat.group === selectedCat.group &&
                              cat.subgroup
                            );
                          } else {
                            // Level 0: Category selected -> Show Groups (will be deduped) or flat Subgroups
                            subgroups = allCategories.filter((cat: any) =>
                              cat.category === selectedCat.category &&
                              cat.id !== selectedCat.id &&
                              (cat.group || cat.subgroup)
                            );
                          }
                        }



                        console.log('Final filtered subgroups:', subgroups);
                        console.log('Subgroup count:', subgroups.length);
                        setAvailableSubgroups(subgroups);
                      } catch (error) {
                        console.error('Error fetching subgroups:', error);
                        setAvailableSubgroups([]);
                      }
                    }}
                    value={editFormData?.categoryPath || editFormData?.category || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
                  <select
                    value={editFormData?.subgroup || ''}
                    onChange={(e) => handleFormChange('subgroup', e.target.value)}
                    disabled={!selectedCategoryId || (!editFormData?.isNew && !editFormData?.isEditMode)}
                    className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Group</option>
                    {availableSubgroups.map((subgroup) => (
                      <option key={subgroup.id} value={subgroup.id}>
                        {subgroup.group && subgroup.subgroup
                          ? `${subgroup.group} > ${subgroup.subgroup}`
                          : (subgroup.subgroup || subgroup.group)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vendor-Specific Item Code */}
              <div className="border-t pt-4">
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 rounded"
                    checked={isVendorSpecificItemCode}
                    onChange={(e) => setIsVendorSpecificItemCode(e.target.checked)}
                    disabled={!selectedItemDetail.isNew && !selectedItemDetail.isEditMode}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Create Vendor-specific item code</span>
                </label>
                {isVendorSpecificItemCode && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name</label>
                      <input
                        type="text"
                        placeholder="Enter vendor name"
                        readOnly={!selectedItemDetail.isNew && !selectedItemDetail.isEditMode}
                        className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Suffix</label>
                      <input
                        type="text"
                        placeholder="Enter suffix"
                        readOnly={!selectedItemDetail.isNew && !selectedItemDetail.isEditMode}
                        className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Unit Configuration */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit (UOM)</label>
                    <select
                      value={editFormData?.uom || ''}
                      onChange={(e) => handleFormChange('uom', e.target.value)}
                      disabled={!editFormData?.isNew && !editFormData?.isEditMode}
                      className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select UOM</option>
                      {unitOptions.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Unit</label>
                    <select
                      placeholder="Enter alternate unit"
                      disabled={!editFormData?.isNew && !editFormData?.isEditMode}
                      className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select alternate unit</option>
                      {unitOptions.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conversion</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="1 UOM"
                      disabled={!editFormData?.isNew && !editFormData?.isEditMode}
                      className="flex-1 px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <span className="text-xl font-bold text-gray-700">=</span>
                    <input
                      type="text"
                      placeholder="? Alternate Unit"
                      disabled={!editFormData?.isNew && !editFormData?.isEditMode}
                      className="flex-1 px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Rate */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={editFormData?.rate || ''}
                    onChange={(e) => handleFormChange('rate', e.target.value)}
                    disabled={!editFormData?.isNew && !editFormData?.isEditMode}
                    placeholder="Enter rate"
                    className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <select className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={!editFormData?.isNew && !editFormData?.isEditMode}>
                    <option>Select unit</option>
                  </select>
                </div>
              </div>

              {/* HSN & GST */}
              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code</label>
                  <input
                    type="text"
                    value={editFormData?.hsnCode || ''}
                    onChange={(e) => handleFormChange('hsnCode', e.target.value)}
                    disabled={!editFormData?.isNew && !editFormData?.isEditMode}
                    placeholder="Enter HSN code"
                    className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate</label>
                  <input
                    type="text"
                    value={editFormData?.gstRate || ''}
                    onChange={(e) => handleFormChange('gstRate', e.target.value)}
                    disabled={!editFormData?.isNew && !editFormData?.isEditMode}
                    placeholder="Enter GST rate"
                    className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Reorder & Saleable */}
              <div className="border-t pt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level</label>
                  <input
                    type="text"
                    placeholder="For Raw Material, Stock-in-trade, Stores & Spares, Packing Material"
                    className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-teal-600 rounded" />
                  <span className="ml-2 text-sm font-medium text-gray-700">Saleable Item → for Work-in-Progress</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="border-t pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveItem}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
                >
                  Save & Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItemDetail(null);
                    setEditFormData(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  };

  const handleGRNSeriesSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grnSeriesName || !grnType || !grnYear || !grnRequiredDigits) {
      alert('Please fill all required fields');
      return;
    }

    try {
      // Generate preview
      const paddedNumber = '0001'.padStart(parseInt(grnRequiredDigits), '0');
      const preview = grnPrefix + paddedNumber + grnSuffix;

      if (isEditModeGRNSeries && selectedGrnSeries) {
        // Update existing series
        setGrnSeriesList(grnSeriesList.map(s =>
          s.id === selectedGrnSeries.id
            ? {
              ...s,
              name: grnSeriesName,
              grnType: grnType,
              prefix: grnPrefix,
              suffix: grnSuffix,
              year: grnYear,
              requiredDigits: grnRequiredDigits,
              preview: preview
            }
            : s
        ));
        alert('GRN Series updated successfully!');
      } else {
        // Create new series
        const newSeries = {
          id: Date.now(),
          name: grnSeriesName,
          grnType: grnType,
          prefix: grnPrefix,
          suffix: grnSuffix,
          year: grnYear,
          requiredDigits: grnRequiredDigits,
          preview: preview
        };

        setGrnSeriesList([...grnSeriesList, newSeries]);
        alert('GRN Series created successfully!');
      }

      // Reset form
      setGrnSeriesName('');
      setGrnType('');
      setGrnPrefix('');
      setGrnSuffix('');
      setGrnYear('');
      setGrnRequiredDigits('');
      setGrnPreview('');
      setIsEditModeGRNSeries(false);
      setSelectedGrnSeries(null);
    } catch (error) {
      console.error('Error saving GRN Series:', error);
      alert('Error saving GRN Series');
    }
  };

  const renderGRN = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Create/Edit GRN Series Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">{isEditModeGRNSeries ? 'Edit GRN Series' : 'Create GRN Series'}</h3>
          <form onSubmit={handleGRNSeriesSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GRN Series Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={grnSeriesName}
                onChange={(e) => setGrnSeriesName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter GRN Series name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GRN Type <span className="text-red-500">*</span></label>
              <select
                value={grnType}
                onChange={(e) => setGrnType(e.target.value)}
                className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select GRN Type</option>
                <option value="job_work">Job Work</option>
                <option value="purchase">Purchase</option>
                <option value="import">Import</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prefix</label>
                <input
                  type="text"
                  value={grnPrefix}
                  onChange={(e) => setGrnPrefix(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., GRN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Suffix</label>
                <input
                  type="text"
                  value={grnSuffix}
                  onChange={(e) => setGrnSuffix(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., /2024"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={grnYear}
                  onChange={(e) => setGrnYear(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 2024"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Digits <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={grnRequiredDigits}
                  onChange={(e) => setGrnRequiredDigits(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 4"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <input
                type="text"
                value={grnPrefix + (grnRequiredDigits ? '0001'.slice(0, Math.max(0, parseInt(grnRequiredDigits) - 1)) : '') + grnSuffix}
                onChange={(e) => setGrnPreview(e.target.value)}
                className="w-full px-4 py-2 border-2 border-teal-400 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Preview will auto-generate"
                readOnly
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {isEditModeGRNSeries ? 'Update Series' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setGrnSeriesName('');
                  setGrnType('');
                  setGrnPrefix('');
                  setGrnSuffix('');
                  setGrnYear('');
                  setGrnRequiredDigits('');
                  setGrnPreview('');
                  setIsEditModeGRNSeries(false);
                  setSelectedGrnSeries(null);
                }}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Close
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Existing GRN Series */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">GRN Series Preview</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loadingGrnSeries ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : grnSeriesList.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No GRN Series created</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GRN Series Name</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grnSeriesList.map((series, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{series.grnType || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{series.preview || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{series.name || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setGrnSeriesName(series.name);
                              setGrnType(series.grnType);
                              setGrnPrefix(series.prefix);
                              setGrnSuffix(series.suffix);
                              setGrnYear(series.year);
                              setGrnRequiredDigits(series.requiredDigits);
                              setIsEditModeGRNSeries(true);
                              setSelectedGrnSeries(series);
                            }}
                            className="text-white bg-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-700"
                            title="Edit"
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this GRN Series?')) {
                                setGrnSeriesList(grnSeriesList.filter(s => s.id !== series.id));
                                setSelectedGrnSeries(null);
                                setGrnSeriesName('');
                                setGrnType('');
                                setGrnPrefix('');
                                setGrnSuffix('');
                                setGrnYear('');
                                setGrnRequiredDigits('');
                                setIsEditModeGRNSeries(false);
                                alert('GRN Series deleted successfully!');
                              }
                            }}
                            className="text-white bg-red-600 px-3 py-1 rounded text-xs hover:bg-red-700"
                            title="Delete"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleIssueSlipSeriesSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueSlipSeriesName || !issueSlipType || !issueSlipYear || !issueSlipRequiredDigits) {
      alert('Please fill all required fields');
      return;
    }

    try {
      // Generate preview
      const paddedNumber = '0001'.padStart(parseInt(issueSlipRequiredDigits), '0');
      const preview = issueSlipPrefix + paddedNumber + issueSlipSuffix;

      if (isEditModeIssueSlipSeries && selectedIssueSlipSeries) {
        // Update existing series
        setIssueSlipSeriesList(issueSlipSeriesList.map(s =>
          s.id === selectedIssueSlipSeries.id
            ? {
              ...s,
              name: issueSlipSeriesName,
              issueSlipType: issueSlipType,
              prefix: issueSlipPrefix,
              suffix: issueSlipSuffix,
              year: issueSlipYear,
              requiredDigits: issueSlipRequiredDigits,
              preview: preview
            }
            : s
        ));
        alert('Issue Slip Series updated successfully!');
      } else {
        // Create new series
        const newSeries = {
          id: Date.now(),
          name: issueSlipSeriesName,
          issueSlipType: issueSlipType,
          prefix: issueSlipPrefix,
          suffix: issueSlipSuffix,
          year: issueSlipYear,
          requiredDigits: issueSlipRequiredDigits,
          preview: preview
        };

        setIssueSlipSeriesList([...issueSlipSeriesList, newSeries]);
        alert('Issue Slip Series created successfully!');
      }

      // Reset form
      setIssueSlipSeriesName('');
      setIssueSlipType('');
      setIssueSlipPrefix('');
      setIssueSlipSuffix('');
      setIssueSlipYear('');
      setIssueSlipRequiredDigits('');
      setIssueSlipPreview('');
      setIsEditModeIssueSlipSeries(false);
      setSelectedIssueSlipSeries(null);
    } catch (error) {
      console.error('Error saving Issue Slip Series:', error);
      alert('Error saving Issue Slip Series');
    }
  };

  const renderIssueSlip = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Create/Edit Issue Slip Series Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">{isEditModeIssueSlipSeries ? 'Edit Issue Slip Series' : 'Create Issue Slip Series'}</h3>
          <form onSubmit={handleIssueSlipSeriesSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Slip Series Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={issueSlipSeriesName}
                onChange={(e) => setIssueSlipSeriesName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter Issue Slip Series name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Slip Type <span className="text-red-500">*</span></label>
              <select
                value={issueSlipType}
                onChange={(e) => setIssueSlipType(e.target.value)}
                className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select Issue Slip Type</option>
                <option value="internal_transfer">Internal Transfer</option>
                <option value="customer_return">Customer Return</option>
                <option value="damage">Damage/Loss</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prefix</label>
                <input
                  type="text"
                  value={issueSlipPrefix}
                  onChange={(e) => setIssueSlipPrefix(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., ISP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Suffix</label>
                <input
                  type="text"
                  value={issueSlipSuffix}
                  onChange={(e) => setIssueSlipSuffix(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., /2024"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={issueSlipYear}
                  onChange={(e) => setIssueSlipYear(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 2024"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Digits <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={issueSlipRequiredDigits}
                  onChange={(e) => setIssueSlipRequiredDigits(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 4"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <input
                type="text"
                value={issueSlipPrefix + (issueSlipRequiredDigits ? '0001'.slice(0, Math.max(0, parseInt(issueSlipRequiredDigits) - 1)) : '') + issueSlipSuffix}
                onChange={(e) => setIssueSlipPreview(e.target.value)}
                className="w-full px-4 py-2 border-2 border-teal-400 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Preview will auto-generate"
                readOnly
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {isEditModeIssueSlipSeries ? 'Update Series' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIssueSlipSeriesName('');
                  setIssueSlipType('');
                  setIssueSlipPrefix('');
                  setIssueSlipSuffix('');
                  setIssueSlipYear('');
                  setIssueSlipRequiredDigits('');
                  setIssueSlipPreview('');
                  setIsEditModeIssueSlipSeries(false);
                  setSelectedIssueSlipSeries(null);
                }}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Close
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Existing Issue Slip Series */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Issue Slip Series Preview</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loadingIssueSlipSeries ? (
              <p className="text-gray-500 text-center py-8">Loading...</p>
            ) : issueSlipSeriesList.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No Issue Slip Series created</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Slip Series Name</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {issueSlipSeriesList.map((series, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{series.issueSlipType || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{series.preview || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{series.name || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setIssueSlipSeriesName(series.name);
                              setIssueSlipType(series.issueSlipType);
                              setIssueSlipPrefix(series.prefix);
                              setIssueSlipSuffix(series.suffix);
                              setIssueSlipYear(series.year);
                              setIssueSlipRequiredDigits(series.requiredDigits);
                              setIsEditModeIssueSlipSeries(true);
                              setSelectedIssueSlipSeries(series);
                            }}
                            className="text-white bg-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-700"
                            title="Edit"
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this Issue Slip Series?')) {
                                setIssueSlipSeriesList(issueSlipSeriesList.filter(s => s.id !== series.id));
                                setSelectedIssueSlipSeries(null);
                                setIssueSlipSeriesName('');
                                setIssueSlipType('');
                                setIssueSlipPrefix('');
                                setIssueSlipSuffix('');
                                setIssueSlipYear('');
                                setIssueSlipRequiredDigits('');
                                setIsEditModeIssueSlipSeries(false);
                                alert('Issue Slip Series deleted successfully!');
                              }
                            }}
                            className="text-white bg-red-600 px-3 py-1 rounded text-xs hover:bg-red-700"
                            title="Delete"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderGRNIssueSlip = () => {
    return (
      <div>
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200" aria-label="GRN & Issue Slip Sub-tabs">
            {grnIssueSlipSubTabs.map((subTab) => (
              <button key={subTab} onClick={() => setActiveGRNIssueSlipSubTab(subTab)} className={`pb-3 px-6 text-sm font-medium transition-all relative ${activeGRNIssueSlipSubTab === subTab ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}>
                {subTab}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-0">
          {activeGRNIssueSlipSubTab === 'GRN' && renderGRN()}
          {activeGRNIssueSlipSubTab === 'Issue Slip' && renderIssueSlip()}
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
        {activeMasterSubTab === 'Inventory Items' && renderItemCode()}
        {activeMasterSubTab === 'GRN & Issue Slip' && renderGRNIssueSlip()}
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
      {activeTab === 'Operations' && renderOperations()}
      {activeTab === 'Reports' && <div className="p-8 text-center text-gray-500">Reports Module</div>}
    </div>
  );
};

export default InventoryPage;
