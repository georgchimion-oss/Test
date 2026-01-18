# Create New -dvui App for UI Testing

This guide shows how to create a **separate** -dvui app to test Lovable UI changes while keeping your working -dv app intact.

## Why Two Apps?

- **-dv app** = Your working production app with current UI
- **-dvui app** = Testing ground for Lovable UI experiments

Both connect to the same Dataverse tables, but are completely separate apps in Power Apps.

---

## Step 1: Create New Folder

```powershell
# Navigate to your project root (where -dv folder is)
cd C:\Users\gchimion001\Desktop\VSCODE\PowerAppsRepoPwC\VSCODE\Test

# Create new folder for dvui app
mkdir project-governance-dvui
cd project-governance-dvui
```

---

## Step 2: Initialize New Code App

```powershell
# Initialize with a DIFFERENT name than your -dv app
pac code init --displayname "Project Governance DVUI"
```

**What this does:**
- Creates `power.config.json` with a NEW App ID
- Creates basic folder structure (src/, public/, etc.)
- Sets up package.json

**IMPORTANT:** Copy the App ID it gives you - you'll need it later.

---

## Step 3: Install Dependencies

```powershell
npm install
```

This installs React, TypeScript, Vite, and all the base packages.

---

## Step 4: Authenticate with Dataverse

```powershell
# Clear any old auth (if needed)
pac auth clear

# Login to PWC environment
pac auth create --environment https://pwc-us-adv-poc.crm.dynamics.com

# Verify it worked
pac auth list
```

---

## Step 5: Add Your Dataverse Tables

Run these commands **one by one** (wait for each to finish):

```powershell
pac code add-data-source -a dataverse -t crda8_deliverables
pac code add-data-source -a dataverse -t crda8_staff4
pac code add-data-source -a dataverse -t crda8_workstreams
pac code add-data-source -a dataverse -t crda8_timeoffrequests
pac code add-data-source -a dataverse -t crda8_weeklyhours
```

**What this does:**
- Auto-generates TypeScript models in `src/generated/models/`
- Creates React hooks in `src/generated/hooks/`
- Sets up services in `src/generated/services/`
- Creates validators in `src/generated/validators/`

---

## Step 6: Copy Your Existing App Code

Now copy your working code from the -dv app:

```powershell
# Copy your components, services, and app structure from -dv app
# Example (adjust paths as needed):
xcopy ..\project-governance-dv\src\components src\components /E /I /Y
xcopy ..\project-governance-dv\src\services src\services /E /I /Y
xcopy ..\project-governance-dv\src\App.tsx src\App.tsx /Y
xcopy ..\project-governance-dv\src\main.tsx src\main.tsx /Y
xcopy ..\project-governance-dv\src\index.css src\index.css /Y
```

**OR** manually copy the folders you need:
- `src/components/` - Your React components
- `src/services/` - Your business logic
- `src/types/` - Your TypeScript types
- Any other custom folders/files

---

## Step 7: Add Lovable UI Components

Now copy in the Lovable UI components you want to test:

```powershell
# Create lovable components folder
mkdir src\components\lovable

# Copy Lovable components from your lovable-app-organized folder
# (adjust path to wherever you have them)
xcopy ..\..\lovable-app-organized\src\components src\components\lovable /E /I /Y
```

---

## Step 8: Test Locally

```powershell
pac code run
```

Opens at http://localhost:5173 - verify it works.

---

## Step 9: Build and Deploy

```powershell
npm run build
pac code push
```

---

## Step 10: Verify in Power Apps

- Go to https://make.powerapps.com
- Click **Apps**
- You should see **TWO** apps now:
  - "Project Governance DV" (your original)
  - "Project Governance DVUI" (your new testing app)

---

## Working with Both Apps

### To work on -dv app (production):
```powershell
cd C:\Users\gchimion001\Desktop\VSCODE\PowerAppsRepoPwC\VSCODE\Test\project-governance-dv
pac code run
```

### To work on -dvui app (UI testing):
```powershell
cd C:\Users\gchimion001\Desktop\VSCODE\PowerAppsRepoPwC\VSCODE\Test\project-governance-dvui
pac code run
```

Both can run at the same time on different ports if needed.

---

## How to Make UI Changes in -dvui

1. Make your UI changes in `project-governance-dvui/src/components/`
2. Test locally: `pac code run`
3. If it works, deploy: `npm run build && pac code push`
4. Test in Power Apps by opening the "Project Governance DVUI" app
5. Once validated, copy the changes to your -dv app

---

## Key Differences Between Apps

| Aspect | -dv app | -dvui app |
|--------|---------|-----------|
| App ID | Original ID | New ID from init |
| Purpose | Production/working version | UI testing |
| Data | Same Dataverse tables | Same Dataverse tables |
| Code | Current working code | Experimental UI code |
| Name in Power Apps | "Project Governance DV" | "Project Governance DVUI" |

---

## Common Issues

### "pac not found" or "pac.exe in wrong folder"
**Fix:** You must run `pac code init --displayname "Name"` in the folder first.

### "Failed to add data source"
**Fix:** Re-authenticate:
```powershell
pac auth clear
pac auth create --environment https://pwc-us-adv-poc.crm.dynamics.com
```

### "Can't find module XYZ"
**Fix:** Make sure you ran `npm install` after init.

### Both apps showing same thing
**Fix:** They are separate apps with different App IDs. Check you're editing the right folder.

---

## Summary

1. ✅ Create new folder `project-governance-dvui`
2. ✅ Run `pac code init --displayname "Project Governance DVUI"`
3. ✅ Run `npm install`
4. ✅ Authenticate with `pac auth create`
5. ✅ Add Dataverse tables with `pac code add-data-source`
6. ✅ Copy existing app code from -dv folder
7. ✅ Add Lovable UI components
8. ✅ Test with `pac code run`
9. ✅ Deploy with `npm run build && pac code push`
10. ✅ You now have two apps to work with!

---

## Quick Command Reference

```powershell
# Setup new app
mkdir project-governance-dvui
cd project-governance-dvui
pac code init --displayname "Project Governance DVUI"
npm install
pac auth create --environment https://pwc-us-adv-poc.crm.dynamics.com

# Add tables (one at a time)
pac code add-data-source -a dataverse -t crda8_deliverables
pac code add-data-source -a dataverse -t crda8_staff4
pac code add-data-source -a dataverse -t crda8_workstreams
pac code add-data-source -a dataverse -t crda8_timeoffrequests
pac code add-data-source -a dataverse -t crda8_weeklyhours

# Copy code from -dv app (adjust paths)
xcopy ..\project-governance-dv\src src /E /I /Y

# Test and deploy
pac code run
npm run build
pac code push
```

Done! You can now experiment with UI in -dvui without touching your working -dv app.
