# ============================================================
# DVUI Build Fix Script v14 - WORKSTREAM PROGRESS FIX
# Version: Jan 20, 2026 - 10:00 AM EST
# - Fixed workstream matching (by NAME not ID)
# - Show ALL workstreams in Project Overview (not just 5)
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DVUI Build Fix Script v14" -ForegroundColor Cyan
Write-Host "WORKSTREAM PROGRESS FIX" -ForegroundColor Green
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Using raw GitHub with cache busting timestamp
$cacheBust = Get-Date -Format 'yyyyMMddHHmmss'
$baseUrl = "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv/dvui%20save"

#------------------------------------------------------------------------------
# Step 1: Verify directory
#------------------------------------------------------------------------------

Write-Host "`n[1/8] Verifying directory..." -ForegroundColor Yellow

if (-not (Test-Path "power.config.json")) {
    Write-Host "ERROR: power.config.json not found!" -ForegroundColor Red
    exit 1
}
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 2: Install dependencies
#------------------------------------------------------------------------------

Write-Host "`n[2/8] Installing dependencies..." -ForegroundColor Yellow

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if (-not $packageJson.dependencies.'framer-motion') {
    npm install framer-motion --save 2>&1 | Out-Null
    Write-Host "  Installed framer-motion" -ForegroundColor Gray
} else {
    Write-Host "  framer-motion already installed" -ForegroundColor Gray
}

if (-not $packageJson.dependencies.'date-fns') {
    npm install date-fns --save 2>&1 | Out-Null
    Write-Host "  Installed date-fns" -ForegroundColor Gray
} else {
    Write-Host "  date-fns already installed" -ForegroundColor Gray
}
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 3: Download data layer and services
#------------------------------------------------------------------------------

Write-Host "`n[3/8] Downloading data layer and services..." -ForegroundColor Yellow

if (-not (Test-Path "src\data")) {
    New-Item -ItemType Directory -Path "src\data" -Force | Out-Null
}
if (-not (Test-Path "src\services")) {
    New-Item -ItemType Directory -Path "src\services" -Force | Out-Null
}

# IMPORTANT: Download dataLayer.ts (contains workstream color logic)
Invoke-WebRequest -Uri "$baseUrl/src/data/dataLayer.ts?t=$cacheBust" -OutFile "src\data\dataLayer.ts" -Headers @{"Cache-Control"="no-cache"; "Pragma"="no-cache"}
Write-Host "  dataLayer.ts (20 distinct workstream colors)" -ForegroundColor Green

Invoke-WebRequest -Uri "$baseUrl/src/services/dataverseService.ts?t=$cacheBust" -OutFile "src\services\dataverseService.ts" -Headers @{"Cache-Control"="no-cache"; "Pragma"="no-cache"}
Write-Host "  dataverseService.ts" -ForegroundColor Gray
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 4: Download ThemeContext (15 fun themes!)
#------------------------------------------------------------------------------

Write-Host "`n[4/8] Downloading ThemeContext (15 themes!)..." -ForegroundColor Yellow

Invoke-WebRequest -Uri "$baseUrl/src/context/ThemeContext.tsx?t=$cacheBust" -OutFile "src\context\ThemeContext.tsx" -Headers @{"Cache-Control"="no-cache"; "Pragma"="no-cache"}
Write-Host "  Themes: PwC, 90s Neon, Miami Vice, Chicago Bulls" -ForegroundColor Gray
Write-Host "          France, Paris, PSG, Matrix, Barbie" -ForegroundColor Gray
Write-Host "          Ocean, Sunset, Forest, Lakers, Cyberpunk, Retro" -ForegroundColor Gray
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 5: Download updated screens
#------------------------------------------------------------------------------

Write-Host "`n[5/8] Downloading updated screens..." -ForegroundColor Yellow

# Project Overview (Landing page with KPI drill-down)
Invoke-WebRequest -Uri "$baseUrl/src/screens/ProjectOverview.tsx?t=$cacheBust" -OutFile "src\screens\ProjectOverview.tsx" -Headers @{"Cache-Control"="no-cache"; "Pragma"="no-cache"}
Write-Host "  ProjectOverview.tsx (KPI landing page)" -ForegroundColor Gray

# NEW: Beautiful Org Chart!
Invoke-WebRequest -Uri "$baseUrl/src/screens/OrgChart.tsx?t=$cacheBust" -OutFile "src\screens\OrgChart.tsx" -Headers @{"Cache-Control"="no-cache"; "Pragma"="no-cache"}
Write-Host "  OrgChart.tsx (NEW - Beautiful unified org chart!)" -ForegroundColor Green

# Staff (removed Role & Department columns)
Invoke-WebRequest -Uri "$baseUrl/src/screens/Staff.tsx?t=$cacheBust" -OutFile "src\screens\Staff.tsx" -Headers @{"Cache-Control"="no-cache"; "Pragma"="no-cache"}
Write-Host "  Staff.tsx" -ForegroundColor Gray

# DashboardEnhanced (uses ThemeContext)
Invoke-WebRequest -Uri "$baseUrl/src/screens/DashboardEnhanced.tsx?t=$cacheBust" -OutFile "src\screens\DashboardEnhanced.tsx" -Headers @{"Cache-Control"="no-cache"; "Pragma"="no-cache"}
Write-Host "  DashboardEnhanced.tsx" -ForegroundColor Gray

# Deliverables (Quick Update modal)
Invoke-WebRequest -Uri "$baseUrl/src/screens/Deliverables.tsx?t=$cacheBust" -OutFile "src\screens\Deliverables.tsx" -Headers @{"Cache-Control"="no-cache"; "Pragma"="no-cache"}
Write-Host "  Deliverables.tsx" -ForegroundColor Gray

