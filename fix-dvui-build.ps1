# ============================================================
# DVUI Build Fix Script v6.2 - Sidebar Fix
# Version: Jan 19, 2026 - 10:20 PM
# Downloads App.tsx directly to ensure Layout wrapper is applied
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DVUI Build Fix Script v6.2" -ForegroundColor Cyan
Write-Host "Sidebar Fix - Downloads correct App.tsx" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

$baseUrl = "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv/dvui%20save"

#------------------------------------------------------------------------------
# Step 1: Verify directory
#------------------------------------------------------------------------------

Write-Host "`n[1/7] Verifying directory..." -ForegroundColor Yellow

if (-not (Test-Path "power.config.json")) {
    Write-Host "ERROR: power.config.json not found!" -ForegroundColor Red
    exit 1
}
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 2: Install framer-motion (only dep needed for animations)
#------------------------------------------------------------------------------

Write-Host "`n[2/7] Installing framer-motion..." -ForegroundColor Yellow

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if (-not $packageJson.dependencies.'framer-motion') {
    npm install framer-motion --save 2>&1 | Out-Null
    Write-Host "  Installed framer-motion" -ForegroundColor Gray
} else {
    Write-Host "  Already installed" -ForegroundColor Gray
}
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 3: Download dataverseService.ts (for data hooks)
#------------------------------------------------------------------------------

Write-Host "`n[3/7] Downloading dataverseService.ts..." -ForegroundColor Yellow

if (-not (Test-Path "src\services")) {
    New-Item -ItemType Directory -Path "src\services" -Force | Out-Null
}

Invoke-WebRequest -Uri "$baseUrl/src/services/dataverseService.ts" -OutFile "src\services\dataverseService.ts"
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 4: Download CommandCenterInline.tsx as CommandCenter.tsx
#------------------------------------------------------------------------------

Write-Host "`n[4/7] Downloading CommandCenter (inline styled)..." -ForegroundColor Yellow

# Remove old files
if (Test-Path "src\screens\CommandCenter.tsx.bak") {
    Remove-Item "src\screens\CommandCenter.tsx.bak" -Force
}

Invoke-WebRequest -Uri "$baseUrl/src/screens/CommandCenterInline.tsx" -OutFile "src\screens\CommandCenter.tsx"
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 5: Download App.tsx (has CommandCenter route WITH Layout wrapper)
#------------------------------------------------------------------------------

Write-Host "`n[5/7] Downloading App.tsx (with sidebar for CommandCenter)..." -ForegroundColor Yellow

Invoke-WebRequest -Uri "$baseUrl/src/App.tsx" -OutFile "src\App.tsx"
Write-Host "  OK - CommandCenter now wrapped in Layout!" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 6: Update BUILD_STAMP
#------------------------------------------------------------------------------

Write-Host "`n[6/7] Updating BUILD_STAMP..." -ForegroundColor Yellow

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
# Step 7: Build and Push
#------------------------------------------------------------------------------

Write-Host "`n[7/7] Building and pushing..." -ForegroundColor Yellow

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
Write-Host "v6.2 - SIDEBAR FIX:" -ForegroundColor Cyan
Write-Host "  * Downloads App.tsx directly (no regex)" -ForegroundColor Green
Write-Host "  * CommandCenter now wrapped in <Layout>" -ForegroundColor Green
Write-Host "  * Sidebar should appear!" -ForegroundColor Green
Write-Host ""
Write-Host "  * Light background (#f8f9fa)" -ForegroundColor White
Write-Host "  * PWC Orange (#D04A02) accents" -ForegroundColor White
Write-Host "  * Animated floating orbs" -ForegroundColor White
Write-Host "  * Glowing stat cards" -ForegroundColor White
Write-Host "  * All animations working" -ForegroundColor White
Write-Host "`nGo to /command-center to see it WITH SIDEBAR!" -ForegroundColor Yellow
