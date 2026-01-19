# ============================================================
# DVUI Build Fix Script v10 - Project Overview Landing Page
# Version: Jan 20, 2026 - 2:00 AM
# - NEW: Project Overview as landing page (top of sidebar)
# - KPI cards: Due this month, Due next 2 weeks, Late deliverables
# - Click KPI -> drill down to list -> click item -> see history
# - Removed "Active Team" section from old CommandCenter
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DVUI Build Fix Script v10" -ForegroundColor Cyan
Write-Host "Project Overview Landing Page" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

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
# Step 2: Install framer-motion + date-fns
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
# Step 3: Download services
#------------------------------------------------------------------------------

Write-Host "`n[3/8] Downloading services..." -ForegroundColor Yellow

if (-not (Test-Path "src\services")) {
    New-Item -ItemType Directory -Path "src\services" -Force | Out-Null
}

Invoke-WebRequest -Uri "$baseUrl/src/services/dataverseService.ts" -OutFile "src\services\dataverseService.ts"
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

# Project Overview (NEW - Landing page with KPI drill-down!)
Invoke-WebRequest -Uri "$baseUrl/src/screens/ProjectOverview.tsx" -OutFile "src\screens\ProjectOverview.tsx"
Write-Host "  ProjectOverview.tsx (NEW - KPI landing page)" -ForegroundColor Green

# Staff (removed Role & Department columns)
Invoke-WebRequest -Uri "$baseUrl/src/screens/Staff.tsx" -OutFile "src\screens\Staff.tsx"
Write-Host "  Staff.tsx (removed Role & Department)" -ForegroundColor Gray

# DashboardEnhanced (uses ThemeContext)
Invoke-WebRequest -Uri "$baseUrl/src/screens/DashboardEnhanced.tsx" -OutFile "src\screens\DashboardEnhanced.tsx"
Write-Host "  DashboardEnhanced.tsx (uses ThemeContext)" -ForegroundColor Gray

# Deliverables (Quick Update modal)
Invoke-WebRequest -Uri "$baseUrl/src/screens/Deliverables.tsx" -OutFile "src\screens\Deliverables.tsx"
Write-Host "  Deliverables.tsx (comment button)" -ForegroundColor Gray

# Kanban (Dataverse persistence + filters)
Invoke-WebRequest -Uri "$baseUrl/src/screens/Kanban.tsx" -OutFile "src\screens\Kanban.tsx"
Write-Host "  Kanban.tsx (Dataverse persist + filters)" -ForegroundColor Gray

Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 6: Download Layout & App (Project Overview as landing page!)
#------------------------------------------------------------------------------

Write-Host "`n[6/8] Downloading Layout & App..." -ForegroundColor Yellow

Invoke-WebRequest -Uri "$baseUrl/src/components/Layout.tsx" -OutFile "src\components\Layout.tsx"
Write-Host "  Layout.tsx (Project Overview at top of sidebar)" -ForegroundColor Gray

Invoke-WebRequest -Uri "$baseUrl/src/App.tsx" -OutFile "src\App.tsx"
Write-Host "  App.tsx (Project Overview as landing page)" -ForegroundColor Gray

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
# Step 8: Build and Push
#------------------------------------------------------------------------------

Write-Host "`n[8/8] Building and pushing..." -ForegroundColor Yellow

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
Write-Host "v10 - WHAT'S NEW:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  PROJECT OVERVIEW (NEW LANDING PAGE!):" -ForegroundColor Yellow
Write-Host "    - Now the FIRST item in sidebar" -ForegroundColor Green
Write-Host "    - KPI Cards:" -ForegroundColor White
Write-Host "      * Due This Month" -ForegroundColor White
Write-Host "      * Due Next 2 Weeks" -ForegroundColor White
Write-Host "      * Overdue (Late)" -ForegroundColor White
Write-Host "    - Click KPI -> See deliverable list" -ForegroundColor White
Write-Host "    - Click deliverable -> See comments & history" -ForegroundColor White
Write-Host "    - Animated workstream progress bars" -ForegroundColor White
Write-Host "    - Overall stats cards" -ForegroundColor White
Write-Host ""
Write-Host "  SIDEBAR CHANGES:" -ForegroundColor Yellow
Write-Host "    - Project Overview moved to TOP" -ForegroundColor White
Write-Host "    - My Work now second" -ForegroundColor White
Write-Host "    - Removed Command Center (replaced by Project Overview)" -ForegroundColor White
Write-Host ""
