"""
Payment model - MongoDB document
"""
from beanie import Document
from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum
from bson import ObjectId
from app.core.types import PyObjectId


class PaymentMethod(str, Enum):
    """Payment method"""
    RAZORPAY = "RAZORPAY"
    STRIPE = "STRIPE"
    BANK_TRANSFER = "BANK_TRANSFER"
    PAYPAL = "PAYPAL"


class PaymentStatus(str, Enum):
    """Payment status"""
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class GatewayResponse(BaseModel):
    """Payment gateway response"""
    status: str
    method: Optional[str] = None
    card_network: Optional[str] = None
    card_last4: Optional[str] = None


class RefundInfo(BaseModel):
    """Refund information"""
    refund_id: Optional[str] = None
    refund_amount: float = 0.0
    refund_reason: Optional[str] = None
    refunded_at: Optional[datetime] = None


class Payment(Document):
    """Payment document model"""

    # References
    invoice_id: PyObjectId
    client_id: ObjectId

    # Payment Details
    amount: float
    currency: str = "INR"
    payment_method: PaymentMethod

    # Gateway Details
    gateway_payment_id: Optional[str] = None
    gateway_order_id: Optional[str] = None
    gateway_signature: Optional[str] = None
    gateway_response: Optional[GatewayResponse] = None

    # Status
    status: PaymentStatus = PaymentStatus.PENDING
    failure_reason: Optional[str] = None

    # Refund Details
    refund: RefundInfo = Field(default_factory=RefundInfo)

    # Timestamps
    paid_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "payments"
        indexes = [
            [("client_id", 1), ("paid_at", -1)],
            "invoice_id",
            "gateway_payment_id",
            "status",
        ]

    class Config:
        json_schema_extra = {
            "example": {
                "amount": 65000,
                "currency": "INR",
                "payment_method": "RAZORPAY",
                "status": "SUCCESS"
            }
        }

    def __repr__(self) -> str:
        return f"<Payment {self.amount} {self.currency}>"
