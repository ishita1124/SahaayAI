"""
SahaayAI - Database Initialization and Connection Management
Using SQLAlchemy for SQL database management (default: SQLite, switchable to MySQL/Postgres)
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session

# Default to SQLite file database in backend folder; can be overridden via SQLALCHEMY_DATABASE_URI
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sahaayai.db")
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{DB_PATH}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    echo=False
)

SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    import models  # Ensure all models are registered
    Base.metadata.create_all(bind=engine)
