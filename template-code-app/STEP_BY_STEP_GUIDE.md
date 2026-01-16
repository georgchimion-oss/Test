# Step-by-Step Guide: From Template to Working App

This guide walks you through using the template to create a working Power Apps Code App with Dataverse.

## Prerequisites

- ✅ Power Platform CLI installed
- ✅ Access to your PWC environment (`https://pwc-us-adv-poc.crm.dynamics.com`)
- ✅ Dataverse tables already created (Staff, Deliverables, etc.)
- ✅ Node.js installed

---

## Phase 1: Download and Setup (5 minutes)

### Step 1: Clone on Your PWC Laptop

```bash
# Open PowerShell or VS Code terminal
cd C:\Users\gchimion001\Desktop\VSCODE\PowerAppsRepoPwC\VSCODE

# Clone the repo (if not already)
git clone https://github.com/georgchimion-oss/Test.git

# Navigate to template
cd Test/template-code-app
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- React & React DOM
- @tanstack/react-query (for data fetching)
- @microsoft/power-apps-data (Dataverse SDK)
- Vite (build tool)
- TypeScript
- And other dependencies

### Step 3: Verify Power Platform CLI

```bash
pac --version
```

If you see a version number, you're good. If not, install from: https://aka.ms/PowerAppsCLI

---

## Phase 2: Configure Your App (10 minutes)

### Step 4: Authenticate to Your Environment

```bash
# Clear any old auth
pac auth clear

# Login to your PWC environment
pac auth create --environment https://pwc-us-adv-poc.crm.dynamics.com

# Verify
pac auth list
```

You should see your environment listed as active.

### Step 5: Get Your App ID

**Option A: Create New App**
```bash
# Initialize a new code app
pac code init --displayname "Project Governance Tool"
```

This creates an app and gives you an App ID.

**Option B: Use Existing App**
- Go to make.powerapps.com → Apps
- Find your app → Details
- Copy the App ID

### Step 6: Update power.config.json

Open `power.config.json` and replace:
```json
"appId": "YOUR_APP_ID_HERE"
```

With your actual App ID:
```json
"appId": "92b3eb2d-bfcc-49ce-9c50-79b2d456c9af"
```

---

## Phase 3: Add Your Dataverse Tables (15 minutes)

This is the CRITICAL step that generates all the code for you.

### Step 7: Add Deliverables Table

```bash
pac code add-data-source -a dataverse -t crda8_deliverables
```

**What this does:**
- Reads the table schema from Dataverse
- Generates `generated/hooks/useDeliverables.ts`
- Generates `generated/models/deliverables-model.ts`
- Generates `generated/services/deliverables-service.ts`
- Generates `generated/validators/deliverables-validator.ts`
- Updates `power.config.json` with correct entity set name

**Wait for it to complete** (takes 10-30 seconds)

### Step 8: Add Staff Table

```bash
pac code add-data-source -a dataverse -t crda8_staff4
```

Same process - generates all the files for Staff.

### Step 9: Add Remaining Tables

```bash
pac code add-data-source -a dataverse -t crda8_workstreams
pac code add-data-source -a dataverse -t crda8_timeoffrequests
pac code add-data-source -a dataverse -t crda8_weeklyhours
```

### Step 10: Verify Generated Files

Check that these folders now exist:
```bash
ls src/generated/hooks/
ls src/generated/models/
ls src/generated/services/
ls src/generated/validators/
```

You should see files for each table you added.

---

## Phase 4: Create Your UI (20 minutes)

### Step 11: Create a Staff List Page

Create `src/pages/staff.tsx`:

```typescript
import { useStaffList } from '@/generated/hooks/useStaff';

