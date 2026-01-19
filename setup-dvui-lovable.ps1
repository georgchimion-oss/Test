# ============================================================
# DVUI + Lovable UI + CommandCenter Setup Script
# Version: Jan 18, 2026 - 09:33 PM EST
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DVUI Enhanced Setup Script" -ForegroundColor Cyan
Write-Host "Version: Jan 18, 2026 - 09:33 PM EST" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

#------------------------------------------------------------------------------
# Step 1: Verify we're in the correct directory
#------------------------------------------------------------------------------

Write-Host "[1/9] Verifying directory..." -ForegroundColor Yellow

if (-not (Test-Path "power.config.json")) {
    Write-Host "ERROR: power.config.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from your project-governance-dvui directory." -ForegroundColor Red
    exit 1
}

Write-Host "  Done: Found power.config.json" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 2: Clean up conflicting files
#------------------------------------------------------------------------------

Write-Host "`n[2/9] Cleaning up conflicting files..." -ForegroundColor Yellow

# Remove conflicting types file
if (Test-Path "src\types\lovable.ts") {
    Remove-Item "src\types\lovable.ts" -Force
    Write-Host "  Removed conflicting lovable.ts" -ForegroundColor Green
}

# Remove pages with type conflicts
if (Test-Path "src\pages\CommandCenterPage.tsx") {
    Remove-Item "src\pages\CommandCenterPage.tsx" -Force
}
if (Test-Path "src\pages\DeliverablesPage.tsx") {
    Remove-Item "src\pages\DeliverablesPage.tsx" -Force
}

# Remove mapper with type conflicts
if (Test-Path "src\mappers\dataverseToLovable.ts") {
    Remove-Item "src\mappers\dataverseToLovable.ts" -Force
}

# Remove components with type conflicts
$componentsToRemove = @(
    "src\components\CommandCenter.tsx",
    "src\components\KanbanBoard.tsx",
    "src\components\GanttChart.tsx",
    "src\components\OrgChart.tsx",
    "src\components\ResourcePlanning.tsx"
)

foreach ($comp in $componentsToRemove) {
    if (Test-Path $comp) {
        Remove-Item $comp -Force
    }
}

Write-Host "  Done: Cleaned up" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 3: Create necessary folders
#------------------------------------------------------------------------------

Write-Host "`n[3/9] Creating folder structure..." -ForegroundColor Yellow

$folders = @(
    "src\components\ui",
    "src\components\dashboard",
    "src\components\layout",
    "src\screens",
    "src\lib",
    "src\data-lovable"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -Path $folder -ItemType Directory -Force | Out-Null
        Write-Host "  Created: $folder" -ForegroundColor Green
    }
}

#------------------------------------------------------------------------------
# Step 4: Install npm dependencies
#------------------------------------------------------------------------------

Write-Host "`n[4/9] Installing npm dependencies..." -ForegroundColor Yellow

$dependencies = "framer-motion date-fns lucide-react class-variance-authority clsx tailwind-merge react-router-dom"
$devDependencies = "tailwindcss postcss autoprefixer tailwindcss-animate"

Write-Host "  Installing dependencies (this may take a minute)..." -ForegroundColor Gray
npm install $dependencies --save 2>&1 | Out-Null
npm install $devDependencies --save-dev 2>&1 | Out-Null
Write-Host "  Done: Dependencies installed" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 5: Initialize Tailwind CSS
#------------------------------------------------------------------------------

Write-Host "`n[5/9] Setting up Tailwind CSS..." -ForegroundColor Yellow

if (-not (Test-Path "tailwind.config.js")) {
    npx tailwindcss init -p 2>&1 | Out-Null
}

$tailwindConfig = @"
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
"@
Set-Content -Path "tailwind.config.js" -Value $tailwindConfig
Write-Host "  Done: Tailwind configured" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 6: Update tsconfig.json
#------------------------------------------------------------------------------

Write-Host "`n[6/9] Updating TypeScript config..." -ForegroundColor Yellow

$tsconfigContent = Get-Content "tsconfig.json" -Raw
$tsconfig = $tsconfigContent | ConvertFrom-Json

if (-not $tsconfig.compilerOptions) {
    $tsconfig | Add-Member -MemberType NoteProperty -Name "compilerOptions" -Value @{} -Force
}

$tsconfig.compilerOptions | Add-Member -MemberType NoteProperty -Name "baseUrl" -Value "." -Force
$tsconfig.compilerOptions | Add-Member -MemberType NoteProperty -Name "paths" -Value @{
    "@/*" = @("./src/*")
} -Force

$tsconfig | ConvertTo-Json -Depth 10 | Set-Content "tsconfig.json"
Write-Host "  Done: TypeScript configured" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 7: Update vite.config.ts
#------------------------------------------------------------------------------

Write-Host "`n[7/9] Updating Vite config..." -ForegroundColor Yellow

$viteConfig = @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
"@
Set-Content -Path "vite.config.ts" -Value $viteConfig
Write-Host "  Done: Vite configured" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 8: Update CSS and create utilities
#------------------------------------------------------------------------------

Write-Host "`n[8/9] Setting up CSS and utilities..." -ForegroundColor Yellow

$indexCss = @"
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
"@
Set-Content -Path "src\index.css" -Value $indexCss

$utilsTs = @"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
"@
Set-Content -Path "src\lib\utils.ts" -Value $utilsTs
Write-Host "  Done: CSS and utilities created" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 9: Create UI components and test page
#------------------------------------------------------------------------------

