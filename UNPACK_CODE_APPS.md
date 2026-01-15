# How to Download and Unpack Code Component Apps

## Key Difference: Code Apps vs Canvas Apps

| Type | Format | How to Get Source Code |
|------|--------|----------------------|
| **Canvas App** | .msapp file | `pac canvas unpack` |
| **Code Component App (PCF)** | Already source code | `pac solution export` + extract |
| **Vibe-generated App** | Usually in GitHub | Clone the repo |

---

## Method 1: List and Export Code Apps (Recommended)

### Step 1: Login to Your Environment

```bash
# Login
pac auth create --environment https://yourorg.crm.dynamics.com

# Verify login
pac auth list
```

### Step 2: List All Apps

```bash
# List canvas apps
pac application list

# List PCF controls (code components)
pac pcf list

# List solutions (code apps are usually in solutions)
pac solution list
```

### Step 3: Find Your Code App

Code apps are typically **custom pages** or **PCF controls** inside a solution.

```bash
# Export the solution containing your code app
pac solution export \
  --name YourSolutionName \
  --path ./MyCodeApp.zip \
  --managed false
```

### Step 4: Unpack the Solution

```bash
# Unpack the solution
pac solution unpack \
  --zipfile ./MyCodeApp.zip \
  --folder ./MyCodeApp-src \
  --processCanvasApps
```

Now your code app source is in `./MyCodeApp-src/`!

---

## Method 2: Clone from Source Control (Vibe Apps)

If your app was created with Vibe, it likely has a GitHub repository already.

### Step 1: Find the Repository

1. Go to **make.powerapps.com** → **Apps**
2. Find your app → Click **Edit**
3. Look for **Source control** or **GitHub** link in settings
4. Or check **Vibe.powerapps.com** → Your project → **Settings** → **Repository**

### Step 2: Clone It

```bash
git clone https://github.com/your-org/your-vibe-app.git
cd your-vibe-app
npm install
```

Done! The source code is already there.

---

## Method 3: Download Code Component Directly

If it's a standalone PCF control (not in a solution):

### Step 1: List PCF Controls

```bash
pac pcf list
```

### Step 2: Create Local Project and Pull

```bash
# Initialize a new PCF project locally
pac pcf init \
  --namespace Contoso \
  --name KanbanApp \
  --template dataset

# Pull the existing control configuration
pac pcf push --import
```

Note: This recreates the project structure locally.

---

## Method 4: Export as Unmanaged Solution (Most Reliable)

This works for ANY code app.

### Full Commands:

```bash
# 1. Login
pac auth create --environment https://yourorg.crm.dynamics.com

# 2. List solutions to find yours
pac solution list

# 3. Export the solution
pac solution export \
  --name YourSolutionName \
  --path ./exported.zip \
  --managed false

# 4. Unpack to source code
pac solution unpack \
  --zipfile ./exported.zip \
  --folder ./src \
  --processCanvasApps

# 5. Navigate to the code component
cd ./src/Other/Customizations
# Your PCF control source will be in a subfolder here
```

---

## What You'll Find After Unpacking

### Directory Structure:

```
./MyCodeApp-src/
├── src/
│   ├── Other/
│   │   └── Customizations/
│   │       └── YourPCFControl/
│   │           ├── ControlManifest.Input.xml
│   │           ├── index.ts
│   │           ├── package.json
│   │           └── src/
│   │               ├── index.tsx          ← Your React code!
│   │               ├── components/
│   │               │   ├── KanbanBoard.tsx
│   │               │   └── KanbanCard.tsx
│   │               └── services/
│   │                   └── dataverseService.ts  ← Dataverse connection!
│   └── Solution.xml
└── ...
```

---

## Quick Reference Commands

```bash
# Login
pac auth create --environment https://yourorg.crm.dynamics.com

# List everything
pac solution list          # Solutions
pac application list       # Canvas apps
pac pcf list              # PCF controls

# Export solution with code app
pac solution export --name MySolution --path ./app.zip --managed false

# Unpack to source code
pac solution unpack --zipfile ./app.zip --folder ./src --processCanvasApps

# After editing, repack
pac solution pack --zipfile ./updated.zip --folder ./src

# Import back to environment
pac solution import --path ./updated.zip
```

---

## Vibe-Specific: Direct Clone

If you created the app in **vibe.powerapps.com**, it automatically creates a GitHub repo.

### Find Your Repo:

1. **vibe.powerapps.com** → Projects
2. Click your project
3. Look for **GitHub repository** link
4. Clone: `git clone <repo-url>`

The source code is **already there** - no unpacking needed!

---

## Example Workflow: Edit a Vibe Code App

```bash
# 1. Login to Power Platform
pac auth create --environment https://yourorg.crm.dynamics.com

# 2. List your solutions
pac solution list

# Example output:
# Display Name: KanbanSolution
# Name: cr123_KanbanSolution

# 3. Export the solution
pac solution export \
  --name cr123_KanbanSolution \
  --path ./kanban.zip \
  --managed false

# 4. Unpack to source
pac solution unpack \
  --zipfile ./kanban.zip \
  --folder ./kanban-src \
  --processCanvasApps

# 5. Find your code component
cd ./kanban-src/Other/Customizations/cr123_KanbanControl/

# 6. Install dependencies
npm install

# 7. Start local development
npm start

# 8. Edit your React components
code src/components/KanbanBoard.tsx

# 9. Build
npm run build

# 10. Pack the solution
cd ../../../../  # Back to kanban-src root
pac solution pack --zipfile ../kanban-updated.zip --folder .

# 11. Import to environment
pac solution import --path ../kanban-updated.zip
```

---

## Troubleshooting

### "pac solution export" says solution not found

```bash
# List with more details
pac solution list --environment https://yourorg.crm.dynamics.com

# Make sure you're logged in to the right environment
pac auth list
```

### Can't find the code component after unpacking

Code components are usually in:
- `./src/Other/Customizations/<ControlName>/`
- Or `./src/Controls/<ControlName>/`

```bash
# Search for it
find . -name "ControlManifest.Input.xml"
find . -name "index.tsx"
```

### Vibe app has no GitHub repo visible

Some Vibe apps don't expose the repo directly. Use the solution export method instead:

1. Find your app's solution name in **make.powerapps.com**
2. Export and unpack that solution
3. Edit locally
4. Repack and import

---

## Summary: Best Approach

**For Vibe Apps:**
1. Clone from GitHub (if available)
2. Or export solution → unpack → edit

**For Custom Code Apps:**
1. Export solution
2. Unpack solution
3. Find PCF control folder
4. Edit React/TypeScript code
5. Repack solution
6. Import back

**Key Command:**
```bash
pac solution export --name YourSolution --path ./app.zip --managed false
pac solution unpack --zipfile ./app.zip --folder ./src --processCanvasApps
```

This gets you the actual source code!
