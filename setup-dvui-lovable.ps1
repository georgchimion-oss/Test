#==============================================================================
# DVUI Lovable UI Setup Script
# Automated setup for integrating Lovable UI components with Dataverse
#==============================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "DVUI + Lovable UI Setup Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

#------------------------------------------------------------------------------
# Step 1: Verify we're in the correct directory
#------------------------------------------------------------------------------

Write-Host "[1/10] Verifying directory..." -ForegroundColor Yellow

if (-not (Test-Path "power.config.json")) {
    Write-Host "ERROR: power.config.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from your project-governance-dvui directory." -ForegroundColor Red
    exit 1
}

Write-Host "  Done: Found power.config.json" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 2: Create necessary folders
#------------------------------------------------------------------------------

Write-Host "`n[2/10] Creating folder structure..." -ForegroundColor Yellow

$folders = @(
    "src\types",
    "src\mappers",
    "src\components\dashboard",
    "src\components\layout",
    "src\components\ui",
    "src\pages",
    "src\lib"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -Path $folder -ItemType Directory -Force | Out-Null
        Write-Host "  Created: $folder" -ForegroundColor Green
    } else {
        Write-Host "  Exists: $folder" -ForegroundColor Gray
    }
}

#------------------------------------------------------------------------------
# Step 3: Download files from GitHub
#------------------------------------------------------------------------------

Write-Host "`n[3/10] Downloading files from GitHub..." -ForegroundColor Yellow

$baseUrl = "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv"

$files = @{
    "dvui-integration/types/lovable.ts" = "src\types\lovable.ts"
    "dvui-integration/mappers/dataverseToLovable.ts" = "src\mappers\dataverseToLovable.ts"
    "dvui-components/CommandCenter.tsx" = "src\components\CommandCenter.tsx"
    "dvui-components/KanbanBoard.tsx" = "src\components\KanbanBoard.tsx"
    "dvui-components/GanttChart.tsx" = "src\components\GanttChart.tsx"
    "dvui-components/OrgChart.tsx" = "src\components\OrgChart.tsx"
    "dvui-components/ResourcePlanning.tsx" = "src\components\ResourcePlanning.tsx"
    "dvui-integration/examples/CommandCenterPage.example.tsx" = "src\pages\CommandCenterPage.tsx"
    "dvui-integration/examples/DeliverablesPage.example.tsx" = "src\pages\DeliverablesPage.tsx"
}

foreach ($file in $files.GetEnumerator()) {
    $url = "$baseUrl/$($file.Key)"
    $destination = $file.Value

    try {
        Write-Host "  Downloading: $($file.Key)..." -NoNewline
        Invoke-WebRequest -Uri $url -OutFile $destination -ErrorAction Stop
        Write-Host " Done" -ForegroundColor Green
    } catch {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

#------------------------------------------------------------------------------
# Step 4: Install npm dependencies
#------------------------------------------------------------------------------

Write-Host "`n[4/10] Installing npm dependencies..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray

$dependencies = "framer-motion date-fns lucide-react class-variance-authority clsx tailwind-merge @radix-ui/react-avatar @radix-ui/react-badge @radix-ui/react-progress @radix-ui/react-slot react-router-dom"

Write-Host "  Installing production dependencies..." -ForegroundColor Gray
npm install $dependencies --save 2>&1 | Out-Null
Write-Host "  Done: Production dependencies installed" -ForegroundColor Green

$devDependencies = "tailwindcss postcss autoprefixer tailwindcss-animate"

Write-Host "  Installing dev dependencies..." -ForegroundColor Gray
npm install $devDependencies --save-dev 2>&1 | Out-Null
Write-Host "  Done: Dev dependencies installed" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 5: Initialize Tailwind CSS
#------------------------------------------------------------------------------

Write-Host "`n[5/10] Initializing Tailwind CSS..." -ForegroundColor Yellow

if (-not (Test-Path "tailwind.config.js")) {
    npx tailwindcss init -p 2>&1 | Out-Null
    Write-Host "  Done: Created tailwind.config.js and postcss.config.js" -ForegroundColor Green
} else {
    Write-Host "  Tailwind already initialized" -ForegroundColor Gray
}

#------------------------------------------------------------------------------
# Step 6: Update tailwind.config.js
#------------------------------------------------------------------------------

Write-Host "`n[6/10] Updating Tailwind configuration..." -ForegroundColor Yellow

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
Write-Host "  Done: Updated tailwind.config.js" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 7: Update tsconfig.json for path aliases
#------------------------------------------------------------------------------

Write-Host "`n[7/10] Updating TypeScript configuration..." -ForegroundColor Yellow

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
Write-Host "  Done: Added @ path alias to tsconfig.json" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 8: Update vite.config.ts for path aliases
#------------------------------------------------------------------------------

Write-Host "`n[8/10] Updating Vite configuration..." -ForegroundColor Yellow

$viteConfig = @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
"@

Set-Content -Path "vite.config.ts" -Value $viteConfig
Write-Host "  Done: Updated vite.config.ts" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 9: Update src/index.css
#------------------------------------------------------------------------------

Write-Host "`n[9/10] Updating CSS with Tailwind directives..." -ForegroundColor Yellow

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
Write-Host "  Done: Updated src\index.css" -ForegroundColor Green

#------------------------------------------------------------------------------
# Step 10: Create utility functions
#------------------------------------------------------------------------------

Write-Host "`n[10/10] Creating utility functions..." -ForegroundColor Yellow

$utilsTs = @"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
"@

Set-Content -Path "src\lib\utils.ts" -Value $utilsTs
Write-Host "  Done: Created src\lib\utils.ts" -ForegroundColor Green

#------------------------------------------------------------------------------
# Done!
#------------------------------------------------------------------------------

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy UI components from lovable-app-organized (or I can add them to the script)" -ForegroundColor White
Write-Host "2. Update mappers in src\mappers\dataverseToLovable.ts with your Dataverse field names" -ForegroundColor White
Write-Host "3. Test locally: pac code run" -ForegroundColor White
Write-Host "4. Build and deploy: npm run build && pac code push`n" -ForegroundColor White

Write-Host "Components installed:" -ForegroundColor Yellow
Write-Host "  - CommandCenter (Animated dashboard)" -ForegroundColor White
Write-Host "  - KanbanBoard (Drag & drop)" -ForegroundColor White
Write-Host "  - GanttChart (Timeline view)" -ForegroundColor White
Write-Host "  - OrgChart (Team hierarchy)" -ForegroundColor White
Write-Host "  - ResourcePlanning (Capacity management)`n" -ForegroundColor White

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
