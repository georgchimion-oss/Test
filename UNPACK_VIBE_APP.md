# How to Unpack and Edit Vibe PowerApps Locally

## Yes, You Can Definitely Do This!

This is actually the **recommended approach** - start with a working app from vibe.powerapps.com that already has Dataverse tables configured, then customize it locally.

---

## Step-by-Step Process

### Step 1: Create App in Vibe

1. Go to **vibe.powerapps.com**
2. Describe your Kanban board for deliverables
3. Let Vibe create the app with Dataverse tables already configured
4. **Test it** - make sure CRUD operations work
5. Note the **App Name** (you'll need this)

### Step 2: Find Your App in Power Platform

1. Go to **make.powerapps.com**
2. Click **Apps** → Find your Vibe-created app
3. Click **...** (three dots) → **Details**
4. Copy the **App ID** (looks like: `abc123-def456-ghi789`)

### Step 3: Download the App

#### Option A: Using Power Platform CLI (Recommended)

```bash
# Login to your environment
pac auth create --environment https://yourorg.crm.dynamics.com

# List all apps to find yours
pac application list

# Download the app package
pac application download --application-id YOUR-APP-ID --path ./my-vibe-app.zip
```

#### Option B: Manual Export from Portal

1. **make.powerapps.com** → **Apps**
2. Select your app → **Export package**
3. Download the `.zip` file
4. Extract it

### Step 4: Unpack for Local Development

```bash
# Create a folder for your app
mkdir my-kanban-app
cd my-kanban-app

# Unpack the .msapp or code component
pac canvas unpack --msapp ./my-vibe-app.msapp --sources ./src

# OR if it's a code component app:
pac pcf init --namespace YourNamespace --name KanbanApp --template dataset
pac pcf push --import
```

**IMPORTANT:** Vibe apps are usually **code component apps**, not traditional canvas apps. Check what type you have:

- **Canvas App** → Use `pac canvas unpack`
- **Code Component App** → Already in source code format, just clone the repository

### Step 5: Check if It's Already a Code Component

Vibe apps created with React are likely already code components. Check:

1. In **make.powerapps.com** → **Apps** → Your app
2. If it says **"Code component"** or **"Custom page"**, it's already code
3. You can find the source repository linked in the app details

### Step 6: Clone from GitHub (If Vibe Created a Repo)

Vibe often creates a GitHub repository automatically:

1. **vibe.powerapps.com** → Your app → **Settings**
2. Look for **GitHub repository** link
3. Clone it:

```bash
git clone https://github.com/your-org/your-vibe-app.git
cd your-vibe-app
npm install
```

### Step 7: Understand the Dataverse Connection

Once you have the source code, look for:

**File: `src/services/dataServices.ts`** or similar

```typescript
// Vibe likely created something like this:
export const fetchDeliverables = async () => {
  const records = await webAPI.retrieveMultipleRecords(
    'cr123_deliverable',
    '?$select=cr123_deliverableid,cr123_name,cr123_status'
  );
  return records.entities;
};
```

**This is the gold!** The Dataverse table names and column names are already configured correctly.

### Step 8: Edit Locally

```bash
# Install dependencies
npm install

# Start local development
npm start

# Or use Power Platform Tools in VS Code
# Install extension: "Power Platform Tools" by Microsoft
```

### Step 9: Test Your Changes

```bash
# Build the app
npm run build

# Deploy to your environment
pac code push --environment https://yourorg.crm.dynamics.com
```

### Step 10: Verify in PowerApps

1. Go to **make.powerapps.com** → **Apps**
2. Your app should show your changes
3. Test CRUD operations still work

---

## Example: Editing a Vibe-Generated Kanban Board

Let's say Vibe created a basic Kanban board. You want to add:
- Collapsible sidebar
- Progress bars
- Better styling

### 1. Find the Kanban Component

```bash
# In your unpacked code
src/
  components/
    KanbanBoard.tsx    ← Edit this
    KanbanCard.tsx     ← Edit this
  services/
    dataverseService.ts ← DON'T change table names here!
```

### 2. Edit the Component

```typescript
// src/components/KanbanBoard.tsx

import React, { useState, useEffect } from 'react';
import { fetchDeliverables } from '../services/dataverseService';

export const KanbanBoard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [deliverables, setDeliverables] = useState([]);

  // The Dataverse connection is already set up by Vibe!
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await fetchDeliverables(); // This already works!
    setDeliverables(data);
  };

  return (
    <div className="kanban-container">
      {/* Add your custom UI here */}
      <Sidebar collapsed={sidebarCollapsed} />
      <KanbanColumns data={deliverables} />
    </div>
  );
};
```

### 3. Keep the Dataverse Service As-Is

**DON'T modify** `src/services/dataverseService.ts` unless you need to add new fields. Vibe already configured the table names correctly.

### 4. Deploy Changes

```bash
npm run build
pac code push
```

---

## Key Files to Look For

When you unpack/clone a Vibe app, look for these files:

| File | Purpose |
|------|---------|
| `ControlManifest.Input.xml` | Defines the code component |
| `package.json` | Dependencies and scripts |
| `src/index.ts` | Entry point |
| `src/services/*.ts` | **Dataverse connection configs** |
| `src/components/*.tsx` | React components you can edit |
| `.env` | Environment variables |

---

## Pro Tips

### Tip 1: Don't Break the Dataverse Schema

The Vibe app already has the correct:
- Table logical names (`cr123_deliverable`)
- Column logical names (`cr123_status`)
- Choice value mappings (0, 1, 2, 3)

**Keep these as-is!** Only modify the UI/UX.

### Tip 2: Use Existing Queries as Templates

Vibe created working queries. Copy them:

```typescript
// Vibe created this (working):
const existing = await client.retrieveMultipleRecords(
  'cr123_deliverable',
  '?$select=cr123_name'
);

// Add your own (same pattern):
const byStatus = await client.retrieveMultipleRecords(
  'cr123_deliverable',
  '?$filter=cr123_status eq 1&$select=cr123_name,cr123_completionpercentage'
);
```

### Tip 3: Test Locally with Power Platform Tools

Install **Power Platform Tools** extension in VS Code:
- Real-time debugging
- Connect to your Dataverse environment
- See live data while coding

### Tip 4: Version Control Your Changes

```bash
git checkout -b add-sidebar-feature
# Make your changes
git commit -m "Add collapsible sidebar to Kanban"
git push origin add-sidebar-feature
```

---

## Common Questions

**Q: Will my changes break the Dataverse connection?**
A: No, as long as you don't change the table/column logical names in the service layer.

**Q: Can I add new Dataverse tables to a Vibe app?**
A: Yes! Just create the table in make.powerapps.com and add queries in your service layer.

**Q: How do I know the correct logical names?**
A: Look at the existing `dataverseService.ts` file - Vibe already used the correct names.

**Q: Can I switch from Vibe to my own app?**
A: Yes, but it's easier to start with Vibe (tables configured) and edit it.

---

## Recommended Workflow

```
1. Create basic app in Vibe → Get working Dataverse connection
2. Export/clone the app → Get source code
3. Edit locally in VS Code → Customize UI/UX
4. pac code push → Deploy changes
5. Test in PowerApps → Verify everything works
6. Repeat steps 3-5 as needed
```

---

## Next Steps

1. Create your Kanban app in **vibe.powerapps.com**
2. Test it works (CRUD operations)
3. Clone/download the source code
4. Find the Dataverse service file
5. Edit only the UI components
6. Deploy with `pac code push`

This approach ensures your Dataverse tables are configured correctly from the start!
