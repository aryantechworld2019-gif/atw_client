"""
Maintenance Package model - MongoDB document
"""
from beanie import Document
from pydantic import Field, BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId
from app.core.types import PyObjectId


class PackageType(str, Enum):
    """Maintenance package types"""
    BASIC = "BASIC"
    STANDARD = "STANDARD"
    PREMIUM = "PREMIUM"
    ENTERPRISE = "ENTERPRISE"
    CUSTOM = "CUSTOM"


class BillingCycle(str, Enum):
    """Billing cycle options"""
    MONTHLY = "MONTHLY"
    QUARTERLY = "QUARTERLY"
    ANNUAL = "ANNUAL"


class PackageStatus(str, Enum):
    """Package status"""
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"
    SUSPENDED = "SUSPENDED"


class AdjustmentType(str, Enum):
    """Hour adjustment type"""
    ADDED = "ADDED"
    DEDUCTED = "DEDUCTED"


class HourAdjustment(BaseModel):
    """Hour adjustment record"""
    adjustment_id: str
    hours_changed: float
    adjustment_type: AdjustmentType
    reason: str
    adjusted_by: PyObjectId
    adjusted_at: datetime = Field(default_factory=datetime.utcnow)


class HourDeduction(BaseModel):
    """Hour deduction record"""
    query_id: PyObjectId
    hours_deducted: float
    time_log_id: PyObjectId
    deducted_at: datetime = Field(default_factory=datetime.utcnow)


class PackageFeatures(BaseModel):
    """Package features"""
    priority_support: bool = False
    support_24x7: bool = False
    dedicated_developer: bool = False
    response_time_sla: str = "24 hours"
    max_concurrent_queries: int = 3


class MaintenancePackage(Document):
    """Maintenance Package document model"""

    # Reference to Client
    client_id: PyObjectId

    # Package Details
    package_type: PackageType
    package_name: str

    # Hours Management
    total_hours: float
    consumed_hours: float = 0.0
    remaining_hours: float = 0.0
    rollover_hours: float = 0.0

    # Billing
    price: float
    currency: str = "INR"
    billing_cycle: BillingCycle = BillingCycle.MONTHLY

    # Dates
    start_date: datetime
    end_date: datetime
    renewal_date: datetime

    # Auto-renewal
    auto_renew: bool = True
    renewal_reminder_sent: bool = False

    # Status
    status: PackageStatus = PackageStatus.ACTIVE

    # Hour Adjustment History
    adjustments: List[HourAdjustment] = Field(default_factory=list)

    # Hour Deduction History
    recent_deductions: List[HourDeduction] = Field(default_factory=list)

    # Package Features
    features: PackageFeatures = Field(default_factory=PackageFeatures)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "maintenance_packages"
        indexes = [
            [("client_id", 1), ("status", 1)],
            "end_date",
            [("status", 1), ("end_date", 1)],
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "package_type": "PREMIUM",
                "package_name": "Premium Support Package",
                "total_hours": 50,
                "price": 65000
            }
        }

    def __repr__(self) -> str:
        return f"<MaintenancePackage {self.package_name}>"

    def __str__(self) -> str:
        return self.package_name

    def update_remaining_hours(self):
        """Calculate and update remaining hours"""
        self.remaining_hours = self.total_hours + self.rollover_hours - self.consumed_hours
