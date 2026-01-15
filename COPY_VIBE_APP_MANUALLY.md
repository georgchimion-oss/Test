# How to Manually Copy Your Vibe App Files

Since there's no export button visible in Vibe, you can manually copy all files from the browser.

## Step 1: Create Local Project Structure

```powershell
# Create project folder
mkdir vibe-app-local
cd vibe-app-local

# Initialize with pac code
pac code init --displayname "Governance Control Center"

# This creates basic structure:
# - package.json
# - power.config.json
# - src/
# - tsconfig.json
```

## Step 2: Copy Files One by One from Vibe

Open **vibe.powerapps.com** → Your app → **App** tab (code view)

### Root Level Files

1. **power.config.json**
   - Click the file in Vibe
   - Select all content (Ctrl+A)
   - Copy (Ctrl+C)
   - Paste into your local `power.config.json`
   - Save

2. **design.md** (if exists)
   - Same process

### Copy src/ Folder Structure

For EACH file in Vibe's `src/` folder:

```powershell
# Create the folders first
mkdir src/assets
mkdir src/components
mkdir src/components/system
mkdir src/components/ui
mkdir src/extensions
mkdir src/generated
mkdir src/hooks
mkdir src/lib
mkdir src/models
mkdir src/pages
mkdir src/services
mkdir src/validations
```

### Copy Each File

For each TypeScript/TSX file:

1. Click the file in Vibe browser
2. Select all (Ctrl+A)
3. Copy (Ctrl+C)
4. Create same file locally in VS Code
5. Paste (Ctrl+V)
6. Save

**Priority files to copy first:**

1. `power.config.json` ⭐ (Has Dataverse table names)
2. `src/main.tsx` ⭐ (App entry point)
3. `src/app.tsx` ⭐ (Main app component)
4. All files in `src/models/` ⭐⭐⭐ (Data models with Dataverse tables)
5. All files in `src/services/` ⭐⭐⭐ (Dataverse queries)
6. All files in `src/components/`
7. All files in `src/pages/`

## Step 3: Use Browser DevTools to Copy Multiple Files

### Advanced Method - Copy from Network Tab:

1. Open Vibe app in browser
2. Open DevTools (F12)
3. Go to **Network** tab
4. Click on each file in Vibe
5. Look for network requests that load file content
6. Copy response data

### Even Faster - Use Browser Console:

```javascript
// In browser console on vibe.powerapps.com
// This might work to get file list

// Get all file elements
const files = document.querySelectorAll('[data-file-path]');
files.forEach(f => console.log(f.getAttribute('data-file-path')));

// Or try to get file contents (may not work due to security)
```

## Step 4: Critical Files Checklist

Make sure you copy these in order:

- [ ] `power.config.json` - **MOST IMPORTANT**
- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `src/main.tsx`
- [ ] `src/app.tsx`
- [ ] `src/index.css`
- [ ] `src/models/deliverable-models.ts`
- [ ] `src/models/staff-models.ts`
- [ ] `src/models/workstream-models.ts`
- [ ] `src/models/common-models.ts`
- [ ] `src/services/` (ALL files)
- [ ] `src/components/` (ALL files)
- [ ] `src/pages/` (ALL files)
- [ ] `src/hooks/` (ALL files)
- [ ] `src/lib/` (ALL files)

## Step 5: Test After Copying

```powershell
# Install dependencies
npm install

# Try to run
npm run dev

# Or better, use Power Platform CLI
pac code run
```

## Step 6: Compare File Count

In Vibe browser, count files in each folder.

In your local folder:
```powershell
# Count files
(Get-ChildItem -Path src -Recurse -File).Count
```

Make sure counts match!

---

## Alternative: Use Screenshot + OCR (Last Resort)

If you can see the code but can't select it:

1. Take screenshots of each file
2. Use OCR tool to extract text
3. Fix any OCR errors manually

**Better option:** Contact Microsoft Support to ask how to export from Vibe.

---

## Easier Solution: Focus on Your Working Local App

Since you already have a local app that you can push with `pac code push`, it might be FASTER to:

1. Fix the Dataverse connection in your local app
2. Add features from Vibe app manually
3. Rather than copying the entire Vibe app

**This is what I recommend - let's fix your local app's Dataverse connection first!**
