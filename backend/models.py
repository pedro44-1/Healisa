"""
SQLAlchemy models for Healisa.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    premium = Column(Boolean, default=False)

    # Profile
    gender = Column(String(20), nullable=True)       # male / female / other
    weight_kg = Column(Float, nullable=True)          # kilograms
    height_cm = Column(Integer, nullable=True)        # centimeters
    has_seen_intro = Column(Boolean, default=False)   # first-time user flag

    created_at = Column(DateTime, default=datetime.utcnow)

    workouts = relationship("Workout", back_populates="user", cascade="all, delete-orphan")


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exercise_name = Column(String(200), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    intensity = Column(Integer, nullable=False)  # 1-10
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="workouts")
