# ============================================================
# DVUI Build Fix Script v5 - Complete Styling Setup
# Version: Jan 19, 2026 - 09:00 PM
# Enables CommandCenter with ALL styling (CSS variables, tailwind config)
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DVUI Build Fix Script v5" -ForegroundColor Cyan
Write-Host "Complete Styling Setup" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

$baseUrl = "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv/dvui%20save"

#------------------------------------------------------------------------------
# Step 1: Verify directory
#------------------------------------------------------------------------------

Write-Host "`n[1/10] Verifying directory..." -ForegroundColor Yellow

if (-not (Test-Path "power.config.json")) {
    Write-Host "ERROR: power.config.json not found!" -ForegroundColor Red
    exit 1
}
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 2: Install required npm packages
#------------------------------------------------------------------------------

Write-Host "`n[2/10] Installing npm packages..." -ForegroundColor Yellow

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

# Install framer-motion
if (-not $packageJson.dependencies.'framer-motion') {
    npm install framer-motion --save 2>&1 | Out-Null
    Write-Host "  Installed framer-motion" -ForegroundColor Gray
} else {
    Write-Host "  framer-motion already installed" -ForegroundColor Gray
}

# Install clsx and tailwind-merge (for cn() utility)
if (-not $packageJson.dependencies.'clsx') {
    npm install clsx tailwind-merge --save 2>&1 | Out-Null
    Write-Host "  Installed clsx + tailwind-merge" -ForegroundColor Gray
} else {
    Write-Host "  clsx + tailwind-merge already installed" -ForegroundColor Gray
}

# Install tailwindcss-animate
if (-not $packageJson.devDependencies.'tailwindcss-animate') {
    npm install tailwindcss-animate --save-dev 2>&1 | Out-Null
    Write-Host "  Installed tailwindcss-animate" -ForegroundColor Gray
} else {
    Write-Host "  tailwindcss-animate already installed" -ForegroundColor Gray
}

# Install class-variance-authority (for button variants)
if (-not $packageJson.dependencies.'class-variance-authority') {
    npm install class-variance-authority --save 2>&1 | Out-Null
    Write-Host "  Installed class-variance-authority" -ForegroundColor Gray
} else {
    Write-Host "  class-variance-authority already installed" -ForegroundColor Gray
}

# Install @radix-ui/react-slot (for button asChild)
if (-not $packageJson.dependencies.'@radix-ui/react-slot') {
    npm install @radix-ui/react-slot --save 2>&1 | Out-Null
    Write-Host "  Installed @radix-ui/react-slot" -ForegroundColor Gray
} else {
    Write-Host "  @radix-ui/react-slot already installed" -ForegroundColor Gray
}

Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 3: Download index.css (with all CSS variables)
#------------------------------------------------------------------------------

Write-Host "`n[3/10] Downloading index.css (CSS variables)..." -ForegroundColor Yellow

Invoke-WebRequest -Uri "$baseUrl/src/index.css" -OutFile "src\index.css"
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 4: Download tailwind.config.ts
#------------------------------------------------------------------------------

Write-Host "`n[4/10] Downloading tailwind.config.ts..." -ForegroundColor Yellow

Invoke-WebRequest -Uri "$baseUrl/tailwind.config.ts" -OutFile "tailwind.config.ts"
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 5: Download lib/utils.ts (cn function)
#------------------------------------------------------------------------------

Write-Host "`n[5/10] Downloading lib/utils.ts..." -ForegroundColor Yellow

if (-not (Test-Path "src\lib")) {
    New-Item -ItemType Directory -Path "src\lib" -Force | Out-Null
}

Invoke-WebRequest -Uri "$baseUrl/src/lib/utils.ts" -OutFile "src\lib\utils.ts"
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 6: Download layout components
#------------------------------------------------------------------------------

Write-Host "`n[6/10] Downloading layout components..." -ForegroundColor Yellow

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
# Step 7: Download UI components
#------------------------------------------------------------------------------

Write-Host "`n[7/10] Downloading UI components..." -ForegroundColor Yellow

if (-not (Test-Path "src\components\ui")) {
    New-Item -ItemType Directory -Path "src\components\ui" -Force | Out-Null
}

$uiFiles = @("card.tsx", "button.tsx", "avatar.tsx", "input.tsx", "dropdown-menu.tsx", "badge.tsx")
foreach ($file in $uiFiles) {
    try {
        Invoke-WebRequest -Uri "$baseUrl/src/components/ui/$file" -OutFile "src\components\ui\$file" -ErrorAction Stop
        Write-Host "  Downloaded $file" -ForegroundColor Gray
    } catch {
        Write-Host "  Skipped $file" -ForegroundColor DarkGray
    }
}
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 8: Download dataverseService.ts and CommandCenter.tsx
#------------------------------------------------------------------------------

Write-Host "`n[8/10] Downloading services and screens..." -ForegroundColor Yellow

if (-not (Test-Path "src\services")) {
    New-Item -ItemType Directory -Path "src\services" -Force | Out-Null
}

Invoke-WebRequest -Uri "$baseUrl/src/services/dataverseService.ts" -OutFile "src\services\dataverseService.ts"
Write-Host "  Downloaded dataverseService.ts" -ForegroundColor Gray

# Remove old .bak
if (Test-Path "src\screens\CommandCenter.tsx.bak") {
    Remove-Item "src\screens\CommandCenter.tsx.bak" -Force
}

Invoke-WebRequest -Uri "$baseUrl/src/screens/CommandCenter.tsx" -OutFile "src\screens\CommandCenter.tsx"
Write-Host "  Downloaded CommandCenter.tsx" -ForegroundColor Gray

Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 9: Enable CommandCenter route in App.tsx
#------------------------------------------------------------------------------

Write-Host "`n[9/10] Enabling CommandCenter route..." -ForegroundColor Yellow

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
# Step 10: Fix tsconfig, Build, and Push
#------------------------------------------------------------------------------

Write-Host "`n[10/10] Building and pushing..." -ForegroundColor Yellow

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
Write-Host "`nv5 Changes:" -ForegroundColor Cyan
Write-Host "  * Added index.css with CSS variables" -ForegroundColor White
Write-Host "  * Added tailwind.config.ts" -ForegroundColor White
Write-Host "  * Added lib/utils.ts (cn function)" -ForegroundColor White
Write-Host "  * Installed clsx, tailwind-merge, class-variance-authority" -ForegroundColor White
Write-Host "  * Installed @radix-ui/react-slot, tailwindcss-animate" -ForegroundColor White
Write-Host "`nCommandCenter enabled at /command-center" -ForegroundColor Cyan
Write-Host "Features:" -ForegroundColor Yellow
Write-Host "  * Animated floating orbs background" -ForegroundColor White
Write-Host "  * Glowing stat cards with hover effects" -ForegroundColor White
Write-Host "  * PWC Orange theme colors" -ForegroundColor White
Write-Host "  * Dark sidebar styling" -ForegroundColor White
Write-Host "  * ALL using REAL Dataverse data!" -ForegroundColor Green
Write-Host "`nRefresh your Power Apps browser!" -ForegroundColor Yellow
