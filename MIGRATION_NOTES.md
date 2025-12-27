# Migration Notes for Module → Submodule UI Implementation

## Overview
This update implements a new hierarchical role permission system with UserTable → Submodule structure for multi-select UI across all application modules.

## Database Schema Changes

### New Tables

#### user_tables
- `id` INT PRIMARY KEY (AUTO_INCREMENT)
- `tenant_id` VARCHAR(36) NOT NULL
- `name` VARCHAR(100) NOT NULL
- `description` VARCHAR(500)
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- UNIQUE KEY `tenant_name_unique` (`tenant_id`, `name`)

#### submodules
- `id` INT PRIMARY KEY (AUTO_INCREMENT)
- `tenant_id` VARCHAR(36) NOT NULL
- `user_table_id` INT NOT NULL (FK to user_tables.id)
- `name` VARCHAR(100) NOT NULL
- `description` VARCHAR(500)
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- UNIQUE KEY `tenant_user_table_name_unique` (`tenant_id`, `user_table_id`, `name`)
- FOREIGN KEY (`user_table_id`) REFERENCES user_tables(id)

## Data Migration

### Automated Seeding
The `seed_rbac.py` script now automatically populates `user_tables` and `submodules` during tenant creation:

1. Creates UserTable entries for each module (accounting → Accounting, inventory → Inventory, etc.)
2. Creates Submodule entries for each unique group_name within each module
3. Links permissions to roles via the hierarchical structure

### For Existing Tenants
Run the seeding script for existing tenants to populate the new tables:

```bash
cd backend
python seed_rbac.py <existing_tenant_id> [owner_username]
```

## API Changes

### New Endpoints

#### GET /api/settings/user-tables/
Returns tenant's user_tables with nested submodules for UI rendering.

Response format:
```json
[
  {
    "id": 1,
    "name": "Accounting",
    "description": "Accounting module access",
    "submodules": [
      {
        "id": 1,
        "name": "Vouchers",
        "description": "Vouchers submodule access"
      }
    ]
  }
]
```

#### GET /api/settings/role-modules/{role_id}/
Returns selected submodule IDs for a role.

Response format:
```json
{
  "selectedSubmoduleIds": [1, 2, 3]
}
```

#### POST /api/settings/role-modules/{role_id}/
Updates role's permissions based on selected submodules.

Request format:
```json
{
  "selectedSubmoduleIds": [1, 2, 3]
}
```

## Backward Compatibility

- Existing permissions and role assignments remain functional
- Old UI components can continue to work alongside new multi-select UI
- Role creation/update APIs accept both permission IDs and submodule IDs

## Testing

1. Create new tenant - verify user_tables and submodules auto-populate
2. Assign role with subset of modules - verify permissions mapped correctly
3. Update role permissions via new UI - verify database updates
4. Cross-tenant isolation - ensure tenant A data invisible to tenant B

## Rollback Plan

If issues occur:

1. Revert frontend to use old permission grouping UI
2. New models use `managed=False` so no Django migrations needed to drop
3. Manually drop tables if using raw SQL:
   ```sql
   DROP TABLE IF EXISTS submodules;
   DROP TABLE IF EXISTS user_tables;
   ```

## Performance Considerations

- Submodules prefetched in UserTablesViewSet to minimize queries
- Tenant-scoped queries ensure proper isolation
- Consider indexing on tenant_id + name for performance if large datasets
