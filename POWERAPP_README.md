# Deliverables Tracker - PowerApps Canvas App

## Overview
This PowerApps canvas app provides a comprehensive project deliverables management solution with two viewing modes:
- **List View**: Traditional list format displaying all deliverable details
- **Kanban View**: Visual board organized by status columns (Not Started, In Progress, In Review, Completed)

## Features
- Toggle between List and Kanban views with a single button click
- Color-coded status indicators
- Priority levels (Low, Medium, High) with visual differentiation
- Due date tracking with overdue highlighting
- Owner assignment
- Responsive layout for desktop and tablet

## SharePoint List Requirements

### Create the SharePoint List

1. Navigate to your SharePoint site
2. Create a new list called **"Deliverables"**
3. Add the following columns:

| Column Name | Type | Required | Choices/Settings |
|-------------|------|----------|------------------|
| Title | Single line of text | Yes | (Default column) |
| Description | Multiple lines of text | No | Plain text |
| Status | Choice | No | Not Started, In Progress, In Review, Completed |
| Owner | Person | No | Single person |
| DueDate | Date and Time | No | Date only |
| Priority | Choice | No | Low, Medium, High |

### Sample Data Structure

```
Title: "Design mockups for homepage"
Description: "Create initial design concepts for the new homepage layout"
Status: "In Progress"
Owner: John Doe
DueDate: 01/25/2026
Priority: "High"
```

## Installation Instructions

### Step 1: Import the App

1. Go to [Power Apps](https://make.powerapps.com)
2. Select your environment
3. Click **Apps** in the left navigation
4. Click **Import canvas app**
5. Upload the **DeliverableTracker.msapp** file
6. Click **Import**

### Step 2: Configure SharePoint Connection

1. Once imported, open the app for editing
2. In the left panel, click **Data** (database icon)
3. Click on the **Deliverables** data source
4. Click **...** (more options) → **Refresh**
5. You'll be prompted to connect to your SharePoint site
6. Enter your SharePoint site URL: `https://yourtenant.sharepoint.com/sites/yoursite`
7. Select the **Deliverables** list
8. Click **Connect**

### Step 3: Update the Data Source

1. Click **View** → **Data sources**
2. Find **Deliverables** and click the refresh icon
3. Verify the connection shows your SharePoint list
4. Save the app (Ctrl+S or File → Save)

### Step 4: Publish

1. Click **File** → **Publish**
2. Click **Publish this version**
3. Your app is now ready to use!

## Using the App

### List View
- Displays all deliverables in a scrollable list
- Shows: Title, Description, Status, Priority, Due Date, and Owner
- Status badges are color-coded:
  - **Not Started**: Gray
  - **In Progress**: Amber/Yellow
  - **In Review**: Blue
  - **Completed**: Green
- Priority is color-coded (High = Red, Medium = Orange, Low = Green)
- Overdue items show due date in red

### Kanban View
- Four columns representing each status
- Drag-and-drop functionality can be added with additional configuration
- Each card shows: Title, Description, and Due Date
- Cards are color-bordered based on status:
  - **Not Started**: Gray border
  - **In Progress**: Amber border
  - **In Review**: Blue border
  - **Completed**: Green border

### Toggle Between Views
- Click the **"Switch to Kanban"** or **"Switch to List"** button in the top right
- The view toggles instantly
- Your preference is maintained during the session

## Customization Options

### Modify Colors
Edit the color values in the control properties:
- Status colors are defined in the Fill property of status labels
- Card borders are defined in BorderColor properties

### Add More Status Types
1. Update your SharePoint list Status column choices
2. In PowerApps, add a new Kanban column gallery
3. Filter it by the new status: `Filter(Deliverables, Status = "YourNewStatus")`
4. Add corresponding header label

### Enable Drag-and-Drop (Advanced)
To enable drag-and-drop in Kanban view:
1. Add OnSelect properties to cards
2. Use Patch function to update Status field
3. Implement visual feedback with hover states

### Add New Fields
1. Add columns to SharePoint list
2. In PowerApps, refresh the data source
3. Add new labels/controls to the gallery templates
4. Reference fields using `ThisItem.FieldName`

## Technical Details

### File Structure
The .msapp file contains:
- **Header.json**: App configuration and version info
- **Properties.json**: App metadata and settings
- **Controls/1.json**: Screen and control definitions
- **DataSources/**: SharePoint connection definitions
- **Connections/**: API connection metadata
- **Entropy/**: Control IDs and checksums

### Key Formulas

**View Toggle (OnSelect):**
```
If(varViewMode = "List", Set(varViewMode, "Kanban"), Set(varViewMode, "List"))
```

**App OnStart:**
```
Set(varViewMode, "List");
ClearCollect(colStatuses, ["Not Started", "In Progress", "In Review", "Completed"]);
```

**Kanban Column Filter:**
```
Filter(Deliverables, Status = "In Progress")
```

**Status Color Coding:**
```
Switch(ThisItem.Status,
  "Not Started", RGBA(173, 173, 173, 1),
  "In Progress", RGBA(255, 193, 7, 1),
  "In Review", RGBA(33, 150, 243, 1),
  "Completed", RGBA(76, 175, 80, 1),
  RGBA(200, 200, 200, 1)
)
```

## Troubleshooting

### "Deliverables data source not found"
- Ensure you've created the SharePoint list with the exact name "Deliverables"
- Refresh the data source connection
- Check that all required columns exist

### "Permission denied" error
- Verify you have Edit permissions on the SharePoint list
- Check that the SharePoint connection is authenticated
- Re-authenticate the SharePoint connector

### Cards not showing in Kanban view
- Verify your items have Status values that match exactly: "Not Started", "In Progress", "In Review", "Completed"
- Check for extra spaces or case differences in Status values

### App looks distorted
- The app is designed for 1366x768 landscape orientation
- Adjust screen size settings in File → Settings → Screen size + orientation

## Support and Enhancement Ideas

### Potential Enhancements
- Add search/filter functionality
- Implement sorting options (by due date, priority, etc.)
- Add create/edit forms for deliverables
- Include charts and metrics (completion rate, overdue count)
- Add email notifications for overdue items
- Implement user filtering (My Deliverables vs All)
- Add attachments support
- Export to Excel functionality

### SharePoint List Permissions
Remember to set appropriate permissions on your SharePoint list:
- **Read**: For users who only need to view deliverables
- **Edit**: For users who need to update statuses and details
- **Full Control**: For administrators

## Version Information
- **Version**: 1.0.0
- **Created**: January 2026
- **PowerApps Version**: 1.338
- **Compatible with**: PowerApps web and mobile

## License
This app template is provided as-is for use in your organization. Customize as needed for your specific requirements.
