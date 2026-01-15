# Diagnose Dataverse Connection Issues
# Run this in your project folder to identify why Dataverse isn't connecting

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Dataverse Connection Diagnostics" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: power.config.json
Write-Host "[1/6] Checking power.config.json..." -ForegroundColor Yellow

if (Test-Path "power.config.json") {
    Write-Host "  ✓ power.config.json exists" -ForegroundColor Green

    $config = Get-Content "power.config.json" -Raw | ConvertFrom-Json

    if ($config.dataConnections -and $config.dataConnections.Count -gt 0) {
        Write-Host "  ✓ Found $($config.dataConnections.Count) Dataverse connections:" -ForegroundColor Green
        foreach ($conn in $config.dataConnections) {
            Write-Host "    - $($conn.displayName) ($($conn.logicalName))" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  ✗ No dataConnections configured!" -ForegroundColor Red
        Write-Host "    You need to add Dataverse tables to power.config.json" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ power.config.json NOT FOUND!" -ForegroundColor Red
    Write-Host "    Your project needs this file for Dataverse integration" -ForegroundColor Yellow
}

Write-Host ""

# Check 2: Service files
Write-Host "[2/6] Checking service files..." -ForegroundColor Yellow

$serviceFiles = Get-ChildItem -Path "src/services" -Filter "*.ts" -ErrorAction SilentlyContinue

if ($serviceFiles) {
    Write-Host "  ✓ Found $($serviceFiles.Count) service files" -ForegroundColor Green

    foreach ($file in $serviceFiles) {
        $content = Get-Content $file.FullName -Raw

        # Check for Dataverse patterns
        $hasDataverseAPI = $content -match "api/data/v9\.\d+" -or $content -match "crdab_" -or $content -match "useQuery"
        $hasMockData = $content -match "const.*=.*\[\s*\{" -or $content -match "mockData" -or $content -match "localData"

        if ($hasDataverseAPI) {
            Write-Host "    ✓ $($file.Name) - Uses Dataverse API" -ForegroundColor Green
        } elseif ($hasMockData) {
            Write-Host "    ✗ $($file.Name) - Uses MOCK/LOCAL data!" -ForegroundColor Red
        } else {
            Write-Host "    ? $($file.Name) - Unclear" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  ✗ No service files found in src/services/" -ForegroundColor Red
}

Write-Host ""

# Check 3: Environment variables
Write-Host "[3/6] Checking environment configuration..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "  ✓ .env file exists" -ForegroundColor Green
    $env = Get-Content ".env"

    if ($env -match "DATAVERSE_URL") {
        Write-Host "    ✓ DATAVERSE_URL configured" -ForegroundColor Green
    } else {
        Write-Host "    ✗ DATAVERSE_URL not set" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ .env file not found (may not be required)" -ForegroundColor Yellow
}

Write-Host ""

# Check 4: Authentication
Write-Host "[4/6] Checking Power Platform authentication..." -ForegroundColor Yellow

try {
    $authList = pac auth list 2>&1
    if ($authList -match "pwc-us-adv-poc") {
        Write-Host "  ✓ Authenticated to pwc-us-adv-poc" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Not authenticated to pwc-us-adv-poc" -ForegroundColor Yellow
        Write-Host "    Run: pac auth create --environment https://pwc-us-adv-poc.crm.dynamics.com" -ForegroundColor Cyan
    }
} catch {
    Write-Host "  ✗ pac command not available" -ForegroundColor Red
}

Write-Host ""

# Check 5: Dependencies
Write-Host "[5/6] Checking dependencies..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    $package = Get-Content "package.json" -Raw | ConvertFrom-Json

    $hasReactQuery = $package.dependencies.'@tanstack/react-query' -ne $null
    $hasDataverseSDK = $package.dependencies.'@microsoft/powerplatform-dataverse-webapi' -ne $null

    if ($hasReactQuery) {
        Write-Host "  ✓ @tanstack/react-query installed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ @tanstack/react-query not found (may not be needed)" -ForegroundColor Yellow
    }

    if ($hasDataverseSDK) {
        Write-Host "  ✓ Dataverse Web API SDK installed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Dataverse SDK not found (using fetch instead?)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Check 6: Model files
Write-Host "[6/6] Checking model files..." -ForegroundColor Yellow

$modelFiles = Get-ChildItem -Path "src/models" -Filter "*-models.ts" -ErrorAction SilentlyContinue

if ($modelFiles) {
    Write-Host "  ✓ Found $($modelFiles.Count) model files:" -ForegroundColor Green
    foreach ($file in $modelFiles) {
        Write-Host "    - $($file.Name)" -ForegroundColor Cyan
    }
} else {
    Write-Host "  ⚠ No model files found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SUMMARY & RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Provide recommendations
Write-Host "Next Steps:" -ForegroundColor White
Write-Host ""
Write-Host "1. Compare your local files with Vibe app in browser" -ForegroundColor Yellow
Write-Host "   Go to: vibe.powerapps.com → Your app → App tab" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Copy service files from Vibe that USE Dataverse" -ForegroundColor Yellow
Write-Host "   Look for files with: fetch(), useQuery, crdab_ tables" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Update power.config.json with correct dataConnections" -ForegroundColor Yellow
Write-Host "   See: FIX_DATAVERSE_CONNECTION.md for example" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Test by running: pac code run" -ForegroundColor Yellow
Write-Host "   NOT 'npm run dev' - use Power Platform CLI!" -ForegroundColor Cyan
Write-Host ""
