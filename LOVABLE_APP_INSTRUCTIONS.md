# Instructions for Using Lovable App UI Components

## What This Is

This folder contains the **complete Lovable app** with all UI components, layouts, and designs that Georg wants to reuse in the PWC Power Apps Code App.

## Folder Structure

```
lovable-app-organized/
├── public/                          # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── dashboard/              # Dashboard widgets
│   │   │   ├── DeliverableRow.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── ProjectProgress.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   ├── RiskOverview.tsx
│   │   │   └── UpcomingDeadlines.tsx
│   │   ├── layout/                 # Layout components
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── NavLink.tsx
│   │   └── ui/                     # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── ... (70+ components)
│   ├── pages/                      # All page components
│   │   ├── Index.tsx               # Dashboard/Home
│   │   ├── Deliverables.tsx
│   │   ├── Kanban.tsx
│   │   ├── Gantt.tsx
│   │   ├── Team.tsx
│   │   ├── Timesheet.tsx
│   │   ├── Workstreams.tsx
│   │   ├── PTO.tsx
│   │   ├── Resources.tsx
│   │   ├── Settings.tsx
│   │   ├── OrgChart.tsx
│   │   └── NotFound.tsx
│   ├── data/
│   │   └── mockData.ts             # Mock data (DO NOT TOUCH - keep for reference)
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts                # cn() utility function
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
└── [config files]                  # vite, tailwind, typescript configs
```

---

## 🎯 What to Copy to PWC App

### Phase 1: Copy UI Components (Safe)

Copy these WITHOUT modification:
```
src/components/ui/ → Copy ALL files to your PWC app
src/lib/utils.ts → Copy to your PWC app
src/hooks/use-mobile.tsx → Copy to your PWC app
```

These are pure UI components with no data dependencies.

### Phase 2: Copy Layout Components (Adapt)

Copy and ADAPT these:
```
src/components/layout/AppSidebar.tsx → Adapt navigation links
src/components/layout/Header.tsx → Keep design, adapt title
src/components/layout/MainLayout.tsx → Keep structure
```

**Changes needed:**
- Update navigation links to match your routing
- Update app title from "TD Governance Hub" to "Project Governance Tool"
- Keep the sidebar collapse/expand functionality

### Phase 3: Copy Dashboard Components (Adapt)

Copy and REPLACE data sources:
```
src/components/dashboard/KPICard.tsx → Keep UI, replace data
src/components/dashboard/RecentActivity.tsx → Keep UI, replace data
src/components/dashboard/ProjectProgress.tsx → Keep UI, replace data
src/components/dashboard/RiskOverview.tsx → Keep UI, replace data
src/components/dashboard/UpcomingDeadlines.tsx → Keep UI, replace data
src/components/dashboard/DeliverableRow.tsx → Keep UI, replace data
```

**Changes needed:**
```typescript
// OLD (uses mock data)
import { deliverables } from "@/data/mockData";

// NEW (use Dataverse hooks)
import { useDeliverablesList } from "@/generated/hooks/useDeliverables";

function KPICard() {
  // OLD
  const data = deliverables;

  // NEW
  const { data, isLoading } = useDeliverablesList();

  if (isLoading) return <Skeleton />;

  // Rest of component stays the same!
}
```

### Phase 4: Copy Pages (Adapt)

Copy and REPLACE data sources:
```
src/pages/Index.tsx → Keep design, replace data
src/pages/Deliverables.tsx → Keep design, replace data
src/pages/Kanban.tsx → Keep design, replace data
src/pages/Team.tsx → Keep design, replace data
src/pages/Workstreams.tsx → Keep design, replace data
```

Same pattern: Replace mock data imports with Dataverse hooks.

---

## ⚠️ CRITICAL: Do NOT Copy These

**DO NOT copy:**
- `src/data/mockData.ts` - This is fake data!
- Any imports from `@/data/mockData`
- The data fetching logic (replace with Dataverse hooks)

**DO NOT modify:**
- Your existing `src/generated/` folder
- Your `power.config.json`
- Your Dataverse hooks
- Your service layer

---

## 🎨 Design Features to Keep

### Color Scheme
The app uses PWC orange theme:
- Primary: `#D04A02` (PWC orange)
- Background: Light neutral
- Cards: White with subtle shadows
- Text: High contrast for accessibility

### Layout Features
- Collapsible sidebar
- Clean card-based design
- Responsive design (mobile-friendly)
- Modern typography
- Consistent spacing