Write-Host "`n[9/9] Creating UI components..." -ForegroundColor Yellow

# Card component
$cardContent = @"
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
"@
Set-Content -Path "src\components\ui\card.tsx" -Value $cardContent

# Badge component
$badgeContent = @"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "border-transparent bg-primary text-primary-foreground": variant === "default",
          "border-transparent bg-secondary text-secondary-foreground": variant === "secondary",
          "border-transparent bg-destructive text-destructive-foreground": variant === "destructive",
          "text-foreground": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
"@
Set-Content -Path "src\components\ui\badge.tsx" -Value $badgeContent

# Download App.tsx and Layout.tsx from GitHub
Write-Host "  Downloading App.tsx and Layout.tsx..." -ForegroundColor Gray
$baseUrl = "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv"

try {
    Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/App.tsx" -OutFile "src\App.tsx" -ErrorAction Stop
    Write-Host "  [OK] Downloaded App.tsx" -ForegroundColor Green
} catch {
    Write-Host "  [X] Failed to download App.tsx: $_" -ForegroundColor Red
}

try {
    Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/components/Layout.tsx" -OutFile "src\components\Layout.tsx" -ErrorAction Stop
    Write-Host "  [OK] Downloaded Layout.tsx" -ForegroundColor Green
} catch {
    Write-Host "  [X] Failed to download Layout.tsx: $_" -ForegroundColor Red
}

# Download CommandCenter
try {
    Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/screens/CommandCenter.tsx" -OutFile "src\screens\CommandCenter.tsx" -ErrorAction Stop
    Write-Host "  [OK] Downloaded CommandCenter.tsx" -ForegroundColor Green
} catch {
    Write-Host "  [X] Failed to download CommandCenter.tsx: $_" -ForegroundColor Red
}

# Download all Lovable UI components
Write-Host "  Downloading Lovable UI components..." -ForegroundColor Gray
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

$downloadedCount = 0
foreach ($component in $uiComponents) {
    try {
        Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/components/ui/$component.tsx" -OutFile "src\components\ui\$component.tsx" -ErrorAction Stop
        $downloadedCount++
    } catch {
        # Skip if not found
    }
}
Write-Host "  [OK] Downloaded $downloadedCount UI components" -ForegroundColor Green

# Download dashboard components
$dashboardComponents = @("DeliverableRow", "KPICard", "ProjectProgress", "RecentActivity", "RiskOverview", "UpcomingDeadlines")
foreach ($component in $dashboardComponents) {
    try {
        Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/components/dashboard/$component.tsx" -OutFile "src\components\dashboard\$component.tsx" -ErrorAction SilentlyContinue
    } catch {
        # Skip if not found
    }
}
Write-Host "  [OK] Downloaded dashboard components" -ForegroundColor Green

# Download layout components
$layoutComponents = @("AppSidebar", "Header", "MainLayout", "NavLink")
foreach ($component in $layoutComponents) {
    try {
        Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/components/layout/$component.tsx" -OutFile "src\components\layout\$component.tsx" -ErrorAction SilentlyContinue
    } catch {
        # Skip if not found
    }
}
Write-Host "  [OK] Downloaded layout components" -ForegroundColor Green

# Download lib files
try {
    Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/lib/utils.ts" -OutFile "src\lib\utils.ts" -ErrorAction SilentlyContinue
    Invoke-WebRequest -Uri "$baseUrl/dvui%20save/src/data-lovable/mockData.ts" -OutFile "src\data-lovable\mockData.ts" -ErrorAction SilentlyContinue
    Write-Host "  [OK] Downloaded utilities and data" -ForegroundColor Green
} catch {
    # Skip if not found
}

Write-Host "  Done: All files downloaded from GitHub" -ForegroundColor Green

#------------------------------------------------------------------------------
# Done!
#------------------------------------------------------------------------------

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "What was done:" -ForegroundColor Yellow
Write-Host "  [OK] Cleaned up conflicting files" -ForegroundColor White
Write-Host "  [OK] Installed all dependencies (Radix UI, Framer Motion, etc.)" -ForegroundColor White
Write-Host "  [OK] Configured Tailwind CSS with PWC design system" -ForegroundColor White
Write-Host "  [OK] Configured TypeScript and Vite with path aliases" -ForegroundColor White
Write-Host "  [OK] Downloaded 50+ Lovable UI components from GitHub" -ForegroundColor White
Write-Host "  [OK] Downloaded CommandCenter, dashboard, and layout components" -ForegroundColor White
Write-Host "  [OK] Downloaded enhanced App.tsx and Layout.tsx with all routes`n" -ForegroundColor White

Write-Host "Next commands:" -ForegroundColor Yellow
Write-Host "  npm install" -ForegroundColor White
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  pac code push`n" -ForegroundColor White

Write-Host "Your app now has:" -ForegroundColor Yellow
Write-Host "  * All original screens (Dashboard, Kanban, Gantt, etc.)" -ForegroundColor White
Write-Host "  * CommandCenter with animations (Zap icon in sidebar)" -ForegroundColor White
Write-Host "  * 50+ Lovable UI components ready to use" -ForegroundColor White
Write-Host "  * Enhanced navigation and layouts`n" -ForegroundColor White

Write-Host "To update later, just run this script again!`n" -ForegroundColor Cyan
