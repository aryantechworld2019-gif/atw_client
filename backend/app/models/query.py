"""
Query model - MongoDB document
"""
from beanie import Document
from pydantic import Field, BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId


class QueryPriority(str, Enum):
    """Query priority levels"""
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class QueryCategory(str, Enum):
    """Query categories"""
    BUG = "BUG"
    FEATURE_REQUEST = "FEATURE_REQUEST"
    CONSULTATION = "CONSULTATION"
    OTHER = "OTHER"


class QueryStatus(str, Enum):
    """Query status"""
    PENDING = "PENDING"
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    TESTING = "TESTING"
    FIXED = "FIXED"
    CLOSED = "CLOSED"
    REOPENED = "REOPENED"
    REJECTED = "REJECTED"


class StatusHistory(BaseModel):
    """Status change history"""
    status: QueryStatus
    changed_by: ObjectId
    changed_at: datetime = Field(default_factory=datetime.utcnow)
    comment: Optional[str] = None


class SLAInfo(BaseModel):
    """SLA tracking information"""
    response_deadline: datetime
    resolution_deadline: datetime
    first_response_at: Optional[datetime] = None
    is_breached: bool = False
    breach_reason: Optional[str] = None


class Attachment(BaseModel):
    """File attachment"""
    attachment_id: ObjectId = Field(default_factory=ObjectId)
    file_name: str
    file_url: str
    file_size: int
    file_type: str
    uploaded_by: ObjectId
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


class SolutionFile(BaseModel):
    """Solution file attachment"""
    file_name: str
    file_url: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


class Resolution(BaseModel):
    """Resolution details"""
    notes: str
    solution_files: List[SolutionFile] = Field(default_factory=list)
    code_commit_url: Optional[str] = None
    testing_notes: Optional[str] = None
    resolved_at: datetime = Field(default_factory=datetime.utcnow)


class Feedback(BaseModel):
    """Client feedback"""
    is_resolved: bool
    rating: int = Field(ge=1, le=5)
    speed_rating: int = Field(ge=1, le=5)
    quality_rating: int = Field(ge=1, le=5)
    professionalism_rating: int = Field(ge=1, le=5)
    comments: Optional[str] = None
    submitted_at: datetime = Field(default_factory=datetime.utcnow)


class Query(Document):
    """Query document model"""

    # Ticket Information
    ticket_number: str

    # References
    client_id: ObjectId
    created_by: ObjectId
    assigned_developer_id: Optional[ObjectId] = None

    # Query Details
    title: str
    description: str
    priority: QueryPriority = QueryPriority.MEDIUM
    category: QueryCategory

    # Status Management
    status: QueryStatus = QueryStatus.PENDING
    status_history: List[StatusHistory] = Field(default_factory=list)

    # SLA Management
    sla: Optional[SLAInfo] = None

    # Time Tracking
    hours_estimated: Optional[float] = None
    hours_actual: Optional[float] = None

    # Expected Resolution
    expected_resolution_date: Optional[datetime] = None

    # Attachments
    attachments: List[Attachment] = Field(default_factory=list)

    # Comments Count
    comments_count: int = 0

    # Resolution
    resolution: Optional[Resolution] = None

    # Feedback
    feedback: Optional[Feedback] = None

    # Reopen History
    reopen_count: int = 0
    reopen_history: List[dict] = Field(default_factory=list)

    # Tags
    tags: List[str] = Field(default_factory=list)

    # Internal Notes
    internal_notes: Optional[str] = None

    # Related Queries
    related_queries: List[ObjectId] = Field(default_factory=list)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    closed_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    class Settings:
        name = "queries"
        indexes = [
            "ticket_number",
            [("client_id", 1), ("status", 1)],
            [("assigned_developer_id", 1), ("status", 1)],
            [("priority", 1), ("status", 1)],
            [("created_at", -1)],
            [("sla.resolution_deadline", 1), ("status", 1)],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "ticket_number": "QRY-2025-001234",
                "title": "Login page not loading",
                "priority": "HIGH",
                "category": "BUG"
            }
        }

    def __repr__(self) -> str:
        return f"<Query {self.ticket_number}>"

    def __str__(self) -> str:
        return self.ticket_number
