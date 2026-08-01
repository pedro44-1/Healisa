"""
Database configuration and session management.
Connects to PostgreSQL via Supabase or any PostgreSQL URL.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
)

# Fallback to SQLite for local demo (no PostgreSQL required)
if not DATABASE_URL or DATABASE_URL == "postgresql://postgres:password@localhost:5432/recovery_os":
    DATABASE_URL = "sqlite:///healisa.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency that yields a DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Run once on startup."""
    Base.metadata.create_all(bind=engine)
    _migrate_users_table()


def _migrate_users_table():
    """Add new columns to users table if they don't exist (for existing DBs)."""
    from sqlalchemy import text
    db = SessionLocal()
    try:
        # SQLite-specific: PRAGMA to check columns
        if 'sqlite' in str(engine.url):
            result = db.execute(text("PRAGMA table_info(users)")).fetchall()
            existing_cols = [row[1] for row in result]
        else:
            result = db.execute(text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'users'
            """)).fetchall()
            existing_cols = [row[0] for row in result]

        new_cols = {
            'gender': "ALTER TABLE users ADD COLUMN gender VARCHAR(20)",
            'weight_kg': "ALTER TABLE users ADD COLUMN weight_kg FLOAT",
            'height_cm': "ALTER TABLE users ADD COLUMN height_cm INTEGER",
            'has_seen_intro': "ALTER TABLE users ADD COLUMN has_seen_intro BOOLEAN DEFAULT 0",
        }

        for col, alter_sql in new_cols.items():
            if col not in existing_cols:
                db.execute(text(alter_sql))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[DB Migration] {e}")
    finally:
        db.close()
