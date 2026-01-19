# Frontend Integration Guide - Vendor Master PO Settings

## Quick Start

### API Endpoint
```
Base URL: http://localhost:8000/api/vendors/po-settings/
```

### Authentication
All requests require authentication. Include the JWT token in the Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## Frontend Form to API Mapping

### Form Fields (from screenshot)
| Form Field | API Field | Type | Required | Notes |
|------------|-----------|------|----------|-------|
| Name of PO Series | `name` | string | Yes | Max 200 chars |
| Category | `category` | integer | No | Category ID from dropdown |
| Prefix | `prefix` | string | No | Max 50 chars, e.g., "PO/" |
| Suffix | `suffix` | string | No | Max 50 chars, e.g., "/24-25" |
| Digits | `digits` | integer | No | Default: 4, Range: 1-10 |
| Auto Year | `auto_year` | boolean | No | Default: false |

## API Examples

### 1. Create New PO Series (Form Submit)

```javascript
const createPOSeries = async (formData) => {
  try {
    const response = await fetch('http://localhost:8000/api/vendors/po-settings/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        category: formData.categoryId || null,  // Can be null
        prefix: formData.prefix || '',
        suffix: formData.suffix || '',
        digits: parseInt(formData.digits) || 4,
        auto_year: formData.autoYear || false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create PO series');
    }

    const data = await response.json();
    console.log('Created PO Series:', data);
    return data;
  } catch (error) {
    console.error('Error creating PO series:', error);
    throw error;
  }
};
```

### 2. Fetch Existing Series (for table display)

```javascript
const fetchPOSeries = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/vendors/po-settings/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch PO series');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching PO series:', error);
    throw error;
  }
};
```

### 3. Preview PO Number (Sample Preview)

```javascript
const previewPONumber = async (settingId) => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/vendors/po-settings/${settingId}/preview_po_number/`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    const data = await response.json();
    return data.preview;  // e.g., "PO/0001/24-25"
  } catch (error) {
    console.error('Error previewing PO number:', error);
    throw error;
  }
};
```

### 4. Update Existing Series

```javascript
const updatePOSeries = async (id, formData) => {
  try {
    const response = await fetch(`http://localhost:8000/api/vendors/po-settings/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        prefix: formData.prefix,
        suffix: formData.suffix,
        digits: parseInt(formData.digits),
        auto_year: formData.autoYear
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update PO series');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating PO series:', error);
    throw error;
  }
};
```

### 5. Delete Series

```javascript
const deletePOSeries = async (id) => {
  try {
    const response = await fetch(`http://localhost:8000/api/vendors/po-settings/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete PO series');
    }

    return true;
  } catch (error) {
    console.error('Error deleting PO series:', error);
    throw error;
  }
};
```

## Response Format

### Success Response (Create/Update)
```json
{
  "id": 1,
  "tenant_id": "tenant-123",
  "name": "Standard PO",
  "category": 5,
  "category_name": "Electronics",
  "category_full_path": "Inventory > Electronics",
  "prefix": "PO/",
  "suffix": "/24-25",
  "digits": 4,
  "auto_year": false,
  "current_number": 1,
  "preview_po_number": "PO/0001/24-25",
  "is_active": true,
  "created_at": "2026-01-17T12:00:00Z",
  "updated_at": "2026-01-17T12:00:00Z"
}
```

### Error Response
```json
{
  "error": "PO setting with name 'Standard PO' already exists"
}
```

## Sample Preview Display

The `preview_po_number` field shows how the PO number will look:

```javascript
// Example: Display in the "SAMPLE PREVIEW" section
const displayPreview = (poSetting) => {
  // If auto_year is true, the year will be automatically appended
  const preview = poSetting.preview_po_number;
  
  // Display: /2024/0001
  document.getElementById('sample-preview').textContent = preview;
};
```

## Form Validation

### Client-side Validation
```javascript
const validatePOForm = (formData) => {
  const errors = {};

  // Name is required
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Name is required';
  }

  // Digits must be between 1 and 10
  if (formData.digits && (formData.digits < 1 || formData.digits > 10)) {
    errors.digits = 'Digits must be between 1 and 10';
  }

  // Prefix max 50 chars
  if (formData.prefix && formData.prefix.length > 50) {
    errors.prefix = 'Prefix cannot exceed 50 characters';
  }

  // Suffix max 50 chars
  if (formData.suffix && formData.suffix.length > 50) {
    errors.suffix = 'Suffix cannot exceed 50 characters';
  }

  return Object.keys(errors).length > 0 ? errors : null;
};
```

## Integration with Existing Table

### Display in "Existing Series" Table

```javascript
const populateExistingSeriesTable = async () => {
  const series = await fetchPOSeries();
  
  const tableBody = document.getElementById('existing-series-tbody');
  tableBody.innerHTML = '';

  series.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.category_name || 'N/A'}</td>
      <td>${item.preview_po_number}</td>
      <td>
        <button onclick="editSeries(${item.id})">Edit</button>
        <button onclick="deleteSeries(${item.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
};
```

## Error Handling

```javascript
const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 400:
        alert('Invalid data: ' + error.response.data.error);
        break;
      case 401:
        alert('Please login again');
        // Redirect to login
        break;
      case 404:
        alert('PO series not found');
        break;
      default:
        alert('An error occurred');
    }
  } else {
    // Network error
    alert('Network error. Please check your connection.');
  }
};
```

## Complete Form Submit Handler

```javascript
const handleFormSubmit = async (event) => {
  event.preventDefault();

  const formData = {
    name: document.getElementById('po-name').value,
    categoryId: document.getElementById('category-select').value || null,
    prefix: document.getElementById('prefix').value,
    suffix: document.getElementById('suffix').value,
    digits: document.getElementById('digits').value,
    autoYear: document.getElementById('auto-year').checked
  };

  // Validate
  const errors = validatePOForm(formData);
  if (errors) {
    displayErrors(errors);
    return;
  }

  try {
    const result = await createPOSeries(formData);
    
    // Success
    alert('PO Series created successfully!');
    
    // Clear form
    event.target.reset();
    
    // Refresh table
    await populateExistingSeriesTable();
    
  } catch (error) {
    handleAPIError(error);
  }
};
```

## Testing the API

### Using Browser Console
```javascript
// Test creating a PO series
fetch('http://localhost:8000/api/vendors/po-settings/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Test PO',
    prefix: 'PO/',
    suffix: '/25',
    digits: 4,
    auto_year: false
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## Notes

1. **Tenant Isolation**: The API automatically filters data by the logged-in user's tenant. You don't need to send tenant_id.

2. **Category Dropdown**: Fetch categories from `/api/inventory/master-categories/` to populate the category dropdown.

3. **Auto Year**: When checked, the suffix will automatically include the current year (last 2 digits).

4. **Preview**: The `preview_po_number` field in the response shows exactly how the PO number will look.

5. **Soft Delete**: Deleted series are not removed from the database, just marked as inactive.

6. **Duplicate Names**: The API prevents duplicate PO series names within the same tenant.
