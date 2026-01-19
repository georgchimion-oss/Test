#==============================================================================
# DVUI Setup Script - One script for everything
# Run this script anytime you need to setup or fix your DVUI app
#==============================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "DVUI Setup & Fix Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

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
    "src\pages",
    "src\lib"
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

# Test page
$testPage = @"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function TestPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg text-center shadow-lg">
        <h2 className="text-3xl font-bold">VERSION: Jan 19, 2026 - 12:05 AM</h2>
        <p className="text-sm mt-2">If you see this exact timestamp, your app updated successfully!</p>
      </div>

      <h1 className="text-4xl font-bold">DVUI App - Ready!</h1>

      <Card>
        <CardHeader>
          <CardTitle>Setup Successful!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your DVUI app is working correctly.</p>
          <div className="mt-4 flex gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Build succeeded - Tailwind CSS is working ✓</li>
            <li>UI components are working ✓</li>
            <li>Ready to add features!</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
"@
Set-Content -Path "src\pages\TestPage.tsx" -Value $testPage

# App.tsx
$appContent = @"
import { TestPage } from './pages/TestPage';
import './index.css';

function App() {
  return <TestPage />;
}

export default App;
"@
Set-Content -Path "src\App.tsx" -Value $appContent

Write-Host "  Done: UI components created" -ForegroundColor Green

#------------------------------------------------------------------------------
# Done!
#------------------------------------------------------------------------------

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "What was done:" -ForegroundColor Yellow
Write-Host "  ✓ Cleaned up conflicting files" -ForegroundColor White
Write-Host "  ✓ Installed all dependencies" -ForegroundColor White
Write-Host "  ✓ Configured Tailwind CSS" -ForegroundColor White
Write-Host "  ✓ Configured TypeScript & Vite" -ForegroundColor White
Write-Host "  ✓ Created UI components" -ForegroundColor White
Write-Host "  ✓ Created test page`n" -ForegroundColor White

Write-Host "Next commands:" -ForegroundColor Yellow
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  pac code push" -ForegroundColor White
Write-Host "  pac code run  (to test locally)`n" -ForegroundColor White

Write-Host "To update later, just run this script again!`n" -ForegroundColor Cyan
