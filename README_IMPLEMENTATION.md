# Module → Submodule Multi-Select UI Implementation

## Overview

This implementation provides a consistent Module → Submodule multi-select UI pattern across all application modules for role permissions management. The system structures permissions hierarchically using UserTable (modules) containing Submodules (permission groups), with full accessibility, keyboard navigation, and tenant isolation.

## Features Implemented

### Backend
- ✅ **Django Models**: `UserTable` and `Submodule` with tenant scoping
- ✅ **Database Schema**: Auto-populating user_tables and submodules based on existing permissions
- ✅ **REST APIs**:
  - `GET /api/settings/user-tables/` - List user tables with nested submodules
  - `GET /api/settings/role-modules/{role_id}/` - Get role's selected submodules
  - `POST /api/settings/role-modules/{role_id}/` - Save role's selected submodules
- ✅ **Migration Support**: Comprehensive migration notes and automated seeding
- ✅ **Tenant Isolation**: All operations scoped to tenant context

### Frontend
- ✅ **ModulePicker Component**: Accessible accordion UI with multi-select functionality
  - Keyboard navigation support
  - ARIA compliance for screen readers
  - Visual feedback for selection states
- ✅ **Custom Hook**: `useModuleData` with caching and error handling
- ✅ **API Integration**: Updated `apiService` with new endpoints
- ✅ **Type Safety**: Full TypeScript interfaces for all data structures

### User Experience
- 🔄 *Integration Pending*: Role creation/editing modals need to be updated to use ModulePicker instead of old permission groups UI
- 🔄 *Testing Pending*: Unit tests for components and hooks missing

## Quick Start

### Backend Setup

1. **Apply Database Changes**:
```bash
# The new models use managed=False, so create tables manually:
# user_tables and submodules tables as described in MIGRATION_NOTES.md
```

2. **Seed Data for New Tenants**:
```python
from backend.seed_rbac import seed_rbac_for_tenant
seed_rbac_for_tenant("your_tenant_id", "owner_username")
```

3. **Verify APIs**:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/settings/user-tables/
```

### Frontend Setup

1. **Install Dependencies** (if needed):
```bash
cd frontend
npm install
```

2. **Update Role Modals** (Integration Step):
In `UsersAndRolesPage.tsx`, replace permission groups UI with:
```tsx
<ModulePicker
  selectedSubmoduleIds={newRole.selectedSubmoduleIds}
  onChange={(ids) => setNewRole(prev => ({ ...prev, selectedSubmoduleIds: ids }))}
  disabled={false}
/>
```

## Architecture

### Data Model

```
Tenant
├── UserTable (e.g., "Accounting")
│   ├── Submodule (e.g., "Vouchers")
│   │   └── Permissions (auto-mapped)
│   └── Submodule (e.g., "Groups")
└── UserTable (e.g., "Inventory")
    ├── Submodule (e.g., "Stock Items")
    └── Submodule (e.g., "Stock Groups")
```

### API Flow

1. **Load Structure**: `GET /api/settings/user-tables/`
2. **Load Role State**: `GET /api/settings/role-modules/{role_id}/`
3. **Save Changes**: `POST /api/settings/role-modules/{role_id}/`

### Caching Strategy

- User tables cached for 5 minutes
- Role selections cached per role
- Automatic cache invalidation on updates

## Testing

### Manual Testing Checklist

#### Backend
- [ ] Create new tenant - verify user_tables/submodules auto-populate
- [ ] Get user tables - response returns nested structure
- [ ] Create/edit role - submodule selections save correctly
- [ ] Cross-tenant isolation - tenant A data not visible to tenant B

#### Frontend
- [ ] ModulePicker renders accordion UI
- [ ] Keyboard navigation works (Tab, Enter, Arrow keys)
- [ ] Screen reader announces selection states
- [ ] Selection changes propagate to parent component
- [ ] Error states display appropriately

### Unit Tests (To Be Implemented)

```bash
# Component tests
npm test -- --testPathPattern=ModulePicker
npm test -- --testPathPattern=useModuleData

# API integration tests
# Test all new endpoints with mock responses
```

## Migration Guide

### For Existing Applications

1. **Database Migration**:
   ```sql
   -- Create new tables (see MIGRATION_NOTES.md for full schema)
   CREATE TABLE user_tables (...);
   CREATE TABLE submodules (...);
   ```

2. **Seed Existing Tenants**:
   ```python
   from backend.seed_rbac import seed_rbac_for_tenant
   # For each existing tenant
   seed_rbac_for_tenant(existing_tenant_id, owner_username)
   ```

3. **Frontend Integration**:
   - Replace old permission grouping UI in role modals
   - Update API calls to use new endpoints
   - Add ModulePicker component imports

### Rollback Plan

1. **Frontend**: Revert to old permission groups UI
2. **Backend**: New APIs remain available alongside old ones
3. **Database**: Tables use `managed=False`, can be dropped manually if needed

## Performance Considerations

- **API Optimization**: Submodules prefetched to minimize queries
- **Caching**: 5-minute TTL on expensive operations
- **Tenant Scoping**: All queries filtered by tenant_id
- **Lazy Loading**: UI components load only when expanded

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support with arrow keys, Enter, Space
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Logical tab order through interactive elements
- **Color Contrast**: High contrast checkbox states and focus indicators
- **Error Announcements**: Screen reader feedback for loading/error states

## Security

- **Tenant Isolation**: All operations verify tenant ownership
- **API Authentication**: Bearer token required for all endpoints
- **Input Validation**: Permission IDs validated before saving
- **Audit Trail**: Role changes logged through existing permission system

## Future Enhancements

- **Search/Filter**: Add search functionality to large module lists
- **Bulk Operations**: Select all/deselect all for entire modules
- **Custom Permissions**: Support for dynamic permission creation
- **Permission Dependencies**: Prevent invalid permission combinations
- **Export/Import**: Role template import/export functionality

## Support

For issues or questions:
1. Check MIGRATION_NOTES.md for detailed schema information
2. Verify tenant setup and seeding completed correctly
3. Test with new tenant creation to isolate integration issues
4. Check browser console for frontend errors
5. Verify backend logs for API failures
