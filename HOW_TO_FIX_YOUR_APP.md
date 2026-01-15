# How to Fix Your App - Replace SharePoint with Dataverse

## The Problem (Confirmed!)

Your `power.config.json` is configured for Dataverse ✅
But your services use SharePoint Graph API ❌

That's why you see "local data" - it's SharePoint, not Dataverse!

---

## The Solution (3 Steps)

### Step 1: Create Dataverse Service File

1. Copy the file: `example-dataverseService.ts` from this repo
2. Save it as: `src/services/dataverseService.ts` in your project
3. This file has all the CRUD operations for Dataverse

### Step 2: Replace SharePoint Imports in Your Components

Find all files that use `sharepointService.ts` and replace them:

**BEFORE (SharePoint):**
```typescript
import { getListItems } from './services/sharepointService';

// Getting data from SharePoint
const deliverables = await getListItems('Deliverables');
```

**AFTER (Dataverse):**
```typescript
import { useGetDeliverables } from './services/dataverseService';

// Getting data from Dataverse
function MyComponent() {
  const { data: deliverables, isLoading } = useGetDeliverables();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {deliverables?.map(d => (
        <div key={d.crda8_deliverablesid}>{d.crda8_name}</div>
      ))}
    </div>
  );
}
```

### Step 3: Update Your Components

#### Example 1: List Component

**BEFORE:**
```typescript
// Using SharePoint
const [deliverables, setDeliverables] = useState([]);

useEffect(() => {
  async function load() {
    const items = await getListItems('Deliverables');
    setDeliverables(items);
  }
  load();
}, []);
```

**AFTER:**
```typescript
// Using Dataverse
import { useGetDeliverables } from '../services/dataverseService';

function DeliverablesList() {
  const { data: deliverables, isLoading, error } = useGetDeliverables();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {deliverables?.map(d => (
        <li key={d.crda8_deliverablesid}>{d.crda8_name}</li>
      ))}
    </ul>
  );
}
```

#### Example 2: Create Component

**BEFORE:**
```typescript
// Creating in SharePoint
async function handleCreate() {
  await createListItem('Deliverables', newItem);
}
```

**AFTER:**
```typescript
// Creating in Dataverse
import { useCreateDeliverable } from '../services/dataverseService';

function CreateDeliverable() {
  const createMutation = useCreateDeliverable();

  async function handleCreate() {
    await createMutation.mutateAsync({
      crda8_name: 'New Deliverable',
      crda8_status: 0,
      crda8_active: true,
    });
  }

  return <button onClick={handleCreate}>Create</button>;
}
```

#### Example 3: Update Component

**BEFORE:**
```typescript
// Updating SharePoint
await updateListItem('Deliverables', itemId, updates);
```

**AFTER:**
```typescript
// Updating Dataverse
import { useUpdateDeliverable } from '../services/dataverseService';

function UpdateDeliverable({ deliverableId }) {
  const updateMutation = useUpdateDeliverable();

  async function handleUpdate() {
    await updateMutation.mutateAsync({
      id: deliverableId,
      data: {
        crda8_status: 3, // Completed
        crda8_completionpercentage: 100,
      },
    });
  }

  return <button onClick={handleUpdate}>Mark Complete</button>;
}
```

---

## Step 4: Search and Replace

### Find all SharePoint imports:

```powershell
# In your project folder
Get-ChildItem -Path src -Recurse -Filter "*.tsx","*.ts" | Select-String "sharepointService"
```

### Replace them with Dataverse:

For each file found:
1. Remove: `import ... from './services/sharepointService'`
2. Add: `import { useGetDeliverables, useCreateDeliverable, ... } from './services/dataverseService'`
3. Update the component to use React Query hooks

---

## Step 5: Install Dependencies (If Needed)

Your project might need React Query:

```powershell
npm install @tanstack/react-query
```

Then wrap your app in `App.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
    </QueryClientProvider>
  );
}
```

---

## Step 6: Test

```powershell
# Clear previous build
Remove-Item -Path dist -Recurse -Force -ErrorAction SilentlyContinue

# Run with Power Platform CLI (NOT npm run dev)
pac code run

# Or build and push
npm run build
pac code push
```

When the app loads, open browser DevTools (F12) → Network tab.

You should see requests to:
```
https://pwc-us-adv-poc.crm.dynamics.com/api/data/v9.0/crda8_deliverabless
```

NOT:
```
https://graph.microsoft.com/v1.0/sites/...
```

---

## Quick Win: Test ONE Component First

Don't change everything at once! Start with one component:

1. Pick your simplest list view (e.g., Deliverables list)
2. Replace just that component with Dataverse
3. Test it works
4. Then do the others

---

## Common Issues

### Issue 1: "CORS Error"

**Fix:** Use `pac code run` instead of `npm run dev`

### Issue 2: "401 Unauthorized"

**Fix:** Re-authenticate:
```powershell
pac auth clear
pac auth create --environment https://pwc-us-adv-poc.crm.dynamics.com
```

### Issue 3: "Table not found"

**Fix:** Check table names match power.config.json EXACTLY:
- `crda8_deliverabless` (with double 's' at the end)
- `crda8_staff4s`
- `crda8_workstreamss`

### Issue 4: "Can't find module @tanstack/react-query"

**Fix:**
```powershell
npm install @tanstack/react-query
```

---

## Files to Change

Based on your structure, you probably need to update:

1. `src/pages/` - All page components
2. `src/components/` - Any components that fetch data
3. `src/services/sharepointService.ts` - Delete or rename to `.backup`
4. `src/App.tsx` - Add QueryClientProvider

---

## Need Help?

Show me ONE component file that uses SharePoint, and I'll convert it to Dataverse for you as an example.

For instance, show me:
```powershell
cat src/pages/DeliverablesList.tsx
# or whatever your main list page is called
```

And I'll give you the exact Dataverse version!