# Kanban (Dataverse persistence + filters)
Invoke-WebRequest -Uri "$baseUrl/src/screens/Kanban.tsx?t=$cacheBust" -OutFile "src\screens\Kanban.tsx" -Headers @{"Cache-Control"="no-cache"; "Pragma"="no-cache"}
Write-Host "  Kanban.tsx" -ForegroundColor Gray

# Workstreams
Invoke-WebRequest -Uri "$baseUrl/src/screens/Workstreams.tsx?t=$cacheBust" -OutFile "src\screens\Workstreams.tsx" -Headers @{"Cache-Control"="no-cache"; "Pragma"="no-cache"}
Write-Host "  Workstreams.tsx" -ForegroundColor Gray

Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 6: Download Layout & App (unified Org Chart route)
#------------------------------------------------------------------------------

Write-Host "`n[6/8] Downloading Layout & App..." -ForegroundColor Yellow

Invoke-WebRequest -Uri "$baseUrl/src/components/Layout.tsx?t=$cacheBust" -OutFile "src\components\Layout.tsx" -Headers @{"Cache-Control"="no-cache"; "Pragma"="no-cache"}
Write-Host "  Layout.tsx (single Org Chart nav link)" -ForegroundColor Gray

Invoke-WebRequest -Uri "$baseUrl/src/App.tsx?t=$cacheBust" -OutFile "src\App.tsx" -Headers @{"Cache-Control"="no-cache"; "Pragma"="no-cache"}
Write-Host "  App.tsx (unified /org-chart route)" -ForegroundColor Gray

Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 7: Update BUILD_STAMP
#------------------------------------------------------------------------------

Write-Host "`n[7/8] Updating BUILD_STAMP..." -ForegroundColor Yellow

$pushTime = Get-Date -Format "yyyy-MM-dd HH:mm"
$buildStamp = "Push $pushTime EST"

$dashPath = "src\screens\DashboardEnhanced.tsx"
if (Test-Path $dashPath) {
    $dashContent = Get-Content $dashPath -Raw
    $dashContent = $dashContent -replace "const BUILD_STAMP = 'Push [^']*'", "const BUILD_STAMP = '$buildStamp'"
    $dashContent | Set-Content $dashPath -NoNewline
    Write-Host "  BUILD_STAMP = '$buildStamp'" -ForegroundColor Gray
}
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 8: Remove old Org Chart files and Build
#------------------------------------------------------------------------------

Write-Host "`n[8/8] Building and pushing..." -ForegroundColor Yellow

# Remove old org chart files (now replaced by unified OrgChart.tsx)
if (Test-Path "src\screens\OrgChartHierarchy.tsx") {
    Remove-Item "src\screens\OrgChartHierarchy.tsx" -Force
    Write-Host "  Removed old OrgChartHierarchy.tsx" -ForegroundColor Gray
}
if (Test-Path "src\screens\OrgChartWorkstream.tsx") {
    Remove-Item "src\screens\OrgChartWorkstream.tsx" -Force
    Write-Host "  Removed old OrgChartWorkstream.tsx" -ForegroundColor Gray
}

# Fix tsconfig excludes
$tsconfig = Get-Content "tsconfig.json" -Raw | ConvertFrom-Json
if (-not $tsconfig.exclude) {
    $tsconfig | Add-Member -Name "exclude" -Value @() -MemberType NoteProperty -Force
}
$tsconfig.exclude = @("node_modules", "dist", "src/_lovable_backup_*", "**/*.bak")
$tsconfig | ConvertTo-Json -Depth 10 | Set-Content "tsconfig.json"

# Build
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n  BUILD FAILED!" -ForegroundColor Red
    Write-Host "  Run 'npm run build' to see errors" -ForegroundColor Yellow
    exit 1
}

Write-Host "  Build OK" -ForegroundColor Green

# Push
pac code push

if ($LASTEXITCODE -ne 0) {
    Write-Host "  PUSH FAILED! Check 'pac auth list'" -ForegroundColor Red
    exit 1
}

#------------------------------------------------------------------------------
# Success!
#------------------------------------------------------------------------------

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "##################################################" -ForegroundColor Magenta
Write-Host "#                                                #" -ForegroundColor Magenta
Write-Host "#  LOOK FOR THIS ON MY WORK PAGE:                #" -ForegroundColor Magenta
Write-Host "#                                                #" -ForegroundColor Magenta
Write-Host "#     $buildStamp                      #" -ForegroundColor White
Write-Host "#                                                #" -ForegroundColor Magenta
Write-Host "##################################################" -ForegroundColor Magenta
Write-Host ""
Write-Host "v14 - WHAT'S NEW:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  WORKSTREAM PROGRESS FIX:" -ForegroundColor Yellow
Write-Host "    - Fixed: Now matches by workstream NAME (not ID)" -ForegroundColor White
Write-Host "    - Shows ALL workstreams (not just 5)" -ForegroundColor White
Write-Host "    - Progress bars should now show actual percentages" -ForegroundColor White
Write-Host ""
Write-Host "  BIDIRECTIONAL STATUS/PROGRESS (from v13):" -ForegroundColor Yellow
Write-Host "    - Status Completed -> Progress 100%" -ForegroundColor White
Write-Host "    - Progress 100% -> Status Completed" -ForegroundColor White
Write-Host ""
Write-Host "  Test: Go to Project Overview, check Workstream Progress" -ForegroundColor Green
Write-Host ""