### Components Used
- shadcn/ui components (already compatible!)
- Lucide React icons
- Tailwind CSS
- React Router for navigation

---

## 📝 Step-by-Step Integration Guide

### Step 1: Copy UI Components
```bash
# Copy all UI components (they're pure components, no data)
cp -r lovable-app-organized/src/components/ui/* your-pwc-app/src/components/ui/
```

### Step 2: Copy Utility Functions
```bash
# Copy utils (needed for UI components)
cp lovable-app-organized/src/lib/utils.ts your-pwc-app/src/lib/
```

### Step 3: Copy Layout Components
```bash
# Copy layout components
cp -r lovable-app-organized/src/components/layout/* your-pwc-app/src/components/layout/
```

Then edit:
- `AppSidebar.tsx` - Update navigation links to match your routes
- `Header.tsx` - Update app title

### Step 4: Copy One Dashboard Component (Test)
```bash
# Start with KPICard
cp lovable-app-organized/src/components/dashboard/KPICard.tsx your-pwc-app/src/components/dashboard/
```

Then edit `KPICard.tsx`:
```typescript
// Remove this line
import { deliverables } from "@/data/mockData";

// Add this line
import { useDeliverablesList } from "@/generated/hooks/useDeliverables";

// In the component, replace:
const data = deliverables;

// With:
const { data, isLoading } = useDeliverablesList();
if (isLoading) return <div>Loading...</div>;
```

Test it! If it works, continue with other dashboard components.

### Step 5: Copy Pages One at a Time
Start with the homepage:
```bash
cp lovable-app-organized/src/pages/Index.tsx your-pwc-app/src/pages/
```

Apply the same data source replacement pattern.

---

## 🔄 Data Source Replacement Pattern

**For every file you copy that uses data:**

### Before (Mock Data):
```typescript
import { deliverables, staff, workstreams } from "@/data/mockData";

function MyComponent() {
  const deliverables = mockData.deliverables;

  return (
    <div>
      {deliverables.map(d => <Card key={d.id}>{d.name}</Card>)}
    </div>
  );
}
```

### After (Dataverse):
```typescript
import { useDeliverablesList } from "@/generated/hooks/useDeliverables";
import { useStaffList } from "@/generated/hooks/useStaff";
import { useWorkstreamsList } from "@/generated/hooks/useWorkstreams";

function MyComponent() {
  const { data: deliverables, isLoading } = useDeliverablesList({
    orderBy: ["crda8_name asc"]
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {deliverables?.map(d => <Card key={d.id}>{d.crda8_name}</Card>)}
    </div>
  );
}
```

**Key changes:**
1. Replace mock data import with Dataverse hook
2. Add loading state
3. Update field names (e.g., `name` → `crda8_name`)
4. Use optional chaining (`deliverables?.map`)

---

## ✅ Checklist for Codex

When copying each file:
- [ ] Copy the file
- [ ] Remove any imports from `@/data/mockData`
- [ ] Replace with appropriate Dataverse hook (`useDeliverablesList`, etc.)
- [ ] Add loading state (`if (isLoading) return <div>Loading...</div>`)
- [ ] Update field names to use Dataverse logical names (`crda8_*`)
- [ ] Test the component
- [ ] Move to next component

---

## 🎯 Goal

Keep the beautiful UI design from Lovable, but connect it to real Dataverse data using the generated hooks.

**What stays:**
- ✅ All UI components
- ✅ Layout and design
- ✅ Color scheme
- ✅ Navigation structure
- ✅ Component composition

**What changes:**
- ❌ Mock data imports → Dataverse hooks
- ❌ Field names → Dataverse logical names
- ❌ Static data → Dynamic queries
- ❌ No loading states → Loading states

---

## 📦 Download

The complete organized app is available as:
- Folder: `lovable-app-organized/`
- Zip file: `lovable-app-organized.zip` (182KB)

Download from GitHub:
```
https://github.com/georgchimion-oss/Test/tree/claude/powerapp-sharepoint-deliverables-vbZKv/lovable-app-organized
```

Or download the zip:
```
https://github.com/georgchimion-oss/Test/raw/claude/powerapp-sharepoint-deliverables-vbZKv/lovable-app-organized.zip
```

---

## 🚀 Ready!

You now have a complete, organized Lovable app structure ready to integrate into the PWC Code App.

Start with UI components (safe), then layout (adapt navigation), then dashboard components (replace data), then pages (replace data).

Good luck! 🎉
