# Quick Start: Export Your Vibe App

Based on your environment: `https://pwc-us-adv-poc.crm.dynamics.com/`

## The Right Commands

```powershell
# You're already authenticated ✓
# Environment: https://pwc-us-adv-poc.crm.dynamics.com/

# ❌ DON'T USE: pac application list (for canvas apps only)
# ✅ USE THIS: pac solution list (for code apps)

pac solution list
```

This will show all your solutions. Look for one related to your Vibe project (likely named something like "project-governance-vibe" based on your folder path).

---

## Full Workflow for Your Vibe App

### Step 1: List Solutions

```powershell
pac solution list
```

**Output will look like:**
```
Display Name: Project Governance Vibe
Name: ProjectGovernanceVibe
Version: 1.0.0.0
```

### Step 2: Export the Solution

```powershell
# Use the "Name" (not Display Name) from the list above
pac solution export `
  --name ProjectGovernanceVibe `
  --path ./vibe-app.zip `
  --managed false
```

### Step 3: Unpack to Source Code

```powershell
pac solution unpack `
  --zipfile ./vibe-app.zip `
  --folder ./vibe-app-src `
  --processCanvasApps
```

### Step 4: Find Your Code

```powershell
# Navigate to the unpacked code
cd ./vibe-app-src/Other/Customizations/

# List folders to find your PCF control
ls
```

Your React/TypeScript code will be in one of those folders!

### Step 5: Open in VS Code

```powershell
# Go to your PCF control folder
cd YourControlName

# Install dependencies
npm install

# Open in VS Code
code .
```

---

## Alternative: Check for GitHub Repo First

Before exporting, check if Vibe created a GitHub repo:

1. Go to **vibe.powerapps.com**
2. Open your project
3. Look for **GitHub repository** link
4. If you see it, just clone that repo instead!

```powershell
git clone https://github.com/your-org/project-governance-vibe.git
cd project-governance-vibe
npm install
code .
```

This is much faster if available!

---

## Why pac application list Failed

| Command | What It Lists | Your Error |
|---------|--------------|------------|
| `pac application list` | Canvas apps (.msapp) | ❌ 401 Error - Not relevant for code apps |
| `pac solution list` | Solutions (contains code apps) | ✅ This is what you need |
| `pac pcf list` | PCF controls | ✅ Alternative option |

**Vibe apps are PCF controls inside solutions, NOT canvas apps!**

---

## Next Commands to Run

```powershell
# 1. List solutions (find your Vibe app's solution)
pac solution list

# 2. Look at the output, find the solution name

# 3. Export it (replace with your actual solution name)
pac solution export --name YourSolutionName --path ./app.zip --managed false

# 4. Unpack it
pac solution unpack --zipfile ./app.zip --folder ./src --processCanvasApps

# 5. Navigate to your code
cd ./src/Other/Customizations/
ls
```

---

## Troubleshooting 401 Errors

If `pac solution list` also gives 401 errors, try:

```powershell
# Re-authenticate with admin mode
pac auth clear
pac auth create --environment https://pwc-us-adv-poc.crm.dynamics.com/

# Verify authentication
pac auth list

# Try listing solutions again
pac solution list
```

If still failing, you may need:
- System Administrator or System Customizer role in the environment
- "Export solutions" permission

Check with your Power Platform admin if needed.

---

## Your Exact Next Step

Run this in PowerShell:

```powershell
pac solution list
```

Then send me the output - I'll help you identify which solution to export!
