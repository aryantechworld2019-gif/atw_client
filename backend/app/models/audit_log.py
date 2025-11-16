"""
Audit Log model - MongoDB document
"""
from beanie import Document
from pydantic import Field
from typing import Optional, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId


class ActionType(str, Enum):
    """Action type"""
    CREATE = "CREATE"
    READ = "READ"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"


class EntityType(str, Enum):
    """Entity type"""
    USER = "USER"
    CLIENT = "CLIENT"
    QUERY = "QUERY"
    PAYMENT = "PAYMENT"
    INVOICE = "INVOICE"
    DEVELOPER = "DEVELOPER"
    MAINTENANCE_PACKAGE = "MAINTENANCE_PACKAGE"


class AuditLog(Document):
    """Audit Log document model"""

    # User performing the action
    user_id: ObjectId
    action_type: ActionType

    # Entity Details
    entity_type: EntityType
    entity_id: ObjectId

    # Change Details
    changes: Optional[dict] = None

    # Request Context
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    request_method: Optional[str] = None
    request_path: Optional[str] = None

    # Additional Context
    description: Optional[str] = None
    metadata: Optional[dict] = None

    # Timestamp
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "audit_logs"
        indexes = [
            [("user_id", 1), ("timestamp", -1)],
            [("entity_type", 1), ("entity_id", 1), ("timestamp", -1)],
            [("timestamp", -1)],
            [("action_type", 1), ("timestamp", -1)],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "action_type": "UPDATE",
                "entity_type": "QUERY",
                "description": "Admin assigned query to developer"
            }
        }

    def __repr__(self) -> str:
        return f"<AuditLog {self.action_type} {self.entity_type}>"
