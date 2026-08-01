# Healisa 💙

> "Healing starts with a single step."

A compassionate mobile-first web app for wellness and workout tracking. Built with care.

---

## What it does

- **AI Recovery Coach** — A warm, supportive chat companion (powered by MiniMax). Not a doctor, but always there.
- **Workout Logging** — Track exercises, duration, and intensity with a simple form.
- **Progress Tracking** — See your weekly stats, current streak, and workout history.
- **Dashboard** — A daily snapshot of how you're doing with a motivational message.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| Database | PostgreSQL (Supabase) |
| AI | MiniMax (OpenAI-compatible) |
| Frontend | React + Vite |
| Hosting | Railway + Vercel |

## Quick Start (Local)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt

# Copy and fill in your .env
cp .env.example .env

uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:8000` in a `.env` file in the `frontend/` folder.

## Project Structure

```
C:\Healisa\
  backend/
    main.py          — FastAPI app (all routes)
    models.py        — SQLAlchemy models
    schemas.py       — Pydantic schemas
    database.py      — DB connection
    auth.py          — JWT utilities
    requirements.txt
    .env.example
  frontend/
    src/
      App.jsx         — Router + layout
      api.js          — API client
      context/        — Auth context
      pages/          — Login, Register, Dashboard, Chat, Workouts, Progress
    index.html
    package.json
    vite.config.js
  DEPLOYMENT.md      — Full deploy guide
  README.md
```

## For Vlad

After deploying:
1. Register an account at the frontend URL
2. Run this SQL in Supabase to unlock all features:
   ```sql
   UPDATE users SET premium = true WHERE email = 'her@email.com';
   ```
3. Share the Vercel URL with her.

She's good to go. 💙
