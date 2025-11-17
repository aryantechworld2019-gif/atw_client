"""
User model - MongoDB document
"""
from beanie import Document, Indexed
from pydantic import EmailStr, Field, BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum
from app.core.types import PyObjectId


class UserRole(str, Enum):
    """User role enumeration"""
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    CLIENT_OWNER = "CLIENT_OWNER"
    CLIENT_USER = "CLIENT_USER"
    DEVELOPER = "DEVELOPER"


class UserStatus(str, Enum):
    """User account status"""
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"
    PENDING = "PENDING"


class TwoFAMethod(str, Enum):
    """Two-factor authentication method"""
    EMAIL_OTP = "EMAIL_OTP"
    SMS_OTP = "SMS_OTP"
    TOTP = "TOTP"


class TwoFASettings(BaseModel):
    """Two-factor authentication settings"""
    enabled: bool = False
    method: Optional[TwoFAMethod] = None
    secret: Optional[str] = None
    backup_codes: List[str] = Field(default_factory=list)


class Session(BaseModel):
    """User session information"""
    session_id: str
    device: str
    ip_address: str
    last_active: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserPreferences(BaseModel):
    """User preferences"""
    language: str = "en"
    timezone: str = "Asia/Kolkata"
    notifications: dict = Field(default_factory=lambda: {
        "email": True,
        "sms": False,
        "push": True
    })


class User(Document):
    """User document model"""

    # Basic Information
    email: Indexed(EmailStr, unique=True)
    password_hash: str
    role: UserRole
    full_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

    # Client Reference (for CLIENT_OWNER and CLIENT_USER roles)
    client_id: Optional[PyObjectId] = None

    # Account Status
    status: UserStatus = UserStatus.ACTIVE
    is_active: bool = True
    is_email_verified: bool = False
    is_phone_verified: bool = False

    # Security
    two_fa: Optional[TwoFASettings] = None
    sessions: List[Session] = Field(default_factory=list)

    # Preferences
    preferences: UserPreferences = Field(default_factory=UserPreferences)

    # Timestamps
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None

    class Settings:
        name = "users"
        use_state_management = True
        indexes = [
            "email",
            "role",
            "status",
            "client_id",
            [("is_active", 1), ("role", 1)],
            [("status", 1), ("role", 1)],
            [("client_id", 1), ("role", 1)],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "email": "john@example.com",
                "role": "CLIENT_OWNER",
                "full_name": "John Doe",
                "phone": "+91-9876543210"
            }
        }

    def __repr__(self) -> str:
        return f"<User {self.email}>"

    def __str__(self) -> str:
        return self.email
