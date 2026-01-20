# ============================================================
# DVUI Build Fix Script v11b - COLOR FIX TEST
# Version: Jan 20, 2026 - 5:15 AM EST
# - NOW DOWNLOADS dataLayer.ts (was missing before!)
# - RED COLORS REMOVED FOR TESTING
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DVUI Build Fix Script v11b" -ForegroundColor Cyan
Write-Host "COLOR FIX TEST - RED REMOVED" -ForegroundColor Yellow
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Using raw GitHub with cache busting
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
Invoke-WebRequest -Uri "$baseUrl/src/data/dataLayer.ts" -OutFile "src\data\dataLayer.ts"
Write-Host "  dataLayer.ts (workstream colors - NO RED)" -ForegroundColor Green

Invoke-WebRequest -Uri "$baseUrl/src/services/dataverseService.ts" -OutFile "src\services\dataverseService.ts"
Write-Host "  dataverseService.ts" -ForegroundColor Gray
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 4: Download ThemeContext (15 fun themes!)
#------------------------------------------------------------------------------

Write-Host "`n[4/8] Downloading ThemeContext (15 themes!)..." -ForegroundColor Yellow

Invoke-WebRequest -Uri "$baseUrl/src/context/ThemeContext.tsx" -OutFile "src\context\ThemeContext.tsx"
Write-Host "  Themes: PwC, 90s Neon, Miami Vice, Chicago Bulls" -ForegroundColor Gray
Write-Host "          France, Paris, PSG, Matrix, Barbie" -ForegroundColor Gray
Write-Host "          Ocean, Sunset, Forest, Lakers, Cyberpunk, Retro" -ForegroundColor Gray
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 5: Download updated screens
#------------------------------------------------------------------------------

Write-Host "`n[5/8] Downloading updated screens..." -ForegroundColor Yellow

# Project Overview (Landing page with KPI drill-down)
Invoke-WebRequest -Uri "$baseUrl/src/screens/ProjectOverview.tsx" -OutFile "src\screens\ProjectOverview.tsx"
Write-Host "  ProjectOverview.tsx (KPI landing page)" -ForegroundColor Gray

# NEW: Beautiful Org Chart!
Invoke-WebRequest -Uri "$baseUrl/src/screens/OrgChart.tsx" -OutFile "src\screens\OrgChart.tsx"
Write-Host "  OrgChart.tsx (NEW - Beautiful unified org chart!)" -ForegroundColor Green

# Staff (removed Role & Department columns)
Invoke-WebRequest -Uri "$baseUrl/src/screens/Staff.tsx" -OutFile "src\screens\Staff.tsx"
Write-Host "  Staff.tsx" -ForegroundColor Gray

# DashboardEnhanced (uses ThemeContext)
Invoke-WebRequest -Uri "$baseUrl/src/screens/DashboardEnhanced.tsx" -OutFile "src\screens\DashboardEnhanced.tsx"
Write-Host "  DashboardEnhanced.tsx" -ForegroundColor Gray

# Deliverables (Quick Update modal)
Invoke-WebRequest -Uri "$baseUrl/src/screens/Deliverables.tsx" -OutFile "src\screens\Deliverables.tsx"
Write-Host "  Deliverables.tsx" -ForegroundColor Gray

# Kanban (Dataverse persistence + filters)
Invoke-WebRequest -Uri "$baseUrl/src/screens/Kanban.tsx" -OutFile "src\screens\Kanban.tsx"
Write-Host "  Kanban.tsx" -ForegroundColor Gray

Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 6: Download Layout & App (unified Org Chart route)
#------------------------------------------------------------------------------

Write-Host "`n[6/8] Downloading Layout & App..." -ForegroundColor Yellow

Invoke-WebRequest -Uri "$baseUrl/src/components/Layout.tsx" -OutFile "src\components\Layout.tsx"
Write-Host "  Layout.tsx (single Org Chart nav link)" -ForegroundColor Gray

Invoke-WebRequest -Uri "$baseUrl/src/App.tsx" -OutFile "src\App.tsx"
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
Write-Host "v11 - WHAT'S NEW:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  BEAUTIFUL ORG CHART:" -ForegroundColor Yellow
Write-Host "    - Unified single screen (replaces 2 old screens)" -ForegroundColor White
Write-Host "    - Toggle: Workstreams vs Hierarchy view" -ForegroundColor White
Write-Host "    - Modern card design with gradients & shadows" -ForegroundColor White
Write-Host "    - Hover animations (cards lift up)" -ForegroundColor White
Write-Host "    - Expand/Collapse all buttons" -ForegroundColor White
Write-Host "    - Workstream cards with colored headers" -ForegroundColor White
Write-Host "    - Lead badges with star icons" -ForegroundColor White
Write-Host "    - Title-based color coding:" -ForegroundColor White
Write-Host "      * Partner     = Orange" -ForegroundColor DarkYellow
Write-Host "      * Director    = Blue" -ForegroundColor Blue
Write-Host "      * Sr Manager  = Purple" -ForegroundColor Magenta
Write-Host "      * Manager     = Green" -ForegroundColor Green
Write-Host "      * Sr Associate = Cyan" -ForegroundColor Cyan
Write-Host "      * Associate   = Gray" -ForegroundColor Gray
Write-Host "    - Stats bar showing team composition" -ForegroundColor White
Write-Host "    - Hierarchy view with tree lines" -ForegroundColor White
Write-Host "    - Direct reports count badges" -ForegroundColor White
Write-Host ""
Write-Host "  Go to: Org Chart (in sidebar)" -ForegroundColor Green
Write-Host ""
