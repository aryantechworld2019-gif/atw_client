"""
Client model - MongoDB document
"""
from beanie import Document, Link
from pydantic import Field, BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId


class ClientStatus(str, Enum):
    """Client status enumeration"""
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"
    CHURNED = "CHURNED"


class ContactInfo(BaseModel):
    """Primary contact information"""
    name: str
    email: str
    phone: str
    designation: Optional[str] = None


class Address(BaseModel):
    """Billing address"""
    street: str
    city: str
    state: str
    country: str
    postal_code: str


class BrandColors(BaseModel):
    """Brand color scheme"""
    primary: str = "#FF5733"
    secondary: str = "#3498DB"


class AdditionalUser(BaseModel):
    """Additional client user"""
    user_id: ObjectId
    name: str
    email: str
    role: str
    added_at: datetime = Field(default_factory=datetime.utcnow)


class AssignedDeveloper(BaseModel):
    """Assigned developer information"""
    developer_id: ObjectId
    is_primary: bool = False
    assigned_at: datetime = Field(default_factory=datetime.utcnow)


class Project(BaseModel):
    """Client project information"""
    project_id: str
    name: str
    description: str
    start_date: datetime
    end_date: Optional[datetime] = None
    status: str = "IN_PROGRESS"


class Contract(BaseModel):
    """Contract details"""
    contract_id: str
    start_date: datetime
    end_date: datetime
    contract_value: float
    currency: str = "INR"
    payment_terms: str = "Monthly"
    signed_document_url: Optional[str] = None


class Client(Document):
    """Client document model"""

    # Reference to User
    user_id: ObjectId

    # Company Details
    company_name: str
    industry: Optional[str] = None
    company_size: Optional[str] = None
    website: Optional[str] = None

    # Contact Information
    primary_contact: ContactInfo
    billing_address: Address

    # Branding
    logo_url: Optional[str] = None
    brand_colors: BrandColors = Field(default_factory=BrandColors)

    # Account Management
    account_manager_id: Optional[ObjectId] = None
    status: ClientStatus = ClientStatus.ACTIVE

    # Additional Users
    additional_users: List[AdditionalUser] = Field(default_factory=list)

    # Assigned Developers
    assigned_developers: List[AssignedDeveloper] = Field(default_factory=list)

    # Projects
    projects: List[Project] = Field(default_factory=list)

    # Contract
    contract: Optional[Contract] = None

    # Timestamps
    onboarded_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None

    class Settings:
        name = "clients"
        indexes = [
            "user_id",
            "company_name",
            "status",
            "assigned_developers.developer_id",
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "company_name": "Tech Innovations Pvt Ltd",
                "industry": "FinTech",
                "status": "ACTIVE"
            }
        }

    def __repr__(self) -> str:
        return f"<Client {self.company_name}>"

    def __str__(self) -> str:
        return self.company_name
