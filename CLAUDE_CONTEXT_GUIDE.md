# Claude Context Guide for Project Governance DVUI

**Last Updated:** Jan 20, 2026 - 1:15 AM EST
**Last Successful Push:** Jan 20, 2026 - 1:10 AM EST (fix-dvui-build.ps1 v9)
**Current Script Version:** v9

## CURRENT STATUS: v9 DEPLOYED
- 15 fun themes (France, Paris, PSG, Matrix, Barbie, etc.)
- Theme dropdown in header on ALL screens
- Staff table: removed Role & Department columns
- Theme persists in localStorage
- **Deliverables screen: Add Comment button (message icon) - DONE**
- **Kanban: Dataverse persistence + filter dropdowns - DONE**

## NEXT TASKS
1. ~~**Deliverables screen** - Add comment button~~ ✅ DONE (v8)
2. ~~**Kanban** - Persist drag changes to Dataverse + add filter dropdowns~~ ✅ DONE (v9)
3. **CommandCenter → Project Overview** - Rename screen + make it LANDING PAGE (top of sidebar, above My Work):
   - Remove "Active Team" section
   - Add KPI cards: Deliverables due this month, Due next 2 weeks, Late deliverables
   - Click on KPI → drill down to list → click item → see comments & history
4. **Resource Management screen** - New screen based on Lovable (file: `/tmp/Test/lovable-app-organized/src/pages/Resources.tsx`)
5. **Skills** - Use existing `role` field for skills (comma-separated text like "React, TypeScript")

---

## CRITICAL: Read This First!

If you're a new Claude session, READ THIS ENTIRE FILE before doing anything. Georg has lost context multiple times and is frustrated with having to re-explain things.

