# Claude Context Guide for Project Governance DVUI

**Last Updated:** Jan 20, 2026 - 8:50 PM EST
**Last Successful Push:** Jan 20, 2026 - 8:45 PM EST (fix-dvui-build.ps1 v11)
**Current Script Version:** v11 (IN PROGRESS - Org Chart)

## CURRENT STATUS: v11 IN PROGRESS - Org Chart Enhancement

**ISSUE:** Workstream colors are all the same. Need to assign unique colors.

**WHAT'S BEEN DONE for v11:**
- Created new unified OrgChart.tsx (replaces OrgChartHierarchy.tsx and OrgChartWorkstream.tsx)
- Beautiful modern card design with gradients, shadows, hover animations
- Toggle between Workstreams and Hierarchy views
- Expand/Collapse all buttons
- Stats bar showing team composition by title
- Updated App.tsx - single `/org-chart` route
- Updated Layout.tsx - single Org Chart nav link
- Removed color picker from Workstreams.tsx (colors weren't persisting to Dataverse anyway)
- Added `getWorkstreamColor(name)` function in dataLayer.ts to assign colors based on name hash

**PROBLEM TO FIX:**
The hash function is giving same colors to multiple workstreams. Need a better approach - maybe just cycle through colors in alphabetical order of workstream names.

## NEXT STEPS
1. Fix workstream color assignment - use alphabetical index instead of hash
2. Test the build
3. Push and deploy

---

## CRITICAL: Read This First!

If you're a new Claude session, READ THIS ENTIRE FILE before doing anything.

**DO NOT:**
- Clone repos unnecessarily (the repo is already at `/tmp/Test/`)
- Use mockData (it doesn't exist!)
- Suggest git pull on PwC laptop (it connects to PwC GitHub, not personal GitHub)
- Use jsdelivr CDN (caching issues) - use raw.githubusercontent.com instead

**DO:**
- Update `fix-dvui-build.ps1` in `/tmp/Test/`
- Push to Georg's personal GitHub
- Give Georg this command with cache-busting:
```powershell
$ts = Get-Date -Format 'yyyyMMddHHmmss'
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv/fix-dvui-build.ps1?t=$ts" -OutFile "fix-dvui-build.ps1" -Headers @{"Cache-Control"="no-cache"; "Pragma"="no-cache"}; .\fix-dvui-build.ps1
```

---

## Project Overview

Georg is building a **Project Governance Dashboard** as a **Power Apps Code App** connected to **Dataverse**.

| App | Status | Purpose |
|-----|--------|---------|
| **Project Governance DV** | Working | The original app |
| **Project Governance DVUI** | Working | Enhanced UI version |

---

## Technical Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Inline styles (Tailwind doesn't work in Power Apps)
- **Data:** Dataverse tables with `crda8_` prefix
- **Auth:** Microsoft SSO (MSAL) in `AuthContext.tsx`
- **State:** React Query + localStorage caching
- **Deployment:** `pac code push` to Power Apps

---

## Dataverse Tables

| Table | Logical Name |
|-------|--------------|
| Deliverables | `crda8_deliverables` |
| Staff | `crda8_staff4` |
| Workstreams | `crda8_workstreams` |
| Time Off Requests | `crda8_timeoffrequests` |
| Weekly Hours | `crda8_weeklyhours` |

**NOTE:** Workstreams table does NOT have a color field. Colors are assigned client-side.

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

### Local Clone for Claude (MacBook)
```
/tmp/Test/
```

### Key Files
| File | Purpose |
|------|---------|
| `fix-dvui-build.ps1` | THE SCRIPT - Claude updates, Georg executes |
| `CLAUDE_CONTEXT_GUIDE.md` | THIS FILE - context for new sessions |
| `dvui save/` | The actual source code |

---

## Current Screens

1. ProjectOverview.tsx - Landing page with KPI cards (route: `/`)
2. DashboardEnhanced.tsx - My Work (route: `/my-work`)
3. Deliverables.tsx - Deliverable management
4. Staff.tsx - Staff management
5. Workstreams.tsx - Workstream management (color picker removed)
6. Kanban.tsx - Kanban board with Dataverse persistence
7. Gantt.tsx - Gantt chart
8. PTORequests.tsx - PTO request management
9. HoursTracking.tsx - Hours logging
10. **OrgChart.tsx** - NEW unified org chart (route: `/org-chart`)
11. AdminAnalytics.tsx - Admin analytics & CSV import
12. Login.tsx - Login screen

---

## Data Layer

**Use dataLayer.ts (synchronous, localStorage):**
```typescript
import { getDeliverables, getStaff, getWorkstreams } from '../data/dataLayer'
const deliverables = getDeliverables()
```

**Workstream color function (in dataLayer.ts):**
```typescript
function getWorkstreamColor(name: string): string {
  const colors = ['#D04A02', '#2563eb', '#059669', '#f59e0b', '#7c3aed', '#ec4899', '#06b6d4', '#84cc16']
  // Currently uses hash - needs to be changed to alphabetical index
  ...
}
```

---

## Key Learnings / Gotchas

1. **Tailwind doesn't work** in Power Apps - use inline styles
2. **Backup folders get compiled** - Add to tsconfig.json exclude
3. **CDN caching is aggressive** - use raw.githubusercontent.com with cache-busting params
4. **BUILD_STAMP verification** - DashboardEnhanced.tsx has BUILD_STAMP constant
5. **Workstream colors not in Dataverse** - assigned client-side based on name

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| Jan 20, 2026 20:50 | v11 | **ORG CHART** - New unified OrgChart.tsx, workstream colors (IN PROGRESS) |
| Jan 20, 2026 03:45 | v10 | **PROJECT OVERVIEW** - KPI landing page working |
| Jan 19, 2026 22:50 | v7 | **15 FUN THEMES** |

---

## Quick Reference Commands

### For Claude (on MacBook):
```bash
cd /tmp/Test && git add . && git commit -m "description" && git push origin claude/powerapp-sharepoint-deliverables-vbZKv
```

### For Georg (on PwC Laptop):
```powershell
$ts = Get-Date -Format 'yyyyMMddHHmmss'
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv/fix-dvui-build.ps1?t=$ts" -OutFile "fix-dvui-build.ps1" -Headers @{"Cache-Control"="no-cache"; "Pragma"="no-cache"}; .\fix-dvui-build.ps1
```

---

## Sessions are isolated. If context is lost, read this file FIRST!
