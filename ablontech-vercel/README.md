# 🛡️ ABLON TECH — Vercel Deployment
### Node.js Serverless · Vercel KV (Redis) Database · Secure Admin Dashboard

---

## 📁 Project Structure

```
ablontech-vercel/
│
├── vercel.json                     ← Vercel routing & build config
├── package.json                    ← Dependencies
├── .env.example                    ← Copy to .env.local for local dev
├── .gitignore
│
├── api/                            ← Serverless functions (auto-deployed by Vercel)
│   ├── request.js                  ← POST /api/request  (contact form)
│   ├── admin-login.js              ← GET/POST /admin/login
│   ├── admin-logout.js             ← GET /admin/logout
│   ├── admin-page.js               ← GET /admin  (dashboard HTML)
│   └── admin/
│       ├── requests.js             ← GET /api/admin/requests
│       ├── export.js               ← GET /api/admin/export (CSV)
│       └── requests/
│           └── [id].js             ← PATCH/DELETE /api/admin/requests/:id
│
├── lib/                            ← Shared utilities
│   ├── db.js                       ← Database layer (Vercel KV / Redis)
│   └── auth.js                     ← Session & auth helpers
│
└── public/                         ← Static files (served directly)
    ├── index.html                  ← Public website
    ├── assets/
    │   └── logo.png                ← Ablon Tech logo
    ├── css/
    │   ├── site.css                ← Public website styles
    │   └── admin.css               ← Admin dashboard styles
    └── js/
        ├── site.js                 ← Public website JavaScript
        └── admin.js                ← Admin dashboard JavaScript
```

---

## 🗄️ DATABASE — Vercel KV (Redis)

This project uses **Vercel KV** (managed Redis) as the database.
- Free tier: 30,000 requests/month, 256MB storage
- Data persists forever (unlike SQLite on serverless)
- Automatically connected to your project on Vercel

---

## 🚀 STEP-BY-STEP DEPLOYMENT TO VERCEL

### ✅ PREREQUISITES
- A free account on **GitHub** (https://github.com)
- A free account on **Vercel** (https://vercel.com) — sign in with GitHub

---

### STEP 1 — Upload code to GitHub

1. Go to https://github.com/new
2. Create a repository named: `ablontech-vercel`
3. Set it to **Private** (so only you can see the code)
4. Click **"Create repository"**

Now upload your files:

**Option A — GitHub Website (easiest, no Git needed):**
1. Open your repository on GitHub
2. Click **"uploading an existing file"**
3. Drag and drop the entire `ablontech-vercel` folder contents
4. Click **"Commit changes"**

**Option B — Git command line:**
```bash
cd ablontech-vercel
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ablontech-vercel.git
git push -u origin main
```

---

### STEP 2 — Import project on Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Find your `ablontech-vercel` repository → click **"Import"**
4. Leave all settings as default
5. Click **"Deploy"**

Vercel will deploy and give you a URL like:
`https://ablontech-vercel.vercel.app`

---

### STEP 3 — Add Vercel KV (Database)

This is the database for storing support requests.

1. In your Vercel project dashboard, click the **"Storage"** tab
2. Click **"Create Database"**
3. Choose **"KV"** (Vercel KV — Redis)
4. Name it: `ablontech-kv`
5. Choose region closest to Ethiopia (e.g., `Frankfurt` or `London`)
6. Click **"Create"**
7. Click **"Connect to Project"** → select your project → **"Connect"**

Vercel will automatically add `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your environment. ✅

---

### STEP 4 — Add Admin Credentials

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add these two variables:

| Name | Value |
|------|-------|
| `ADMIN_USER` | `admin` (or your chosen username) |
| `ADMIN_PASS` | `YourStrongPasswordHere` |

3. Click **"Save"** for each

---

### STEP 5 — Redeploy

After adding environment variables, redeploy:

1. Go to **Deployments** tab
2. Click the 3 dots on the latest deployment → **"Redeploy"**
3. Wait ~30 seconds

---

### STEP 6 — Your Live URLs 🎉

| Page | URL |
|------|-----|
| 🌐 Website | `https://your-app.vercel.app` |
| 🔐 Admin Login | `https://your-app.vercel.app/admin/login` |
| 📋 Dashboard | `https://your-app.vercel.app/admin` |

---

### STEP 7 — Add a Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Type your domain: `ablontech.et` or `www.ablontech.et`
3. Follow the DNS instructions (add a CNAME record at your domain registrar)
4. Vercel adds free HTTPS automatically ✅

---

## 🔐 ADMIN DASHBOARD

### Access
```
https://your-app.vercel.app/admin/login
```

### Features
| Feature | Description |
|---------|-------------|
| 📊 Stats | Total / New / In Progress / Resolved counts |
| 🔍 Search | Search by name, phone, category, message |
| 🗂️ Filter | Filter by status |
| 👁️ View | Click any row for full request details |
| ⏳ Status | Update request status |
| 🗑️ Delete | Delete requests |
| ⬇️ Export | Download CSV (opens in Excel) |
| 🔄 Auto-refresh | Every 30 seconds |

---

## 🔧 CHANGING ADMIN PASSWORD ON VERCEL

1. Go to Vercel Dashboard → your project
2. Click **Settings** → **Environment Variables**
3. Find `ADMIN_PASS` → click **Edit** → change value → **Save**
4. Go to **Deployments** → Redeploy latest

---

## 💻 LOCAL DEVELOPMENT

To run locally before deploying:

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Link to your project
vercel link

# 4. Pull environment variables (including KV keys)
vercel env pull .env.local

# 5. Start local dev server
vercel dev
```

Site will be at: http://localhost:3000

---

## ❓ TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "KV not configured" error | Go to Storage tab → create & connect KV store |
| Can't login | Check ADMIN_USER / ADMIN_PASS in Environment Variables, redeploy |
| 404 on /admin | Make sure vercel.json routes are saved correctly |
| Form submission fails | Check Vercel Function Logs (in Deployments → View Logs) |
| No data showing | Make sure KV is connected and redeployed after adding vars |

---

## 📊 VERCEL FREE TIER LIMITS

| Resource | Free Limit |
|----------|-----------|
| Deployments | Unlimited |
| Bandwidth | 100 GB/month |
| Serverless Function executions | 100,000/month |
| KV requests | 30,000/month |
| KV storage | 256 MB |

More than enough for Ablon Tech! 🇪🇹

---

*Built for Ablon Tech — Addis Ababa, Ethiopia*
