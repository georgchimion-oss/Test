# COMPLETE GUIDE FOR CODEX - Read This Entire File

This file contains EVERYTHING you need to fix the Dataverse connection and build the app correctly.

---

## 🚨 THE PROBLEM

**You are using SharePoint Graph API instead of Dataverse!**

This code is WRONG:
```typescript
const GRAPH_API = 'https://graph.microsoft.com/v1.0';
fetch(`${GRAPH_API}/sites/.../lists/...`);
```

That's why the app shows "local data" - you're connecting to SharePoint, not Dataverse!

---

## ✅ THE SOLUTION (3 Steps)

### Step 1: Delete Bad Code
- DELETE `src/services/sharepointService.ts`
- DELETE any code with `https://graph.microsoft.com`
- DELETE any fake data arrays

### Step 2: Run Official Commands
```bash
pac code add-data-source -a dataverse -t crda8_deliverables
pac code add-data-source -a dataverse -t crda8_staff4
pac code add-data-source -a dataverse -t crda8_workstreams
```

### Step 3: Use Generated Hooks
```typescript
import { useStaffList } from '@/generated/hooks/useStaff';

function StaffPage() {
  const { data: staff, isLoading } = useStaffList({
    orderBy: ["crda8_name asc"]
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {staff?.map(person => (
        <div key={person.id}>{person.crda8_name}</div>
      ))}
    </div>
  );
}
```

---

# PART 1: QUICK REFERENCE

## What Gets Generated

After running `pac code add-data-source`, you get:

```
src/generated/
├── hooks/
│   └── useStaff.ts         ← USE THIS in your components
├── models/
│   └── staff-model.ts      ← TypeScript types
├── services/
│   └── staff-service.ts    ← Used by hooks internally
└── validators/
    └── staff-validator.ts  ← Zod schemas
```

## Complete Workflow

1. **Remove SharePoint code** - Delete sharepointService.ts
2. **Run pac commands** - Generate Dataverse code for each table
3. **Update app.tsx** - Add initialize() and QueryClientProvider
4. **Update pages** - Use generated hooks
5. **Test** - `pac code run`
6. **Deploy** - `pac code push`

## Required Files

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

## Create/Update/Delete Example

```typescript
import {
  useStaffList,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff
} from '@/generated/hooks/useStaff';

function StaffManager() {
  const { data: staff } = useStaffList();
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
      {staff?.map(person => (
        <div key={person.id}>
          {person.crda8_name}
          <button onClick={() => handleUpdate(person.id)}>Edit</button>
          <button onClick={() => handleDelete(person.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

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

# PART 2: COMPLETE IMPLEMENTATION GUIDE

## 🔑 Critical Facts

### 1. DO NOT Manually Create Services

**NEVER** manually create `dataverseService.ts` files. The official way is:

```bash
pac code add-data-source -a dataverse -t <table-logical-name>
```

This command **auto-generates** 4 files per table:
- `/generated/hooks/useTableName.ts`
- `/generated/models/table-name-model.ts`
- `/generated/services/table-name-service.ts`
- `/generated/validators/table-name-validator.ts`

### 2. Import Paths - CRITICAL

**You MUST use:**
```typescript
import { getClient, type IOperationResult } from '@microsoft/power-apps-data';
```

**NOT the Vibe internal path:**
```typescript
import { getClient } from '../../../app-gen-sdk/data';  // ❌ WRONG
```

### 3. Project Structure

```
project-root/
├── power.config.json              ← App configuration
├── package.json                   ← Dependencies
├── tsconfig.json                  ← TypeScript config
├── vite.config.ts                 ← Build config
├── index.html                     ← Entry point
├── src/
│   ├── main.tsx                   ← React entry
│   ├── app.tsx                    ← Main app component
│   ├── index.css                  ← Global styles
│   ├── lib/
│   │   ├── query-client.ts        ← React Query config
│   │   └── utils.ts               ← Utility functions
│   ├── hooks/
│   │   └── use-mobile.ts          ← Custom hooks
│   ├── models/
│   │   └── common-models.ts       ← Shared interfaces
│   ├── components/
│   │   ├── system/
│   │   │   └── error-boundary.tsx ← Error handling
│   │   └── ui/                    ← UI components
│   ├── pages/
│   │   ├── _layout.tsx            ← Layout wrapper
│   │   ├── index.tsx              ← Home page
│   │   └── not-found.tsx          ← 404 page
│   └── generated/                 ← AUTO-GENERATED
│       ├── hooks/
│       ├── models/
│       ├── services/
│       └── validators/
```

---

## 📋 COMPLETE FILE CONTENTS

### 1. power.config.json (Already correct)

```json
{
  "appDisplayName": "Project Governance Tool",
  "description": "Governance tool for leaders and teams",
  "environmentId": "deccb389-10c5-4d5c-8716-1093a04538e1",
  "buildPath": "./dist",
  "buildEntryPoint": "index.html",
  "logoPath": "Default",
  "localAppUrl": "http://localhost:5173/",
  "appId": "92b3eb2d-bfcc-49ce-9c50-79b2d456c9af",
  "connectionReferences": {},
  "databaseReferences": {
    "default.cds": {
      "dataSources": {
        "crda8_deliverables": {
          "entitySetName": "crda8_deliverabless",
          "logicalName": "crda8_deliverables",
          "isHidden": false
        },
        "crda8_staff4": {
          "entitySetName": "crda8_staff4s",
          "logicalName": "crda8_staff4",
          "isHidden": false
        },
        "crda8_workstreams": {
          "entitySetName": "crda8_workstreamss",
          "logicalName": "crda8_workstreams",
          "isHidden": false
        }
      }
    }
  }
}
```

### 2. src/main.tsx

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from '@/app.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### 3. src/app.tsx ⭐ CRITICAL

```typescript
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { initialize } from '@microsoft/power-apps/app';

