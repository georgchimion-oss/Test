# Dataverse Tables Setup for Code-First PowerApps

## Part 1: Create Dataverse Table for Deliverables

### 1. Create the Table in Dataverse

Go to **make.powerapps.com** → **Tables** → **New table** → **New table**

**Table Properties:**
- Display name: `Deliverable`
- Plural name: `Deliverables`
- Primary column: `Deliverable Name`

### 2. Add Columns to Match Your SharePoint List

| Column Name | Data Type | Notes |
|------------|-----------|-------|
| Deliverable Name | Text | (Primary column) |
| Description | Multiline Text | |
| Workstream | Lookup | Link to Workstreams table |
| Owner | Lookup | Link to User/Staff table |
| Status | Choice | Options: Not Started, In Progress, In Review, Completed |
| Target Date | Date | Date only |
| Testing Date | Date | |
| Partner Review Date | Date | |
| Client Review Date | Date | |
| Milestone | Text | |
| Dependencies | Multiline Text | |
| Notes | Multiline Text | |
| Active | Yes/No | |
| Comment | Multiline Text | |
| Risk | Choice | Options: Low, Medium, High |
| Risk Description | Multiline Text | |
| Completion Percentage | Whole Number | 0-100 |
| Completion Date | Date | |

### 3. Important: Create Choice Columns Correctly

For **Status** choice column:
```
Not Started
In Progress
In Review
Completed
```

For **Risk** choice column:
```
Low
Medium
High
```

---

## Part 2: Configure Your Code App to Use Dataverse

### 1. Update Your Environment File

In your code app project, you should have a file like `environmentVariables.json` or similar.

Add your Dataverse connection:

```json
{
  "dataverse": {
    "environmentUrl": "https://yourorg.crm.dynamics.com",
    "tables": {
      "deliverables": "cr123_deliverable",
      "workstreams": "cr123_workstream",
      "staff": "cr123_staff"
    }
  }
}
```

**Find your environment URL:**
- Go to **make.powerapps.com**
- Top right corner → Settings (gear icon) → **Developer resources**
- Copy **Instance url**

**Find your table logical names:**
- Go to **Tables** → Open your table → **Properties**
- Look for **Logical name** (usually starts with your publisher prefix like `cr123_`)

### 2. Install Dataverse SDK in Your React App

```bash
npm install @microsoft/powerplatform-dataverse-webapi
```

### 3. Create a Dataverse Service File

Create `src/services/dataverseService.ts`:

```typescript
import { WebApiClient } from '@microsoft/powerplatform-dataverse-webapi';

const client = new WebApiClient();

export interface Deliverable {
  cr123_deliverableid?: string; // Primary key
  cr123_deliverablename: string;
  cr123_description?: string;
  cr123_status?: number; // Choice field (0, 1, 2, 3)
  cr123_targetdate?: string;
  cr123_completionpercentage?: number;
  cr123_active?: boolean;
  // Add other fields
}

// READ: Get all active deliverables
export async function getDeliverables(): Promise<Deliverable[]> {
  const response = await client.retrieveMultipleRecords(
    'cr123_deliverable', // Your table logical name
    '?$filter=cr123_active eq true&$orderby=cr123_targetdate asc'
  );
  return response.entities as Deliverable[];
}

// READ: Get deliverables by status
export async function getDeliverablesByStatus(status: number): Promise<Deliverable[]> {
  const response = await client.retrieveMultipleRecords(
    'cr123_deliverable',
    `?$filter=cr123_status eq ${status} and cr123_active eq true`
  );
  return response.entities as Deliverable[];
}

// WRITE: Create new deliverable
export async function createDeliverable(data: Deliverable): Promise<string> {
  const response = await client.createRecord('cr123_deliverable', data);
  return response.id;
}

// WRITE: Update deliverable
export async function updateDeliverable(id: string, data: Partial<Deliverable>): Promise<void> {
  await client.updateRecord('cr123_deliverable', id, data);
}

// WRITE: Delete (deactivate) deliverable
export async function deleteDeliverable(id: string): Promise<void> {
  await client.updateRecord('cr123_deliverable', id, {
    cr123_active: false
  });
}
```

### 4. Use in Your React Components

```typescript
import React, { useEffect, useState } from 'react';
import { getDeliverablesByStatus } from './services/dataverseService';

export const KanbanBoard: React.FC = () => {
  const [notStarted, setNotStarted] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [inReview, setInReview] = useState([]);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [ns, ip, ir, c] = await Promise.all([
      getDeliverablesByStatus(0), // Not Started
      getDeliverablesByStatus(1), // In Progress
      getDeliverablesByStatus(2), // In Review
      getDeliverablesByStatus(3), // Completed
    ]);

    setNotStarted(ns);
    setInProgress(ip);
    setInReview(ir);
    setCompleted(c);
  };

  return (
    <div className="kanban-board">
      {/* Your Kanban UI */}
    </div>
  );
};
```

### 5. Deploy with pac code push

```bash
# Build your React app
npm run build

# Push to your environment
pac code push --environment https://yourorg.crm.dynamics.com
```

---

## Part 3: Security & Permissions

### Grant App Permissions

Your app needs permission to read/write Dataverse tables:

1. **Make.powerapps.com** → **Apps** → Your code app → **Settings**
2. **Security** → **App permissions**
3. Add tables: `Deliverables`, `Workstreams`, `Staff`
4. Grant: **Read**, **Write**, **Create**, **Delete**

### User Security Roles

Users need proper security roles:

1. **Settings** (gear icon) → **Advanced settings**
2. **Security** → **Security Roles**
3. Ensure users have a role with access to your custom tables
4. Or create a custom role with specific permissions

---

## Common Issues & Fixes

### Issue 1: "Entity does not exist" error

**Fix:** Use the **logical name**, not display name
- ❌ `deliverables`
- ✅ `cr123_deliverable`

### Issue 2: Choice field values not showing

**Fix:** Choice fields are stored as numbers:
```typescript
// Map choice values
const statusMap = {
  0: 'Not Started',
  1: 'In Progress',
  2: 'In Review',
  3: 'Completed'
};
```

### Issue 3: Lookup fields returning GUIDs

**Fix:** Use `$expand` in queries:
```typescript
const response = await client.retrieveMultipleRecords(
  'cr123_deliverable',
  '?$expand=cr123_workstream($select=cr123_name),cr123_owner($select=fullname)'
);
```

### Issue 4: CORS errors in local development

**Fix:** You need to test in the actual PowerApps environment or use Power Platform Tools extension in VS Code

---

## Next Steps

1. Create Dataverse tables in make.powerapps.com
2. Note down all logical names
3. Install Dataverse SDK in your React app
4. Create service layer for CRUD operations
5. Test locally with VS Code Power Platform Tools
6. Deploy with `pac code push`

---

**Pro Tip:** Dataverse is MUCH better than SharePoint lists for PowerApps because:
- Built-in security model
- Better relationships between tables
- Faster queries
- Automatic auditing
- Better scalability
- Native PowerApps integration
