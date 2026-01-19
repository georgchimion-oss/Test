# DVUI - One Command Setup

**Always run the same command. That's it.**

---

## The Only Command You Need

```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/georgchimion-oss/Test/claude/powerapp-sharepoint-deliverables-vbZKv/setup-dvui-lovable.ps1" -OutFile "setup-dvui-lovable.ps1" -Force; .\setup-dvui-lovable.ps1
```

**What it does:**
- Downloads the latest setup script
- Runs it automatically
- Sets up/fixes everything

---

## After First Setup

**Every time I make updates, just run:**

```powershell
.\setup-dvui-lovable.ps1
```

(The script is already downloaded, just run it again)

---

## Then Deploy

```powershell
npm run build
pac code push
```

---

## That's It!

- **First time:** Run the long command (downloads + runs)
- **Updates:** Run `.\setup-dvui-lovable.ps1`
- **Deploy:** `npm run build && pac code push`

Same commands every single time. No thinking required. 🚀
