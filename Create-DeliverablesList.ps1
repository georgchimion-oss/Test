# PowerShell Script to Create SharePoint Deliverables List
# Prerequisites: Install PnP.PowerShell module
# Install-Module -Name PnP.PowerShell -Scope CurrentUser

param(
    [Parameter(Mandatory=$true)]
    [string]$SiteUrl,

    [Parameter(Mandatory=$false)]
    [string]$ListName = "Deliverables"
)

# Connect to SharePoint site
Write-Host "Connecting to SharePoint site: $SiteUrl" -ForegroundColor Cyan
Connect-PnPOnline -Url $SiteUrl -Interactive

# Create the list
Write-Host "Creating list: $ListName" -ForegroundColor Cyan
$list = New-PnPList -Title $ListName -Template GenericList -OnQuickLaunch

# Add Description column (Multiple lines of text)
Write-Host "Adding Description column..." -ForegroundColor Yellow
Add-PnPField -List $ListName -DisplayName "Description" -InternalName "Description" -Type Note -AddToDefaultView

# Add Status column (Choice)
Write-Host "Adding Status column..." -ForegroundColor Yellow
$statusChoices = @("Not Started", "In Progress", "In Review", "Completed")
Add-PnPField -List $ListName -DisplayName "Status" -InternalName "Status" -Type Choice -Choices $statusChoices -AddToDefaultView

# Add Owner column (Person)
Write-Host "Adding Owner column..." -ForegroundColor Yellow
Add-PnPField -List $ListName -DisplayName "Owner" -InternalName "Owner" -Type User -AddToDefaultView

# Add DueDate column (DateTime)
Write-Host "Adding DueDate column..." -ForegroundColor Yellow
Add-PnPField -List $ListName -DisplayName "Due Date" -InternalName "DueDate" -Type DateTime -AddToDefaultView

# Add Priority column (Choice)
Write-Host "Adding Priority column..." -ForegroundColor Yellow
$priorityChoices = @("Low", "Medium", "High")
Add-PnPField -List $ListName -DisplayName "Priority" -InternalName "Priority" -Type Choice -Choices $priorityChoices -AddToDefaultView

Write-Host "`nList created successfully!" -ForegroundColor Green
Write-Host "List URL: $SiteUrl/Lists/$ListName" -ForegroundColor Green

# Optional: Add sample data
Write-Host "`nWould you like to add sample data? (Y/N)" -ForegroundColor Cyan
$addSample = Read-Host

if ($addSample -eq "Y" -or $addSample -eq "y") {
    Write-Host "Adding sample deliverables..." -ForegroundColor Yellow

    # Get current user for Owner field
    $currentUser = Get-PnPUser | Select-Object -First 1

    # Sample items
    $sampleItems = @(
        @{
            Title = "Design mockups for homepage"
            Description = "Create initial design concepts for the new homepage layout"
            Status = "In Progress"
            Priority = "High"
            DueDate = (Get-Date).AddDays(14)
        },
        @{
            Title = "Database schema review"
            Description = "Review and optimize the current database schema for performance"
            Status = "Not Started"
            Priority = "Medium"
            DueDate = (Get-Date).AddDays(21)
        },
        @{
            Title = "User acceptance testing"
            Description = "Conduct UAT sessions with key stakeholders"
            Status = "In Review"
            Priority = "High"
            DueDate = (Get-Date).AddDays(7)
        },
        @{
            Title = "API documentation"
            Description = "Complete API documentation for all endpoints"
            Status = "Completed"
            Priority = "Medium"
            DueDate = (Get-Date).AddDays(-5)
        },
        @{
            Title = "Security audit"
            Description = "Perform comprehensive security audit of the application"
            Status = "In Progress"
            Priority = "High"
            DueDate = (Get-Date).AddDays(10)
        },
        @{
            Title = "Mobile responsiveness testing"
            Description = "Test application on various mobile devices and screen sizes"
            Status = "Not Started"
            Priority = "Low"
            DueDate = (Get-Date).AddDays(30)
        }
    )

    foreach ($item in $sampleItems) {
        Add-PnPListItem -List $ListName -Values $item
        Write-Host "  Added: $($item.Title)" -ForegroundColor Gray
    }

    Write-Host "`nSample data added successfully!" -ForegroundColor Green
}

Write-Host "`nSetup complete! You can now import the PowerApp and connect it to this list." -ForegroundColor Green
Write-Host "Site URL to use in PowerApp: $SiteUrl" -ForegroundColor Cyan
Write-Host "List Name: $ListName" -ForegroundColor Cyan

# Disconnect
Disconnect-PnPOnline
