from fastapi import APIRouter, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse

from sqlalchemy import or_

import datetime
import random

from database import SessionLocal
from models import User, Complaint, ComplaintTimeline


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)

security = HTTPBearer(auto_error=False)


# ============================================================
# AUTHENTICATION
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
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
# ADMIN CHECK
# ============================================================

def require_admin(
    credentials: HTTPAuthorizationCredentials
):
    user = get_current_user(credentials)

    if not user:
        return None, JSONResponse(
            status_code=401,
            content={
                "error": "Authentication required"
            }
        )

    if user.role != "admin":
        return None, JSONResponse(
            status_code=403,
            content={
                "error": "Admin access required"
            }
        )

    return user, None


# ============================================================
# TRACKING ID
# ============================================================

def generate_tracking_id():

    year = datetime.datetime.now().year
    rand_num = random.randint(1000, 9999)

    return f"SHY-{year}-{rand_num}"


# ============================================================
# GET ALL ADMIN COMPLAINTS
#
# GET /api/admin/complaints
#
# Supports:
# status
# department
# priority
# search
# ============================================================

@router.get("/complaints")
def get_admin_complaints(
    status: str | None = Query(default=None),
    department: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    search: str | None = Query(default=None),

    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    user, error_response = require_admin(credentials)

    if error_response:
        return error_response

    db = SessionLocal()

    try:

        query = db.query(Complaint)

        # ----------------------------------------------------
        # STATUS FILTER
        # ----------------------------------------------------

        if status and status.strip():
            query = query.filter(
                Complaint.status == status.strip()
            )

        # ----------------------------------------------------
        # DEPARTMENT FILTER
        # ----------------------------------------------------

        if department and department.strip():
            query = query.filter(
                Complaint.department == department.strip()
            )

        # ----------------------------------------------------
        # PRIORITY FILTER
        # ----------------------------------------------------

        if priority and priority.strip():
            query = query.filter(
                Complaint.priority == priority.strip()
            )

        # ----------------------------------------------------
        # SEARCH
        # ----------------------------------------------------

        if search and search.strip():

            search_value = f"%{search.strip()}%"

            query = query.filter(
                or_(
                    Complaint.tracking_id.ilike(search_value),
                    Complaint.title.ilike(search_value),
                    Complaint.description.ilike(search_value),
                    Complaint.location.ilike(search_value),
                    Complaint.citizen_name.ilike(search_value),
                    Complaint.citizen_email.ilike(search_value),
                    Complaint.keywords.ilike(search_value)
                )
            )

        complaints = (
            query
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
# REVIEW / UPDATE COMPLAINT
#
# PATCH /api/admin/complaints/{complaint_id}/review
#
# Supports:
# status
# priority
# department
# officer_notes
# assigned_officer
# ============================================================

@router.patch("/complaints/{complaint_id}/review")
def review_complaint(
    complaint_id: int,
    data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    user, error_response = require_admin(credentials)

    if error_response:
        return error_response

    db = SessionLocal()

    try:

        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.id == complaint_id
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

        # ----------------------------------------------------
        # Store old values
        # ----------------------------------------------------

        old_status = complaint.status
        old_priority = complaint.priority
        old_department = complaint.department
        old_officer = complaint.assigned_officer

        # ----------------------------------------------------
        # Read incoming values
        # ----------------------------------------------------

        status = data.get("status")
        priority = data.get("priority")
        department = data.get("department")
        officer_notes = data.get("officer_notes")
        assigned_officer = data.get("assigned_officer")

        # ----------------------------------------------------
        # UPDATE STATUS
        # ----------------------------------------------------

        if status is not None:
            status = str(status).strip()

            if status:
                complaint.status = status

        # ----------------------------------------------------
        # UPDATE PRIORITY
        # ----------------------------------------------------

        if priority is not None:
            priority = str(priority).strip()

            if priority:
                complaint.priority = priority

        # ----------------------------------------------------
        # UPDATE DEPARTMENT
        # ----------------------------------------------------

        if department is not None:
            department = str(department).strip()

            if department:
                complaint.department = department

        # ----------------------------------------------------
        # UPDATE OFFICER NOTES
        # ----------------------------------------------------

        if officer_notes is not None:
            complaint.officer_notes = str(
                officer_notes
            ).strip()

        # ----------------------------------------------------
        # UPDATE ASSIGNED OFFICER
        # ----------------------------------------------------

        if assigned_officer is not None:
            complaint.assigned_officer = str(
                assigned_officer
            ).strip()

        # ----------------------------------------------------
        # CREATE TIMELINE ENTRY
        #
        # Add timeline whenever a meaningful admin change
        # has occurred.
        # ----------------------------------------------------

        changes = []

        if complaint.status != old_status:
            changes.append(
                f"Status changed from {old_status} to {complaint.status}."
            )

        if complaint.priority != old_priority:
            changes.append(
                f"Priority changed from {old_priority} to {complaint.priority}."
            )

        if complaint.department != old_department:
            changes.append(
                f"Department changed from {old_department} to {complaint.department}."
            )

        if complaint.assigned_officer != old_officer:
            changes.append(
                f"Assigned officer changed to {complaint.assigned_officer}."
            )

        if officer_notes:
            changes.append(
                f"Officer note: {officer_notes}"
            )

        if changes:

            timeline = ComplaintTimeline(
                complaint_id=complaint.id,
                status=complaint.status,
                remarks=" ".join(changes),
                action_by=user.name
            )

            db.add(timeline)

        # ----------------------------------------------------
        # RESOLUTION DATE
        #
        # Resolved and Rejected are considered closed states.
        # ----------------------------------------------------

        if complaint.status in ["Resolved", "Rejected"]:

            if not complaint.resolution_date:
                complaint.resolution_date = (
                    datetime.datetime.utcnow()
                )

        else:

            # If complaint is moved back from a closed state,
            # clear the resolution date.
            complaint.resolution_date = None

        db.commit()

        db.refresh(complaint)

        return {
            "message": "Complaint reviewed successfully",
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


# ============================================================
# ADMIN ANALYTICS
#
# GET /api/admin/analytics
# ============================================================

@router.get("/analytics")
def get_admin_analytics(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    user, error_response = require_admin(credentials)

    if error_response:
        return error_response

    db = SessionLocal()

    try:

        complaints = (
            db.query(Complaint)
            .all()
        )

        total_complaints = len(complaints)

        # ----------------------------------------------------
        # STATUS COUNTS
        # ----------------------------------------------------

        pending = sum(
            1 for c in complaints
            if c.status == "Pending"
        )

        under_review = sum(
            1 for c in complaints
            if c.status == "Under Review"
        )

        in_progress = sum(
            1 for c in complaints
            if c.status == "In Progress"
        )

        resolved = sum(
            1 for c in complaints
            if c.status == "Resolved"
        )

        rejected = sum(
            1 for c in complaints
            if c.status == "Rejected"
        )

        # ----------------------------------------------------
        # PRIORITY COUNTS
        # ----------------------------------------------------

        high_priority = sum(
            1 for c in complaints
            if c.priority == "High"
        )

        medium_priority = sum(
            1 for c in complaints
            if c.priority == "Medium"
        )

        low_priority = sum(
            1 for c in complaints
            if c.priority == "Low"
        )

        # ----------------------------------------------------
        # DEPARTMENT COUNTS
        # ----------------------------------------------------

        department_counts = {}

        for complaint in complaints:

            department = (
                complaint.department
                or "Unknown"
            )

            department_counts[department] = (
                department_counts.get(department, 0) + 1
            )

        # ----------------------------------------------------
        # AVERAGE CITIZEN RATING
        # ----------------------------------------------------

        ratings = [
            c.citizen_rating
            for c in complaints
            if c.citizen_rating is not None
        ]

        average_rating = (
            round(sum(ratings) / len(ratings), 2)
            if ratings
            else 0
        )

        return {
            "total_complaints": total_complaints,

            "status_counts": {
                "Pending": pending,
                "Under Review": under_review,
                "In Progress": in_progress,
                "Resolved": resolved,
                "Rejected": rejected
            },

            "priority_counts": {
                "High": high_priority,
                "Medium": medium_priority,
                "Low": low_priority
            },

            "department_counts": department_counts,

            "average_rating": average_rating
        }

    except Exception as e:

        return JSONResponse(
            status_code=500,
            content={
                "error": str(e)
            }
        )

    finally:
        db.close()


# ============================================================
# SEED DEMO DATA
#
# POST /api/admin/seed-demo
# ============================================================

@router.post("/seed-demo")
def seed_demo_data(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    user, error_response = require_admin(credentials)

    if error_response:
        return error_response

    db = SessionLocal()

    try:

        demo_complaints = [

            {
                "name": "Rahul Sharma",
                "phone": "9876543210",
                "email": "rahul@example.com",

                "title": "Street lights not working",

                "description": (
                    "Multiple street lights in our area "
                    "have not been working for several days."
                ),

                "location": "Sector 10",

                "department": "Electricity & Power",

                "priority": "High",

                "status": "Pending"
            },

            {
                "name": "Priya Verma",
                "phone": "9876543211",
                "email": "priya@example.com",

                "title": "Water supply issue",

                "description": (
                    "There has been no proper water supply "
                    "in our locality for the last two days."
                ),

                "location": "Model Town",

                "department": "Water Supply & Sewage",

                "priority": "High",

                "status": "In Progress"
            },

            {
                "name": "Amit Kumar",
                "phone": "9876543212",
                "email": "amit@example.com",

                "title": "Garbage collection problem",

                "description": (
                    "Garbage has not been collected from "
                    "our street for many days."
                ),

                "location": "Civil Lines",

                "department": "Sanitation & Waste Management",

                "priority": "Medium",

                "status": "Resolved"
            }
        ]

        created_complaints = []

        # ----------------------------------------------------
        # CREATE DEMO COMPLAINTS
        # ----------------------------------------------------

        for item in demo_complaints:

            tracking_id = generate_tracking_id()

            while (
                db.query(Complaint)
                .filter(
                    Complaint.tracking_id == tracking_id
                )
                .first()
            ):
                tracking_id = generate_tracking_id()

            complaint = Complaint(

                tracking_id=tracking_id,

                user_id=None,

                citizen_name=item["name"],
                citizen_phone=item["phone"],
                citizen_email=item["email"],

                title=item["title"],
                description=item["description"],
                location=item["location"],

                department=item["department"],

                ai_predicted_department=item["department"],

                ai_confidence=0.90,

                priority=item["priority"],

                ai_suggested_priority=item["priority"],

                urgency_score=(
                    80
                    if item["priority"] == "High"
                    else 50
                ),

                keywords="demo, sample, complaint",

                status=item["status"],

                assigned_officer=(
                    f"{item['department'].split()[0]} Ward Officer"
                )
            )

            db.add(complaint)

            db.flush()

            timeline = ComplaintTimeline(

                complaint_id=complaint.id,

                status=item["status"],

                remarks=(
                    "Demo complaint created for testing."
                ),

                action_by="SahaayAI Demo"
            )

            db.add(timeline)

            created_complaints.append(complaint)

        db.commit()

        for complaint in created_complaints:
            db.refresh(complaint)

        return {
            "message": "Demo complaints created successfully",
            "count": len(created_complaints),
            "complaints": [
                complaint.to_dict()
                for complaint in created_complaints
            ]
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