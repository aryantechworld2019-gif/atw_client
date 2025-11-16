"""
Notification model - MongoDB document
"""
from beanie import Document
from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime, timedelta
from enum import Enum
from bson import ObjectId
from app.core.types import PyObjectId


class NotificationType(str, Enum):
    """Notification type"""
    QUERY_CREATED = "QUERY_CREATED"
    QUERY_ASSIGNED = "QUERY_ASSIGNED"
    QUERY_STATUS_CHANGED = "QUERY_STATUS_CHANGED"
    COMMENT_ADDED = "COMMENT_ADDED"
    MAINTENANCE_LOW = "MAINTENANCE_LOW"
    PAYMENT_RECEIVED = "PAYMENT_RECEIVED"
    SLA_BREACH = "SLA_BREACH"
    INVOICE_GENERATED = "INVOICE_GENERATED"


class NotificationPriority(str, Enum):
    """Notification priority"""
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"


class ChannelStatus(BaseModel):
    """Notification channel status"""
    sent: bool = False
    sent_at: Optional[datetime] = None
    message_id: Optional[str] = None


class InAppChannel(BaseModel):
    """In-app notification channel"""
    sent: bool = True
    is_read: bool = False
    read_at: Optional[datetime] = None


class NotificationChannels(BaseModel):
    """Notification delivery channels"""
    in_app: InAppChannel = Field(default_factory=InAppChannel)
    email: ChannelStatus = Field(default_factory=ChannelStatus)
    sms: ChannelStatus = Field(default_factory=ChannelStatus)
    push: ChannelStatus = Field(default_factory=ChannelStatus)


class Notification(Document):
    """Notification document model"""

    # Recipient
    user_id: PyObjectId

    # Reference (optional)
    query_id: Optional[PyObjectId] = None

    # Notification Details
    title: str
    message: str
    notification_type: NotificationType

    # Delivery Channels
    channels: NotificationChannels = Field(default_factory=NotificationChannels)

    # Action Link
    action_url: Optional[str] = None

    # Priority
    priority: NotificationPriority = NotificationPriority.NORMAL

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(
        default_factory=lambda: datetime.utcnow() + timedelta(days=30)
    )

    class Settings:
        name = "notifications"
        indexes = [
            [("user_id", 1), ("created_at", -1)],
            [("user_id", 1), ("channels.in_app.is_read", 1)],
            "expires_at",  # TTL index for auto-deletion
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Query Status Updated",
                "message": "Your query #QRY-2025-001234 has been marked as 'Fixed'",
                "notification_type": "QUERY_STATUS_CHANGED"
            }
        }

    def __repr__(self) -> str:
        return f"<Notification {self.title}>"
