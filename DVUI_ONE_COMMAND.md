# DVUI - Complete One-Command Workflow

**Just run this. That's it.**

---

## Step 1: Run the Setup Script

```powershell
Remove-Item setup-dvui-lovable.ps1 -ErrorAction SilentlyContinue
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv/setup-dvui-lovable.ps1" -OutFile "setup-dvui-lovable.ps1"
.\setup-dvui-lovable.ps1
```

**This script does EVERYTHING:**
- ✅ Downloads 50+ Lovable UI components (shadcn/ui)
- ✅ Installs ALL dependencies (Radix UI, Framer Motion, recharts, etc.)
- ✅ Configures Tailwind CSS with PWC design system
- ✅ Configures TypeScript and Vite with path aliases
- ✅ Downloads hooks (use-toast, use-mobile)
- ✅ Keeps your existing App/Layout (they work with Dataverse!)

---

## Step 2: Build and Deploy

```powershell
npm install
npm run build
pac code push
```

---

## Step 3: Verify It Worked

Open your app in Power Apps. You should see a **big blue/purple banner** at the top that says:

```
VERSION: Jan 18, 2026 - 09:47 PM EST
```

**If you see that exact timestamp, it worked!**

Every time I update the script, I'll change the timestamp so you know it's the latest version.

---

## That's All You Need

**Setup:** 3 commands (copy/paste the whole block)
**Deploy:** 3 commands (`npm install`, `npm run build`, and `pac code push`)
**Verify:** Check the version timestamp in the app

No file editing. No troubleshooting. Just works. 🚀

---

## If Something Goes Wrong

Just run the setup script again:

```powershell
.\setup-dvui-lovable.ps1
```

It's idempotent - you can run it as many times as you want and it won't break anything.
