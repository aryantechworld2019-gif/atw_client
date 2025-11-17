"""
Payment management endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.payment import (
    Payment,
    PaymentMethod,
    PaymentStatus,
    GatewayResponse,
    RefundInfo
)
from app.models.user import User, UserRole
from app.api.dependencies.auth import get_current_user, require_admin
from app.core.types import PyObjectId
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()


class GatewayResponseCreate(BaseModel):
    status: str
    method: Optional[str] = None
    card_network: Optional[str] = None
    card_last4: Optional[str] = None


class PaymentCreate(BaseModel):
    invoice_id: str
    client_id: str
    amount: float
    currency: str = "INR"
    payment_method: PaymentMethod
    gateway_payment_id: Optional[str] = None
    gateway_order_id: Optional[str] = None
    gateway_signature: Optional[str] = None
    gateway_response: Optional[GatewayResponseCreate] = None


class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    gateway_payment_id: Optional[str] = None
    gateway_order_id: Optional[str] = None
    gateway_signature: Optional[str] = None
    failure_reason: Optional[str] = None


class RefundCreate(BaseModel):
    refund_amount: float
    refund_reason: str


class PaymentResponse(BaseModel):
    id: str
    invoice_id: str
    client_id: str
    amount: float
    currency: str
    payment_method: PaymentMethod
    gateway_payment_id: Optional[str]
    gateway_order_id: Optional[str]
    status: PaymentStatus
    failure_reason: Optional[str]
    refund: RefundInfo
    paid_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[PaymentResponse])
async def get_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[PaymentStatus] = None,
    client_id: Optional[str] = None,
    invoice_id: Optional[str] = None,
    payment_method: Optional[PaymentMethod] = None,
    current_user: User = Depends(get_current_user),
):
    """Get all payments"""
    query = {}

    if status:
        query["status"] = status

    if client_id:
        query["client_id"] = PyObjectId(client_id)

    if invoice_id:
        query["invoice_id"] = PyObjectId(invoice_id)

    if payment_method:
        query["payment_method"] = payment_method

    # If client user, only show their payments
    if current_user.role in [UserRole.CLIENT_OWNER, UserRole.CLIENT_USER]:
        if current_user.client_id:
            query["client_id"] = current_user.client_id

    payments = await Payment.find(query).skip(skip).limit(limit).to_list()

    return [
        PaymentResponse(
            id=str(payment.id),
            invoice_id=str(payment.invoice_id),
            client_id=str(payment.client_id),
            amount=payment.amount,
            currency=payment.currency,
            payment_method=payment.payment_method,
            gateway_payment_id=payment.gateway_payment_id,
            gateway_order_id=payment.gateway_order_id,
            status=payment.status,
            failure_reason=payment.failure_reason,
            refund=payment.refund,
            paid_at=payment.paid_at,
            created_at=payment.created_at,
            updated_at=payment.updated_at,
        )
        for payment in payments
    ]


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a specific payment"""
    try:
        payment = await Payment.get(ObjectId(payment_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    # Check access
    if current_user.role in [UserRole.CLIENT_OWNER, UserRole.CLIENT_USER]:
        if current_user.client_id != payment.client_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this payment"
            )

    return PaymentResponse(
        id=str(payment.id),
        invoice_id=str(payment.invoice_id),
        client_id=str(payment.client_id),
        amount=payment.amount,
        currency=payment.currency,
        payment_method=payment.payment_method,
        gateway_payment_id=payment.gateway_payment_id,
        gateway_order_id=payment.gateway_order_id,
        status=payment.status,
        failure_reason=payment.failure_reason,
        refund=payment.refund,
        paid_at=payment.paid_at,
        created_at=payment.created_at,
        updated_at=payment.updated_at,
    )


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(require_admin),
):
    """Create a new payment record"""
    # Create gateway response if provided
    gateway_response = None
    if payment_data.gateway_response:
        gateway_response = GatewayResponse(**payment_data.gateway_response.model_dump())

    payment = Payment(
        invoice_id=PyObjectId(payment_data.invoice_id),
        client_id=PyObjectId(payment_data.client_id),
        amount=payment_data.amount,
        currency=payment_data.currency,
        payment_method=payment_data.payment_method,
        gateway_payment_id=payment_data.gateway_payment_id,
        gateway_order_id=payment_data.gateway_order_id,
        gateway_signature=payment_data.gateway_signature,
        gateway_response=gateway_response,
        status=PaymentStatus.SUCCESS if payment_data.gateway_payment_id else PaymentStatus.PENDING,
        paid_at=datetime.utcnow() if payment_data.gateway_payment_id else None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    await payment.insert()

    return PaymentResponse(
        id=str(payment.id),
        invoice_id=str(payment.invoice_id),
        client_id=str(payment.client_id),
        amount=payment.amount,
        currency=payment.currency,
        payment_method=payment.payment_method,
        gateway_payment_id=payment.gateway_payment_id,
        gateway_order_id=payment.gateway_order_id,
        status=payment.status,
        failure_reason=payment.failure_reason,
        refund=payment.refund,
        paid_at=payment.paid_at,
        created_at=payment.created_at,
        updated_at=payment.updated_at,
    )


@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: str,
    payment_data: PaymentUpdate,
    current_user: User = Depends(require_admin),
):
    """Update a payment"""
    try:
        payment = await Payment.get(ObjectId(payment_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    # Update fields
    update_data = payment_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(payment, field):
            setattr(payment, field, value)

    # If status changed to SUCCESS and paid_at is not set, set it now
    if payment_data.status == PaymentStatus.SUCCESS and not payment.paid_at:
        payment.paid_at = datetime.utcnow()

    payment.updated_at = datetime.utcnow()
    await payment.save()

    return PaymentResponse(
        id=str(payment.id),
        invoice_id=str(payment.invoice_id),
        client_id=str(payment.client_id),
        amount=payment.amount,
        currency=payment.currency,
        payment_method=payment.payment_method,
        gateway_payment_id=payment.gateway_payment_id,
        gateway_order_id=payment.gateway_order_id,
        status=payment.status,
        failure_reason=payment.failure_reason,
        refund=payment.refund,
        paid_at=payment.paid_at,
        created_at=payment.created_at,
        updated_at=payment.updated_at,
    )


@router.post("/{payment_id}/refund", response_model=PaymentResponse)
async def refund_payment(
    payment_id: str,
    refund_data: RefundCreate,
    current_user: User = Depends(require_admin),
):
    """Refund a payment"""
    try:
        payment = await Payment.get(ObjectId(payment_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )

    if payment.status != PaymentStatus.SUCCESS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only refund successful payments"
        )

    if refund_data.refund_amount > payment.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refund amount cannot exceed payment amount"
        )

    # Update refund information
    payment.refund = RefundInfo(
        refund_id=str(ObjectId()),
        refund_amount=refund_data.refund_amount,
        refund_reason=refund_data.refund_reason,
        refunded_at=datetime.utcnow(),
    )
    payment.status = PaymentStatus.REFUNDED
    payment.updated_at = datetime.utcnow()

    await payment.save()

    return PaymentResponse(
        id=str(payment.id),
        invoice_id=str(payment.invoice_id),
        client_id=str(payment.client_id),
        amount=payment.amount,
        currency=payment.currency,
        payment_method=payment.payment_method,
        gateway_payment_id=payment.gateway_payment_id,
        gateway_order_id=payment.gateway_order_id,
        status=payment.status,
        failure_reason=payment.failure_reason,
        refund=payment.refund,
        paid_at=payment.paid_at,
        created_at=payment.created_at,
        updated_at=payment.updated_at,
    )
