# Build Deliverables Tracker PowerApp - Step by Step

## Why Build Manually?

The .msapp file import is failing because PowerApps requires a very specific internal structure. Building the app manually in PowerApps is actually faster and more reliable.

**Time to complete: 15-20 minutes**

---

## Prerequisites

1. Access to [make.powerapps.com](https://make.powerapps.com)
2. SharePoint site where you can create a list
3. Your PWC credentials

---

## Part 1: Create SharePoint List (5 minutes)

### Step 1: Create the List

1. Go to your SharePoint site
2. Click **New** → **List**
3. Name it: `Deliverables`
4. Click **Create**

### Step 2: Add Columns

Click **+ Add column** for each column below:

#### Column 1: Description
- Type: **Multiple lines of text**
- Name: `Description`
- Click **Save**

#### Column 2: Status
- Type: **Choice**
- Name: `Status`
- Choices (type each on a new line):
  ```
  Not Started
  In Progress
  In Review
  Completed
  ```
- Default value: `Not Started`
- Click **Save**

#### Column 3: Owner
- Type: **Person**
- Name: `Owner`
- Click **Save**

#### Column 4: Due Date
- Type: **Date and time**
- Name: `Due Date`
- Include time: **No** (uncheck)
- Click **Save**

#### Column 5: Priority
- Type: **Choice**
- Name: `Priority`
- Choices:
  ```
  Low
  Medium
  High
  ```
- Default value: `Medium`
- Click **Save**

### Step 3: Add Sample Data (Optional)

Add a few test items:

| Title | Description | Status | Priority | Due Date | Owner |
|-------|-------------|--------|----------|----------|-------|
| Design homepage | Create mockups | In Progress | High | [Pick a date] | [Your name] |
| Database review | Optimize schema | Not Started | Medium | [Pick a date] | [Your name] |
| UAT testing | Test with users | In Review | High | [Pick a date] | [Your name] |
| API docs | Complete documentation | Completed | Medium | [Past date] | [Your name] |

---

## Part 2: Create PowerApp (10-15 minutes)

### Step 1: Start New App

1. Go to [make.powerapps.com](https://make.powerapps.com)
2. Click **+ Create** (left sidebar)
3. Select **Blank app**
4. Choose **Blank canvas app**
5. Name: `Deliverables Tracker`
6. Format: **Tablet** (16:9 landscape)
7. Click **Create**

### Step 2: Connect to SharePoint

1. In left panel, click **Data** (database icon)
2. Click **+ Add data**
3. Search for and select **SharePoint**
4. Choose **Connect directly (cloud services)**
5. Enter your SharePoint site URL: `https://[tenant].sharepoint.com/sites/[sitename]`
6. Click **Connect**
7. Find and check **Deliverables** list
8. Click **Connect**

You should now see "Deliverables" in your data sources.

### Step 3: Set Up App Variables

1. In left tree view, click **App** (at the very top)
2. In the properties panel, find **OnStart**
3. Enter this formula:
   ```
   Set(varViewMode, "List")
   ```

### Step 4: Create the Header

#### Add Header Rectangle
1. Click **+ Insert** → **Rectangle**
2. Rename it to `HeaderRectangle` (in left panel)
3. Set properties (on the right):
   - **Fill**: `RGBA(0, 120, 212, 1)` (blue)
   - **Height**: `80`
   - **Width**: `Parent.Width`
   - **X**: `0`
   - **Y**: `0`

#### Add Title Label
1. Click **+ Insert** → **Label**
2. Rename to `TitleLabel`
3. Properties:
   - **Text**: `"Deliverables Tracker"`
   - **X**: `20`
   - **Y**: `20`
   - **Width**: `500`
   - **Height**: `40`
   - **Size**: `24`
   - **Font weight**: `FontWeight.Bold`
   - **Color**: `RGBA(255, 255, 255, 1)` (white)

#### Add Toggle Button
1. Click **+ Insert** → **Button**
2. Rename to `ViewToggleButton`
3. Properties:
   - **Text**: `If(varViewMode = "List", "Switch to Kanban", "Switch to List")`
   - **OnSelect**: `If(varViewMode = "List", Set(varViewMode, "Kanban"), Set(varViewMode, "List"))`
   - **X**: `Parent.Width - Self.Width - 20`
   - **Y**: `20`
   - **Width**: `200`
   - **Height**: `40`
   - **Fill**: `RGBA(255, 255, 255, 0.2)`
   - **Color**: `RGBA(255, 255, 255, 1)`

### Step 5: Create List View

#### Add Gallery
1. Click **+ Insert** → **Vertical gallery**
2. Rename to `ListViewGallery`
3. Properties:
   - **Items**: `Deliverables`
   - **X**: `20`
   - **Y**: `100`
   - **Width**: `Parent.Width - 40`
   - **Height**: `Parent.Height - 120`
   - **Visible**: `varViewMode = "List"`
   - **Template size**: `120`

#### Customize Gallery Template

Click on the gallery, then click **Edit** (pencil icon) to enter edit mode.

Delete all default controls in the template. Now add:

**1. Title Label**
- Insert → Label
- Name: `ListItemTitle`
- **Text**: `ThisItem.Title`
- **X**: `20`
- **Y**: `15`
- **Width**: `400`
- **Height**: `30`
- **Size**: `16`
- **Font weight**: `FontWeight.Semibold`

**2. Description Label**
- Insert → Label
- Name: `ListItemDescription`
- **Text**: `ThisItem.Description`
- **X**: `20`
- **Y**: `50`
- **Width**: `400`
- **Height**: `50`
- **Size**: `12`
- **Color**: `RGBA(102, 102, 102, 1)`

**3. Status Label**
- Insert → Label
- Name: `ListItemStatus`
- **Text**: `ThisItem.Status.Value`
- **X**: `440`
- **Y**: `20`
- **Width**: `150`
- **Height**: `30`
- **Size**: `12`
- **Align**: `Align.Center`
- **Fill**:
  ```
  Switch(ThisItem.Status.Value,
    "Not Started", RGBA(173, 173, 173, 1),
    "In Progress", RGBA(255, 193, 7, 1),
    "In Review", RGBA(33, 150, 243, 1),
    "Completed", RGBA(76, 175, 80, 1),
    RGBA(200, 200, 200, 1)
  )
  ```
- **Color**: `RGBA(255, 255, 255, 1)`

**4. Priority Label**
- Insert → Label
- Name: `ListItemPriority`
- **Text**: `"Priority: " & ThisItem.Priority.Value`
- **X**: `610`
- **Y**: `20`
- **Width**: `120`
- **Height**: `30`
- **Size**: `12`
- **Color**:
  ```
  Switch(ThisItem.Priority.Value,
    "High", RGBA(244, 67, 54, 1),
    "Medium", RGBA(255, 152, 0, 1),
    "Low", RGBA(76, 175, 80, 1),
    RGBA(102, 102, 102, 1)
  )
  ```

**5. Due Date Label**
- Insert → Label
- Name: `ListItemDueDate`
- **Text**: `"Due: " & Text(ThisItem.'Due Date', "mm/dd/yyyy")`
- **X**: `610`
- **Y**: `55`
- **Width**: `150`
- **Height**: `30`
- **Size**: `12`
- **Color**:
  ```
  If(ThisItem.'Due Date' < Today(),
    RGBA(244, 67, 54, 1),
    RGBA(102, 102, 102, 1)
  )
  ```

**6. Owner Label**
- Insert → Label
- Name: `ListItemOwner`
- **Text**: `"Owner: " & ThisItem.Owner.DisplayName`
- **X**: `440`
- **Y**: `55`
- **Width**: `150`
- **Height**: `30`
- **Size**: `12`

Click outside the gallery to exit edit mode.

### Step 6: Create Kanban View

This is the more complex part. We'll create 4 galleries side by side.

#### Kanban Column 1: Not Started

1. Insert → **Vertical gallery**
2. Rename to `KanbanNotStarted`
3. Properties:
   - **Items**: `Filter(Deliverables, Status.Value = "Not Started")`
   - **X**: `20`
   - **Y**: `140`
   - **Width**: `(Parent.Width - 100) / 4`
   - **Height**: `Parent.Height - 180`
   - **Visible**: `varViewMode = "Kanban"`
   - **Template size**: `150`

Edit the gallery template:
- Delete default controls
- Add **Rectangle**:
  - **Fill**: `RGBA(255, 255, 255, 1)`
  - **BorderColor**: `RGBA(173, 173, 173, 1)`
  - **BorderThickness**: `2`
  - Width/Height: Fill the template

- Add **Title Label**:
  - **Text**: `ThisItem.Title`
  - Position at top
  - **Font weight**: `FontWeight.Semibold`

- Add **Description Label**:
  - **Text**: `ThisItem.Description`
  - Below title
  - **Size**: `11`

- Add **Due Date Label**:
  - **Text**: `Text(ThisItem.'Due Date', "mm/dd")`
  - At bottom
  - **Size**: `10`

#### Add Header Label for Not Started
- Insert → Label
- Name: `HeaderNotStarted`
- **Text**: `"Not Started"`
- **X**: `20`
- **Y**: `100`
- **Width**: `(Parent.Width - 100) / 4`
- **Height**: `30`
- **Size**: `14`
- **Font weight**: `FontWeight.Bold`
- **Align**: `Align.Center`
- **Color**: `RGBA(173, 173, 173, 1)`
- **Visible**: `varViewMode = "Kanban"`

#### Repeat for Other 3 Columns

**Column 2: In Progress**
- Gallery X position: `40 + (Parent.Width - 100) / 4`
- Filter: `Filter(Deliverables, Status.Value = "In Progress")`
- Border color: `RGBA(255, 193, 7, 1)` (amber)
- Header color: `RGBA(255, 193, 7, 1)`

**Column 3: In Review**
- Gallery X position: `60 + 2 * (Parent.Width - 100) / 4`
- Filter: `Filter(Deliverables, Status.Value = "In Review")`
- Border color: `RGBA(33, 150, 243, 1)` (blue)
- Header color: `RGBA(33, 150, 243, 1)`

**Column 4: Completed**
- Gallery X position: `80 + 3 * (Parent.Width - 100) / 4`
- Filter: `Filter(Deliverables, Status.Value = "Completed")`
- Border color: `RGBA(76, 175, 80, 1)` (green)
- Header color: `RGBA(76, 175, 80, 1)`

### Step 7: Test and Save

1. Click **Preview** button (play icon) or press F5
2. Test the toggle button
3. Verify both views display correctly
4. Press Esc to exit preview
5. Click **File** → **Save**
6. Click **Publish** → **Publish this version**

---

## Troubleshooting

### "Status.Value" errors
If you see errors, your SharePoint column might be returning different data. Try:
- `ThisItem.Status` (without .Value)
- Check the exact column name in SharePoint

### Gallery not showing items
- Click the gallery
- Check the **Items** property
- Make sure connection is active
- Try refreshing: Add a button with `Refresh(Deliverables)` and click it

### Colors not working
- Copy formulas exactly as shown
- Use formula bar (fx) at top for long formulas
- Check for typos in property names

### Layout issues on PWC laptop
- Adjust X, Y, Width, Height values to fit your screen
- Use responsive formulas like `Parent.Width` instead of fixed numbers

---

## Quick Reference: Color Codes

```
Blue (Header): RGBA(0, 120, 212, 1)
White: RGBA(255, 255, 255, 1)
Gray (Not Started): RGBA(173, 173, 173, 1)
Amber (In Progress): RGBA(255, 193, 7, 1)
Blue (In Review): RGBA(33, 150, 243, 1)
Green (Completed): RGBA(76, 175, 80, 1)
Red (High/Overdue): RGBA(244, 67, 54, 1)
Orange (Medium): RGBA(255, 152, 0, 1)
Light Gray: RGBA(243, 242, 241, 1)
Dark Gray: RGBA(102, 102, 102, 1)
```

---

## Next Steps

Once working:
- Add a **New Item** button
- Add **Edit** functionality
- Implement **Search** and **Filter**
- Add **Drag and Drop** for Kanban
- Create **Dashboard** with metrics
