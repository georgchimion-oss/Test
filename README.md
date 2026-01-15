# PowerApps Code-First Development Guides

## 🎯 Quick Navigation

| Guide | What It Covers | When to Use |
|-------|---------------|-------------|
| **[UNPACK_CODE_APPS.md](./UNPACK_CODE_APPS.md)** | ⭐ How to download/unpack code component apps | You have a code app and want to edit it locally |
| **[DATAVERSE_SETUP_GUIDE.md](./DATAVERSE_SETUP_GUIDE.md)** | Setting up Dataverse tables for code apps | Building from scratch with Dataverse |
| **[UNPACK_VIBE_APP.md](./UNPACK_VIBE_APP.md)** | Working with Vibe-generated apps | You created an app in vibe.powerapps.com |
| **[KANBAN_SCREEN_DETAILS.md](./KANBAN_SCREEN_DETAILS.md)** | Kanban screen design (canvas app) | Reference for canvas app design |

---

## 🚀 Most Common Scenarios

### Scenario 1: "I created an app in Vibe, how do I edit it?"

**Answer: Clone the GitHub repo (if available) or export the solution**

```bash
# Option A: Clone from GitHub (check vibe.powerapps.com for repo link)
git clone https://github.com/your-org/your-app.git
cd your-app
npm install
npm start

# Option B: Export solution
pac auth create --environment https://yourorg.crm.dynamics.com
pac solution list
pac solution export --name YourSolution --path ./app.zip --managed false
pac solution unpack --zipfile ./app.zip --folder ./src --processCanvasApps
```

**See: [UNPACK_CODE_APPS.md](./UNPACK_CODE_APPS.md) for full details**

---

### Scenario 2: "How do I connect my React app to Dataverse?"

**Answer: Use the Dataverse Web API**

```typescript
import { WebApiClient } from '@microsoft/powerplatform-dataverse-webapi';

const client = new WebApiClient();

// Read data
const records = await client.retrieveMultipleRecords(
  'cr123_deliverable',
  '?$filter=cr123_active eq true'
);

// Write data
await client.createRecord('cr123_deliverable', {
  cr123_name: 'New Deliverable',
  cr123_status: 1
});
```

**See: [DATAVERSE_SETUP_GUIDE.md](./DATAVERSE_SETUP_GUIDE.md) for full setup**

---

### Scenario 3: "I want to build a Kanban board code app from scratch"

**Recommended: Start with Vibe, then customize**

1. Go to **vibe.powerapps.com**
2. Describe your Kanban board
3. Let Vibe create the app with Dataverse configured
4. Clone/export the source code
5. Edit the React components locally
6. Deploy back to Power Platform

**Why?** Vibe handles all the Dataverse table setup correctly from the start.

---

## 📦 Files in This Repo

### Working Guides (Use These)
- `UNPACK_CODE_APPS.md` - **Start here** for code component apps
- `DATAVERSE_SETUP_GUIDE.md` - Dataverse integration guide
- `UNPACK_VIBE_APP.md` - Vibe app workflow

### Legacy Files (Canvas App Approach - Old)
- `Pack-AppWithKanban.ps1` - Script for canvas apps (not needed for code apps)
- `ProjectGovernance.msapp` - Original canvas app
- `ProjectGovernance_Enhanced.msapp` - Enhanced canvas app
- `app-source/` - Unpacked canvas app source
- `KANBAN_SCREEN_DETAILS.md` - Canvas app Kanban design

---

## 🔑 Key Commands Reference

```bash
# Authentication
pac auth create --environment https://yourorg.crm.dynamics.com
pac auth list

# List apps/solutions
pac solution list
pac application list
pac pcf list

# Export and unpack
pac solution export --name MySolution --path ./app.zip --managed false
pac solution unpack --zipfile ./app.zip --folder ./src --processCanvasApps

# Edit code
cd ./src/Other/Customizations/YourControl/
npm install
npm start

# Build and deploy
npm run build
cd ../../../../
pac solution pack --zipfile ./updated.zip --folder ./src
pac solution import --path ./updated.zip

# Alternative: Direct push (for some code apps)
pac code push --environment https://yourorg.crm.dynamics.com
```

---

## ❓ FAQ

**Q: Canvas app vs Code component app - which should I use?**

**A: Code component apps for modern development:**
- React/TypeScript
- Better performance
- Version control friendly
- Modern tooling (VS Code, npm, git)
- Direct Dataverse integration

**Q: Can I convert a canvas app to a code app?**

**A: Not directly. Better to rebuild with code components or use Power Apps Component Framework (PCF).**

**Q: Do I need admin privileges?**

**A: No. Power Platform CLI can be installed without admin using .NET:**
```bash
dotnet tool install --global Microsoft.PowerApps.CLI.Tool
```

**Q: Where do I find my environment URL?**

**A: make.powerapps.com → Settings (gear) → Developer resources → Instance url**

---

## 🎯 Recommended Workflow

```
1. vibe.powerapps.com
   ↓ Create app with Dataverse

2. Clone/export source code
   ↓ Get React/TypeScript project

3. Edit locally (VS Code)
   ↓ Modify components, keep Dataverse service intact

4. Build & deploy
   ↓ npm run build → pac solution pack → import

5. Test in Power Apps
   ↓ Verify functionality

6. Repeat 3-5
   ↓ Iterate until perfect
```

---

## 📚 Additional Resources

- [Power Platform CLI Documentation](https://learn.microsoft.com/power-platform/developer/cli/introduction)
- [Dataverse Web API](https://learn.microsoft.com/power-apps/developer/data-platform/webapi/overview)
- [Power Apps Component Framework](https://learn.microsoft.com/power-apps/developer/component-framework/overview)
- [Vibe](https://vibe.powerapps.com)

---

**Need help? Check the specific guide for your scenario above, or open an issue in this repo.**
