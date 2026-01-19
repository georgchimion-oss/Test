# Claude Context Guide for Project Governance DVUI

**Last Updated:** Jan 19, 2026 - 03:20 PM EST
**Last Successful Push:** Jan 19, 2026 - 03:15 PM EST (fix-dvui-build.ps1 v2)

---

## Project Overview

Georg is building a **Project Governance Dashboard** as a **Power Apps Code App** connected to **Dataverse** (NOT SharePoint - SharePoint is not supported for Code Apps).

There are **TWO separate apps**:

| App | Status | Purpose |
|-----|--------|---------|
| **Project Governance DV** | ✅ Working | The original app, fully functional |
| **Project Governance DVUI** | ✅ Now Working | Enhanced UI version with Lovable components |

---

## Technical Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + PwC custom CSS (`pwc_compat.css`, `pwc_light_mode.css`)
- **Data:** Dataverse tables with `crda8_` prefix
- **Auth:** Microsoft SSO (MSAL) configured in `AuthContext.tsx`
- **State:** React Query + localStorage caching
- **Deployment:** `pac code push` to Power Apps

---

## Dataverse Tables (5 tables)

| Table | Logical Name |
|-------|--------------|
| Deliverables | `crda8_deliverables` |
| Staff | `crda8_staff4` |
| Workstreams | `crda8_workstreams` |
| Time Off Requests | `crda8_timeoffrequests` |
| Weekly Hours | `crda8_weeklyhours` |

---

## File Locations

### On Georg's PwC Laptop (Windows)
```
C:\Users\gchimion001\OneDrive - PwC\Desktop\VSCODE\PowerAppsRepoPWC\VSCODE\project-governance-dvui
```

### On Georg's Personal GitHub
```
https://github.com/georgchimion-oss/Test
Branch: claude/powerapp-sharepoint-deliverables-vbZKv
```

### Key Files in the Repo
- `fix-dvui-build.ps1` - **THE SCRIPT** Claude updates for Georg to execute
- `CODEX_PROJECT_CONTEXT.md` - High-level project context
- `CODEX_COMPLETE_GUIDE.md` - Dataverse integration guide
- `CODEX_INSTRUCTIONS.md` - Detailed instructions
- `dvui save/` - Backup of working DVUI state
- `lovable-app-organized/` - Fancy Lovable UI components to integrate

---

## Current App State (as of Jan 19, 2026)

### Working Screens (14 total)
1. DashboardEnhanced.tsx - Main dashboard with cards/table/kanban views
2. Deliverables.tsx - Deliverable management
3. Staff.tsx - Staff management
4. Workstreams.tsx - Workstream management
5. Kanban.tsx - Kanban board view
6. Gantt.tsx - Gantt chart view
7. PTORequests.tsx - PTO request management
8. HoursTracking.tsx - Hours logging
9. OrgChartHierarchy.tsx - Org chart by hierarchy
10. OrgChartWorkstream.tsx - Org chart by workstream
11. AdminAnalytics.tsx - Admin analytics & CSV import
12. Login.tsx - Login screen
13. Dashboard.tsx - Old dashboard (route: /dashboard-old)

