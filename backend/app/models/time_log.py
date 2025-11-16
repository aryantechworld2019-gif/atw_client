"""
Time Log model - MongoDB document
"""
from beanie import Document
from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum
from bson import ObjectId
from app.core.types import PyObjectId


class LogType(str, Enum):
    """Time log type"""
    DEVELOPMENT = "DEVELOPMENT"
    TESTING = "TESTING"
    CONSULTATION = "CONSULTATION"
    MEETING = "MEETING"


class EntryMethod(str, Enum):
    """Time entry method"""
    TIMER = "TIMER"
    MANUAL = "MANUAL"


class ApprovalStatus(str, Enum):
    """Approval status"""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class Cost(BaseModel):
    """Cost calculation"""
    hourly_rate: float
    total_cost: float
    currency: str = "INR"


class TimeLog(Document):
    """Time Log document model"""

    # References
    query_id: PyObjectId
    developer_id: ObjectId
    client_id: PyObjectId

    # Time Tracking
    time_spent_minutes: int
    billable_hours: float

    # Work Details
    work_description: str
    log_type: LogType = LogType.DEVELOPMENT

    # Time Entry Method
    entry_method: EntryMethod = EntryMethod.MANUAL
    timer_start: Optional[datetime] = None
    timer_end: Optional[datetime] = None

    # Approval Workflow
    approval_status: ApprovalStatus = ApprovalStatus.PENDING
    approved_by: Optional[PyObjectId] = None
    approval_notes: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

    # Cost Calculation
    cost: Cost

    # Hour Deduction
    hours_deducted_from_package: bool = False
    package_id: Optional[PyObjectId] = None

    # Timestamps
    logged_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "time_logs"
        indexes = [
            "query_id",
            [("developer_id", 1), ("logged_at", -1)],
            [("client_id", 1), ("logged_at", -1)],
            "approval_status",
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "time_spent_minutes": 157,
                "billable_hours": 3.0,
                "work_description": "Fixed Safari CSS issue"
            }
        }

    def __repr__(self) -> str:
        return f"<TimeLog {self.billable_hours}h>"
