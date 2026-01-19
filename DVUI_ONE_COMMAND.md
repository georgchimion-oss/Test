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
- ✅ Downloads CommandCenter with animations
- ✅ Downloads dashboard and layout components
- ✅ Updates package.json with all dependencies (Radix UI, Framer Motion, etc.)
- ✅ Configures Tailwind CSS, TypeScript, Vite
- ✅ Updates App.tsx and Layout.tsx with new routes

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
VERSION: Jan 18, 2026 - 09:33 PM EST
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
