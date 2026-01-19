# ============================================================
# DVUI Build Fix Script v4 - Complete Lovable UI Setup
# Version: Jan 19, 2026 - 08:30 PM
# Enables CommandCenter with ALL required dependencies
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DVUI Build Fix Script v4" -ForegroundColor Cyan
Write-Host "Complete Lovable UI Setup" -ForegroundColor Cyan
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
# Step 2: Install framer-motion (required for CommandCenter animations)
#------------------------------------------------------------------------------

Write-Host "`n[2/8] Installing framer-motion..." -ForegroundColor Yellow

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if (-not $packageJson.dependencies.'framer-motion') {
    npm install framer-motion --save 2>&1 | Out-Null
    Write-Host "  Installed framer-motion" -ForegroundColor Green
} else {
    Write-Host "  Already installed" -ForegroundColor Gray
}

#------------------------------------------------------------------------------
# Step 3: Download layout components (MainLayout, AppSidebar, Header)
#------------------------------------------------------------------------------

Write-Host "`n[3/8] Downloading layout components..." -ForegroundColor Yellow

# Create layout folder if not exists
if (-not (Test-Path "src\components\layout")) {
    New-Item -ItemType Directory -Path "src\components\layout" -Force | Out-Null
}

$layoutFiles = @("MainLayout.tsx", "AppSidebar.tsx", "Header.tsx", "NavLink.tsx")
foreach ($file in $layoutFiles) {
    Invoke-WebRequest -Uri "$baseUrl/src/components/layout/$file" -OutFile "src\components\layout\$file"
    Write-Host "  Downloaded $file" -ForegroundColor Gray
}
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 4: Download UI components (Card, Avatar, Button, etc.)
#------------------------------------------------------------------------------

Write-Host "`n[4/8] Downloading UI components..." -ForegroundColor Yellow

if (-not (Test-Path "src\components\ui")) {
    New-Item -ItemType Directory -Path "src\components\ui" -Force | Out-Null
}

$uiFiles = @("card.tsx", "button.tsx", "avatar.tsx", "input.tsx", "dropdown-menu.tsx", "badge.tsx")
foreach ($file in $uiFiles) {
    $url = "$baseUrl/src/components/ui/$file"
    try {
        Invoke-WebRequest -Uri $url -OutFile "src\components\ui\$file" -ErrorAction Stop
        Write-Host "  Downloaded $file" -ForegroundColor Gray
    } catch {
        Write-Host "  Skipped $file (may already exist or not needed)" -ForegroundColor DarkGray
    }
}
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 5: Download dataverseService.ts
#------------------------------------------------------------------------------

Write-Host "`n[5/8] Downloading dataverseService.ts..." -ForegroundColor Yellow

if (-not (Test-Path "src\services")) {
    New-Item -ItemType Directory -Path "src\services" -Force | Out-Null
}

Invoke-WebRequest -Uri "$baseUrl/src/services/dataverseService.ts" -OutFile "src\services\dataverseService.ts"
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 6: Download CommandCenter.tsx
#------------------------------------------------------------------------------

Write-Host "`n[6/8] Downloading CommandCenter.tsx..." -ForegroundColor Yellow

# Remove old .bak
if (Test-Path "src\screens\CommandCenter.tsx.bak") {
    Remove-Item "src\screens\CommandCenter.tsx.bak" -Force
}

Invoke-WebRequest -Uri "$baseUrl/src/screens/CommandCenter.tsx" -OutFile "src\screens\CommandCenter.tsx"
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 7: Enable CommandCenter route in App.tsx
#------------------------------------------------------------------------------

Write-Host "`n[7/8] Enabling CommandCenter route..." -ForegroundColor Yellow

$appPath = "src\App.tsx"
$content = Get-Content $appPath -Raw

# Handle import
if ($content -match "//\s*import CommandCenter") {
    $content = $content -replace "//\s*import CommandCenter from", "import CommandCenter from"
} elseif ($content -notmatch "import CommandCenter from") {
    $content = $content -replace "(import Login from [^;]+;)", "`$1`nimport CommandCenter from './screens/CommandCenter';"
}

# Handle route
if ($content -match "\{/\*.*CommandCenter.*disabled.*\*/\}") {
    $content = $content -replace '\{/\*\s*CommandCenter route disabled\s*\*/\}', '<Route path="/command-center" element={<CommandCenter />} />'
} elseif ($content -notmatch 'path="/command-center"') {
    $content = $content -replace '(<Route path="\*")', '<Route path="/command-center" element={<CommandCenter />} />`n          $1'
}

$content | Set-Content $appPath -NoNewline
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 8: Fix tsconfig, Build, and Push
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
Write-Host "`nCommandCenter enabled at /command-center" -ForegroundColor Cyan
Write-Host "Features:" -ForegroundColor Yellow
Write-Host "  * Animated floating orbs background" -ForegroundColor White
Write-Host "  * Glowing stat cards with hover effects" -ForegroundColor White
Write-Host "  * Animated counters" -ForegroundColor White
Write-Host "  * Circular progress indicators" -ForegroundColor White
Write-Host "  * Workstream progress bars" -ForegroundColor White
Write-Host "  * Team avatar stack" -ForegroundColor White
Write-Host "  * Particle effects" -ForegroundColor White
Write-Host "  * ALL using REAL Dataverse data!" -ForegroundColor Green
Write-Host "`nRefresh your Power Apps browser!" -ForegroundColor Yellow
