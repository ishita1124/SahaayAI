"""
SahaayAI - Database Models (SQL Schema)
"""
import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(20), default="citizen")  # 'citizen' or 'admin'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaints = relationship("Complaint", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone or "",
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    tracking_id = Column(String(32), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    citizen_name = Column(String(120), nullable=False)
    citizen_phone = Column(String(20), nullable=False)
    citizen_email = Column(String(120), nullable=True)
    
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(250), nullable=False)
    
    # Categorization
    department = Column(String(100), nullable=False)
    ai_predicted_department = Column(String(100), nullable=True)
    ai_confidence = Column(Float, default=0.0)

    # Prioritization & Urgency
    priority = Column(String(20), default="Medium")  # High, Medium, Low
    ai_suggested_priority = Column(String(20), default="Medium")
    urgency_score = Column(Integer, default=50) # 0 to 100

    # NLP Keywords stored as comma-separated or json string
    keywords = Column(Text, default="")

    # Status: 'Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected'
    status = Column(String(50), default="Pending", index=True)
    officer_notes = Column(Text, default="")
    assigned_officer = Column(String(120), default="Unassigned")

    # Citizen Feedback
    citizen_feedback = Column(Text, default="")
    citizen_rating = Column(Integer, default=0) # 1 - 5 stars

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    resolution_date = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="complaints")
    timeline = relationship("ComplaintTimeline", back_populates="complaint", cascade="all, delete-orphan", order_by="ComplaintTimeline.created_at")

    def to_dict(self):
        kw_list = [k.strip() for k in self.keywords.split(",") if k.strip()] if self.keywords else []
        return {
            "id": self.id,
            "tracking_id": self.tracking_id,
            "user_id": self.user_id,
            "citizen_name": self.citizen_name,
            "citizen_phone": self.citizen_phone,
            "citizen_email": self.citizen_email or "",
            "title": self.title,
            "description": self.description,
            "location": self.location,
            "department": self.department,
            "ai_predicted_department": self.ai_predicted_department or self.department,
            "ai_confidence": round(self.ai_confidence, 2),
            "priority": self.priority,
            "ai_suggested_priority": self.ai_suggested_priority or self.priority,
            "urgency_score": self.urgency_score,
            "keywords": kw_list,
            "status": self.status,
            "officer_notes": self.officer_notes or "",
            "assigned_officer": self.assigned_officer or "Unassigned",
            "citizen_feedback": self.citizen_feedback or "",
            "citizen_rating": self.citizen_rating,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M") if self.created_at else None,
            "updated_at": self.updated_at.strftime("%Y-%m-%d %H:%M") if self.updated_at else None,
            "resolution_date": self.resolution_date.strftime("%Y-%m-%d %H:%M") if self.resolution_date else None,
            "timeline": [t.to_dict() for t in self.timeline]
        }

class ComplaintTimeline(Base):
    __tablename__ = "complaint_timeline"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    status = Column(String(50), nullable=False)
    remarks = Column(Text, default="")
    action_by = Column(String(100), default="System")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaint = relationship("Complaint", back_populates="timeline")

    def to_dict(self):
        return {
            "id": self.id,
            "status": self.status,
            "remarks": self.remarks,
            "action_by": self.action_by,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M") if self.created_at else None
        }
