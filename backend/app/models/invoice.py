"""
Invoice model - MongoDB document
"""
from beanie import Document
from pydantic import Field, BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId


class InvoiceStatus(str, Enum):
    """Invoice status"""
    DRAFT = "DRAFT"
    SENT = "SENT"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"


class BillingPeriod(BaseModel):
    """Billing period"""
    start_date: datetime
    end_date: datetime


class LineItem(BaseModel):
    """Invoice line item"""
    description: str
    quantity: int
    unit_price: float
    total: float


class Invoice(Document):
    """Invoice document model"""

    # Invoice Information
    invoice_number: str
    client_id: ObjectId
    package_id: Optional[ObjectId] = None

    # Billing Period
    billing_period: BillingPeriod

    # Line Items
    line_items: List[LineItem] = Field(default_factory=list)

    # Amounts
    subtotal: float
    tax_rate: float = 18.0  # GST percentage
    tax_amount: float
    total_amount: float
    currency: str = "INR"

    # Payment Status
    status: InvoiceStatus = InvoiceStatus.DRAFT
    due_date: datetime

    # PDF Document
    pdf_url: Optional[str] = None
    pdf_generated_at: Optional[datetime] = None

    # Timestamps
    issued_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "invoices"
        indexes = [
            "invoice_number",
            [("client_id", 1), ("issued_at", -1)],
            "status",
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "invoice_number": "INV-2025-11-001",
                "subtotal": 80000,
                "tax_amount": 14400,
                "total_amount": 94400
            }
        }

    def __repr__(self) -> str:
        return f"<Invoice {self.invoice_number}>"

    def __str__(self) -> str:
        return self.invoice_number
