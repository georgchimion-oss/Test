# UI Reference Guide - Use Lovable App for Design Inspiration

## What This Is

The `lovable-app-organized/` folder contains a Lovable app with nice UI designs. **We are NOT deploying this app.** We're just using it as a **reference** to improve the look and feel of the PWC Power Apps Code App.

Think of it as a **design library** - look at the components, see how they style things, and apply similar patterns to make our PWC app look better.

---

## 🎯 Goal

Make the PWC app look modern and professional by borrowing design patterns from the Lovable app.

---

## 📂 Where to Look for Design Ideas

### 1. **Dashboard Components** (`src/components/dashboard/`)

Look at these for inspiration:

**KPICard.tsx** - Shows metrics in cards:
- Clean card design with icon, number, and label
- Color coding for different metric types
- Trend indicators (up/down arrows)
- Consistent spacing and shadows

**RecentActivity.tsx** - Shows activity feed:
- Timeline layout with avatars
- Status badges (comment, completed, risk, update)
- Relative timestamps ("2 hours ago")
- Card-based list with good spacing

**ProjectProgress.tsx** - Shows progress bars:
- Progress bar with percentage
- Color coding (green for good, red for at risk)
- Clean typography

**UpcomingDeadlines.tsx** - Shows upcoming tasks:
- Date badges
- Status indicators
- Hover effects
- Compact list design

### 2. **Layout Components** (`src/components/layout/`)

**AppSidebar.tsx** - Collapsible sidebar:
- Smooth collapse/expand animation
- Icon + text navigation
- Active state highlighting
- PWC orange accent color

**Header.tsx** - Top header bar:
- Clean title display
- User info/avatar on right
- Consistent height and spacing

**MainLayout.tsx** - Overall page structure:
- Sidebar + content area layout
- Responsive design
- Proper spacing and padding

### 3. **Page Layouts** (`src/pages/`)

**Index.tsx** - Dashboard page:
- Grid layout for KPI cards
- Multiple sections (stats, activity, progress)
- Good use of whitespace
- Organized information hierarchy

**Deliverables.tsx** - Table view:
- Search/filter bar at top
- Data table with sorting
- Action buttons (edit, delete)
- Status badges

**Kanban.tsx** - Kanban board:
- Multi-column drag-and-drop layout
- Card design for tasks
- Column headers with counts
- Smooth animations

**Team.tsx** - Team directory:
- Grid of people cards
- Avatar + name + role
- Hover effects
- Skills/tags display

---

## 🎨 Key Design Patterns to Copy

### Color Scheme
```css
Primary (PWC Orange): #D04A02
Background: #FAFAFA (light gray)
Card Background: #FFFFFF (white)
Text: #1A1A1A (dark gray)
Muted Text: #6B7280 (medium gray)
Border: #E5E7EB (light gray)
Success: #10B981 (green)
Warning: #F59E0B (amber)
Danger: #EF4444 (red)
```

### Card Design Pattern
```typescript
<Card className="shadow-sm hover:shadow-md transition-shadow">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-medium">Title</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">Value</div>
    <p className="text-xs text-muted-foreground">Description</p>
  </CardContent>
</Card>
```

### Status Badge Pattern
```typescript
// Different colors for different statuses
<Badge variant={
  status === "completed" ? "success" :
  status === "in-progress" ? "default" :
  status === "at-risk" ? "destructive" :
  "secondary"
}>
  {status}
</Badge>
```

### Avatar + Text Pattern
```typescript
<div className="flex items-center gap-3">
  <Avatar>
    <AvatarFallback>{initials}</AvatarFallback>
  </Avatar>
  <div>
    <p className="text-sm font-medium">{name}</p>
    <p className="text-xs text-muted-foreground">{role}</p>
  </div>
</div>
```

