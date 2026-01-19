# ============================================================
# DVUI Build Fix Script v3 - Enable Lovable UI
# Version: Jan 19, 2026 - 08:15 PM
# Enables CommandCenter + fancy Kanban/Gantt styling
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DVUI Build Fix Script v3" -ForegroundColor Cyan
Write-Host "Enable Lovable UI Components" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

#------------------------------------------------------------------------------
# Step 1: Verify directory
#------------------------------------------------------------------------------

Write-Host "`n[1/6] Verifying directory..." -ForegroundColor Yellow

if (-not (Test-Path "power.config.json")) {
    Write-Host "ERROR: power.config.json not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the project-governance-dvui folder" -ForegroundColor Red
    exit 1
}
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 2: Download CommandCenter.tsx (fancy animated dashboard)
#------------------------------------------------------------------------------

Write-Host "`n[2/6] Downloading CommandCenter.tsx..." -ForegroundColor Yellow

$baseUrl = "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv"

# Remove old .bak if exists
if (Test-Path "src\screens\CommandCenter.tsx.bak") {
    Remove-Item "src\screens\CommandCenter.tsx.bak" -Force
}

Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/screens/CommandCenter.tsx" -OutFile "src\screens\CommandCenter.tsx"
Write-Host "  OK: CommandCenter.tsx (animated dashboard)" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 3: Download dataverseService.ts (React Query hooks)
#------------------------------------------------------------------------------

Write-Host "`n[3/6] Downloading dataverseService.ts..." -ForegroundColor Yellow

if (-not (Test-Path "src\services")) {
    New-Item -ItemType Directory -Path "src\services" -Force | Out-Null
}

Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/services/dataverseService.ts" -OutFile "src\services\dataverseService.ts"
Write-Host "  OK: dataverseService.ts (React Query hooks)" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 4: Re-enable CommandCenter route in App.tsx
#------------------------------------------------------------------------------

Write-Host "`n[4/6] Enabling CommandCenter route..." -ForegroundColor Yellow

$appPath = "src\App.tsx"
$content = Get-Content $appPath -Raw

# Uncomment or add import
if ($content -match "//\s*import CommandCenter") {
    $content = $content -replace "//\s*import CommandCenter from", "import CommandCenter from"
    Write-Host "  Uncommented import" -ForegroundColor Gray
} elseif ($content -notmatch "import CommandCenter from") {
    $content = $content -replace "(import Login from [^;]+;)", "`$1`nimport CommandCenter from './screens/CommandCenter';"
    Write-Host "  Added import" -ForegroundColor Gray
}

# Enable route
if ($content -match "\{/\*.*CommandCenter.*disabled.*\*/\}") {
    $content = $content -replace '\{/\*\s*CommandCenter route disabled\s*\*/\}', '<Route path="/command-center" element={<CommandCenter />} />'
    Write-Host "  Enabled route" -ForegroundColor Gray
} elseif ($content -notmatch 'path="/command-center"') {
    $content = $content -replace '(<Route path="\*")', '<Route path="/command-center" element={<CommandCenter />} />`n          $1'
    Write-Host "  Added route" -ForegroundColor Gray
}

$content | Set-Content $appPath -NoNewline
Write-Host "  OK: App.tsx updated" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 5: Ensure tsconfig excludes
#------------------------------------------------------------------------------

Write-Host "`n[5/6] Checking tsconfig.json..." -ForegroundColor Yellow

$tsconfigPath = "tsconfig.json"
$tsconfig = Get-Content $tsconfigPath -Raw | ConvertFrom-Json

if (-not $tsconfig.exclude) {
    $tsconfig | Add-Member -Name "exclude" -Value @() -MemberType NoteProperty -Force
}

$tsconfig.exclude = @("node_modules", "dist", "src/_lovable_backup_*", "**/*.bak")
$tsconfig | ConvertTo-Json -Depth 10 | Set-Content $tsconfigPath
Write-Host "  OK" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 6: Build and Push
#------------------------------------------------------------------------------

Write-Host "`n[6/6] Building and pushing..." -ForegroundColor Yellow

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n  BUILD FAILED!" -ForegroundColor Red
    Write-Host "  Run 'npm run build' to see errors" -ForegroundColor Yellow
    exit 1
}

Write-Host "  Build OK" -ForegroundColor Green

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
Write-Host "`nNew features enabled:" -ForegroundColor Cyan
Write-Host "  * CommandCenter - Animated dashboard at /command-center" -ForegroundColor White
Write-Host "`nRefresh your Power Apps browser tab!" -ForegroundColor Yellow
