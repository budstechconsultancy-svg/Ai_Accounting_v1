/**
 * ============================================================================
 * INVENTORY PAGE (Inventory.tsx)
 * ============================================================================
 * Main inventory management page with Category and Location management
 */

import React, { useState, useEffect } from 'react';
import { httpClient } from '../../services/httpClient';
import { CategoryHierarchicalDropdown } from '../../components/CategoryHierarchicalDropdown';

// Props interface
interface InventoryPageProps {
  userPermissions?: {
    canCreate?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canView?: boolean;
  };
}

// Tab types
type InventoryTab = 'Master' | 'Operations' | 'Reports';
type MasterSubTab = 'Category' | 'Location' | 'Item Code';

// Category interface
interface Category {
  id: number;
  name: string;
  parent: number | null;
  parent_name: string | null;
  is_system: boolean;
  is_active: boolean;
  description: string;
  display_order: number;
  full_path: string;
  level: number;
  subcategories_count: number;
}

// Location interface
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
  country: string;
  pincode: string;
  gstin: string | null;
  is_active: boolean;
  is_default: boolean;
}

/**
 * Inventory Page Component
 */
const InventoryPage: React.FC<InventoryPageProps> = () => {
  const [activeTab, setActiveTab] = useState<InventoryTab>('Master');
  const [activeMasterSubTab, setActiveMasterSubTab] = useState<MasterSubTab>('Category');

  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);
  const [parentCategoryPath, setParentCategoryPath] = useState<string>('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [isEditModeCategory, setIsEditModeCategory] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Location state
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

  // Define main tabs
  const tabs: { id: InventoryTab; label: string }[] = [
    { id: 'Master', label: 'Master' },
    { id: 'Operations', label: 'Operations' },
    { id: 'Reports', label: 'Reports' }
  ];

  // Define Master sub-tabs
  const masterSubTabs: { id: MasterSubTab; label: string }[] = [
    { id: 'Category', label: 'Category' },
    { id: 'Location', label: 'Location' },
    { id: 'Item Code', label: 'Item Code' }
  ];

  // Location types
  const locationTypes = [
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'store', label: 'Store' },
    { value: 'godown', label: 'Godown' },
    { value: 'factory', label: 'Factory' },
    { value: 'office', label: 'Office' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await httpClient.get<Category[]>('/api/inventory/categories/');
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch locations
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

  useEffect(() => {
    if (activeMasterSubTab === 'Category') {
      fetchCategories();
    } else if (activeMasterSubTab === 'Location') {
      fetchLocations();
    }
  }, [activeMasterSubTab]);

  // Handle parent category selection
  const handleParentSelect = (selection: { id: number; name: string; fullPath: string }) => {
    setParentCategoryId(selection.id);
    setParentCategoryPath(selection.fullPath);
  };

  // Handle category form submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        name: categoryName,
        parent: parentCategoryId,
        description: categoryDescription
      };

      if (isEditModeCategory && selectedCategory) {
        await httpClient.put(`/api/inventory/categories/${selectedCategory.id}/`, data);
      } else {
        await httpClient.post('/api/inventory/categories/', data);
      }

      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category. Please try again.');
    }
  };

  // Handle location form submit
  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determine the final location type value
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

  // Handle edit category
  const handleEditCategory = () => {
    if (!selectedCategory) return;

    setCategoryName(selectedCategory.name);
    setParentCategoryId(selectedCategory.parent);
    setParentCategoryPath(selectedCategory.parent_name || '');
    setCategoryDescription(selectedCategory.description || '');
    setIsEditModeCategory(true);
  };

  // Handle edit location
  const handleEditLocation = () => {
    if (!selectedLocation) return;

    setLocationName(selectedLocation.name);

    // Check if the location type is one of the predefined types
    const predefinedType = locationTypes.find(t => t.value === selectedLocation.location_type);
    if (predefinedType) {
      setLocationType(selectedLocation.location_type);
      setIsCustomLocationType(false);
      setCustomLocationTypeValue('');
    } else {
      // It's a custom type
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

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    if (selectedCategory.is_system) {
      alert('System categories cannot be deleted');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${selectedCategory.name}"?`)) {
      return;
    }

    try {
      await httpClient.delete(`/api/inventory/categories/${selectedCategory.id}/`);
      resetCategoryForm();
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.error || 'Error deleting category');
    }
  };

  // Handle delete location
  const handleDeleteLocation = async () => {
    if (!selectedLocation) return;

    if (!confirm(`Are you sure you want to delete "${selectedLocation.name}"?`)) {
      return;
    }

    try {
      await httpClient.delete(`/api/inventory/locations/${selectedLocation.id}/`);
      resetLocationForm();
      fetchLocations();
    } catch (error: any) {
      console.error('Error deleting location:', error);
      alert(error.response?.data?.error || 'Error deleting location');
    }
  };

  // Reset category form
  const resetCategoryForm = () => {
    setCategoryName('');
    setParentCategoryId(null);
    setParentCategoryPath('');
    setCategoryDescription('');
    setIsEditModeCategory(false);
    setSelectedCategory(null);
  };

  // Reset location form
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

  // Filter categories by search query
  const filteredCategories = categories.filter(cat =>
    cat.full_path.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  // Filter locations by search query
  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
    loc.city.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );

  // Render Category sub-tab content
  const renderCategory = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Create/Edit Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            {isEditModeCategory ? 'Edit Category' : 'Create Category'}
          </h3>

          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter category name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category (Optional)
              </label>
              <CategoryHierarchicalDropdown
                onSelect={handleParentSelect}
                value={parentCategoryPath}
                excludeId={isEditModeCategory ? selectedCategory?.id : undefined}
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to create a root category, or select a parent to create a subcategory
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
                placeholder="Enter category description"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {isEditModeCategory ? 'Update Category' : 'Create Category'}
              </button>
              {isEditModeCategory && (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column - Categories List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Existing Categories</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {categorySearchQuery && (
                <button
                  onClick={() => setCategorySearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loadingCategories ? (
              <p className="text-gray-500 text-center py-8">Loading categories...</p>
            ) : filteredCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No categories found</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th scope="col" className="w-12 px-6 py-3"></th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Path</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => {
                    const isSelected = selectedCategory?.id === category.id;
                    return (
                      <tr
                        key={category.id}
                        className={`transition-colors ${isSelected ? 'bg-teal-50 hover:bg-teal-100' : 'hover:bg-gray-50'
                          }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="radio"
                            name="selectedCategory"
                            checked={isSelected}
                            onChange={() => setSelectedCategory(category)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category.full_path}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.is_system ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              System
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Custom
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {isSelected ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={handleEditCategory}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md text-white bg-teal-600 hover:bg-teal-700 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              {!category.is_system && (
                                <button
                                  onClick={handleDeleteCategory}
                                  className="inline-flex items-center justify-center w-10 h-10 rounded-md text-white bg-red-600 hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                  title="Delete"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Select to edit</span>
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

  // Render Location sub-tab content
  const renderLocation = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Create/Edit Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            {isEditModeLocation ? 'Edit Location' : 'Create Location'}
          </h3>

          <form onSubmit={handleLocationSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter location name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Type <span className="text-red-500">*</span>
              </label>
              <select
                value={isCustomLocationType ? 'custom' : locationType}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'custom') {
                    setIsCustomLocationType(true);
                    setLocationType('custom');
                  } else {
                    setIsCustomLocationType(false);
                    setLocationType(value);
                    setCustomLocationTypeValue('');
                  }
                }}
                className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required={!isCustomLocationType}
              >
                <option value="">Select location type</option>
                {locationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
                <option value="custom">+ Create New Type</option>
              </select>

              {isCustomLocationType && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customLocationTypeValue}
                    onChange={(e) => setCustomLocationTypeValue(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter custom location type"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter a custom location type name</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={locAddressLine1}
                onChange={(e) => setLocAddressLine1(e.target.value)}
                className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Building/Street/Area"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={locAddressLine2}
                  onChange={(e) => setLocAddressLine2(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Landmark (Optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 3
                </label>
                <input
                  type="text"
                  value={locAddressLine3}
                  onChange={(e) => setLocAddressLine3(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Additional Info (Optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={locCity}
                  onChange={(e) => setLocCity(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={locState}
                  onChange={(e) => setLocState(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="State"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={locPincode}
                onChange={(e) => setLocPincode(e.target.value)}
                className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Pincode/Zip Code"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GSTIN (Optional)
              </label>
              <input
                type="text"
                value={locationGstin}
                onChange={(e) => setLocationGstin(e.target.value)}
                className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter GSTIN (15 characters)"
                maxLength={15}
              />
              <p className="mt-1 text-xs text-gray-500">Optional - 15 character GSTIN</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {isEditModeLocation ? 'Update Location' : 'Create Location'}
              </button>
              {isEditModeLocation && (
                <button
                  type="button"
                  onClick={resetLocationForm}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column - Locations List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Existing Locations</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search locations..."
                value={locationSearchQuery}
                onChange={(e) => setLocationSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {locationSearchQuery && (
                <button
                  onClick={() => setLocationSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loadingLocations ? (
              <p className="text-gray-500 text-center py-8">Loading locations...</p>
            ) : filteredLocations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No locations found</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th scope="col" className="w-12 px-6 py-3"></th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location Type</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLocations.map((location) => {
                    const isSelected = selectedLocation?.id === location.id;
                    return (
                      <tr
                        key={location.id}
                        className={`transition-colors ${isSelected ? 'bg-teal-50 hover:bg-teal-100' : 'hover:bg-gray-50'
                          }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="radio"
                            name="selectedLocation"
                            checked={isSelected}
                            onChange={() => setSelectedLocation(location)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer"
                          onClick={() => setSelectedLocation(location)}
                        >
                          {location.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {location.location_type_display}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {isSelected ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={handleEditLocation}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md text-white bg-teal-600 hover:bg-teal-700 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={handleDeleteLocation}
                                className="inline-flex items-center justify-center w-10 h-10 rounded-md text-white bg-red-600 hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Select to edit</span>
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

  // Item interface
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
    conversion_factor: string | null; // Decimal as string from API
    gst_rate: string; // Decimal as string
    rate: string; // Decimal as string
    location: number | null;
    location_name: string | null;
    is_active: boolean;
  }

  // Item state
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Item Form State
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

  // Unit Options
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

  // Fetch Items
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

  useEffect(() => {
    if (activeMasterSubTab === 'Category') {
      fetchCategories();
    } else if (activeMasterSubTab === 'Location') {
      fetchLocations();
    } else if (activeMasterSubTab === 'Item Code') {
      fetchItems();
      // Also fetch Categories and Locations for dropdowns if not already loaded
      fetchCategories();
      fetchLocations();
    }
  }, [activeMasterSubTab]);

  // Handle Item Form Submit
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

  // Populate form for edit
  const handleEditItem = () => {
    if (!selectedItem) return;

    setItemCode(selectedItem.item_code);
    setItemName(selectedItem.name);
    setItemCategory(selectedItem.category);
    setItemCategoryPath(selectedItem.category_name); // Or find full path if available
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

  // Delete Item
  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    if (!confirm(`Are you sure you want to delete "${selectedItem.name}"?`)) {
      return;
    }

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

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
    item.item_code.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
    (item.hsn_code && item.hsn_code.includes(itemSearchQuery))
  );

  // Render Item Code Tab
  const renderItemCode = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Create/Edit Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            {isEditModeItem ? 'Edit Item' : 'Create Item'}
          </h3>

          <form onSubmit={handleItemSubmit} className="space-y-4">

            {/* Item Code & Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Code"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Name"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
              <CategoryHierarchicalDropdown
                onSelect={(selection) => {
                  setItemCategory(selection.id);
                  setItemCategoryPath(selection.fullPath);
                }}
                value={itemCategoryPath}
              />
            </div>

            {/* HSN & Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code</label>
                <input
                  type="text"
                  value={itemHsn}
                  onChange={(e) => setItemHsn(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="HSN Code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate / Unit</label>
                <input
                  type="number"
                  step="0.01"
                  value={itemRate}
                  onChange={(e) => setItemRate(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Description (Auto from HSN logic if connected)"
              />
            </div>

            {/* Units */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit <span className="text-red-500">*</span></label>
                <select
                  value={itemUnit}
                  onChange={(e) => setItemUnit(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {unitOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  id="hasMultipleUnits"
                  checked={itemHasMultipleUnits}
                  onChange={(e) => setItemHasMultipleUnits(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="hasMultipleUnits" className="ml-2 block text-sm text-gray-900">
                  Show multiple units
                </label>
              </div>
            </div>

            {/* Alternative Unit Logic */}
            {itemHasMultipleUnits && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">Conversion Logic</p>
                <div className="flex items-center gap-2 text-sm">
                  <span>1</span>
                  <select
                    value={itemAltUnit}
                    onChange={(e) => setItemAltUnit(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  >
                    <option value="">Select Alt Unit</option>
                    {unitOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <span>=</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={itemConversionFactor}
                    onChange={(e) => setItemConversionFactor(e.target.value)}
                    className="w-24 border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    placeholder="Factor"
                  />
                  <span className="font-medium text-gray-700">{unitOptions.find(u => u.value === itemUnit)?.label}</span>
                </div>
              </div>
            )}

            {/* GST Rate & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={itemGstRate}
                  onChange={(e) => setItemGstRate(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="18.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={itemLocation || ''}
                  onChange={(e) => setItemLocation(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Location</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {isEditModeItem ? 'Update Item' : 'Create Item'}
              </button>
              {isEditModeItem && (
                <button
                  type="button"
                  onClick={resetItemForm}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column - Items List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Existing Items</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {itemSearchQuery && (
                <button
                  onClick={() => setItemSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loadingItems ? (
              <p className="text-gray-500 text-center py-8">Loading items...</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items found</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th scope="col" className="w-12 px-6 py-3"></th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code/Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map(item => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <tr key={item.id} className={`transition-colors ${isSelected ? 'bg-teal-50 hover:bg-teal-100' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="radio"
                            name="selectedItem"
                            checked={isSelected}
                            onChange={() => setSelectedItem(item)}
                            className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={() => setSelectedItem(item)}>
                          <div className="text-sm font-medium text-gray-900">{item.item_code}</div>
                          <div className="text-sm text-gray-500">{item.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.hsn_code || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {isSelected ? (
                            <div className="inline-flex items-center gap-2">
                              <button onClick={handleEditItem} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md text-white bg-teal-600 hover:bg-teal-700">
                                Edit
                              </button>
                              <button onClick={handleDeleteItem} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md text-white bg-red-600 hover:bg-red-700">
                                Delete
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Select</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Master tab content with sub-tabs
  const renderMaster = () => (
    <div>
      {/* Master Sub-tabs Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200" aria-label="Master Sub-tabs">
          {masterSubTabs.map((subTab) => (
            <button
              key={subTab.id}
              onClick={() => setActiveMasterSubTab(subTab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeMasterSubTab === subTab.id
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {subTab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Master Sub-tab Content */}
      <div className="mt-6">
        {activeMasterSubTab === 'Category' && renderCategory()}
        {activeMasterSubTab === 'Location' && renderLocation()}
        {activeMasterSubTab === 'Item Code' && renderItemCode()}
      </div>
    </div>
  );

  // Render Operations tab content
  const renderOperations = () => (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Operations</h3>
      <p className="text-gray-600">Manage inventory operations, transfers, and adjustments.</p>
    </div>
  );

  // Render Reports tab content
  const renderReports = () => (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Reports</h3>
      <p className="text-gray-600">View inventory reports, valuation, and analytics.</p>
    </div>
  );

  return (
    <div>
      {/* Page Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Inventory Management</h2>

      {/* Main Tabs Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200" aria-label="Inventory Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'Master') {
                  setActiveMasterSubTab('Category');
                }
              }}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Tab Content */}
      <div className="mt-6">
        {activeTab === 'Master' && renderMaster()}
        {activeTab === 'Operations' && renderOperations()}
        {activeTab === 'Reports' && renderReports()}
      </div>
    </div>
  );
};

export default InventoryPage;