### Disabled/Backed Up
- **CommandCenter.tsx** - Renamed to `.bak`, needs mockData→dataLayer conversion
- **src/components/dashboard/** - Backed up, uses mockData
- **src/components/layout/Header.tsx** - Backed up, uses mockData
- **src/components/layout/AppSidebar.tsx** - Backed up, uses mockData
- **src/components/layout/MainLayout.tsx** - Backed up, imports removed files
- **calendar.tsx, chart.tsx, resizable.tsx** - Deleted due to type errors

### Backup Location
```
src\_lovable_backup_20260119_142119\
```

---

## How Claude Delivers Code to Georg

**IMPORTANT:** Georg's PwC laptop connects to PwC GitHub, NOT his personal GitHub. Claude cannot push directly to PwC GitHub.

### The Workflow:
1. Claude updates `fix-dvui-build.ps1` (or other scripts) in `/tmp/Test/`
2. Claude commits and pushes to Georg's personal GitHub
3. Georg runs this command on PwC laptop:
   ```powershell
   Invoke-WebRequest -Uri "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv/fix-dvui-build.ps1" -OutFile "fix-dvui-build.ps1"; .\fix-dvui-build.ps1
   ```
4. Script executes, builds, and pushes to Power Apps

### Script Naming Convention
- `fix-dvui-build.ps1` - Main fix/build script
- Any new scripts should follow pattern: `action-description.ps1`

---

## Data Layer Architecture

### Current (Working)
- `src/data/dataLayer.ts` - Main data functions (getStaff, getDeliverables, etc.)
- `src/data/auditLayer.ts` - Audit logging
- Uses localStorage for caching
- Syncs with Dataverse via `syncDataverseData()`

### DO NOT USE
- `@/data/mockData` - This file doesn't exist! Lovable components reference it but it's not compatible.

---

## What Needs to Be Done Next (Lovable Integration)

Georg wants to integrate the fancy UI from `lovable-app-organized/` into DVUI:

### Lovable Components to Integrate
1. **Gantt chart** - Better than current
2. **Kanban view** - Better styling
3. **Resource planning** - New feature
4. **CommandCenter** - Animated dashboard with metrics

### The Challenge
Lovable components use `@/data/mockData` which doesn't exist. They need to be converted to use `dataLayer.ts` functions instead:
- `mockData.deliverables` → `getDeliverables()`
- `mockData.workstreams` → `getWorkstreams()`
- `mockData.teamMembers` → `getStaff()`
- `mockData.currentUser` → `useAuth().currentUser`

### Integration Strategy
1. One component at a time
2. Update imports from mockData to dataLayer
3. Adjust type definitions to match existing types
4. Test locally with `npm run dev`
5. Build and push via script

---

## Common Commands

### On PwC Laptop (PowerShell)
```powershell
# Navigate to project
cd "C:\Users\gchimion001\OneDrive - PwC\Desktop\VSCODE\PowerAppsRepoPWC\VSCODE\project-governance-dvui"

# Download and run latest script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv/fix-dvui-build.ps1" -OutFile "fix-dvui-build.ps1"; .\fix-dvui-build.ps1

# Manual build
npm run build

# Manual push
pac code push

# Check Power Apps auth
pac auth list
```

### For Claude (on Georg's MacBook via Claude Code)
```bash
# Clone/update repo
cd /tmp && rm -rf Test && git clone --branch claude/powerapp-sharepoint-deliverables-vbZKv https://github.com/georgchimion-oss/Test.git

# After editing files
cd /tmp/Test && git add . && git commit -m "message" && git push origin claude/powerapp-sharepoint-deliverables-vbZKv
```

---

## Power Apps URLs

- **DVUI App:** `https://apps.powerapps.com/play/e/deccb389-10c5-4d5c-8716-1093a04538e1/app/a951bd8f-2c6d-4250-85d9-23fd25297bab`
- **Environment ID:** `deccb389-10c5-4d5c-8716-1093a04538e1`
- **App ID:** `a951bd8f-2c6d-4250-85d9-23fd25297bab`

---

## Key Learnings / Gotchas

1. **SharePoint NOT supported** for Code Apps - only Dataverse works
2. **Backup folders get compiled** - Must add to tsconfig.json exclude
3. **`.bak` files get compiled** - Must add `**/*.bak` to exclude
4. **PowerShell regex is tricky** - Complex JSX patterns often fail, manual fix is faster
5. **npm install can be slow** on PwC network - individual installs work better
6. **pac code push** requires auth - check with `pac auth list`

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| Jan 19, 2026 15:15 | v2 | Fixed build - excluded backup folders, removed broken UI components, disabled CommandCenter |
| Jan 19, 2026 14:30 | v1 | Initial script - installed deps, backed up mockData components |

---

## Contact / Sessions

- **Georg's MacBook:** Claude Code in VS Code (this session)
- **Georg's PwC Laptop:** VS Code with Codex (ran out of credits)
- **Georg's Personal PC:** Claude Code in browser (had connection issues)

**Remember:** Sessions are isolated. If context is lost, read this file first!
