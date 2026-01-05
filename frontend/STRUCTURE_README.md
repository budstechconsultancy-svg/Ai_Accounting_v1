# Frontend Directory Structure

## Overview
The frontend has been reorganized into a clean, modular structure that separates concerns and makes the codebase easy to navigate.

## Directory Structure

```
frontend/
└── src/
    ├── app/                    # Application setup
    │   ├── App.tsx            # Main application component
    │   ├── main.tsx           # Application entry point
    │   └── routes.tsx         # Route definitions (future)
    │
    ├── pages/                  # Page components (one per route)
    │   ├── Login/
    │   │   ├── Login.tsx
    │   │   └── index.ts
    │   ├── Register/
    │   ├── Dashboard/
    │   ├── Masters/
    │   ├── Inventory/
    │   ├── Vouchers/
    │   ├── Reports/
    │   ├── Settings/
    │   ├── UsersAndRoles/
    │   ├── VendorPortal/
    │   ├── CustomerPortal/
    │   ├── Payroll/
    │   └── MassUploadResult/
    │
    ├── components/             # Shared/reusable UI components
    │   ├── Sidebar.tsx
    │   ├── Modal.tsx
    │   ├── Icon.tsx
    │   ├── ErrorBoundary.tsx
    │   ├── AIAgent.tsx
    │   ├── HierarchicalDropdown.tsx
    │   ├── LedgerCreationWizard.tsx
    │   ├── LedgerQuestions.tsx
    │   ├── DynamicQuestions.tsx
    │   ├── ModulePicker.tsx
    │   ├── PermissionTreeSelector.tsx
    │   ├── MassUploadModal.tsx
    │   ├── StockMassUploadModal.tsx
    │   ├── inventory-reports/
    │   └── index.ts
    │
    ├── services/               # API calls and external services
    │   ├── api.ts
    │   ├── geminiService.ts
    │   ├── httpClient.ts
    │   ├── inventoryReportsService.ts
    │   ├── validationService.ts
    │   └── index.ts
    │
    ├── store/                  # Global state and initial data
    │   ├── initialData.ts
    │   ├── initialVouchers.ts
    │   └── index.ts
    │
    ├── types/                  # TypeScript type definitions
    │   ├── types.ts
    │   └── index.ts
    │
    ├── hooks/                  # Custom React hooks
    │   └── index.ts
    │
    ├── utils/                  # Helper functions and utilities
    │   └── index.ts
    │
    ├── styles/                 # Global styles
    │   ├── index.css
    │   └── globals.css
    │
    └── assets/                 # Static assets
        ├── images/
        └── icons/
```

## Import Patterns

### Importing Pages
```typescript
// Clean barrel exports
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
```

### Importing Components
```typescript
import { Sidebar, Modal, Icon } from '@/components';
// Or individual
import Sidebar from '@/components/Sidebar';
```

### Importing Services
```typescript
import { apiService } from '@/services';
import { extractInvoiceDataWithRetry } from '@/services/geminiService';
```

### Importing Types
```typescript
import type { Voucher, Ledger, CompanyDetails } from '@/types';
```

### Importing Store Data
```typescript
import { initialLedgers, initialVouchers } from '@/store';
```

## Benefits

### For Beginners
- **Clear structure**: Easy to find code by feature
- **Logical organization**: Pages, components, services are separated
- **Import clarity**: Barrel exports make imports clean

### For Development  
- **Feature isolation**: Each page is self-contained
- **Shared components**: Reusable UI in one place
- **Type safety**: All types in dedicated directory

### For Scalability
- **Easy to extend**: Add new pages following same pattern
- **Maintainable**: Clear ownership per feature
- **Testable**: Modular structure enables better testing

## File Naming Conventions

- **Pages**: PascalCase (e.g., `Dashboard.tsx`, `VendorPortal.tsx`)
- **Components**: PascalCase (e.g., `Sidebar.tsx`, `Modal.tsx`)
- **Services**: camelCase (e.g., `geminiService.ts`, `apiService.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`, `validation.ts`)
- **Types**: camelCase for file, PascalCase for types (e.g., `types.ts` contains `Voucher`, `Ledger`)

## Adding New Features

### Adding a New Page
1. Create folder in `src/pages/NewFeature/`
2. Create `NewFeature.tsx` component
3. Create `index.ts` barrel export: `export { default } from './NewFeature';`
4. Import in App.tsx: `import NewFeature from '../pages/NewFeature';`

### Adding a New Component
1. Create component in `src/components/MyComponent.tsx`
2. Add to `src/components/index.ts`: `export { default as MyComponent } from './MyComponent';`
3. Use anywhere: `import { MyComponent } from '@/components';`

## Migration Status

✅ Directory structure created  
✅ Files moved to new locations  
✅ Barrel exports created  
✅ App.tsx imports updated  
✅ index.html entry point updated  
✅ Dashboard component imports fixed  
✅ Login component imports fixed  
✅ Register component imports fixed  
⏳ Remaining page components need import fixes  
⏳ Shared components need import fixes  

## Next Steps

1. Update imports in remaining page components
2. Update imports in shared components
3. Add path aliases to vite.config.ts
4. Test build and dev server
5. Verify all pages load correctly
