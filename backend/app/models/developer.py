"""
Developer model - MongoDB document
"""
from beanie import Document
from pydantic import Field, BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId
from app.core.types import PyObjectId


class AvailabilityStatus(str, Enum):
    """Developer availability status"""
    AVAILABLE = "AVAILABLE"
    BUSY = "BUSY"
    ON_LEAVE = "ON_LEAVE"
    OFFLINE = "OFFLINE"


class ProficiencyLevel(str, Enum):
    """Skill proficiency level"""
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERT = "EXPERT"


class Skill(BaseModel):
    """Developer skill"""
    name: str
    proficiency: ProficiencyLevel


class WorkingHours(BaseModel):
    """Daily working hours"""
    start: str  # HH:MM format
    end: str  # HH:MM format


class WorkSchedule(BaseModel):
    """Weekly work schedule"""
    timezone: str = "Asia/Kolkata"
    working_hours: dict = Field(default_factory=lambda: {
        "monday": {"start": "09:00", "end": "18:00"},
        "tuesday": {"start": "09:00", "end": "18:00"},
        "wednesday": {"start": "09:00", "end": "18:00"},
        "thursday": {"start": "09:00", "end": "18:00"},
        "friday": {"start": "09:00", "end": "18:00"},
        "saturday": None,
        "sunday": None
    })


class Performance(BaseModel):
    """Performance metrics"""
    total_queries_assigned: int = 0
    total_queries_resolved: int = 0
    queries_reopened: int = 0
    avg_resolution_time_hours: float = 0.0
    avg_client_rating: float = 0.0
    sla_compliance_rate: float = 0.0
    last_calculated: datetime = Field(default_factory=datetime.utcnow)


class AssignedClient(BaseModel):
    """Assigned client information"""
    client_id: PyObjectId
    is_primary: bool = False
    assigned_at: datetime = Field(default_factory=datetime.utcnow)


class Developer(Document):
    """Developer document model"""

    # Reference to User
    user_id: PyObjectId

    # Developer Details
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    designation: str = "Developer"

    # Skills & Expertise
    skills: List[Skill] = Field(default_factory=list)
    expertise_areas: List[str] = Field(default_factory=list)

    # Availability
    availability_status: AvailabilityStatus = AvailabilityStatus.AVAILABLE
    max_concurrent_queries: int = 5
    current_active_queries: int = 0

    # Work Schedule
    work_schedule: WorkSchedule = Field(default_factory=WorkSchedule)

    # Compensation
    hourly_rate: float = 1500  # INR per hour
    currency: str = "INR"

    # Performance Metrics
    performance: Performance = Field(default_factory=Performance)

    # Current Assignments
    assigned_clients: List[AssignedClient] = Field(default_factory=list)

    # Timestamps
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None

    class Settings:
        name = "developers"
        indexes = [
            "user_id",
            "email",
            "assigned_clients.client_id",
            "availability_status",
            "skills.name",
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "Rajesh Kumar",
                "email": "rajesh@aryantechworld.com",
                "designation": "Senior Full Stack Developer"
            }
        }

    def __repr__(self) -> str:
        return f"<Developer {self.full_name}>"

    def __str__(self) -> str:
        return self.full_name
