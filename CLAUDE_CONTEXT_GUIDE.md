# Claude Context Guide for Project Governance DVUI

**Last Updated:** Jan 20, 2026 - 11:00 PM EST
**Last Successful Push:** Jan 20, 2026 - 11:00 PM EST (fix-dvui-build.ps1 v16)
**Current Script Version:** v16 (STABLE)

## CURRENT STATUS: v16 STABLE - All Features Working

**COMPLETED IN v16:**
- Staff screen: Workstreams column (colored badges)
- Staff screen: Skills column (colored badges)
- Staff screen: Search by name, email, title, workstream, or skill
- Skills input uses onBlur (allows typing commas)
- Skills save to Dataverse (`crda8_skills` column)
- types/index.ts downloaded by script (Staff interface with skills property)
- 20 distinct workstream colors (consistent across app)
- Unified Org Chart with toggle views

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

| Table | Logical Name | Notes |
|-------|--------------|-------|
| Deliverables | `crda8_deliverables` | |
| Staff | `crda8_staff4` | Has `crda8_skills` column (comma-separated string) |
| Workstreams | `crda8_workstreams` | No color field - colors assigned client-side |
| Time Off Requests | `crda8_timeoffrequests` | |
| Weekly Hours | `crda8_weeklyhours` | |

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
| `dvui save/src/types/index.ts` | TypeScript interfaces (Staff with skills) |
| `dvui save/src/data/dataLayer.ts` | Data layer with Dataverse mapping |

---

## Current Screens

1. ProjectOverview.tsx - Landing page with KPI cards (route: `/`)
2. DashboardEnhanced.tsx - My Work (route: `/my-work`)
3. Deliverables.tsx - Deliverable management
4. Staff.tsx - Staff management (with skills & workstreams columns, search)
5. Workstreams.tsx - Workstream management
6. Kanban.tsx - Kanban board with Dataverse persistence
7. Gantt.tsx - Gantt chart
8. PTORequests.tsx - PTO request management
9. HoursTracking.tsx - Hours logging
10. OrgChart.tsx - Unified org chart with toggle views (route: `/org-chart`)
11. AdminAnalytics.tsx - Admin analytics & CSV import
12. Login.tsx - Login screen

---

## Data Layer

**Use dataLayer.ts (synchronous, localStorage):**
```typescript
import { getDeliverables, getStaff, getWorkstreams } from '../data/dataLayer'
const deliverables = getDeliverables()
```

**Staff interface (types/index.ts):**
```typescript
export interface Staff {
  id: string
  name: string
  title: StaffTitle
  role: string
  email: string
  department: string
  supervisorId?: string
  workstreamIds: string[]
  skills?: string[]  // Optional array of skill strings
  userRole: UserRole
  isActive: boolean
  createdAt: string
}
```

**Workstream colors (dataLayer.ts):**
- 20 distinct colors assigned based on alphabetical order
- Colors are consistent across all screens (Kanban, Org Chart, Staff, etc.)

**Skills mapping to Dataverse (dataLayer.ts toDataverseStaffFields):**
```typescript
crda8_skills: (staff.skills || []).join(', ')
```

---

## Key Learnings / Gotchas

1. **Tailwind doesn't work** in Power Apps - use inline styles
2. **Backup folders get compiled** - Add to tsconfig.json exclude
3. **CDN caching is aggressive** - use raw.githubusercontent.com with cache-busting params
4. **BUILD_STAMP verification** - DashboardEnhanced.tsx has BUILD_STAMP constant
5. **Workstream colors not in Dataverse** - assigned client-side based on alphabetical order
6. **Skills input** - Use onBlur not onChange (allows typing commas)
7. **types/index.ts must be downloaded** - Script downloads it for Staff interface with skills

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| Jan 20, 2026 23:00 | v16 | **TYPES FIX** - types/index.ts download, skills working |
| Jan 20, 2026 22:00 | v15 | Staff skills column, search, onBlur fix |
| Jan 20, 2026 21:00 | v14 | Workstream colors (20 distinct), progress bars fixed |
| Jan 20, 2026 20:50 | v11 | Unified OrgChart.tsx |
| Jan 20, 2026 03:45 | v10 | PROJECT OVERVIEW - KPI landing page |
| Jan 19, 2026 22:50 | v7 | 15 FUN THEMES |

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
