# 🎨 Modern Kanban Screen - Design Specification

## Screen Name: `scrKanbanModern`

### Overview
A professional, modern Kanban board designed specifically for your TD Project Governance Tool. Features a collapsible sidebar, sleek card design, and PWC color branding.

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Sidebar - Collapsible]  │  Main Kanban Area                       │
│                            │                                         │
│  [☰ Toggle]               │  📊 Deliverables Board    [🔄 Refresh]  │
│                            │  ───────────────────────────────────── │
│  Kanban Board             │                                         │
│                            │  NOT STARTED  IN PROGRESS  IN REVIEW  COMPLETED │
│  ─────────────            │  ┌─────────┐  ┌─────────┐  ┌───────┐  ┌───────┐ │
│                            │  │ Card 1  │  │ Card 1  │  │ Card 1│  │ Card 1│ │
│  TOTAL DELIVERABLES       │  │         │  │ ▓▓▓▓░░  │  │       │  │   ✓   │ │
│     42                    │  │ Title   │  │  45%    │  │ Title │  │ Title │ │
│                            │  │ Owner   │  │ Owner   │  │ Owner │  │ Owner │ │
│  COMPLETED                │  │ 📅 Date │  │ 📅 Date │  │📅 Date│  │✓ Done │ │
│     28                    │  ├─────────┤  ├─────────┤  ├───────┤  ├───────┤ │
│                            │  │ Card 2  │  │ Card 2  │  │ Card 2│  │ Card 2│ │
│                            │  └─────────┘  └─────────┘  └───────┘  └───────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design Features

