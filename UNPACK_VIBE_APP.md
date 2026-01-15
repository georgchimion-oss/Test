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

### Step 2: Check if Vibe Created a GitHub Repo (Usually YES)

**Vibe apps are CODE COMPONENT apps, not canvas apps!**

1. Go to **vibe.powerapps.com** → Your project
2. Look for **GitHub repository** link in settings
3. If you see it, **just clone the repo** - you're done!

```bash
git clone https://github.com/your-org/your-vibe-app.git
cd your-vibe-app
npm install
npm start
```

**If no GitHub repo is visible**, proceed to Step 3.

### Step 3: Download via Power Platform CLI

Code apps can't be downloaded like canvas apps. You need to export the **solution** they're in.

```bash
# Login to your environment
pac auth create --environment https://yourorg.crm.dynamics.com

# List solutions (your app is in one of these)
pac solution list

# Find your solution name (look for one matching your app name)
# Then export it
pac solution export \
  --name YourSolutionName \
  --path ./my-app.zip \
  --managed false

# Unpack to source code
pac solution unpack \
  --zipfile ./my-app.zip \
  --folder ./my-app-src \
  --processCanvasApps
```

**See UNPACK_CODE_APPS.md for detailed commands and troubleshooting.**

### Step 4: Find Your Code in the Unpacked Solution

After unpacking, your code component is in:

```
./my-app-src/
└── Other/
    └── Customizations/
        └── YourPCFControl/          ← Your code is here!
            ├── ControlManifest.Input.xml
            ├── package.json
            ├── index.ts
            └── src/
                ├── index.tsx
                ├── components/
                │   ├── KanbanBoard.tsx    ← Edit this!
                │   └── KanbanCard.tsx
                └── services/
                    └── dataverseService.ts ← Dataverse connection!
```

```bash
# Navigate to your component
cd ./my-app-src/Other/Customizations/YourPCFControl/

# Install dependencies
npm install

# Start development
npm start
```

### Step 5: Understand the Dataverse Connection

Once you have the source code, look for:

**File: `src/services/dataverseService.ts`** or similar

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

### Step 6: Edit Locally

```bash
# Navigate to your PCF control
cd ./my-app-src/Other/Customizations/YourPCFControl/

# Install dependencies
npm install

# Start local development (with hot reload)
npm start

# Or use Power Platform Tools in VS Code
# Install extension: "Power Platform Tools" by Microsoft
```

### Step 7: Build and Deploy Your Changes

```bash
# Build your component
npm run build

# Go back to solution root
cd ../../../..  # Back to my-app-src/

# Pack the solution
pac solution pack --zipfile ../my-app-updated.zip --folder .

# Import to environment
pac solution import --path ../my-app-updated.zip
```

**Alternative: Direct push (if supported)**
```bash
pac code push --environment https://yourorg.crm.dynamics.com
```

### Step 8: Verify in PowerApps

1. Go to **make.powerapps.com** → **Apps**
2. Open your app
3. Your changes should be visible
4. Test CRUD operations still work with Dataverse

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

## Recommended Workflow for Code Apps

```
1. Create app in vibe.powerapps.com → Get Dataverse configured
2. Clone from GitHub OR export solution → Get source code
3. Edit locally in VS Code → Customize React components
4. npm run build → pac solution pack/import → Deploy
5. Test in PowerApps → Verify Dataverse CRUD works
6. Repeat steps 3-5 as needed
```

**For detailed pac commands, see: UNPACK_CODE_APPS.md**

---

## Next Steps

1. Create your Kanban app in **vibe.powerapps.com**
2. Test it works (CRUD operations)
3. Clone/download the source code
4. Find the Dataverse service file
5. Edit only the UI components
6. Deploy with `pac code push`

This approach ensures your Dataverse tables are configured correctly from the start!