### Data Table Pattern
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Due Date</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data?.map(item => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell><Badge>{item.status}</Badge></TableCell>
        <TableCell>{item.dueDate}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Grid Layout Pattern
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {kpis.map(kpi => (
    <KPICard key={kpi.id} {...kpi} />
  ))}
</div>
```

---

## 🔨 How to Use This Reference

### Step 1: Look at a Component
Open a file in `lovable-app-organized/src/components/dashboard/KPICard.tsx`

### Step 2: Identify the Design Pattern
See what makes it look good:
- Card with shadow and rounded corners
- Icon at the top
- Large number in bold
- Small description text
- Proper spacing between elements

### Step 3: Apply Similar Styling to Your Component
In your PWC app, update your component to use similar patterns:

**Before (basic):**
```typescript
function StaffCard({ staff }) {
  return (
    <div>
      <h3>{staff.crda8_name}</h3>
      <p>{staff.crda8_email}</p>
    </div>
  );
}
```

**After (styled like Lovable):**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function StaffCard({ staff }) {
  const initials = staff.crda8_name
    .split(' ')
    .map(n => n[0])
    .join('');

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{staff.crda8_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{staff.crda8_role}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{staff.crda8_email}</p>
        {staff.crda8_active && (
          <Badge variant="success" className="mt-2">Active</Badge>
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 4: Repeat for Other Components
Look at different Lovable components for inspiration and apply similar patterns throughout your PWC app.

---

## 🎯 Specific Improvements to Make

### 1. **Improve the Dashboard Page**
Look at: `lovable-app-organized/src/pages/Index.tsx`

Apply:
- Grid layout for KPI cards
- Recent activity feed on the side
- Progress indicators for projects
- Better spacing and organization

### 2. **Improve the Staff List**
Look at: `lovable-app-organized/src/pages/Team.tsx`

Apply:
- Card-based layout instead of plain list
- Avatars with initials
- Role badges
- Hover effects

### 3. **Improve the Deliverables Page**
Look at: `lovable-app-organized/src/pages/Deliverables.tsx`

Apply:
- Search bar at top
- Filter buttons
- Status badges with colors
- Better table styling
- Action buttons

### 4. **Add a Kanban View**
Look at: `lovable-app-organized/src/pages/Kanban.tsx`

Apply:
- Column-based layout
- Drag and drop cards (optional)
- Color-coded columns
- Card shadows and spacing

### 5. **Improve the Sidebar**
Look at: `lovable-app-organized/src/components/layout/AppSidebar.tsx`

Apply:
- Collapsible sidebar
- Icon + text navigation
- Active state highlighting
- Smooth animations

---

## 💡 Quick Wins - Easy Improvements

### 1. Add Card Shadows
```typescript
// Old
<div>Content</div>

// New
<Card className="shadow-sm">
  <CardContent>Content</CardContent>
</Card>
```

### 2. Add Status Badges
```typescript
// Old
<span>{status}</span>

// New
<Badge variant={status === "active" ? "success" : "secondary"}>
  {status}
</Badge>
```

### 3. Add Avatars
```typescript
// Old
<span>{name}</span>

// New
<div className="flex items-center gap-2">
  <Avatar>
    <AvatarFallback>{initials}</AvatarFallback>
  </Avatar>
  <span>{name}</span>
</div>
```

### 4. Improve Typography
```typescript
// Old
<h2>Title</h2>
<p>Description</p>

// New
<h2 className="text-2xl font-bold tracking-tight">Title</h2>
<p className="text-sm text-muted-foreground">Description</p>
```

### 5. Add Hover Effects
```typescript
// Old
<div>Click me</div>

// New
<div className="hover:shadow-md transition-shadow cursor-pointer">
  Click me
</div>
```

---

## ⚠️ What NOT to Do

- ❌ Don't copy the mock data (`src/data/mockData.ts`)
- ❌ Don't copy the entire app structure
- ❌ Don't replace your working Dataverse connection
- ❌ Don't copy routing/navigation logic
- ❌ Don't copy data fetching logic

**Only copy:**
- ✅ Visual styling (classes, colors, spacing)
- ✅ Layout patterns (grid, flex, card arrangements)
- ✅ UI component usage (how to use Card, Badge, Avatar, etc.)
- ✅ Design ideas (how to organize information)

---

## 📋 Action Plan for Codex

1. **Look at** `lovable-app-organized/src/pages/Index.tsx`
   - See how the dashboard is organized
   - Note the grid layout for KPIs
   - See the activity feed design

2. **Look at** `lovable-app-organized/src/components/dashboard/KPICard.tsx`
   - See how metrics are displayed in cards
   - Note the icon, number, label pattern
   - See the shadow and hover effects

3. **Apply similar patterns** to your PWC app:
   - Update your dashboard to use a grid layout
   - Style your KPI cards with shadows and icons
   - Add an activity feed with avatars and badges

4. **Look at** `lovable-app-organized/src/pages/Team.tsx`
   - See the card-based team member display
   - Note the avatar + name + role pattern

5. **Apply to your Staff page:**
   - Use Card components
   - Add avatars with initials
   - Add role badges
   - Use grid layout

6. **Repeat** for other pages:
   - Deliverables page → look at Deliverables.tsx
   - Add filters, search, better table
   - Workstreams page → look at Workstreams.tsx
   - Use progress bars, status indicators

---

## 🎨 Summary

**Think of the Lovable app as a design reference book:**
- Browse through the components
- See what looks good
- Copy the styling patterns
- Apply to your PWC app
- Make your app look modern and professional

**Don't think of it as:**
- An app to deploy
- Code to copy verbatim
- A replacement for your working app

**It's inspiration, not implementation!**

---

## 📦 Files Location

**Folder:**
```
lovable-app-organized/
```

**Download zip on PWC laptop:**
```
lovable-app-organized.zip (182KB)
```

Open the files, look at the designs, get inspired, make your PWC app look great! 🎨✨