export default function StaffPage() {
  const { data: staff, isLoading, error } = useStaffList({
    orderBy: ['name asc']
  });

  if (isLoading) return <div>Loading staff...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Staff</h1>
      <ul>
        {staff?.map(s => (
          <li key={s.id}>{s.name} - {s.email}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Step 12: Add Route to App

Update `src/app.tsx` to include your new page:

```typescript
import StaffPage from '@/pages/staff';

// In your Routes:
<Route path="/staff" element={<StaffPage />} />
```

### Step 13: Test Locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

Navigate to /staff and you should see your staff data from Dataverse!

---

## Phase 5: Build and Deploy (5 minutes)

### Step 14: Build for Production

```bash
npm run build
```

This creates `dist/` folder with compiled code.

### Step 15: Push to Power Apps

```bash
pac code push
```

This uploads your app to Power Apps.

### Step 16: Test in Power Apps

- Go to make.powerapps.com → Apps
- Find "Project Governance Tool"
- Click to open
- Your app should load with REAL Dataverse data!

---

## Phase 6: Add More Features (Optional)

### Add Create Functionality

```typescript
import { useCreateStaff } from '@/generated/hooks/useStaff';

function AddStaffForm() {
  const createMutation = useCreateStaff();
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      name: name,
      email: `${name.toLowerCase()}@pwc.com`,
      // ... other required fields
    });
    setName(''); // Clear form
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Staff name"
      />
      <button type="submit">Add Staff</button>
    </form>
  );
}
```

### Add Update Functionality

```typescript
import { useUpdateStaff } from '@/generated/hooks/useStaff';

function EditStaffButton({ staffId }) {
  const updateMutation = useUpdateStaff();

  const handleUpdate = async () => {
    await updateMutation.mutateAsync({
      id: staffId,
      changedFields: {
        name: 'Updated Name'
      }
    });
  };

  return <button onClick={handleUpdate}>Update</button>;
}
```

### Add Delete Functionality

```typescript
import { useDeleteStaff } from '@/generated/hooks/useStaff';

function DeleteStaffButton({ staffId }) {
  const deleteMutation = useDeleteStaff();

  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      await deleteMutation.mutateAsync(staffId);
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

---

## Common Issues and Solutions

### Issue 1: "pac: command not found"

**Solution:**
Install Power Platform CLI from https://aka.ms/PowerAppsCLI

OR if you have .NET:
```bash
dotnet tool install --global Microsoft.PowerApps.CLI.Tool
```

### Issue 2: "Failed to add data source"

**Solution:**
```bash
# Re-authenticate
pac auth clear
pac auth create --environment https://pwc-us-adv-poc.crm.dynamics.com

# Try again
pac code add-data-source -a dataverse -t crda8_staff4
```

### Issue 3: "Table not found"

**Solution:**
- Verify the table exists in make.powerapps.com → Tables
- Use the LOGICAL NAME (singular), not entity set name (plural)
- Example: `crda8_staff4`, NOT `crda8_staff4s`

### Issue 4: "Import errors after pac code add-data-source"

**Solution:**
The generated hooks use `@/generated/` paths. Make sure your `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue 5: "404 errors when fetching data"

**Solution:**
This usually means the entity set name is wrong. Re-run:
```bash
pac code add-data-source -a dataverse -t [your-table-logical-name]
```

This will overwrite the config with the correct names.

---

## Verification Checklist

Before deploying, verify:

- [ ] `pac auth list` shows your environment
- [ ] `power.config.json` has your App ID
- [ ] `src/generated/` folder exists with hooks/models/services
- [ ] `npm run dev` starts without errors
- [ ] Local app at http://localhost:5173 shows data
- [ ] `npm run build` completes successfully
- [ ] `pac code push` uploads without errors
- [ ] App opens in make.powerapps.com
- [ ] Data loads from Dataverse (not hardcoded)

---

## Next Steps

Once you have the basic list working:

1. ✅ Add filtering (use the `filter` option in hooks)
2. ✅ Add sorting (use the `orderBy` option)
3. ✅ Add Create/Edit/Delete forms
4. ✅ Add more tables (Deliverables, Workstreams, etc.)
5. ✅ Style with Tailwind CSS or your preferred library
6. ✅ Add authentication UI
7. ✅ Add error boundaries
8. ✅ Add loading skeletons

---

## Success!

If you followed all steps, you now have:
- ✅ A working Code App
- ✅ Connected to Dataverse
- ✅ Displaying real data
- ✅ Ready to build features

**This is the foundation. Now you can build your complete governance tool on top of it!**
