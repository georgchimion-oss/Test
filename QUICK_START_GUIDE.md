# Deliverables Tracker - Quick Start Guide

## 5-Minute Setup

### Step 1: Create SharePoint List (2 minutes)

#### Option A: Manual Creation
1. Go to your SharePoint site
2. Click **New** → **List**
3. Name it: **Deliverables**
4. Click **Create**
5. Add these columns by clicking **+ Add column**:

| Column | Type | Settings |
|--------|------|----------|
| Description | Multiple lines of text | - |
| Status | Choice | Choices: `Not Started`, `In Progress`, `In Review`, `Completed` |
| Owner | Person | - |
| Due Date | Date and time | Date only |
| Priority | Choice | Choices: `Low`, `Medium`, `High` |

#### Option B: PowerShell Script (Faster)
```powershell
# Install PnP PowerShell if needed
Install-Module -Name PnP.PowerShell -Scope CurrentUser

# Run the setup script
.\Create-DeliverablesList.ps1 -SiteUrl "https://yourtenant.sharepoint.com/sites/yoursite"
```

### Step 2: Import PowerApp (2 minutes)

1. Go to [make.powerapps.com](https://make.powerapps.com)
2. Click **Apps** → **Import canvas app**
3. Upload **DeliverableTracker.msapp**
4. Click **Import**

### Step 3: Connect to SharePoint (1 minute)

1. Open the imported app for editing
2. Click **Data** (left panel)
3. Click **Deliverables** → **...** → **Refresh**
4. Enter your SharePoint site URL
5. Select **Deliverables** list
6. Click **Connect**
7. **Save** and **Publish**

### Done!

Your app is ready. Click **Play** to test it.

---

## Adding Sample Data

Copy this into your SharePoint list for testing:

| Title | Description | Status | Priority | Due Date |
|-------|-------------|--------|----------|----------|
| Design mockups for homepage | Create design concepts | In Progress | High | [Today + 14 days] |
| Database schema review | Review and optimize schema | Not Started | Medium | [Today + 21 days] |
| User acceptance testing | UAT with stakeholders | In Review | High | [Today + 7 days] |
| API documentation | Complete API docs | Completed | Medium | [Today - 5 days] |
| Security audit | Security assessment | In Progress | High | [Today + 10 days] |
| Mobile testing | Test on mobile devices | Not Started | Low | [Today + 30 days] |

---

## Using the App

### Switch Views
- Click the button in top-right corner
- **List View**: Detailed list with all fields
- **Kanban View**: Visual board with status columns

### Understanding Colors

**Status Colors:**
- 🔵 Not Started (Gray)
- 🟡 In Progress (Amber)
- 🔵 In Review (Blue)
- 🟢 Completed (Green)

**Priority Colors:**
- 🔴 High (Red)
- 🟠 Medium (Orange)
- 🟢 Low (Green)

**Due Dates:**
- ⚠️ Overdue items show in red

---

## Troubleshooting

### Problem: "Cannot find Deliverables"
**Solution**:
- Check list name is exactly "Deliverables" (case-sensitive)
- Refresh data source in PowerApp
- Re-connect to SharePoint

### Problem: "Permission denied"
**Solution**:
- Ensure you have Edit rights on SharePoint list
- Re-authenticate SharePoint connector
- Check site permissions

### Problem: "No items in Kanban"
**Solution**:
- Verify Status values match exactly:
  - "Not Started" (not "NotStarted" or "Not started")
  - "In Progress" (not "InProgress")
  - "In Review" (not "InReview")
  - "Completed" (not "Complete")

---

## Next Steps

### Customizations
- Add more status columns
- Change colors in control properties
- Add forms for creating/editing items
- Implement drag-and-drop in Kanban

### Enhancements
- Add filtering by owner
- Include search functionality
- Add metrics dashboard
- Set up automated notifications
- Export to Excel

---

## Support Files

- **DeliverableTracker.msapp** - The PowerApp file
- **POWERAPP_README.md** - Detailed documentation
- **Create-DeliverablesList.ps1** - PowerShell setup script
- **SharePoint-List-Schema.json** - List schema reference

---

## SharePoint Site URL Format

Your SharePoint site URL should look like:
```
https://[tenant].sharepoint.com/sites/[site-name]
```

Examples:
- `https://contoso.sharepoint.com/sites/ProjectManagement`
- `https://fabrikam.sharepoint.com/sites/TeamSite`
- `https://northwind.sharepoint.com/sites/IT`

---

## Default View on Startup

The app starts in **List View** by default. To change this:

1. Open app for editing
2. Click **App** in tree view (left panel)
3. Find **OnStart** property
4. Change `Set(varViewMode, "List")` to `Set(varViewMode, "Kanban")`
5. Save and republish

---

## Questions?

Refer to **POWERAPP_README.md** for comprehensive documentation including:
- Technical details
- Formula explanations
- Advanced customization
- SharePoint list schema
- Complete feature list
