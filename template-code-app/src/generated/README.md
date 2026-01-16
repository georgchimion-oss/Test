# Generated Code Folder

This folder will contain auto-generated code when you run:

```bash
pac code add-data-source -a dataverse -t <table-logical-name>
```

## Expected Structure

After running the command for each table, you'll see:

```
generated/
├── hooks/
│   ├── useDeliverables.ts
│   ├── useStaff.ts
│   ├── useWorkstreams.ts
│   └── ...
├── models/
│   ├── deliverables-model.ts
│   ├── staff-model.ts
│   ├── workstreams-model.ts
│   └── ...
├── services/
│   ├── deliverables-service.ts
│   ├── staff-service.ts
│   ├── workstreams-service.ts
│   └── ...
└── validators/
    ├── deliverables-validator.ts
    ├── staff-validator.ts
    ├── workstreams-validator.ts
    └── ...
```

## Example Commands

```bash
# Add Deliverables table
pac code add-data-source -a dataverse -t crda8_deliverables

# Add Staff table
pac code add-data-source -a dataverse -t crda8_staff4

# Add Workstreams table
pac code add-data-source -a dataverse -t crda8_workstreams

# Add Time Off Requests table
pac code add-data-source -a dataverse -t crda8_timeoffrequests

# Add Weekly Hours table
pac code add-data-source -a dataverse -t crda8_weeklyhours
```

## What Gets Generated

### 1. Hooks (`/hooks/useTableName.ts`)
React Query hooks for CRUD operations:
- `useTableNameList()` - Get all records
- `useTableName(id)` - Get single record
- `useCreateTableName()` - Create record
- `useUpdateTableName()` - Update record
- `useDeleteTableName()` - Delete record

### 2. Models (`/models/table-name-model.ts`)
TypeScript interfaces matching your Dataverse table schema

### 3. Services (`/services/table-name-service.ts`)
Service layer using `@microsoft/power-apps-data` SDK

### 4. Validators (`/validators/table-name-validator.ts`)
Zod schemas for validation

## Usage Example

```typescript
import { useDeliverablesList, useCreateDeliverable } from '@/generated/hooks/useDeliverables';

function DeliverablesPage() {
  const { data: deliverables, isLoading } = useDeliverablesList({
    orderBy: ['crda8_targetdate asc'],
    filter: 'crda8_active eq true'
  });

  const createMutation = useCreateDeliverable();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {deliverables?.map(d => (
        <div key={d.id}>{d.crda8_name}</div>
      ))}
    </div>
  );
}
```
