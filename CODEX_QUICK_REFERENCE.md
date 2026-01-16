# CODEX QUICK REFERENCE - Must-Know Facts

## 🚨 CRITICAL: Stop Using SharePoint!

**DELETE THESE NOW:**
- `src/services/sharepointService.ts`
- Any code with `https://graph.microsoft.com`
- Any fake data arrays

**The app is showing "local data" because you're using SharePoint Graph API instead of Dataverse.**

---

## ✅ THE RIGHT WAY (What Georg's Working App Uses)

### Step 1: Run These Commands

```bash
pac code add-data-source -a dataverse -t crda8_deliverables
pac code add-data-source -a dataverse -t crda8_staff4
pac code add-data-source -a dataverse -t crda8_workstreams
```

This auto-generates hooks, models, services for each table.

### Step 2: Use Generated Hooks in Pages

```typescript
import { useStaffList } from '@/generated/hooks/useStaff';

export default function StaffPage() {
  const { data: staff, isLoading, isError, error } = useStaffList({
    orderBy: ["crda8_name asc"]
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      {staff?.map(person => (
        <div key={person.id}>{person.crda8_name}</div>
      ))}
    </div>
  );
}
```

### Step 3: Update app.tsx

```typescript
import { useEffect } from 'react';
import { initialize } from '@microsoft/power-apps/app';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

function App() {
  useEffect(() => {
    initialize();  // ← CRITICAL!
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* your routes */}
    </QueryClientProvider>
  );
}
```

---

## 📁 What Gets Generated

After running `pac code add-data-source`, you get:

```
src/generated/
├── hooks/
│   └── useStaff.ts         ← USE THIS in your components
├── models/
│   └── staff-model.ts      ← TypeScript types
├── services/
│   └── staff-service.ts    ← Used by hooks (you don't call directly)
└── validators/
    └── staff-validator.ts  ← Zod schemas
```

---

## 💾 Create/Update/Delete Example

```typescript
import { useCreateStaff, useUpdateStaff, useDeleteStaff } from '@/generated/hooks/useStaff';

function StaffManager() {
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const deleteMutation = useDeleteStaff();

  const handleCreate = () => {
    createMutation.mutate({
      crda8_name: "John Doe",
      crda8_email: "john@example.com"
    });
  };

  const handleUpdate = (id: string) => {
    updateMutation.mutate({
      id,
      changedFields: { crda8_email: "newemail@example.com" }
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div>
      <button onClick={handleCreate}>Add Staff</button>
      {/* buttons to update/delete */}
    </div>
  );
}
```

---

## 🎯 Required Files (Copy from Georg's Working App)

### src/lib/query-client.ts

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
```

### src/lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## ❌ NEVER DO THIS

```typescript
// ❌ WRONG - Manual fetch
fetch('/api/data/v9.0/crda8_staff4s')

// ❌ WRONG - SharePoint
fetch('https://graph.microsoft.com/v1.0/sites/...')

// ❌ WRONG - Fake data
const fakeStaff = [{ name: "Test" }];

// ❌ WRONG - Manual service
export const dataverseService = { getStaff() {...} }
```

## ✅ ALWAYS DO THIS

```typescript
// ✅ RIGHT - Use generated hooks
import { useStaffList } from '@/generated/hooks/useStaff';
const { data: staff } = useStaffList();
```

---

## 🔑 Key Differences from Vibe

**Vibe uses internal paths:**
```typescript
import { getClient } from '../../../app-gen-sdk/data';
```

**You must use public SDK:**
```typescript
import { getClient } from '@microsoft/power-apps-data';
```

---

## 📦 Required Dependencies

```bash
npm install @microsoft/power-apps @microsoft/power-apps-data @tanstack/react-query jotai react-router-dom zod clsx tailwind-merge
```

---

## 🚀 Complete Workflow

1. **Remove SharePoint code** - Delete sharepointService.ts
2. **Run pac commands** - Generate Dataverse code for each table
3. **Update app.tsx** - Add initialize() and QueryClientProvider
4. **Update pages** - Use generated hooks
5. **Test** - `pac code run`
6. **Deploy** - `pac code push`

---

## 🎓 The Pattern (Memorize This)

```
UI Component
    ↓ (calls)
useStaffList() hook
    ↓ (calls)
StaffService.getAll()
    ↓ (calls)
Dataverse Web API
    ↓ (returns)
Real data from crda8_staff4 table
```

NO fake data, NO SharePoint, NO manual services.

**Just use the generated hooks!**

---

Read `CODEX_INSTRUCTIONS.md` for complete details.