**DO NOT:**
- Clone repos unnecessarily (the repo is already at `/tmp/Test/`)
- Mention Google OAuth (that was days ago, not relevant now)
- Use mockData (it doesn't exist!)
- Suggest git pull on PwC laptop (it connects to PwC GitHub, not personal GitHub)

**DO:**
- Update `fix-dvui-build.ps1` in `/tmp/Test/`
- Push to Georg's personal GitHub
- Give Georg the Invoke-WebRequest command to run

---

## Project Overview

Georg is building a **Project Governance Dashboard** as a **Power Apps Code App** connected to **Dataverse** (NOT SharePoint - SharePoint is not supported for Code Apps).

There are **TWO separate apps**:

| App | Status | Purpose |
|-----|--------|---------|
| **Project Governance DV** | ✅ Working | The original app, fully functional |
| **Project Governance DVUI** | ✅ Working | Enhanced UI version - NOW ADDING LOVABLE COMPONENTS |

---

## Technical Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + PwC custom CSS (`pwc_compat.css`, `pwc_light_mode.css`)
- **Data:** Dataverse tables with `crda8_` prefix
- **Auth:** Microsoft SSO (MSAL) configured in `AuthContext.tsx`
- **State:** React Query + localStorage caching
- **Deployment:** `pac code push` to Power Apps
- **Animations:** `framer-motion` (for CommandCenter)

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

### Local Clone for Claude (MacBook)
```
/tmp/Test/
```

### Key Files in the Repo
| File | Purpose |
|------|---------|
| `fix-dvui-build.ps1` | **THE SCRIPT** - Claude updates this, Georg executes it |
| `CLAUDE_CONTEXT_GUIDE.md` | **THIS FILE** - Read it to understand context |
| `dvui save/` | Backup of working DVUI with CommandCenter already converted |
| `lovable-app-organized/` | Fancy Lovable UI components (uses mockData - needs conversion) |

---

## Current App State (as of Jan 19, 2026 - 8:35 PM)

### Working Screens (13 screens, CommandCenter pending)
1. DashboardEnhanced.tsx - Main dashboard
2. Deliverables.tsx - Deliverable management
3. Staff.tsx - Staff management
4. Workstreams.tsx - Workstream management
5. Kanban.tsx - Kanban board (basic styling, uses dataLayer)
6. Gantt.tsx - Gantt chart (basic styling, uses dataLayer)
7. PTORequests.tsx - PTO request management
8. HoursTracking.tsx - Hours logging
9. OrgChartHierarchy.tsx - Org chart by hierarchy
10. OrgChartWorkstream.tsx - Org chart by workstream
11. AdminAnalytics.tsx - Admin analytics & CSV import
12. Login.tsx - Login screen
13. Dashboard.tsx - Old dashboard (route: /dashboard-old)

### About to Enable (v4 script)
- **CommandCenter.tsx** - Animated dashboard with:
  - Floating orbs background
  - Glowing stat cards
  - Animated counters
  - Circular progress indicators
  - Workstream progress bars
  - Team avatar stack
  - Particle effects
  - **ALL USING REAL DATAVERSE DATA** (no mockData!)

### Disabled/Backed Up (in DVUI app on PwC laptop)
- `src/components/layout/` - Layout files were backed up
- `src/components/dashboard/` - Dashboard widgets backed up
- `calendar.tsx, chart.tsx, resizable.tsx` - Deleted due to type errors

---

## The Workflow: How Claude Delivers Code to Georg

**IMPORTANT:** Georg's PwC laptop connects to PwC GitHub, NOT his personal GitHub.

### Step-by-Step:
1. Claude edits files in `/tmp/Test/` on Georg's MacBook
2. Claude commits and pushes to Georg's personal GitHub
3. Claude gives Georg this command:
   ```powershell
   cd "C:\Users\gchimion001\OneDrive - PwC\Desktop\VSCODE\PowerAppsRepoPWC\VSCODE\project-governance-dvui"

   Invoke-WebRequest -Uri "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv/fix-dvui-build.ps1" -OutFile "fix-dvui-build.ps1"; .\fix-dvui-build.ps1
   ```
4. Script downloads files from GitHub, builds, and pushes to Power Apps

### Script Naming Convention
- `fix-dvui-build.ps1` - Main deployment script (keep updating this one)

---

## Data Layer Architecture

### Two Data Access Patterns

**Pattern 1: dataLayer.ts (synchronous, localStorage)**
```typescript
import { getDeliverables, getStaff, getWorkstreams } from '../data/dataLayer'
const deliverables = getDeliverables()  // returns array from localStorage
```
- Used by: Kanban.tsx, Gantt.tsx, most existing screens

**Pattern 2: dataverseService.ts (React Query hooks)**
```typescript
import { useGetDeliverables, useGetStaff, useGetWorkstreams } from '@/services/dataverseService'
const { data: deliverables = [], isLoading } = useGetDeliverables()
```
- Used by: CommandCenter.tsx (the Lovable version in `dvui save/`)
- Returns `{ data, isLoading, error }` pattern

### DO NOT USE
- `@/data/mockData` - **THIS FILE DOES NOT EXIST!**
- Lovable components reference it but we must convert to dataLayer or dataverseService

---

## CommandCenter Dependencies (v4 script installs these)

### NPM Packages Required
- `framer-motion` - For animations

### Files Required from `dvui save/`
| File | Purpose |
|------|---------|
| `src/screens/CommandCenter.tsx` | The main screen (uses dataverseService hooks) |
| `src/services/dataverseService.ts` | React Query hooks for Dataverse |
| `src/components/layout/MainLayout.tsx` | Layout wrapper |
| `src/components/layout/AppSidebar.tsx` | Sidebar navigation |
| `src/components/layout/Header.tsx` | Top header |
| `src/components/layout/NavLink.tsx` | Navigation link component |
| `src/components/ui/card.tsx` | Card component |
| `src/components/ui/button.tsx` | Button component |
| `src/components/ui/avatar.tsx` | Avatar component |
| `src/components/ui/input.tsx` | Input component |
| `src/components/ui/dropdown-menu.tsx` | Dropdown menu |
| `src/components/ui/badge.tsx` | Badge component |

### What CommandCenter.tsx imports:
```typescript
import { motion } from "framer-motion";  // Animations
import { MainLayout } from "@/components/layout/MainLayout";  // Layout
import { Card } from "@/components/ui/card";  // UI component
import { useGetDeliverables, useGetWorkstreams, useGetStaff } from "@/services/dataverseService";  // DATA!
```

**NO mockData references!** ✅

---

## Converting Lovable Components to Dataverse

When converting components from `lovable-app-organized/`:

### Replace These Imports:
```typescript
// FROM (Lovable - WRONG)
import { deliverables, teamMembers, workstreams, currentUser } from '@/data/mockData';

// TO (dataLayer - synchronous)
import { getDeliverables, getStaff, getWorkstreams } from '../data/dataLayer';
import { useAuth } from '../context/AuthContext';
const deliverables = getDeliverables();
const staff = getStaff();
const workstreams = getWorkstreams();
const { currentUser } = useAuth();

// OR TO (dataverseService - React Query)
import { useGetDeliverables, useGetStaff, useGetWorkstreams } from '@/services/dataverseService';
const { data: deliverables = [] } = useGetDeliverables();
const { data: staff = [] } = useGetStaff();
const { data: workstreams = [] } = useGetWorkstreams();
```

---

## Key Learnings / Gotchas

1. **SharePoint NOT supported** for Code Apps - only Dataverse works
2. **Backup folders get compiled** - Add to tsconfig.json exclude: `"src/_lovable_backup_*"`
3. **`.bak` files get compiled** - Add `"**/*.bak"` to exclude
4. **PowerShell regex is tricky** - Complex JSX patterns often fail
5. **npm install can be slow** on PwC network
6. **pac code push** requires auth - check with `pac auth list`
7. **Don't clone unnecessarily** - repo already exists at `/tmp/Test/`
8. **Don't suggest git pull** - PwC laptop uses different GitHub
9. **CommandCenter uses dataverseService** NOT dataLayer (both work, different patterns)
10. **framer-motion** required for CommandCenter animations
11. **BUILD_STAMP verification** - `DashboardEnhanced.tsx` has a `BUILD_STAMP` constant that displays on the My Work page. The script MUST update this with current timestamp (EST) so Georg can verify the push deployed. Script shows the expected value at the end.

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| Jan 19, 2026 22:50 | v7 | **15 FUN THEMES** - France, Paris, PSG, Matrix, Barbie + theme dropdown in header on all screens + Staff cleanup |
| Jan 19, 2026 22:25 | v6.2 | **SIDEBAR FIX** - Downloads App.tsx directly instead of regex (regex was broken) |
| Jan 19, 2026 22:15 | v6.1 | Added Layout wrapper to route - sidebar STILL NOT WORKING |
| Jan 19, 2026 21:45 | v6 | **INLINE STYLED CommandCenter** - light theme, no Tailwind CSS vars, hardcoded PWC colors, all animations work |
| Jan 19, 2026 21:00 | v5 | Full styling setup - index.css with CSS vars (didn't work) |
| Jan 19, 2026 20:35 | v4 | Enable CommandCenter with ALL dependencies (layout, UI, framer-motion) |
| Jan 19, 2026 15:15 | v2 | Fixed build - excluded backup folders, disabled CommandCenter |
| Jan 19, 2026 14:30 | v1 | Initial script - installed deps, backed up mockData components |

---

## Power Apps URLs

- **DVUI App:** `https://apps.powerapps.com/play/e/deccb389-10c5-4d5c-8716-1093a04538e1/app/a951bd8f-2c6d-4250-85d9-23fd25297bab`
- **Environment ID:** `deccb389-10c5-4d5c-8716-1093a04538e1`
- **App ID:** `a951bd8f-2c6d-4250-85d9-23fd25297bab`

---

## Quick Reference Commands

### For Claude (on MacBook):
```bash
# Edit files in /tmp/Test/
# Then push:
cd /tmp/Test && git add . && git commit -m "description" && git push origin claude/powerapp-sharepoint-deliverables-vbZKv
```

### For Georg (on PwC Laptop):
```powershell
cd "C:\Users\gchimion001\OneDrive - PwC\Desktop\VSCODE\PowerAppsRepoPWC\VSCODE\project-governance-dvui"

Invoke-WebRequest -Uri "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv/fix-dvui-build.ps1" -OutFile "fix-dvui-build.ps1"; .\fix-dvui-build.ps1
```

---

## Contact / Sessions

- **Georg's MacBook:** Claude Code in VS Code
- **Georg's PwC Laptop:** Where the actual code lives and builds happen
- **Georg's Personal PC:** Backup option

**Sessions are isolated. If context is lost, read this file FIRST!**
