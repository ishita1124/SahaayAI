from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse

from sqlalchemy import or_

import random
import datetime

from database import SessionLocal
from models import User, Complaint, ComplaintTimeline
from ml_engine import ml_engine


router = APIRouter(
    prefix="/api/complaints",
    tags=["Complaints"]
)

security = HTTPBearer(auto_error=False)


# ============================================================
# AUTHENTICATION HELPER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Extract user from the SahaayAI token.

    Expected token format:
    sahaay_tok_<user_id>_<role>_<random>
    """

    if not credentials:
        return None

    token = credentials.credentials

    parts = token.split("_")

    if len(parts) < 4:
        return None

    if parts[0] != "sahaay" or parts[1] != "tok":
        return None

    try:
        user_id = int(parts[2])
    except (TypeError, ValueError):
        return None

    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        return user

    except Exception:
        return None

    finally:
        db.close()


# ============================================================
# TRACKING ID GENERATOR
# ============================================================

def generate_tracking_id():
    year = datetime.datetime.now().year
    rand_num = random.randint(1000, 9999)

    return f"SHY-{year}-{rand_num}"


# ============================================================
# CREATE COMPLAINT
# POST /api/complaints
# ============================================================

@router.post("", status_code=201)
def create_complaint(
    data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    user = get_current_user(credentials)

    title = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()
    location = str(data.get("location", "")).strip()

    if not title or not description or not location:
        return JSONResponse(
            status_code=400,
            content={
                "error": "Title, description, and location are required."
            }
        )

    # --------------------------------------------------------
    # Citizen information
    # --------------------------------------------------------

    citizen_name = (
        str(data.get("citizen_name", "")).strip()
        or (user.name if user else "Anonymous Citizen")
    )

    citizen_phone = (
        str(data.get("citizen_phone", "")).strip()
        or (user.phone if user and user.phone else "9876543210")
    )

    citizen_email = (
        str(data.get("citizen_email", "")).strip()
        or (user.email if user else "")
    )

    # --------------------------------------------------------
    # AI analysis
    # --------------------------------------------------------

    try:
        ai_result = ml_engine.analyze(
            text=description,
            title=title
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "error": f"AI analysis failed: {str(e)}"
            }
        )

    # --------------------------------------------------------
    # Department
    # --------------------------------------------------------

    department = str(
        data.get("department", "")
    ).strip()

    if not department or department == "Auto-Detect":
        department = ai_result["predicted_department"]

    db = SessionLocal()

    try:

        # ----------------------------------------------------
        # Generate unique tracking ID
        # ----------------------------------------------------

        tracking_id = generate_tracking_id()

        while (
            db.query(Complaint)
            .filter(Complaint.tracking_id == tracking_id)
            .first()
        ):
            tracking_id = generate_tracking_id()

        # ----------------------------------------------------
        # Convert AI keywords to database string
        # ----------------------------------------------------

        keywords = ai_result.get("keywords", [])

        if isinstance(keywords, list):
            keywords_string = ", ".join(keywords)
        else:
            keywords_string = str(keywords)

        # ----------------------------------------------------
        # Create complaint
        # ----------------------------------------------------

        complaint = Complaint(
            tracking_id=tracking_id,
            user_id=user.id if user else None,

            citizen_name=citizen_name,
            citizen_phone=citizen_phone,
            citizen_email=citizen_email,

            title=title,
            description=description,
            location=location,

            department=department,

            ai_predicted_department=ai_result.get(
                "predicted_department",
                department
            ),

            ai_confidence=ai_result.get(
                "confidence",
                0.0
            ),

            priority=ai_result.get(
                "priority",
                "Medium"
            ),

            ai_suggested_priority=ai_result.get(
                "priority",
                "Medium"
            ),

            urgency_score=ai_result.get(
                "urgency_score",
                50
            ),

            keywords=keywords_string,

            status="Pending",

            assigned_officer=(
                f"{department.split()[0]} Ward Officer"
                if department
                else "Unassigned"
            )
        )

        db.add(complaint)

        # Generate ID before timeline creation
        db.flush()

        # ----------------------------------------------------
        # Initial timeline
        # ----------------------------------------------------

        timeline = ComplaintTimeline(
            complaint_id=complaint.id,
            status="Pending",
            remarks=(
                "Grievance successfully submitted and verified "
                "by AI engine. Auto-assigned to department."
            ),
            action_by="SahaayAI Engine"
        )

        db.add(timeline)

        db.commit()

        db.refresh(complaint)

        return {
            "message": "Complaint registered successfully",
            "tracking_id": complaint.tracking_id,
            "complaint": complaint.to_dict(),
            "ai_insights": ai_result
        }

    except Exception as e:

        db.rollback()

        return JSONResponse(
            status_code=500,
            content={
                "error": str(e)
            }
        )

    finally:
        db.close()


# ============================================================
# TRACK COMPLAINT
# GET /api/complaints/track/{tracking_id}
# ============================================================

@router.get("/track/{tracking_id}")
def track_complaint(tracking_id: str):

    tracking_id = tracking_id.strip()

    if not tracking_id:
        return JSONResponse(
            status_code=400,
            content={
                "error": "Tracking ID is required"
            }
        )

    db = SessionLocal()

    try:

        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.tracking_id == tracking_id
            )
            .first()
        )

        if not complaint:
            return JSONResponse(
                status_code=404,
                content={
                    "error": "Complaint not found"
                }
            )

        return {
            "complaint": complaint.to_dict()
        }

    finally:
        db.close()


# ============================================================
# GET MY COMPLAINTS
# GET /api/complaints/my
# ============================================================

@router.get("/my")
def get_my_complaints(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    user = get_current_user(credentials)

    if not user:
        return JSONResponse(
            status_code=401,
            content={
                "error": "Authentication required"
            }
        )

    db = SessionLocal()

    try:

        # Match either:
        # 1. user_id
        # 2. citizen email
        #
        # This preserves compatibility with the original
        # SahaayAI backend.

        complaints = (
            db.query(Complaint)
            .filter(
                or_(
                    Complaint.user_id == user.id,
                    Complaint.citizen_email == user.email
                )
            )
            .order_by(
                Complaint.created_at.desc()
            )
            .all()
        )

        return {
            "complaints": [
                complaint.to_dict()
                for complaint in complaints
            ]
        }

    finally:
        db.close()


# ============================================================
# SUBMIT CITIZEN FEEDBACK
# POST /api/complaints/{complaint_id}/feedback
# ============================================================

@router.post("/{complaint_id}/feedback")
def submit_feedback(
    complaint_id: int,
    data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    user = get_current_user(credentials)

    if not user:
        return JSONResponse(
            status_code=401,
            content={
                "error": "Authentication required"
            }
        )

    # --------------------------------------------------------
    # Rating
    # --------------------------------------------------------

    rating = data.get("rating")

    # Original behavior:
    # if rating is missing, use 5.
    if rating is None:
        rating = 5

    try:
        rating = int(rating)
    except (TypeError, ValueError):

        return JSONResponse(
            status_code=400,
            content={
                "error": "Rating must be a number"
            }
        )

    # Keep rating inside 1-5 range.
    rating = max(1, min(5, rating))

    # --------------------------------------------------------
    # Feedback text
    # --------------------------------------------------------

    feedback = str(
        data.get("feedback", "")
    ).strip()

    db = SessionLocal()

    try:

        # User can give feedback only on their own complaint.
        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.id == complaint_id,
                or_(
                    Complaint.user_id == user.id,
                    Complaint.citizen_email == user.email
                )
            )
            .first()
        )

        if not complaint:
            return JSONResponse(
                status_code=404,
                content={
                    "error": "Complaint not found"
                }
            )

        complaint.citizen_rating = rating
        complaint.citizen_feedback = feedback

        db.commit()

        db.refresh(complaint)

        return {
            "message": "Feedback submitted successfully",
            "complaint": complaint.to_dict()
        }

    except Exception as e:

        db.rollback()

        return JSONResponse(
            status_code=500,
            content={
                "error": str(e)
            }
        )

    finally:
        db.close()