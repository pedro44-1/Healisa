# Healisa — Deployment Guide

Complete step-by-step to get Healisa live.

---

## Overview

| Layer | Service | Free Tier |
|-------|---------|-----------|
| Backend API | Railway | ✅ 500 hrs/month |
| Database | Supabase | ✅ 500 MB |
| Frontend | Vercel | ✅ Unlimited |

**Estimated time: ~30 minutes**

---

## Step 1 — Supabase (Database)

1. Go to [supabase.com](https://supabase.com) → Create project
2. Choose a region closest to your users
3. Under **Settings → Database**, find your **Connection string** (URI format):
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```
4. Copy it — you'll use it as `DATABASE_URL` in Railway.

---

## Step 2 — Railway (Backend)

### 2.1 Connect GitHub
1. Go to [railway.app](https://railway.app) → Sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repo (push the `backend/` folder or entire repo first)

### 2.2 Set Environment Variables
In Railway dashboard → your project → **Variables**, add:

```
DATABASE_URL=postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:5432/postgres
JWT_SECRET=super-long-random-secret-abc123
MINIMAX_API_KEY=  (leave empty for MVP, or add your key)
```

### 2.3 Set Start Command
Under **Settings → Start Command**:
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 2.4 Deploy
Railway auto-deploys on push. Wait for green ✅

Your backend URL will look like:
```
https://your-backend.up.railway.app
```
Test it: `https://your-backend.up.railway.app/health`

---

## Step 3 — Vercel (Frontend)

### 3.1 Connect GitHub
1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **Add New Project** → import your repo
3. Vercel auto-detects React/Vite. Configure:

**Framework Preset:** Vite

**Build Command:** `npm run build`

**Output Directory:** `dist`

### 3.2 Set Environment Variable
Under **Environment Variables**:

```
VITE_API_URL=https://your-backend.up.railway.app
```

Replace with your actual Railway URL.

### 3.3 Deploy
Click **Deploy**. Vercel gives you a URL like:
```
https://your-project.vercel.app
```

---

## Step 4 — Update Backend CORS (before frontend goes live)

In Railway, update `CORS_ORIGIN` variable:
```
CORS_ORIGIN=https://your-project.vercel.app
```
Then redeploy the backend.

---

## Step 5 — Create Her Account

1. Open the Vercel URL on her phone
2. Register with her email
3. **Manual premium flag** — connect to your Supabase database and run:

```sql
UPDATE users SET premium = true WHERE email = 'her@email.com';
```

Or via Supabase Dashboard → SQL Editor:
```sql
UPDATE users SET premium = true WHERE email = 'her@email.com';
```

---

## Step 6 — Verify Everything Works

- [ ] `/health` returns `{"status": "ok"}` on Railway
- [ ] Can register and login
- [ ] Can chat with AI Coach (or see fallback message if no MiniMax key)
- [ ] Can log a workout
- [ ] Progress stats show correctly
- [ ] Page loads on mobile within 3 seconds

---

## Updating the App

Push to GitHub — both Railway and Vercel auto-deploy.

---

## Troubleshooting

**Backend 500 on startup?**
Check your `DATABASE_URL` is correct and Supabase is awake.

**CORS errors on frontend?**
Set `CORS_ORIGIN` to your Vercel URL in Railway variables.

**Chat not working?**
Add your MiniMax API key to Railway `MINIMAX_API_KEY`. Falls back to a friendly message if not set.

**User not getting premium?**
Run the SQL update manually in Supabase. There's no admin panel in MVP.