import Layout from '@/pages/_layout';
import { queryClient } from '@/lib/query-client';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from '@/components/system/error-boundary';

import HomePage from '@/pages/index';
import NotFoundPage from '@/pages/not-found';

function App() {
  useEffect(() => {
    initialize();  // ⭐ CRITICAL - Must call this!
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary resetQueryCache>
        <JotaiProvider>
          <Toaster />
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Router>
        </JotaiProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
```

**Key Points:**
- `initialize()` from `@microsoft/power-apps/app` - **CRITICAL** call
- `QueryClientProvider` wraps everything
- `ErrorBoundary` with `resetQueryCache` prop
- `JotaiProvider` for state management
- Router with nested routes under Layout

### 4. src/lib/query-client.ts

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 10 * 60 * 1000,         // 10 minutes
      retry: false,
      refetchOnWindowFocus: false,
      retryOnMount: false,
    },
    mutations: {
      retry: false,
    },
  },
});
```

### 5. src/lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 6. src/pages/_layout.tsx

```typescript
import { Outlet, Link } from 'react-router';

export default function Layout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="px-6 pt-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight">
            <Link to="/" className="text-primary hover:text-primary/90 transition-colors">
              Project Governance Tool
            </Link>
          </h1>
        </div>
      </header>

      <main className="px-6 pb-10">
        <div className="mx-auto max-w-3xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
```

### 7. src/pages/not-found.tsx

```typescript
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}
```

---

## 🔧 AUTO-GENERATED FILES PATTERN

### Generated Service Pattern

**File: `src/generated/services/staff-service.ts`** (Example)

```typescript
import type { Staff } from '../models/staff-model';
import type { IGetAllOptions } from '../models/common-models';
import type { IOperationResult } from '@microsoft/power-apps/data';
import { getClient } from '@microsoft/power-apps-data';

export class StaffService {
  private static readonly dataSourceName = 'Staff';
  private static readonly client = getClient();

  public static async create(record: Omit<Staff, 'id'>): Promise<IOperationResult<Staff>> {
    const result = await StaffService.client.createRecordAsync<Omit<Staff, 'id'>, Staff>(
      StaffService.dataSourceName,
      record
    );
    return result;
  }

  public static async update(id: string, changedFields: Partial<Omit<Staff, 'id'>>): Promise<IOperationResult<Staff>> {
    const result = await StaffService.client.updateRecordAsync<Partial<Omit<Staff, 'id'>>, Staff>(
      StaffService.dataSourceName,
      id.toString(),
      changedFields
    );
    return result;
  }

  public static async delete(id: string): Promise<void> {
    await StaffService.client.deleteRecordAsync(
      StaffService.dataSourceName,
      id.toString()
    );
  }

  public static async get(id: string): Promise<IOperationResult<Staff>> {
    const result = await StaffService.client.retrieveRecordAsync<Staff>(
      StaffService.dataSourceName,
      id.toString()
    );
    return result;
  }

  public static async getAll(options?: IGetAllOptions): Promise<IOperationResult<Staff[]>> {
    const result = await StaffService.client.retrieveMultipleRecordsAsync<Staff>(
      StaffService.dataSourceName,
      options
    );
    return result;
  }
}
```

### Generated Model Pattern

**File: `src/generated/models/staff-model.ts`** (Example)

```typescript
export interface Staff {
  /**
   * @typeHint uuid
   * @validationRule Required
   */
  id: string;

  /**
   * @displayName Name
   * @format Text
   * @maxLength 850
   */
  crda8_name: string;

  /**
   * @displayName Email
   * @format Text
   * @maxLength 100
   */
  crda8_email?: string;

  /**
   * @displayName Role
   * @format Text
   * @maxLength 100
   */
  crda8_role?: string;

  /**
   * @displayName Active
   * @format Boolean
   */
  crda8_active?: boolean;
}
```

### Generated Validator Pattern

**File: `src/generated/validators/staff-validator.ts`** (Example)

```typescript
import { z } from 'zod';

export const StaffSchema = z.object({
  id: z.string().uuid(),
  crda8_name: z.string().max(850).min(1, "Name is required"),
  crda8_email: z.string().max(100).optional(),
  crda8_role: z.string().max(100).optional(),
  crda8_active: z.boolean().optional(),
});

export const CreateStaffSchema = StaffSchema.omit({ id: true });
export const UpdateStaffSchema = StaffSchema;

export type StaffInput = z.infer<typeof StaffSchema>;
export type CreateStaffInput = z.infer<typeof CreateStaffSchema>;
export type UpdateStaffInput = z.infer<typeof UpdateStaffSchema>;
```

### Generated Common Models

**File: `src/generated/models/common-models.ts`**

```typescript
export interface IGetAllOptions {
  // Filter format: "propertyName eq 'value'" or "propertyName gt 100"
  // For dates: use ge/lt instead of eq
  // For lookups: "lookupProperty/id eq 'guid'"
  filter?: string;

  // OrderBy format: ["propertyName asc", "otherProperty desc"]
  orderBy?: string[];
}
```

### Generated Hook Pattern

**File: `src/generated/hooks/useStaff.ts`** (Example)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffService } from "../services/staff-service";
import type { Staff } from "../models/staff-model";
import type { IGetAllOptions } from "../models/common-models";

export function useStaffList(options?: IGetAllOptions) {
  return useQuery({
    queryKey: ["staff-list", options],
    queryFn: async () => {
      const result = await StaffService.getAll(options);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  });
}

export function useStaff(id: string) {
  return useQuery({
    queryKey: ["staff", id],
    queryFn: async () => {
      const result = await StaffService.get(id);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    enabled: !!id,
  });
}

export function useCreateStaff() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Staff, "id">) => {
      const result = await StaffService.create(data);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["staff-list"] });
    },
  });
}

