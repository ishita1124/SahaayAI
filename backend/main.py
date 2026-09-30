from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.auth import router as auth_router
from routers.ai import router as ai_router
from routers.complaints import router as complaints_router
from routers.admin import router as admin_router


# ============================================================
# SAHAAYAI FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="SahaayAI API",
    description="AI-powered grievance management system",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# API ROUTERS
# ============================================================

app.include_router(auth_router)

app.include_router(ai_router)

app.include_router(complaints_router)

app.include_router(admin_router)


# ============================================================
# ROOT
#
# GET /
# ============================================================

@app.get("/")
def root():

    return {
        "message": "SahaayAI API is running successfully!"
    }


# ============================================================
# DEPARTMENTS
#
# GET /api/departments
#
# Kept separately for frontend compatibility.
# ============================================================

@app.get("/api/departments")
def get_departments():

    from ml_engine import DEPARTMENTS

    return {
        "departments": DEPARTMENTS
    }