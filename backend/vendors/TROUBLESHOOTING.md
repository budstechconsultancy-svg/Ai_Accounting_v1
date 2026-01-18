# Troubleshooting Guide: Vendor Master PO Settings Data Not Saving

## Issue
Data is not saving to the `vendor_master_posettings` table when submitted from the frontend.

## Changes Made for Debugging

### 1. Permission Changed (Temporary)
**File:** `backend/vendors/posettings_api.py`
- Changed `permission_classes = [IsAuthenticated]` to `permission_classes = [AllowAny]`
- **⚠️ IMPORTANT:** This is temporary for debugging. Change it back to `[IsAuthenticated]` after fixing the issue.

### 2. Added Detailed Logging
Added comprehensive logging to track:
- Request data received
- User information
- Tenant ID extraction
- Serializer validation
- Database operations
- Any errors that occur

## How to Debug

### Step 1: Check Django Server Logs
The server will now log detailed information. Watch the terminal where `python manage.py runserver` is running.

When you submit the form from the frontend, you should see logs like:
```
=== PO Settings CREATE Request ===
Request data: {'name': 'Test PO', 'prefix': 'PO/', ...}
Request user: <User object>
Tenant ID: tenant_123
Serializer validated data: {...}
Creating PO setting with tenant_id=tenant_123, name=Test PO
✅ PO setting created successfully! ID: 1
```

### Step 2: Check for Errors
Look for any of these error messages in the logs:
- `Serializer validation failed` - The data format is incorrect
- `Duplicate name detected` - A PO setting with that name already exists
- `ValueError` - Invalid data type or value
- `IntegrityError` - Database constraint violation
- `Unexpected error` - Something else went wrong

### Step 3: Test the API Directly

#### Using cURL (Command Line)
```bash
curl -X POST http://localhost:8000/api/vendors/po-settings/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test PO Series",
    "prefix": "PO/",
    "suffix": "/26",
    "digits": 4,
    "auto_year": false
  }'
```

#### Using Browser Console
```javascript
fetch('http://localhost:8000/api/vendors/po-settings/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Test PO Series',
    prefix: 'PO/',
    suffix: '/26',
    digits: 4,
    auto_year: false
  })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### Step 4: Check Database Directly
```sql
-- Check if table exists
SHOW TABLES LIKE 'vendor_master_posettings';

-- Check table structure
DESCRIBE vendor_master_posettings;

-- Check for any records
SELECT * FROM vendor_master_posettings;

-- Check count
SELECT COUNT(*) FROM vendor_master_posettings;
```

## Common Issues and Solutions

### Issue 1: Authentication Error (401 Unauthorized)
**Symptom:** Request returns 401 status code
**Solution:** 
- We've temporarily disabled authentication with `AllowAny`
- If still getting 401, check CORS settings
- After debugging, implement proper authentication

### Issue 2: CORS Error
**Symptom:** Browser console shows CORS error
**Solution:** Check `backend/backend/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5174",  # Your frontend URL
]
```

### Issue 3: Serializer Validation Error
**Symptom:** Logs show "Serializer validation failed"
**Solution:** 
- Check the exact error in logs
- Ensure all required fields are sent
- Check data types (digits should be integer, auto_year should be boolean)

### Issue 4: Network Error
**Symptom:** Request doesn't reach the server
**Solution:**
- Check if backend is running: `python manage.py runserver`
- Check the correct URL: `http://localhost:8000/api/vendors/po-settings/`
- Check browser network tab for the actual request

### Issue 5: Table Doesn't Exist
**Symptom:** Error about table not existing
**Solution:**
```bash
cd backend
python manage.py makemigrations vendors
python manage.py migrate vendors
```

## Frontend Integration Checklist

### ✅ Check These in Your Frontend Code:

1. **Correct API Endpoint**
   ```javascript
   const url = 'http://localhost:8000/api/vendors/po-settings/';
   ```

2. **Correct HTTP Method**
   ```javascript
   method: 'POST'
   ```

3. **Correct Headers**
   ```javascript
   headers: {
     'Content-Type': 'application/json'
   }
   ```

4. **Correct Data Format**
   ```javascript
   body: JSON.stringify({
     name: formData.name,           // Required, string
     category: formData.categoryId, // Optional, integer or null
     prefix: formData.prefix,       // Optional, string
     suffix: formData.suffix,       // Optional, string
     digits: parseInt(formData.digits), // Optional, integer
     auto_year: formData.autoYear   // Optional, boolean
   })
   ```

5. **Error Handling**
   ```javascript
   .then(response => {
     if (!response.ok) {
       return response.json().then(err => {
         console.error('API Error:', err);
         throw new Error(err.error || 'Failed to create PO setting');
       });
     }
     return response.json();
   })
   .then(data => {
     console.log('Success:', data);
   })
   .catch(error => {
     console.error('Error:', error);
   });
   ```

## Verification Steps

### 1. Verify Table Exists
```bash
cd backend
python debug_po_settings.py
```

### 2. Verify API Works
```bash
cd backend
python test_po_api.py
```

### 3. Check Server Logs
Watch the terminal running `python manage.py runserver` for detailed logs.

### 4. Check Browser Console
Open browser DevTools (F12) and check:
- **Console tab:** For JavaScript errors
- **Network tab:** For API request/response details

## Expected Successful Flow

1. Frontend submits form
2. POST request sent to `/api/vendors/po-settings/`
3. Backend logs show:
   ```
   === PO Settings CREATE Request ===
   Request data: {...}
   Tenant ID: ...
   Serializer validated data: {...}
   Creating PO setting...
   ✅ PO setting created successfully! ID: X
   ```
4. Backend returns 201 Created with data
5. Frontend receives success response
6. Data is visible in database

## Next Steps After Fixing

1. **Re-enable Authentication**
   Change `permission_classes = [AllowAny]` back to `permission_classes = [IsAuthenticated]`

2. **Add Frontend Authentication**
   Include JWT token in requests:
   ```javascript
   headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
   }
   ```

3. **Remove Debug Logging** (Optional)
   You can keep the logging or reduce it to just errors

## Contact Points for Further Help

If the issue persists:
1. Share the exact error from Django server logs
2. Share the network request/response from browser DevTools
3. Share the frontend code making the API call
4. Run the debug scripts and share the output