export function useUpdateStaff() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      changedFields,
    }: {
      id: string;
      changedFields: Partial<Omit<Staff, "id">>;
    }) => {
      const result = await StaffService.update(id, changedFields);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["staff-list"] });
      client.invalidateQueries({ queryKey: ["staff", variables.id] });
    },
  });
}

export function useDeleteStaff() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await StaffService.delete(id);
    },
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: ["staff-list"] });
      client.invalidateQueries({ queryKey: ["staff", id] });
    },
  });
}
```

---

## 📦 REQUIRED DEPENDENCIES

**package.json dependencies:**

```json
{
  "dependencies": {
    "@microsoft/power-apps": "^1.0.0",
    "@microsoft/power-apps-data": "^1.0.0",
    "@tanstack/react-query": "^5.0.0",
    "jotai": "^2.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.0.0",
    "zod": "^3.22.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 🎯 COMPLETE USAGE EXAMPLES

### Example 1: Staff List Page

```typescript
import { useStaffList } from "@/generated/hooks/useStaff";

export default function StaffPage() {
  const { data: staff, isLoading, isError, error, refetch } = useStaffList({
    filter: "crda8_active eq true",
    orderBy: ["crda8_name asc"]
  });

  if (isLoading) return <div>Loading staff...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Staff List ({staff?.length ?? 0})</h2>
      {staff?.map(person => (
        <div key={person.id}>
          <h3>{person.crda8_name}</h3>
          <p>{person.crda8_email}</p>
          <p>Role: {person.crda8_role}</p>
        </div>
      ))}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### Example 2: Deliverables with Create

```typescript
import { useDeliverablesList, useCreateDeliverable } from "@/generated/hooks/useDeliverables";
import { useState } from "react";

export default function DeliverablesPage() {
  const [name, setName] = useState("");
  const { data: deliverables, isLoading } = useDeliverablesList({
    orderBy: ["crda8_targetdate asc"]
  });
  const createMutation = useCreateDeliverable();

  const handleCreate = () => {
    createMutation.mutate({
      crda8_name: name,
      crda8_status: "In Progress",
      crda8_targetdate: new Date().toISOString()
    });
    setName("");
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Deliverables</h2>

      <div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Deliverable name"
        />
        <button onClick={handleCreate}>Add Deliverable</button>
      </div>

      {deliverables?.map(d => (
        <div key={d.id}>
          <h3>{d.crda8_name}</h3>
          <p>Status: {d.crda8_status}</p>
          <p>Target Date: {d.crda8_targetdate}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Update and Delete

```typescript
import {
  useStaffList,
  useUpdateStaff,
  useDeleteStaff
} from "@/generated/hooks/useStaff";

export default function StaffManager() {
  const { data: staff } = useStaffList();
  const updateMutation = useUpdateStaff();
  const deleteMutation = useDeleteStaff();

  const handlePromote = (id: string, currentRole: string) => {
    updateMutation.mutate({
      id,
      changedFields: {
        crda8_role: currentRole === "Developer" ? "Senior Developer" : "Lead Developer"
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      {staff?.map(person => (
        <div key={person.id}>
          <span>{person.crda8_name} - {person.crda8_role}</span>
          <button onClick={() => handlePromote(person.id, person.crda8_role)}>
            Promote
          </button>
          <button onClick={() => handleDelete(person.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Example 4: Filtering and Sorting

```typescript
import { useDeliverablesList } from "@/generated/hooks/useDeliverables";
import { useState } from "react";

export default function DeliverablesDashboard() {
  const [status, setStatus] = useState("all");

  const { data: deliverables } = useDeliverablesList({
    filter: status !== "all" ? `crda8_status eq '${status}'` : undefined,
    orderBy: ["crda8_targetdate asc", "crda8_name asc"]
  });

  return (
    <div>
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="all">All</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Blocked">Blocked</option>
      </select>

      {deliverables?.map(d => (
        <div key={d.id}>{d.crda8_name}</div>
      ))}
    </div>
  );
}
```

---

## ⚠️ CRITICAL MISTAKES TO AVOID

### ❌ DON'T: Manually create services
```typescript
// WRONG - Don't create this manually
export const dataverseService = {
  async getStaff() {
    const response = await fetch('/api/data/v9.0/crda8_staff4s');
    return response.json();
  }
};
```

### ✅ DO: Use pac command
```bash
pac code add-data-source -a dataverse -t crda8_staff4
```

### ❌ DON'T: Use SharePoint Graph API
```typescript
// WRONG - This is SharePoint, not Dataverse!
const GRAPH_API = 'https://graph.microsoft.com/v1.0';
```

### ✅ DO: Use generated service
```typescript
import { StaffService } from '@/generated/services/staff-service';
const result = await StaffService.getAll();
```

### ❌ DON'T: Guess entity set names
```typescript
// WRONG - Guessing plural form
fetch('/api/data/v9.0/crda8_staff4s');
```

### ✅ DO: Let pac command handle it
The command reads your table schema and generates correct names.

---

## 🚀 STEP-BY-STEP IMPLEMENTATION

### Phase 1: Remove ALL SharePoint Code

1. **Delete** `src/services/sharepointService.ts`
2. **Delete** any SharePoint-related imports
3. **Delete** any Graph API code (`https://graph.microsoft.com`)
4. **Remove** fake/local data arrays

### Phase 2: Structure Setup

1. **Verify** existing:
   - `power.config.json` (already correct)
   - `package.json` (update dependencies if needed)

2. **Create** if missing:
   - `src/lib/query-client.ts` (copy from above)
   - `src/lib/utils.ts` (copy from above)
   - `src/pages/_layout.tsx` (copy from above)
   - `src/pages/not-found.tsx` (copy from above)

3. **Update** `src/app.tsx`:
   - Add `initialize()` from `@microsoft/power-apps/app`
   - Wrap in `QueryClientProvider`
   - Add `ErrorBoundary`
   - Add `JotaiProvider`

### Phase 3: Generate Dataverse Code

Run these commands **one at a time**:

```bash
pac code add-data-source -a dataverse -t crda8_deliverables
pac code add-data-source -a dataverse -t crda8_staff4
pac code add-data-source -a dataverse -t crda8_workstreams
```

Each command will create 4 files in `src/generated/`:
- `hooks/useTableName.ts`
- `models/table-name-model.ts`
- `services/table-name-service.ts`
- `validators/table-name-validator.ts`

### Phase 4: Update Pages to Use Generated Hooks

**Before (SharePoint - DELETE THIS):**
```typescript
import { getStaffFromSharePoint } from '../services/sharepointService';

export default function StaffPage() {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    getStaffFromSharePoint().then(setStaff);
  }, []);

  // ...
}
```

**After (Dataverse - USE THIS):**
```typescript
import { useStaffList } from '@/generated/hooks/useStaff';

export default function StaffPage() {
  const { data: staff, isLoading } = useStaffList({
    orderBy: ["crda8_name asc"]
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {staff?.map(person => (
        <div key={person.id}>{person.crda8_name}</div>
      ))}
    </div>
  );
}
```

### Phase 5: Test and Deploy

```bash
# Test locally
pac code run

# Build
npm run build

# Deploy
pac code push
```

---

## 📝 FINAL CHECKLIST

Before you're done, verify:

- [ ] Removed ALL SharePoint service code
- [ ] Removed ALL fake/local data
- [ ] Updated `app.tsx` with `initialize()` and providers
- [ ] Created `query-client.ts` with proper config
- [ ] Ran `pac code add-data-source` for each table
- [ ] Verified `src/generated/` folder has hooks, models, services, validators
- [ ] Updated all page components to use generated hooks
- [ ] NO manual `fetch()` calls anywhere
- [ ] NO hardcoded data arrays
- [ ] Using `@microsoft/power-apps-data` (NOT `app-gen-sdk`)
- [ ] All imports use `@/` path alias
- [ ] Error handling with ErrorBoundary
- [ ] Loading states with `isLoading`
- [ ] Mutations invalidate queries on success

---

## 🎓 KEY CONCEPTS

### The Data Flow

```
User Action (UI)
    ↓
React Query Hook (useStaffList)
    ↓
Service Layer (StaffService.getAll)
    ↓
Power Apps Data Client (getClient())
    ↓
Dataverse Web API
    ↓
Returns IOperationResult<Staff[]>
    ↓
React Query caches and returns data
    ↓
UI displays data
```

### The IOperationResult Pattern

All Dataverse operations return this structure:

```typescript
interface IOperationResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}
```

Always check `result.success` before using `result.data`.

### The Query Invalidation Pattern

When you create/update/delete, you must invalidate queries:

```typescript
onSuccess: () => {
  client.invalidateQueries({ queryKey: ["staff-list"] });
}
```

This triggers a refetch so the UI updates with fresh data.

---

## ✅ YOU ARE NOW READY

This document contains **everything you need** to build a working Dataverse-connected Power Apps Code App.

Follow this pattern **exactly** and you will succeed.

**DO NOT DEVIATE** from this pattern unless you have a very good reason.

This is the proven pattern from Georg's working GeorgCodeTemplate app that successfully loads real data from Dataverse.

Good luck! 🚀
