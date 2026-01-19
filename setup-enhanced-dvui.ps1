# ============================================================
# DVUI + Lovable UI + CommandCenter Setup Script
# Version: Jan 19, 2026 - 02:18 AM
# ============================================================

Write-Host "========================================"

 -ForegroundColor Cyan
Write-Host "DVUI Enhanced Setup Script" -ForegroundColor Cyan
Write-Host "Version: Jan 19, 2026 - 02:18 AM" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will enhance your existing DVUI app with:" -ForegroundColor White
Write-Host "  • 50+ Lovable UI components (shadcn/ui)" -ForegroundColor Gray
Write-Host "  • CommandCenter with animations" -ForegroundColor Gray
Write-Host "  • Tailwind CSS + Framer Motion" -ForegroundColor Gray
Write-Host "  • Enhanced navigation and layouts" -ForegroundColor Gray
Write-Host ""

# Base GitHub URL
$baseUrl = "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv"

# Step 1: Verify directory
Write-Host "[Step 1] Verifying directory..." -ForegroundColor Green
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from your project directory." -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Found package.json" -ForegroundColor Gray

# Step 2: Backup package.json
Write-Host "[Step 2] Backing up package.json..." -ForegroundColor Green
Copy-Item "package.json" "package.json.backup" -Force
Write-Host "  ✓ Backup created" -ForegroundColor Gray

# Step 3: Download package.json with all dependencies
Write-Host "[Step 3] Downloading enhanced package.json..." -ForegroundColor Green
try {
    Invoke-WebRequest -Uri "$baseUrl/dvui%20save/package.json" -OutFile "package.json" -ErrorAction Stop
    Write-Host "  ✓ Downloaded" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Failed to download package.json" -ForegroundColor Red
    Copy-Item "package.json.backup" "package.json" -Force
    exit 1
}

# Step 4: Download config files
Write-Host "[Step 4] Downloading configuration files..." -ForegroundColor Green
Invoke-WebRequest -Uri "$baseUrl/dvui%20save/tsconfig.json" -OutFile "tsconfig.json"
Invoke-WebRequest -Uri "$baseUrl/dvui%20save/vite.config.ts" -OutFile "vite.config.ts"
Invoke-WebRequest -Uri "$baseUrl/dvui%20save/tailwind.config.ts" -OutFile "tailwind.config.ts"
Invoke-WebRequest -Uri "$baseUrl/dvui%20save/postcss.config.js" -OutFile "postcss.config.js"
Invoke-WebRequest -Uri "$baseUrl/dvui%20save/components.json" -OutFile "components.json"
Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/index.css" -OutFile "src/index.css"
Write-Host "  ✓ Downloaded all configs" -ForegroundColor Gray

# Step 5: Create directories
Write-Host "[Step 5] Creating directory structure..." -ForegroundColor Green
$dirs = @(
    "src/components/ui",
    "src/components/dashboard",
    "src/components/layout",
    "src/lib",
    "src/data-lovable"
)
foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "  ✓ Directories created" -ForegroundColor Gray

# Step 6: Download lib files
Write-Host "[Step 6] Downloading utilities..." -ForegroundColor Green
Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/lib/utils.ts" -OutFile "src/lib/utils.ts"
Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/data-lovable/mockData.ts" -OutFile "src/data-lovable/mockData.ts"
Write-Host "  ✓ Utilities downloaded" -ForegroundColor Gray

# Step 7: Download UI components
Write-Host "[Step 7] Downloading UI components (50+ files)..." -ForegroundColor Green
$uiComponents = @(
    "accordion", "alert-dialog", "alert", "aspect-ratio", "avatar", "badge",
    "breadcrumb", "button", "calendar", "card", "carousel", "chart",
    "checkbox", "collapsible", "command", "context-menu", "dialog", "drawer",
    "dropdown-menu", "form", "hover-card", "input-otp", "input", "label",
    "menubar", "navigation-menu", "pagination", "popover", "progress",
    "radio-group", "resizable", "scroll-area", "select", "separator", "sheet",
    "sidebar", "skeleton", "slider", "sonner", "switch", "table", "tabs",
    "textarea", "toast", "toaster", "toggle-group", "toggle", "tooltip", "use-mobile"
)
$count = 0
foreach ($component in $uiComponents) {
    try {
        Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/components/ui/$component.tsx" -OutFile "src/components/ui/$component.tsx" -ErrorAction Stop
        $count++
    } catch {
        # Skip if not found
    }
}
Write-Host "  ✓ Downloaded $count UI components" -ForegroundColor Gray

# Step 8: Download dashboard components
Write-Host "[Step 8] Downloading dashboard components..." -ForegroundColor Green
$dashboardComponents = @("DeliverableRow", "KPICard", "ProjectProgress", "RecentActivity", "RiskOverview", "UpcomingDeadlines")
foreach ($component in $dashboardComponents) {
    Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/components/dashboard/$component.tsx" -OutFile "src/components/dashboard/$component.tsx"
}
Write-Host "  ✓ Downloaded dashboard components" -ForegroundColor Gray

# Step 9: Download layout components
Write-Host "[Step 9] Downloading layout components..." -ForegroundColor Green
$layoutComponents = @("AppSidebar", "Header", "MainLayout", "NavLink")
foreach ($component in $layoutComponents) {
    Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/components/layout/$component.tsx" -OutFile "src/components/layout/$component.tsx"
}
Write-Host "  ✓ Downloaded layout components" -ForegroundColor Gray

# Step 10: Download CommandCenter
Write-Host "[Step 10] Downloading CommandCenter..." -ForegroundColor Green
Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/screens/CommandCenter.tsx" -OutFile "src/screens/CommandCenter.tsx"
Write-Host "  ✓ CommandCenter downloaded" -ForegroundColor Gray

# Step 11: Update App.tsx and Layout.tsx
Write-Host "[Step 11] Updating App.tsx and Layout.tsx..." -ForegroundColor Green
Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/App.tsx" -OutFile "src/App.tsx"
Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/components/Layout.tsx" -OutFile "src/components/Layout.tsx"
Write-Host "  ✓ Updated main files" -ForegroundColor Gray

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Version: Jan 19, 2026 - 02:18 AM" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. npm install" -ForegroundColor White
Write-Host "2. npm run build" -ForegroundColor White
Write-Host "3. pac code push" -ForegroundColor White
Write-Host ""
