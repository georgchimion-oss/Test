# ============================================================
# DVUI Build Fix Script v3 - Enable CommandCenter
# Version: Jan 19, 2026 - 07:50 PM
# Enables CommandCenter with dataverseService hooks
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DVUI Build Fix Script v3" -ForegroundColor Cyan
Write-Host "Enable CommandCenter with Lovable UI" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

#------------------------------------------------------------------------------
# Step 1: Verify directory
#------------------------------------------------------------------------------

Write-Host "`n[1/7] Verifying directory..." -ForegroundColor Yellow

if (-not (Test-Path "power.config.json")) {
    Write-Host "ERROR: power.config.json not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the project-governance-dvui folder" -ForegroundColor Red
    exit 1
}
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 2: Download CommandCenter.tsx from GitHub (uses dataverseService hooks)
#------------------------------------------------------------------------------

Write-Host "`n[2/7] Downloading CommandCenter.tsx..." -ForegroundColor Yellow

$ccUrl = "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv/dvui%20save/src/screens/CommandCenter.tsx"
$ccPath = "src\screens\CommandCenter.tsx"

# Remove old .bak if exists
if (Test-Path "src\screens\CommandCenter.tsx.bak") {
    Remove-Item "src\screens\CommandCenter.tsx.bak" -Force
    Write-Host "  Removed old .bak file" -ForegroundColor Gray
}

Invoke-WebRequest -Uri $ccUrl -OutFile $ccPath
Write-Host "  OK: CommandCenter.tsx downloaded" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 3: Download dataverseService.ts (React Query hooks)
#------------------------------------------------------------------------------

Write-Host "`n[3/7] Downloading dataverseService.ts..." -ForegroundColor Yellow

$dsUrl = "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv/dvui%20save/src/services/dataverseService.ts"

# Create services folder if not exists
if (-not (Test-Path "src\services")) {
    New-Item -ItemType Directory -Path "src\services" -Force | Out-Null
    Write-Host "  Created src\services folder" -ForegroundColor Gray
}

Invoke-WebRequest -Uri $dsUrl -OutFile "src\services\dataverseService.ts"
Write-Host "  OK: dataverseService.ts downloaded" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 4: Re-enable CommandCenter route in App.tsx
#------------------------------------------------------------------------------

Write-Host "`n[4/7] Enabling CommandCenter route in App.tsx..." -ForegroundColor Yellow

$appPath = "src\App.tsx"
$content = Get-Content $appPath -Raw

# Check if CommandCenter import is commented out or missing
if ($content -match "//\s*import CommandCenter") {
    # Uncomment the import
    $content = $content -replace "//\s*import CommandCenter from", "import CommandCenter from"
    Write-Host "  Uncommented CommandCenter import" -ForegroundColor Gray
} elseif ($content -notmatch "import CommandCenter from") {
    # Add the import after other screen imports
    $content = $content -replace "(import Login from [^;]+;)", "`$1`nimport CommandCenter from './screens/CommandCenter';"
    Write-Host "  Added CommandCenter import" -ForegroundColor Gray
}

# Check if route is disabled/commented
if ($content -match "\{/\*.*CommandCenter.*disabled.*\*/\}") {
    # Replace the disabled comment with actual route
    $content = $content -replace '\{/\*\s*CommandCenter route disabled\s*\*/\}', '<Route path="/command-center" element={<CommandCenter />} />'
    Write-Host "  Enabled CommandCenter route" -ForegroundColor Gray
} elseif ($content -notmatch 'path="/command-center"') {
    # Add the route before the catch-all route
    $content = $content -replace '(<Route path="\*")', '<Route path="/command-center" element={<CommandCenter />} />`n          $1'
    Write-Host "  Added CommandCenter route" -ForegroundColor Gray
}

$content | Set-Content $appPath -NoNewline
Write-Host "  OK: App.tsx updated" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 5: Ensure tsconfig excludes are set
#------------------------------------------------------------------------------

Write-Host "`n[5/7] Checking tsconfig.json..." -ForegroundColor Yellow

$tsconfigPath = "tsconfig.json"
$tsconfig = Get-Content $tsconfigPath -Raw | ConvertFrom-Json

if (-not $tsconfig.exclude) {
    $tsconfig | Add-Member -Name "exclude" -Value @() -MemberType NoteProperty -Force
}

$tsconfig.exclude = @("node_modules", "dist", "src/_lovable_backup_*", "**/*.bak")
$tsconfig | ConvertTo-Json -Depth 10 | Set-Content $tsconfigPath
Write-Host "  OK: Backup folders excluded" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 6: Build
#------------------------------------------------------------------------------

Write-Host "`n[6/7] Building project..." -ForegroundColor Yellow

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n  BUILD FAILED!" -ForegroundColor Red
    Write-Host "  Run 'npm run build' manually to see errors." -ForegroundColor Yellow
    exit 1
}

Write-Host "  OK: Build successful!" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 7: Push to Power Apps
#------------------------------------------------------------------------------

Write-Host "`n[7/7] Pushing to Power Apps..." -ForegroundColor Yellow

pac code push

if ($LASTEXITCODE -ne 0) {
    Write-Host "  PUSH FAILED! Run 'pac auth list' to check login." -ForegroundColor Red
    exit 1
}

#------------------------------------------------------------------------------
# Success!
#------------------------------------------------------------------------------

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "CommandCenter is now enabled!" -ForegroundColor Green
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nRefresh your Power Apps browser tab!" -ForegroundColor Cyan
Write-Host "Navigate to /command-center to see it!" -ForegroundColor Cyan