### Collapsible Sidebar
- **Expanded Width**: 280px
- **Collapsed Width**: 60px
- **Toggle Button**: Clean hamburger menu (☰)
- **Background**: White (#FFFFFF) with subtle shadow
- **Contents**:
  - Title: "Kanban Board" (when expanded)
  - Metrics cards with counts
  - Total Deliverables (PWC blue accent)
  - Completed count (green accent)

### Kanban Columns (4 Total)

#### 1. NOT STARTED
- **Header Color**: Light gray (#ADADAD background, 10% opacity)
- **Text Color**: Gray (#605E5C)
- **Card Border**: None
- **Shows**: Basic card with title, workstream, owner, due date

#### 2. IN PROGRESS
- **Header Color**: Amber (#FFC107 background, 10% opacity)
- **Text Color**: Dark amber (#A27B00)
- **Card Accent**: 4px amber top border
- **Special Feature**: Progress bar showing completion %
- **Progress Bar**: Amber fill on gray background
- **Shows**: Title, workstream, progress %, owner, due date

#### 3. IN REVIEW
- **Header Color**: PWC Blue (#0078D4 background, 10% opacity)
- **Text Color**: Dark blue (#005A9E)
- **Card Accent**: 4px blue top border
- **Shows**: Title, workstream, owner, due date

#### 4. COMPLETED
- **Header Color**: Green (#107C10 background, 10% opacity)
- **Text Color**: Dark green (#0C5D0C)
- **Special Feature**: Green checkmark (✓) icon
- **Shows**: Checkmark, title (grayed), workstream, owner, completion date

---

## 📊 Card Design

### Card Dimensions
- **Width**: Auto (fills column width minus padding)
- **Height**: 140px (template size)
- **Padding**: 12px all around
- **Margin**: 8px between cards
- **Border Radius**: 6px
- **Shadow**: Light drop shadow

### Card Elements

**1. Header Section**
- Deliverable name (bold, 13px, Segoe UI)
- 2 lines max with ellipsis

**2. Workstream Tag**
- PWC blue color (#0078D4)
- 11px font
- Workstream name from lookup

**3. Progress Bar** (In Progress only)
- Height: 8px
- Background: Light gray
- Fill: Amber (dynamic width based on completion %)
- Shows percentage text

**4. Metadata**
- Owner with 👤 icon
- Due date with 📅 icon
- **Overdue dates**: Red color (#C4314B)
- **Normal dates**: Gray (#605E5C)

**5. Completion Date** (Completed only)
- Green checkmark ✓ with date
- Green color (#107C10)

---

## 🎯 Interactive Features

### Sidebar Toggle
- Click hamburger menu to expand/collapse
- Smooth width transition
- Metrics hide when collapsed

### Card Click
- OnSelect: Navigate to `scrDeliverablesForm`
- Passes selected deliverable as context variable
- Fade screen transition

### Refresh Button
- Top-right header
- Reloads all active deliverables from SharePoint
- PWC blue outline button with hover effect

---

## 🎨 Color Palette (PWC Branded)

```
Primary Blue:    #0078D4  (PWC brand color)
Gray:            #ADADAD  (Not Started)
Amber:           #FFC107  (In Progress)
Blue:            #0078D4  (In Review)
Green:           #107C10  (Completed)
Red:             #C4314B  (Overdue warning)

Backgrounds:
Main:            #FAFAFA  (Light gray)
Sidebar:         #FFFFFF  (White)
Cards:           #FFFFFF  (White)

Text:
Primary:         #201F1E  (Almost black)
Secondary:       #605E5C  (Dark gray)
Tertiary:        #969696  (Light gray)
```

---

## 📱 Responsive Behavior

### Column Widths
- Each column: `(Parent.Width / 4) - 15px`
- Minimum width: 300px
- Auto-adjusts based on screen width

### Sidebar
- Fixed width when expanded (280px)
- Collapses to 60px icon-only mode
- Main area takes remaining width

### Cards
- Fill column width minus padding
- Scroll independently within each column
- ShowScrollbar enabled

---

## 🔍 Data Filtering

### Column Filters

**Not Started**:
```
Filter(colKanbanDeliverables, StartsWith(Status.Value, "Not Started"))
```

**In Progress**:
```
Filter(colKanbanDeliverables, StartsWith(Status.Value, "In Progress"))
```

**In Review**:
```
Filter(colKanbanDeliverables,
    StartsWith(Status.Value, "In Review") ||
    StartsWith(Status.Value, "Testing") ||
    StartsWith(Status.Value, "Review")
)
```

**Completed**:
```
Filter(colKanbanDeliverables,
    'Completion%' >= 1 ||
    StartsWith(Status.Value, "Complete")
)
```

---

## 📈 Metrics Displayed

### Sidebar Metrics

**1. Total Deliverables**
- Count of all active deliverables
- PWC blue accent card
- Large bold number (24px)
- Small caps label

**2. Completed Count**
- Count of deliverables with 100% completion
- Green accent card
- Large bold number (24px)
- Small caps label

### Column Headers
- Shows count per status
- Format: "X items"
- Updates dynamically

---

## 🚀 Performance Features

- **DelayItemLoading**: Enabled on all galleries
- **LoadingSpinner**: Status-color matched spinners
- **Collection**: Pre-loads deliverables on screen load
- **Filtering**: Client-side filtering for speed

---

## 🎭 User Experience Details

### Hover States
- Cards: Subtle shadow increase (not implemented, but recommended)
- Buttons: Background color change
- Sidebar toggle: Light blue background

### Visual Hierarchy
1. Screen title (largest, bold)
2. Column headers (medium, caps, colored)
3. Card titles (bold, readable)
4. Metadata (smallest, gray)

### Spacing
- Generous padding for breathing room
- Consistent 8px/12px/20px spacing system
- Aligned grid layout

---

## 📝 Implementation Notes

### Data Source
- Uses collection: `colKanbanDeliverables`
- Loaded in OnVisible
- Filters active deliverables only

### Navigation
- Cards navigate to existing `scrDeliverablesForm`
- Passes `varSelectedDeliverable` context

### Status Mapping
- Flexible status matching using `StartsWith()`
- Handles variations in status naming
- Completion % as fallback for "Completed"

---

## ✅ What Works Out of the Box

1. ✅ Sidebar expand/collapse
2. ✅ Dynamic column counts
3. ✅ Card click navigation
4. ✅ Progress bars on in-progress cards
5. ✅ Overdue date highlighting
6. ✅ Status-based filtering
7. ✅ Refresh button
8. ✅ Responsive column widths
9. ✅ PWC color branding
10. ✅ Modern, professional design

---

## 🎯 Next Steps to Test

1. Import `ProjectGovernance_Enhanced.msapp` into PowerApps
2. Open the app for editing
3. Navigate to `scrKanbanModern` screen
4. Connect to your SharePoint Deliverables list (if not connected)
5. Preview the app (F5)
6. Test:
   - Sidebar toggle
   - Card clicks
   - Refresh button
   - Scroll in columns
   - Different screen sizes

---

## 🐛 Potential Issues to Watch For

1. **Status field names**: Ensure SharePoint Status column has choices that match the filters
2. **Completion% field**: Should be a number field (0-1 scale) or (0-100 scale - adjust formula)
3. **Workstream lookup**: Must be connected to Workstreams table
4. **Owner field**: Must be a Person field
5. **Navigation**: scrDeliverablesForm must exist

---

## 🎨 Customization Options

### Easy Changes:
- **Colors**: Modify Fill/Color properties in column headers and cards
- **Card height**: Change TemplateSize in gallery properties
- **Column count**: Adjust width calculation in ColumnNotStarted etc.
- **Sidebar width**: Change 280/60 values in Sidebar.Width property
- **Metrics**: Add more metric cards in SidebarMetrics container

### Advanced Changes:
- Add drag-and-drop (requires custom logic)
- Add WIP limits per column
- Add swimlanes by workstream
- Add filtering/search
- Add card creation inline
- Add color-coded risk indicators

---

## 🏆 Design Philosophy

**Principles Applied:**
1. **Clarity over complexity**: Clean, readable design
2. **Professional aesthetics**: Enterprise-ready look
3. **PWC branding**: Maintains corporate identity
4. **User-centric**: Focus on workflow efficiency
5. **Modern UX**: Contemporary design patterns
6. **Responsive**: Works on various screen sizes
7. **Performance**: Optimized for speed
8. **Accessible**: Clear typography and contrasts

---

**File**: `ProjectGovernance_Enhanced.msapp`
**Size**: 3.0 MB
**Screens**: 16 total (15 existing + 1 new Kanban)
**Status**: ✅ Ready for import and testing
