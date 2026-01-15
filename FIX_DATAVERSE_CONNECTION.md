# Fix Dataverse Connection in Your Local Code App

## The Problem

Your Vibe app works perfectly with Dataverse in the cloud, but your local copy (in the PWC repo) is using local/mock data instead of connecting to Dataverse.

## The Solution

You need to configure your local app to use the same Dataverse connection as the Vibe app.

---

## Step 1: Check Your power.config.json

In your local project folder, open `power.config.json`:

```json
{
  "applicationName": "Project Governance Tool",
  "description": "Governance tool for leaders and teams to manage workstreams, deliverables, tasks, risks, and staff operations efficiently.",
  "buildVersion": "1.0.0.0",
  "connectionReferences": [],
  "dataConnections": [
    {
      "entityName": "crdab_deliverables",
      "displayName": "Deliverables",
      "logicalName": "crdab_deliverables",
      "isHidden": false
    },
    {
      "entityName": "crdab_staff",
      "displayName": "Staff",
      "logicalName": "crdab_staff",
      "isHidden": false
    },
    {
      "entityName": "crdab_timeoffrequests",
      "displayName": "TimeOffRequests",
      "logicalName": "crdab_timeoffrequests",
      "isHidden": false
    },
    {
      "entityName": "crdab_weeklyhours",
      "displayName": "WeeklyHours",
      "logicalName": "crdab_weeklyhours",
      "isHidden": false
    },
    {
      "entityName": "crdab_workstreams",
      "displayName": "Workstreams",
      "logicalName": "crdab_workstreams",
      "isHidden": false
    }
  ],
  "environmentVariableNames": []
}
```

**If your file is missing the `dataConnections` section, ADD IT!**

---

## Step 2: Check Your Service Files

Look in `src/services/` for files that fetch data. They should use Dataverse Web API, NOT local data.

### ❌ WRONG (Local Data):

```typescript
// This uses hardcoded local data
const deliverables = [
  { id: 1, name: "Deliverable 1", status: "In Progress" },
  { id: 2, name: "Deliverable 2", status: "Completed" }
];

export const getDeliverables = () => deliverables;
```

### ✅ CORRECT (Dataverse):

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetDeliverables = () => {
  return useQuery({
    queryKey: ['deliverables'],
    queryFn: async () => {
      // This calls Dataverse
      const response = await fetch(
        `${window.location.origin}/api/data/v9.2/crdab_deliverables?$select=crdab_deliverablesid,crdab_name,crdab_status`
      );
      return response.json();
    }
  });
};
```

---

## Step 3: Find the Correct Service Files in Vibe

Go back to **vibe.powerapps.com** → Your app → **App** tab (code view)

Look for files in `src/services/` or `src/models/` that show HOW the Vibe app connects to Dataverse.

From your screenshots, I can see files like:
- `deliverable-service.ts` (or similar)
- `staff-service.ts`
- `supervisor-store.ts`

**Copy the EXACT code from those Vibe files to your local files!**

---

## Step 4: Authentication Setup

For local development, you need to authenticate to Dataverse.

### Update Your Environment

```bash
# In your project folder
pac auth create --environment https://pwc-us-adv-poc.crm.dynamics.com

# Verify
pac auth list
```

### Add .env File

Create a `.env` file in your project root:

```env
VITE_DATAVERSE_URL=https://pwc-us-adv-poc.crm.dynamics.com
VITE_DATAVERSE_API_VERSION=v9.2
```

### Update Your Service to Use Environment Variables

```typescript
const DATAVERSE_URL = import.meta.env.VITE_DATAVERSE_URL;
const API_VERSION = import.meta.env.VITE_DATAVERSE_API_VERSION;

export const getDeliverables = async () => {
  const response = await fetch(
    `${DATAVERSE_URL}/api/data/${API_VERSION}/crdab_deliverables`
  );
  return response.json();
};
```

---

## Step 5: Copy Files Directly from Vibe

The EASIEST way to fix this:

### Option A: Export from Vibe (If Possible)

Look in Vibe for an export/download option to get the full working code.

### Option B: Manually Copy Each File

1. Open Vibe in browser: `vibe.powerapps.com` → Your app
2. Open VS Code with your local project
3. For each file in Vibe's `src/services/` and `src/models/`:
   - Copy the content from Vibe
   - Paste into your local version
   - Save

Focus on these files:
- `src/models/deliverable-models.ts` ✅ (You have this)
- `src/models/staff-models.ts` ✅
- `src/services/deliverable-service.ts` ⚠️ (Check if this uses Dataverse)
- `src/services/supervisor-store.ts` ⚠️

---

## Step 6: Check for Mock Data / Local Data

Search your codebase for hardcoded data:

```bash
# In your project folder
grep -r "const.*=.*\[" src/
grep -r "mockData" src/
grep -r "localData" src/
```

If you find hardcoded arrays or mock data, REPLACE them with Dataverse queries.

---

## Step 7: Test the Connection

```bash
# Run your local app
npm run dev

# Open browser console (F12)
# Check for network requests to Dataverse

# You should see requests like:
# GET https://pwc-us-adv-poc.crm.dynamics.com/api/data/v9.2/crdab_deliverables
```

If you DON'T see Dataverse requests, your services are still using local data!

---

## Step 8: Common Issues & Fixes

### Issue 1: "CORS Error"

**Fix:** Run `pac code run` instead of `npm run dev`:

```bash
pac code run
```

This uses Power Platform's proxy to avoid CORS issues.

### Issue 2: "401 Unauthorized"

**Fix:** Re-authenticate:

```bash
pac auth clear
pac auth create --environment https://pwc-us-adv-poc.crm.dynamics.com
```

### Issue 3: "Table not found"

**Fix:** Double-check the table names. From your screenshots, they are:
- `crdab_deliverables` (NOT `Deliverables`)
- `crdab_staff` (NOT `Staff`)
- Case matters!

---

## The Real Fix: Copy Vibe's Working Code

Since your Vibe app WORKS with Dataverse, the fastest solution:

1. Open Vibe app in browser
2. Navigate through ALL files in `src/services/` and `src/models/`
3. Copy EACH file's content
4. Paste into your local project
5. This gives you the EXACT working Dataverse integration

---

## Key Files to Check Right Now

In your local project:

```bash
# Check power.config.json
cat power.config.json

# Check if services use Dataverse
cat src/services/*.ts | grep -i "fetch\|query\|dataverse"

# Check for mock data
grep -r "const.*\[\s*{" src/ | head -20
```

Show me the output and I'll tell you exactly what's wrong!
