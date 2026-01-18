# Quick Start: DVUI + Lovable UI Integration

**Automated setup in 3 steps!**

---

## Step 1: Pull from GitHub

```powershell
cd C:\Users\gchimion001\OneDrive - PwC\Desktop\VSCODE\PowerAppsRepoPWC\VSCODE\Test
git pull origin claude/powerapp-sharepoint-deliverables-vbZKv
```

---

## Step 2: Copy the setup script

```powershell
# Copy setup script to your dvui folder
Copy-Item Test\setup-dvui-lovable.ps1 ..\project-governance-dvui\setup-dvui-lovable.ps1

# Navigate to dvui folder
cd ..\project-governance-dvui
```

---

## Step 3: Run the setup script

```powershell
.\setup-dvui-lovable.ps1
```

**That's it!** The script will:
- ✅ Download all components from GitHub
- ✅ Install all dependencies (framer-motion, date-fns, etc.)
- ✅ Configure Tailwind CSS
- ✅ Update TypeScript & Vite configs
- ✅ Create all necessary folders
- ✅ Set up mappers and types

---

## Step 4: Copy UI Components from Lovable

The shadcn/ui components are already in your lovable-app-organized folder. Copy them over:

```powershell
# From project-governance-dvui directory
xcopy C:\Users\gchimion001\OneDrive - PwC\Desktop\VSCODE\PowerAppsRepoPWC\VSCODE\Test\lovable-app-organized\src\components\ui src\components\ui /E /I /Y
```

---

## Step 5: Test Locally

```powershell
pac code run
```

Opens at http://localhost:5173

---

## Step 6: Build and Deploy

```powershell
npm run build
pac code push
```

---

## What You Got

### 🎨 Components

1. **CommandCenter** - Animated dashboard with:
   - Real-time KPI counters
   - Circular progress indicators
   - Floating background orbs
   - Pulse animations
   - Glassmorphism effects

2. **KanbanBoard** - Drag & drop board with:
   - 5 status columns
   - Drag and drop between columns
   - Auto-updates Dataverse
   - Progress bars on cards
   - Risk indicators

3. **GanttChart** - Timeline view with:
   - Interactive timeline
   - Month navigation
   - Progress overlay on bars
   - Hover tooltips
   - Color-coded by workstream

4. **OrgChart** - Team hierarchy with:
   - Expandable/collapsible nodes
   - Two views (hierarchy & workstream)
   - Hover details
   - Reporting lines

5. **ResourcePlanning** - Capacity management with:
   - Weekly utilization percentages
   - Overallocation warnings
   - PTO tracking
   - Active work display

### 🔧 Utilities

- **Data Mappers** - Convert Dataverse → Lovable types
- **TypeScript Types** - All Lovable type definitions
- **Example Pages** - Ready-to-use page templates

---

## Customize the Mappers

**IMPORTANT:** Update `src\mappers\dataverseToLovable.ts` with your actual Dataverse field names!

### Find Your Option Set Values:

1. Go to make.powerapps.com
2. Dataverse → Tables → crda8_deliverables
3. Columns → crda8_status
4. Note the values (0, 1, 2, etc.)

### Update the Mapper:

```typescript
function mapDeliverableStatus(dataverseStatus: number | string | undefined): DeliverableStatus {
  const statusMap: Record<string | number, DeliverableStatus> = {
    0: 'Not Started',           // <-- Update these numbers
    1: 'In Progress',           // <-- Based on your actual values
    2: 'Under Review',
    3: 'Client Review',
    4: 'Completed',
    5: 'On Hold',
    6: 'At Risk',
  };

  return statusMap[dataverseStatus as any] || 'Not Started';
}
```

Do the same for:
- `mapRiskLevel()`
- `mapJobTitle()`
- `mapPTOStatus()`

---

## Use the Components

### In your App.tsx or routing file:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CommandCenterPage />} />
          {/* Add more routes */}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

---

## Troubleshooting

### "Cannot find module '@/types'"
**Fix:** The setup script already configured the @ alias. Restart your editor.

### "Tailwind classes not working"
**Fix:** The setup script already configured Tailwind. Run `npm run dev` to rebuild.

### "Module not found: can't resolve 'path'"
**Fix:** Install @types/node:
```powershell
npm install -D @types/node
```

### Build errors about missing components
**Fix:** Make sure you copied the UI components from lovable-app-organized in Step 4.

---

## Adding More Features

Want to add the AI chatbot? Just tell me and I'll create the component + integration code!

All future updates: Just run the script again - it won't break existing files.

---

## File Structure After Setup

```
project-governance-dvui/
├── src/
│   ├── types/
│   │   └── lovable.ts
│   ├── mappers/
│   │   └── dataverseToLovable.ts
│   ├── components/
│   │   ├── CommandCenter.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── GanttChart.tsx
│   │   ├── OrgChart.tsx
│   │   ├── ResourcePlanning.tsx
│   │   └── ui/                    (copied from lovable)
│   ├── pages/
│   │   ├── CommandCenterPage.tsx
│   │   └── DeliverablesPage.tsx
│   ├── lib/
│   │   └── utils.ts
│   └── generated/                 (from pac code add-data-source)
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── power.config.json
```

---

## 🚀 You're Done!

Run the script, copy the UI components, and you're ready to go!

All the components are connected to Dataverse and will show real data from your tables.

Need help? Just ask! 💪
