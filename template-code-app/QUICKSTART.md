# Quick Start - 5 Minutes to Working App

Follow these exact steps to go from template to working app.

## Step 1: Download on PWC Laptop (1 minute)

```powershell
# Open PowerShell or VS Code terminal
cd C:\Users\gchimion001\Desktop\VSCODE\PowerAppsRepoPwC\VSCODE

# Clone or pull latest
git clone https://github.com/georgchimion-oss/Test.git
# OR if already cloned:
cd Test
git pull origin claude/powerapp-sharepoint-deliverables-vbZKv

# Navigate to template
cd template-code-app
```

## Step 2: Install Dependencies (1 minute)

```powershell
npm install
```

## Step 3: Configure App ID (1 minute)

Edit `power.config.json` and replace `YOUR_APP_ID_HERE` with your actual App ID.

**To get your App ID:**
- Go to make.powerapps.com → Apps
- Find your app → Details
- Copy the App ID

**OR create a new app:**
```powershell
pac code init --displayname "Project Governance Tool"
# Copy the App ID it gives you
```

## Step 4: Authenticate (30 seconds)

```powershell
# Clear old auth
pac auth clear

# Login
pac auth create --environment https://pwc-us-adv-poc.crm.dynamics.com

# Verify
pac auth list
```

## Step 5: Add Your Tables (2 minutes)

Run these commands one by one:

```powershell
pac code add-data-source -a dataverse -t crda8_deliverables
pac code add-data-source -a dataverse -t crda8_staff4
pac code add-data-source -a dataverse -t crda8_workstreams
pac code add-data-source -a dataverse -t crda8_timeoffrequests
pac code add-data-source -a dataverse -t crda8_weeklyhours
```

**Wait for each to complete** (10-30 seconds each).

## Step 6: Test Locally (Optional)

```powershell
pac code run
```

Opens at http://localhost:5173 - you should see the starter page.

## Step 7: Build and Deploy

```powershell
npm run build
pac code push
```

## Step 8: Open in Power Apps

- Go to make.powerapps.com → Apps
- Find "Project Governance Tool"
- Click to open
- ✅ Your app is now live!

---

## What Just Happened?

1. `npm install` - Installed React, Dataverse SDK, React Query, etc.
2. `pac auth create` - Connected to your PWC Dataverse environment
3. `pac code add-data-source` - Auto-generated hooks, models, services for each table
4. `npm run build` - Compiled your React app
5. `pac code push` - Uploaded to Power Apps

---

## Next Steps

Now you can build features! See:
- `EXAMPLE_USAGE.md` - Copy/paste examples for Staff list, Deliverables, etc.
- `STEP_BY_STEP_GUIDE.md` - Detailed walkthrough
- `README.md` - Full documentation

---

## Verify It Worked

Check these folders were created:
```powershell
ls src/generated/hooks
ls src/generated/models
ls src/generated/services
ls src/generated/validators
```

You should see files for each table you added.

---

## Common Issues

### "pac: command not found"
Install from: https://aka.ms/PowerAppsCLI

### "Failed to add data source"
Re-authenticate:
```powershell
pac auth clear
pac auth create --environment https://pwc-us-adv-poc.crm.dynamics.com
```

### "Table not found"
Make sure you're using the **logical name** (singular):
- ✅ `crda8_staff4`
- ❌ `crda8_staff4s`

---

## You're Done!

You now have a working Code App connected to Dataverse. Start building by copying examples from `EXAMPLE_USAGE.md`.
