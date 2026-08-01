"""
Pydantic schemas — input/output validation for all endpoints.
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List


# ─── Auth ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    gender: Optional[str] = None  # male / female / other
    weight_kg: Optional[float] = None
    height_cm: Optional[int] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    premium: bool
    gender: Optional[str] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[int] = None
    has_seen_intro: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─── Profile Update ──────────────────────────────────────────────────────────

class ProfileUpdate(BaseModel):
    gender: Optional[str] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[int] = None
    has_seen_intro: bool = False


# ─── Chat ─────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]  # conversation history


class ChatResponse(BaseModel):
    reply: str


# ─── Workouts ─────────────────────────────────────────────────────────────────

class WorkoutCreate(BaseModel):
    exercise_name: str = Field(..., min_length=1, max_length=200)
    duration_minutes: int = Field(..., ge=1, le=480)
    intensity: int = Field(..., ge=1, le=10)
    notes: Optional[str] = None
    logged_at: Optional[datetime] = None


class WorkoutOut(BaseModel):
    id: int
    exercise_name: str
    duration_minutes: int
    intensity: int
    notes: Optional[str]
    logged_at: datetime
    calories_burned: Optional[int] = None  # estimated

    class Config:
        from_attributes = True


# ─── Workout Predictions ───────────────────────────────────────────────────────

class WorkoutPrediction(BaseModel):
    estimated_calories: int  # per workout average
    weekly_calories: int  # if training 3x per week
    monthly_calories: int  # if training 3x per week for a month
    avg_duration_minutes: int
    avg_intensity: float
    recovery_days_needed: int  # recommended rest between sessions
    insight: str  # realistic, human-readable insight
    next_milestone: str
    training_tip: str


# ─── Progress ─────────────────────────────────────────────────────────────────

class ProgressStats(BaseModel):
    total_workouts: int
    workouts_this_week: int
    workouts_this_month: int
    current_streak: int
    workouts: List[WorkoutOut]
    predictions: Optional[WorkoutPrediction] = None
