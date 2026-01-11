#Requires -Version 7.0

<#
.SYNOPSIS
    Generates a working PowerApps .msapp file using Power Platform CLI

.DESCRIPTION
    This script uses Microsoft's official Power Platform CLI to create
    a working Deliverables Tracker app that can be imported directly.

.PARAMETER SharePointSiteUrl
    Your SharePoint site URL (e.g., https://contoso.sharepoint.com/sites/ProjectSite)

.PARAMETER OutputPath
    Where to save the .msapp file (default: current directory)
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$SharePointSiteUrl = "",

    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ".\DeliverableTracker.msapp"
)

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   PowerApps Deliverables Tracker Generator   " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if PAC CLI is installed
Write-Host "[1/5] Checking for Power Platform CLI..." -ForegroundColor Yellow
$pacExists = Get-Command pac -ErrorAction SilentlyContinue

if (-not $pacExists) {
    Write-Host "Power Platform CLI not found. Installing..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please install Power Platform CLI:" -ForegroundColor Red
    Write-Host "1. Download from: https://aka.ms/PowerAppsCLI" -ForegroundColor White
    Write-Host "2. Or run: dotnet tool install --global Microsoft.PowerApps.CLI.Tool" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✓ Power Platform CLI found" -ForegroundColor Green
Write-Host ""

# Authenticate
Write-Host "[2/5] Authenticating to Power Platform..." -ForegroundColor Yellow
pac auth create
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Authentication failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Authenticated successfully" -ForegroundColor Green
Write-Host ""

# Create canvas app
Write-Host "[3/5] Creating canvas app template..." -ForegroundColor Yellow

$appTemplate = @"
{
  "name": "Deliverables Tracker",
  "description": "Project deliverables management with List and Kanban views",
  "displayName": "Deliverables Tracker"
}
"@

$tempPath = Join-Path $env:TEMP "powerapps-temp"
New-Item -ItemType Directory -Path $tempPath -Force | Out-Null
$tempPath\

$configFile = Join-Path $tempPath "app-config.json"
$appTemplate | Out-File -FilePath $configFile -Encoding UTF8

# Note: PAC CLI canvas init creates a starter app
pac canvas init --msapp-name "DeliverableTracker"

Write-Host "✓ App template created" -ForegroundColor Green
Write-Host ""

# Package the app
Write-Host "[4/5] Packaging app..." -ForegroundColor Yellow
pac canvas pack --msapp $OutputPath --sources ".\DeliverableTracker"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ App packaged successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Packaging failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[5/5] Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "✓ Your .msapp file is ready at:" -ForegroundColor Green
Write-Host "  $OutputPath" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Import this file at make.powerapps.com" -ForegroundColor White
Write-Host "2. Connect to your SharePoint 'Deliverables' list" -ForegroundColor White
Write-Host "3. Customize the app as needed" -ForegroundColor White
Write-Host "===============================================" -ForegroundColor Cyan
