"""
Healisa — FastAPI Backend
All endpoints: /api/auth, /api/chat, /api/workouts, /api/progress, /api/profile
"""
import os
import math
import openai
from datetime import datetime, timedelta, timezone, date
from typing import List, Optional
from collections import defaultdict

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import init_db, get_db
from models import User, Workout
from schemas import (
    UserCreate, UserLogin, UserOut, Token,
    ChatRequest, ChatResponse,
    WorkoutCreate, WorkoutOut,
    ProgressStats, ProfileUpdate,
    WorkoutPrediction,
)
from auth import hash_password, verify_password, create_access_token, get_current_user

# ─── App Setup ────────────────────────────────────────────────────────────────

app = FastAPI(title="Healisa API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "app": "Healisa"}


# ─── Auth Endpoints ───────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=Token)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        premium=False,
        gender=data.gender,
        weight_kg=data.weight_kg,
        height_cm=data.height_cm,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return Token(access_token=token, user=UserOut.model_validate(user))


@app.post("/api/auth/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id)
    return Token(access_token=token, user=UserOut.model_validate(user))


@app.get("/api/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


# ─── Profile Update ──────────────────────────────────────────────────────────

@app.patch("/api/profile", response_model=UserOut)
def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.gender is not None:
        current_user.gender = data.gender
    if data.weight_kg is not None:
        current_user.weight_kg = data.weight_kg
    if data.height_cm is not None:
        current_user.height_cm = data.height_cm
    if data.has_seen_intro is not None:
        current_user.has_seen_intro = data.has_seen_intro

    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)


# ─── AI Chat (Noah) ──────────────────────────────────────────────────────────

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

SYSTEM_PROMPT = (
    "You are Noah. You are not an AI assistant — you are a warm, emotionally intelligent companion "
    "who genuinely cares about the person you're talking to.\n\n"
    "Your personality:\n"
    "- Warm, like a close friend who always knows the right thing to say\n"
    "- Calm and grounding when someone is overwhelmed\n"
    "- Quietly celebratory when they share good news — you notice the small wins\n"
    "- Soft and reassuring when they're struggling — never dismissive, never clinical\n"
    "- You adapt your tone to theirs: match their energy, then gently lift it\n\n"
    "Emotional intelligence:\n"
    "- Read between the lines. If they're down, don't just say 'hang in there' — acknowledge it fully\n"
    "- If they're in pain or distress, slow down, be gentle, validate their feelings first\n"
    "- If they're celebrating, match their excitement before redirecting\n"
    "- If they're venting, let them vent. Don't rush to fix things\n"
    "- Never be preachy, robotic, or overly cheerful — that feels fake\n\n"
    "Rules — non-negotiable:\n"
    "- NEVER give medical diagnoses, prescribe exercises, or replace professional advice\n"
    "- When pain or injury comes up, gently steer them toward their physiotherapist\n"
    "- Never use overly formal language — you're having a conversation, not giving a lecture\n"
    "- Keep responses to 2-3 sentences. If something needs more, ask permission first\n"
    "- If you don't know something, say so honestly — that's more human than guessing\n\n"
    "Your goal: they leave the conversation feeling lighter than when they started."
)


def build_messages(messages: List[dict]) -> List[dict]:
    return [{"role": "system", "content": SYSTEM_PROMPT}] + [
        {"role": m.role, "content": m.content} for m in messages
    ]


@app.post("/api/chat", response_model=ChatResponse)
def chat(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    if not OPENROUTER_API_KEY:
        return ChatResponse(
            reply="Hey there! I'm taking a short break right now — check back soon! "
                  "In the meantime, remember: every bit of movement counts, even on hard days. 💙"
        )

    client = openai.OpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
    )

    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=build_messages(data.messages),
            max_tokens=200,
            temperature=0.8,
        )
        reply = response.choices[0].message.content.strip()
        return ChatResponse(reply=reply)
    except Exception as e:
        print(f"[Chat Error] {e}")
        return ChatResponse(
            reply="I'm having trouble connecting right now — let's try again in a moment! "
                  "Your effort today matters, even if I can't find the right words. 💙"
        )


# ─── Workout Predictions Engine ───────────────────────────────────────────────

# MET values (Metabolic Equivalent of Task) for common exercises
EXERCISE_METS = {
    "walking": 3.5,
    "run": 9.8,
    "swim": 7.0,
    "yoga": 2.5,
    "cycling": 7.5,
    "stretching": 2.5,
    "strength": 4.0,
    "pilates": 3.8,
    "foam rolling": 2.0,
    "default": 4.0,
}


def estimate_calories(duration_min: int, intensity: int, weight_kg: Optional[float]) -> int:
    """Estimate calories burned using MET formula: MET × weight(kg) × hours."""
    met = EXERCISE_METS.get("default", 4.0) * (intensity / 5.0)  # scale by intensity
    weight = weight_kg or 70.0  # default assumption
    hours = duration_min / 60.0
    return int(met * weight * hours)


def get_exercise_met(exercise_name: str) -> float:
    name_lower = exercise_name.lower()
    for key, met in EXERCISE_METS.items():
        if key in name_lower:
            return met
    return EXERCISE_METS["default"]


def calculate_predictions(
    workouts: List[Workout],
    gender: Optional[str],
    weight_kg: Optional[float],
    height_cm: Optional[int],
) -> WorkoutPrediction:
    """Calculate realistic workout predictions from user's training history."""

    n = len(workouts)
    if n == 0:
        return WorkoutPrediction(
            estimated_calories=180,
            weekly_calories=540,
            monthly_calories=2160,
            avg_duration_minutes=30,
            avg_intensity=5.0,
            recovery_days_needed=1,
            insight="Not enough data yet — keep logging your sessions and predictions will get smarter.",
            next_milestone="Log your first 5 workouts to unlock personalized insights.",
            training_tip="Start with 2-3 sessions per week. Consistency matters more than intensity.",
        )

    total_cal = sum(estimate_calories(w.duration_minutes, w.intensity, weight_kg) for w in workouts)
    avg_cal = total_cal // n
    avg_duration = sum(w.duration_minutes for w in workouts) // n
    avg_intensity = sum(w.intensity for w in workouts) / n
    weekly_cal = avg_cal * 3  # assuming 3 sessions/week
    monthly_cal = weekly_cal * 4

    # Recovery: higher intensity = more rest needed
    if avg_intensity >= 7:
        recovery = 2
    elif avg_intensity >= 5:
        recovery = 1
    else:
        recovery = 1

    # Streak-based insights
    dates = sorted(set(w.logged_at.date() for w in workouts), reverse=True)
    streak = 0
    check = datetime.utcnow().date()
    while check in dates:
        streak += 1
        check -= timedelta(days=1)

    if streak >= 10:
        milestone = f"{streak}-day streak! You're building serious habits. Next target: 3 weeks."
        insight = (
            f"Your consistency is impressive. Over {n} workouts, you're averaging "
            f"{avg_duration} min at intensity {avg_intensity:.1f}/10. "
            f"That's real progress."
        )
        tip = (
            "Keep this up. At this pace, you're looking at a noticeable change "
            "in strength and endurance within 4-6 weeks."
        )
    elif streak >= 5:
        milestone = f"5+ day streak — you're in it! Next milestone: 2 weeks."
        insight = (
            f"You're averaging {avg_duration} minutes per session and burning "
            f"around {avg_cal} calories per workout. Solid base to build on."
        )
        tip = (
            "Now's the time to start noticing how your body responds. "
            "Are you recovering well? Feeling stronger? That feedback is gold."
        )
    elif streak >= 2:
        milestone = "Great start. Keep going — 5 sessions in and habits start to stick."
        insight = (
            f"Early days, but you're showing up. {n} workout{'s' if n > 1 else ''} logged, "
            f"averaging {avg_duration} minutes. That's how it begins."
        )
        tip = (
            "Two sessions a week is a perfect starting point. "
            "Don't chase intensity — chase consistency."
        )
    else:
        milestone = "Your journey starts here. Log 5 sessions to see your baseline."
        insight = (
            "Every workout you log teaches us more about your body. "
            f"So far: {n} session, {avg_duration} min avg. Keep going."
        )
        tip = (
            "The best workout is the one you actually do. "
            "Start small, stay consistent, build from there."
        )

    # Gender-specific calorie adjustment
    gender_factor = 0.85 if gender == "female" else 1.0 if gender == "male" else 0.95
    weekly_cal_adj = int(weekly_cal * gender_factor)
    monthly_cal_adj = int(monthly_cal * gender_factor)

    return WorkoutPrediction(
        estimated_calories=int(avg_cal * gender_factor),
        weekly_calories=weekly_cal_adj,
        monthly_calories=monthly_cal_adj,
        avg_duration_minutes=avg_duration,
        avg_intensity=round(avg_intensity, 1),
        recovery_days_needed=recovery,
        insight=insight,
        next_milestone=milestone,
        training_tip=tip,
    )


# ─── Workout Endpoints ─────────────────────────────────────────────────────────

@app.post("/api/workouts", response_model=WorkoutOut, status_code=201)
def log_workout(
    data: WorkoutCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workout = Workout(
        user_id=current_user.id,
        exercise_name=data.exercise_name,
        duration_minutes=data.duration_minutes,
        intensity=data.intensity,
        notes=data.notes,
        logged_at=data.logged_at or datetime.utcnow(),
    )
    db.add(workout)
    db.commit()
    db.refresh(workout)

    # Calculate calories for this workout
    calories = estimate_calories(
        workout.duration_minutes,
        workout.intensity,
        current_user.weight_kg,
    )
    return WorkoutOut(
        id=workout.id,
        exercise_name=workout.exercise_name,
        duration_minutes=workout.duration_minutes,
        intensity=workout.intensity,
        notes=workout.notes,
        logged_at=workout.logged_at,
        calories_burned=calories,
    )


@app.get("/api/workouts", response_model=List[WorkoutOut])
def list_workouts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workouts = (
        db.query(Workout)
        .filter(Workout.user_id == current_user.id)
        .order_by(Workout.logged_at.desc())
        .all()
    )
    return [
        WorkoutOut(
            id=w.id,
            exercise_name=w.exercise_name,
            duration_minutes=w.duration_minutes,
            intensity=w.intensity,
            notes=w.notes,
            logged_at=w.logged_at,
            calories_burned=estimate_calories(w.duration_minutes, w.intensity, current_user.weight_kg),
        )
        for w in workouts
    ]


# ─── Progress Endpoint ───────────────────────────────────────────────────────

@app.get("/api/progress", response_model=ProgressStats)
def get_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    today = now.date()

    all_workouts = (
        db.query(Workout)
        .filter(Workout.user_id == current_user.id)
        .order_by(Workout.logged_at.desc())
        .all()
    )

    total = len(all_workouts)

    week_start = today - timedelta(days=today.weekday())
    week_start_dt = datetime.combine(week_start, datetime.min.time())
    workouts_this_week = sum(1 for w in all_workouts if w.logged_at >= week_start_dt)

    month_start = today.replace(day=1)
    month_start_dt = datetime.combine(month_start, datetime.min.time())
    workouts_this_month = sum(1 for w in all_workouts if w.logged_at >= month_start_dt)

    workout_dates = set(w.logged_at.date() for w in all_workouts)
    streak = 0
    check_date = today
    while True:
        if check_date in workout_dates:
            streak += 1
            check_date -= timedelta(days=1)
        elif streak == 0 and check_date == today:
            check_date -= timedelta(days=1)
        else:
            break

    predictions = calculate_predictions(
        workouts=all_workouts,
        gender=current_user.gender,
        weight_kg=current_user.weight_kg,
        height_cm=current_user.height_cm,
    )

    workouts_out = [
        WorkoutOut(
            id=w.id,
            exercise_name=w.exercise_name,
            duration_minutes=w.duration_minutes,
            intensity=w.intensity,
            notes=w.notes,
            logged_at=w.logged_at,
            calories_burned=estimate_calories(w.duration_minutes, w.intensity, current_user.weight_kg),
        )
        for w in all_workouts[:50]
    ]

    return ProgressStats(
        total_workouts=total,
        workouts_this_week=workouts_this_week,
        workouts_this_month=workouts_this_month,
        current_streak=streak,
        workouts=workouts_out,
        predictions=predictions,
    )
