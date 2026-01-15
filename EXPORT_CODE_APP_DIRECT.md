# Export Code Apps That Aren't in Custom Solutions

Based on your screenshots, "Governance Control Center" shows as a Code app but isn't in your solutions list.

## Try These Commands

### Option 1: Check Default Solution

```powershell
# The app might be in the Default Solution
pac solution export --name Default --path ./default.zip --managed false

# Then unpack
pac solution unpack --zipfile ./default.zip --folder ./default-src --processCanvasApps
```

### Option 2: Use pac code command

```powershell
# Try to list code components
pac code list

# Or try to pull the code directly
pac code pull --environment https://pwc-us-adv-poc.crm.dynamics.com/
```

### Option 3: Export by App Name

```powershell
# Try exporting the app by name (not sure if this works for code apps, but worth trying)
pac application export --name "Governance Control Center" --path ./governance.zip

# Or by app ID (get ID from make.powerapps.com -> App details)
pac application export --application-id <APP-ID> --path ./governance.zip
```

### Option 4: Check Which Solution It's In

Go to **make.powerapps.com**:

1. Click on "Governance Control Center" app
2. Click the **...** (three dots) → **Details**
3. Look for **"Solution"** field - it will tell you which solution it belongs to
4. Then export that specific solution

### Option 5: Search Solutions for "governance"

```powershell
# List all solutions and search for governance-related ones
pac solution list | Select-String -Pattern "governance" -CaseSensitive:$false

# Or list ALL solutions including system ones
pac solution list --include-system
```

### Option 6: Clone from Source Control

Since your folder path shows: `C:\Users\gchimion001\OneDrive - PwC\Desktop\VSCODE\PowerAppsRepoPwC\VSCODE\project-governance-vibe`

This suggests there might already be a local copy or Git repo!

Check if there's a `.git` folder in that directory:

```powershell
cd "C:\Users\gchimion001\OneDrive - PwC\Desktop\VSCODE\PowerAppsRepoPwC\VSCODE\project-governance-vibe"

# Check if it's a git repo
git status

# If it is, check remote
git remote -v

# If there's a GitHub remote, you already have the source!
```

### Option 7: Check in Vibe

Go to **vibe.powerapps.com**:
- Look for "Governance Control Center" project
- Check if there's a GitHub repository link
- Clone that repo if available

---

## My Next Suggestion

**Try Option 4 first** (check the app details in make.powerapps.com to see which solution it's in).

Then try **Option 6** (check if you already have source code locally in that VSCODE folder).

Let me know what you find!
