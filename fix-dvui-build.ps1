# ============================================================
# DVUI Build Fix Script v6 - Inline Styled CommandCenter
# Version: Jan 19, 2026 - 09:30 PM
# Uses hardcoded colors - no Tailwind CSS vars needed!
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DVUI Build Fix Script v6" -ForegroundColor Cyan
Write-Host "Inline Styled CommandCenter" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

$baseUrl = "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv/dvui%20save"

#------------------------------------------------------------------------------
# Step 1: Verify directory
#------------------------------------------------------------------------------

Write-Host "`n[1/6] Verifying directory..." -ForegroundColor Yellow

if (-not (Test-Path "power.config.json")) {
    Write-Host "ERROR: power.config.json not found!" -ForegroundColor Red
    exit 1
}
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 2: Install framer-motion (only dep needed for animations)
#------------------------------------------------------------------------------

Write-Host "`n[2/6] Installing framer-motion..." -ForegroundColor Yellow

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

Write-Host "`n[3/6] Downloading dataverseService.ts..." -ForegroundColor Yellow

if (-not (Test-Path "src\services")) {
    New-Item -ItemType Directory -Path "src\services" -Force | Out-Null
}

Invoke-WebRequest -Uri "$baseUrl/src/services/dataverseService.ts" -OutFile "src\services\dataverseService.ts"
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 4: Download CommandCenterInline.tsx as CommandCenter.tsx
#------------------------------------------------------------------------------

Write-Host "`n[4/6] Downloading CommandCenter (inline styled)..." -ForegroundColor Yellow

# Remove old files
if (Test-Path "src\screens\CommandCenter.tsx.bak") {
    Remove-Item "src\screens\CommandCenter.tsx.bak" -Force
}

Invoke-WebRequest -Uri "$baseUrl/src/screens/CommandCenterInline.tsx" -OutFile "src\screens\CommandCenter.tsx"
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 5: Update BUILD_STAMP and Enable Route
#------------------------------------------------------------------------------

Write-Host "`n[5/6] Updating BUILD_STAMP and route..." -ForegroundColor Yellow

$pushTime = Get-Date -Format "yyyy-MM-dd HH:mm"
$buildStamp = "Push $pushTime EST"

# Update BUILD_STAMP
$dashPath = "src\screens\DashboardEnhanced.tsx"
if (Test-Path $dashPath) {
    $dashContent = Get-Content $dashPath -Raw
    $dashContent = $dashContent -replace "const BUILD_STAMP = 'Push [^']*'", "const BUILD_STAMP = '$buildStamp'"
    $dashContent | Set-Content $dashPath -NoNewline
    Write-Host "  BUILD_STAMP = '$buildStamp'" -ForegroundColor Gray
}

# Enable CommandCenter route in App.tsx WITH Layout wrapper
$appPath = "src\App.tsx"
$content = Get-Content $appPath -Raw

if ($content -match "//\s*import CommandCenter") {
    $content = $content -replace "//\s*import CommandCenter from", "import CommandCenter from"
} elseif ($content -notmatch "import CommandCenter from") {
    $content = $content -replace "(import Login from [^;]+;)", "`$1`nimport CommandCenter from './screens/CommandCenter';"
}

# Add route WITH Layout wrapper (like other screens)
$routeCode = @'
<Route
        path="/command-center"
        element={
          <Layout title="Command Center">
            <CommandCenter />
          </Layout>
        }
      />
'@

if ($content -match "\{/\*.*CommandCenter.*disabled.*\*/\}") {
    $content = $content -replace '\{/\*\s*CommandCenter route disabled\s*\*/\}', $routeCode
} elseif ($content -notmatch 'path="/command-center"') {
    $content = $content -replace '(<Route path="\*")', "$routeCode`n      `$1"
}

$content | Set-Content $appPath -NoNewline
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 6: Build and Push
#------------------------------------------------------------------------------

Write-Host "`n[6/6] Building and pushing..." -ForegroundColor Yellow

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
Write-Host "v6 - Inline Styled CommandCenter:" -ForegroundColor Cyan
Write-Host "  * Dark background (#0a0a0a)" -ForegroundColor White
Write-Host "  * PWC Orange (#D04A02) accents" -ForegroundColor White
Write-Host "  * Animated floating orbs" -ForegroundColor White
Write-Host "  * Glowing stat cards" -ForegroundColor White
Write-Host "  * Circular progress rings" -ForegroundColor White
Write-Host "  * Activity bar chart" -ForegroundColor White
Write-Host "  * Team avatar stack" -ForegroundColor White
Write-Host "  * Particle effects" -ForegroundColor White
Write-Host "  * NO Tailwind CSS vars needed!" -ForegroundColor Green
Write-Host "`nGo to /command-center to see it!" -ForegroundColor Yellow
