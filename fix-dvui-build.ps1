# ============================================================
# DVUI Build Fix Script v7 - Fun Themes & Staff Cleanup
# Version: Jan 19, 2026 - 10:45 PM
# Adds 15 themes (France, Paris, PSG, Matrix, Barbie, etc.)
# Theme dropdown now in header on ALL screens
# Staff table: removed Role & Department columns
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DVUI Build Fix Script v7" -ForegroundColor Cyan
Write-Host "Fun Themes & Staff Cleanup" -ForegroundColor Cyan
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
# Step 2: Install framer-motion
#------------------------------------------------------------------------------

Write-Host "`n[2/8] Installing framer-motion..." -ForegroundColor Yellow

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if (-not $packageJson.dependencies.'framer-motion') {
    npm install framer-motion --save 2>&1 | Out-Null
    Write-Host "  Installed framer-motion" -ForegroundColor Gray
} else {
    Write-Host "  Already installed" -ForegroundColor Gray
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
# Step 4: Download ThemeContext (NEW - 15 fun themes!)
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

# CommandCenter
if (Test-Path "src\screens\CommandCenter.tsx.bak") {
    Remove-Item "src\screens\CommandCenter.tsx.bak" -Force
}
Invoke-WebRequest -Uri "$baseUrl/src/screens/CommandCenterInline.tsx" -OutFile "src\screens\CommandCenter.tsx"
Write-Host "  CommandCenter.tsx (animated dashboard)" -ForegroundColor Gray

# Staff (removed Role & Department columns)
Invoke-WebRequest -Uri "$baseUrl/src/screens/Staff.tsx" -OutFile "src\screens\Staff.tsx"
Write-Host "  Staff.tsx (removed Role & Department)" -ForegroundColor Gray

# DashboardEnhanced (uses ThemeContext)
Invoke-WebRequest -Uri "$baseUrl/src/screens/DashboardEnhanced.tsx" -OutFile "src\screens\DashboardEnhanced.tsx"
Write-Host "  DashboardEnhanced.tsx (uses ThemeContext)" -ForegroundColor Gray

Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 6: Download Layout & App (theme dropdown in header!)
#------------------------------------------------------------------------------

Write-Host "`n[6/8] Downloading Layout & App..." -ForegroundColor Yellow

Invoke-WebRequest -Uri "$baseUrl/src/components/Layout.tsx" -OutFile "src\components\Layout.tsx"
Write-Host "  Layout.tsx (theme dropdown in header)" -ForegroundColor Gray

Invoke-WebRequest -Uri "$baseUrl/src/App.tsx" -OutFile "src\App.tsx"
Write-Host "  App.tsx (ThemeProvider wrapper)" -ForegroundColor Gray

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
Write-Host "v7 - WHAT'S NEW:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  15 FUN THEMES (dropdown in header on ALL screens!):" -ForegroundColor Yellow
Write-Host "    PwC Light       - Professional corporate" -ForegroundColor White
Write-Host "    90s Neon        - Bright vibrant pastels" -ForegroundColor White
Write-Host "    Miami Vice      - Tropical vibes" -ForegroundColor White
Write-Host "    Chicago Bulls   - Red & black" -ForegroundColor White
Write-Host "    Vive la France! - Blue white red tricolor" -ForegroundColor Blue
Write-Host "    Paris Mon Amour - Romantic pink & gold" -ForegroundColor Magenta
Write-Host "    Paris SG        - PSG blue & red" -ForegroundColor Blue
Write-Host "    The Matrix      - Green on black" -ForegroundColor Green
Write-Host "    Barbie World    - Hot pink everywhere" -ForegroundColor Magenta
Write-Host "    Deep Ocean      - Ocean blues" -ForegroundColor Cyan
Write-Host "    California Sunset - Orange gradients" -ForegroundColor DarkYellow
Write-Host "    Enchanted Forest - Greens" -ForegroundColor Green
Write-Host "    LA Lakers       - Purple & gold" -ForegroundColor Magenta
Write-Host "    Cyberpunk 2077  - Neon cyan & magenta" -ForegroundColor Cyan
Write-Host "    Retro Arcade    - Classic game colors" -ForegroundColor Yellow
Write-Host ""
Write-Host "  STAFF SCREEN:" -ForegroundColor Yellow
Write-Host "    Removed Role & Department columns" -ForegroundColor White
Write-Host ""
Write-Host "  Theme persists in localStorage!" -ForegroundColor Green
Write-Host ""
