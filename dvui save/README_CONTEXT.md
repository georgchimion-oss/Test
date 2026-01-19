# Project Governance DV - Context

This file captures the working context for the "Project Governance DV" Power Apps Code App.
Use it to rehydrate context if the chat history is lost.

## Overview
- App name: Project Governance DV
- Type: Power Apps Code App (React + TypeScript)
- Goal: Replace a live SharePoint canvas app used by ~150 users.
- Data source: Dataverse (not SharePoint).

## Dataverse Tables (crda8_ prefix)
- crda8_deliverables (entity set: crda8_deliverableses)
- crda8_staff4 (entity set: crda8_staff4s)
- crda8_workstreams (entity set: crda8_workstreamses)
- crda8_timeoffrequests (entity set: crda8_timeoffrequestses)
- crda8_weeklyhours (entity set: crda8_weeklyhourses)
- crda8_audittrail2 (entity set: crda8_audittrail2s)
- crda8_appusagelog (entity set: crda8_appusagelogs)
- crda8_georgtown (test table, entity set: crda8_georgtowns)

## App Structure
- `src/screens/AdminAnalytics.tsx`: Admin analytics + CSV import + bulk data operations.
- `src/screens/DashboardEnhanced.tsx`: My Work landing page (build stamp displayed here).
- `src/screens/Deliverables.tsx`: Deliverables screen (table view + bulk update modal).
- `src/screens/Kanban.tsx`: Kanban board (group by status/workstream/owner).
- `src/data/dataLayer.ts`: Dataverse + localStorage sync logic.
- `src/generated/`: Auto-generated models/services (do not edit).

## Build Stamp
- A hard-coded stamp is kept in `src/screens/DashboardEnhanced.tsx` as `BUILD_STAMP`.
- Update this string after each `npm run build` + `pac code push` to confirm deploy.

## SharePoint -> Dataverse CSV Migration
### CSV Files
- Stored under: `C:\Users\gchimion001\OneDrive - PwC\Desktop\VSCODE\PowerAppsRepoPWC\VSCODE`
- Example files: `Workstreams (2).csv`, `Staff (1).csv`, `Deliverables (3).csv`

### Import UI
- Use Admin screen: "Import SharePoint CSVs to Dataverse".
- Import order:
  1) Workstreams
  2) Staff
  3) Workstreams again (or update leaders) so leaders resolve
  4) Deliverables

### Key Import Behavior
- Import only processes tables whose CSVs are provided.
- If you upload only Deliverables, staff/workstreams are pulled from Dataverse for matching.
- Import now uses upsert (update if exists, create if missing):
  - Workstreams match by `crda8_title`
  - Staff match by `crda8_email` (fallback name)
  - Deliverables match by `crda8_deliverablename` / `crda8_title`
- Leaders and supervisors:
  - Workstream leader uses normalized text; falls back to raw string if not found.
  - Staff supervisor uses email/name if found; falls back to raw string.

### Data Normalization
- Whitespace normalized (handles line breaks like "Operational\nReadiness").
- Dates converted to ISO date-only; `0001-01-01` and empty become undefined.
- Progress converted to decimal 0-1 for Dataverse (from 0-100 in CSV).
- Risk/Status converted to numeric option values.

## Bulk Update
- Deliverables screen has a bulk update modal:
  - Select rows (checkbox + select all filtered).
  - Bulk fields: Workstream, Status, Risk, Completion %, Comment.
  - Owner is intentionally not editable here.
- Admin screen still has broader bulk operations.
- If the Deliverables screen doesn’t update after Admin changes, React Query invalidation is now in place.

## UI Enhancements
- Deliverables filter dropdowns include "Unassigned" for Workstream and Owner.
- Kanban board includes an "Unassigned" column when grouping by Workstream.
- Deliverables table shows "Unassigned" for missing owner/workstream.

## Operational Notes
- Use `npm run build` then `pac code push` to deploy.
- Avoid editing files in `src/generated/`.
- Dataverse fields are text for many relationships (owner/workstream/lead). Email-based matching is preferred.

## Known Expected Outcomes
- Importing Deliverables without staff/workstreams should still match if Dataverse data exists.
- Missing owner in CSV will show "Unassigned".
- Workstreams should not duplicate after upsert.

