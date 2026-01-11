#Requires -Version 7.0

<#
.SYNOPSIS
    Properly packages your PowerApp with the new Kanban screen using official Microsoft tools

.DESCRIPTION
    This script uses Microsoft Power Platform CLI to create a proper .msapp file
    that includes your new scrKanbanModern screen. This will actually work when imported.

.NOTES
    Run this on your local Windows machine where you have the app files
#>

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  PowerApp Kanban Screen Packager" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check for Power Platform CLI
Write-Host "[Step 1/3] Checking for Power Platform CLI..." -ForegroundColor Yellow

$pacExists = Get-Command pac -ErrorAction SilentlyContinue

if (-not $pacExists) {
    Write-Host ""
    Write-Host "Power Platform CLI not found. Please install it:" -ForegroundColor Red
    Write-Host ""
    Write-Host "Option 1 (Recommended):" -ForegroundColor White
    Write-Host "  Download installer from: https://aka.ms/PowerAppsCLI" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 2 (If you have .NET):" -ForegroundColor White
    Write-Host "  Run: dotnet tool install --global Microsoft.PowerApps.CLI.Tool" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installing, run this script again." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✓ Power Platform CLI found" -ForegroundColor Green
Write-Host ""

# Step 2: Verify app-source folder exists
Write-Host "[Step 2/3] Checking for app source files..." -ForegroundColor Yellow

if (-not (Test-Path ".\app-source")) {
    Write-Host "✗ app-source folder not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please make sure you're running this script from the Test folder" -ForegroundColor Yellow
    Write-Host "that contains the app-source directory with scrKanbanModern.pa.yaml" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

if (-not (Test-Path ".\app-source\Src\scrKanbanModern.pa.yaml")) {
    Write-Host "✗ scrKanbanModern.pa.yaml not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "The Kanban screen file is missing from app-source\Src\" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✓ Found app-source with Kanban screen" -ForegroundColor Green
Write-Host ""

# Step 3: Pack the app
Write-Host "[Step 3/3] Packing app into .msapp file..." -ForegroundColor Yellow
Write-Host ""
Write-Host "This may take 30-60 seconds..." -ForegroundColor Gray
Write-Host ""

$outputFile = "ProjectGovernance_WithKanban.msapp"

# Remove old output if exists
if (Test-Path $outputFile) {
    Remove-Item $outputFile -Force
}

# Pack using Microsoft's official tool
pac canvas pack --msapp $outputFile --sources ".\app-source"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "✓ SUCCESS!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your app is ready at:" -ForegroundColor White
    Write-Host "  $outputFile" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Go to make.powerapps.com" -ForegroundColor White
    Write-Host "  2. Click 'Apps' → 'Import canvas app'" -ForegroundColor White
    Write-Host "  3. Upload: $outputFile" -ForegroundColor Cyan
    Write-Host "  4. Open app and find screen: scrKanbanModern" -ForegroundColor White
    Write-Host ""
    Write-Host "The Kanban screen will be there this time!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Packaging failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error message above." -ForegroundColor Yellow
    Write-Host "If you need help, share the error message." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
