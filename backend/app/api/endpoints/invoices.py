"""
Invoice management endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.invoice import (
    Invoice,
    InvoiceStatus,
    BillingPeriod,
    LineItem
)
from app.models.user import User, UserRole
from app.api.dependencies.auth import get_current_user, require_admin
from app.core.types import PyObjectId
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()


class BillingPeriodCreate(BaseModel):
    start_date: datetime
    end_date: datetime


class LineItemCreate(BaseModel):
    description: str
    quantity: int
    unit_price: float


class InvoiceCreate(BaseModel):
    client_id: str
    package_id: Optional[str] = None
    billing_period: BillingPeriodCreate
    line_items: List[LineItemCreate]
    tax_rate: float = 18.0
    currency: str = "INR"
    due_date: datetime


class InvoiceUpdate(BaseModel):
    status: Optional[InvoiceStatus] = None
    due_date: Optional[datetime] = None
    pdf_url: Optional[str] = None


class InvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    client_id: str
    package_id: Optional[str]
    billing_period: BillingPeriod
    line_items: List[LineItem]
    subtotal: float
    tax_rate: float
    tax_amount: float
    total_amount: float
    currency: str
    status: InvoiceStatus
    due_date: datetime
    pdf_url: Optional[str]
    issued_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


def generate_invoice_number() -> str:
    """Generate a unique invoice number"""
    now = datetime.utcnow()
    # Format: INV-YYYY-MM-XXXXX (where XXXXX is incremental)
    # For simplicity, using timestamp for uniqueness
    return f"INV-{now.strftime('%Y-%m')}-{now.strftime('%d%H%M%S')}"


@router.get("/", response_model=List[InvoiceResponse])
async def get_invoices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[InvoiceStatus] = None,
    client_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """Get all invoices"""
    query = {}

    if status:
        query["status"] = status

    if client_id:
        query["client_id"] = PyObjectId(client_id)

    # If client user, only show their invoices
    if current_user.role in [UserRole.CLIENT_OWNER, UserRole.CLIENT_USER]:
        if current_user.client_id:
            query["client_id"] = current_user.client_id

    invoices = await Invoice.find(query).skip(skip).limit(limit).to_list()

    return [
        InvoiceResponse(
            id=str(inv.id),
            invoice_number=inv.invoice_number,
            client_id=str(inv.client_id),
            package_id=str(inv.package_id) if inv.package_id else None,
            billing_period=inv.billing_period,
            line_items=inv.line_items,
            subtotal=inv.subtotal,
            tax_rate=inv.tax_rate,
            tax_amount=inv.tax_amount,
            total_amount=inv.total_amount,
            currency=inv.currency,
            status=inv.status,
            due_date=inv.due_date,
            pdf_url=inv.pdf_url,
            issued_at=inv.issued_at,
            created_at=inv.created_at,
            updated_at=inv.updated_at,
        )
        for inv in invoices
    ]


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a specific invoice"""
    try:
        invoice = await Invoice.get(ObjectId(invoice_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )

    # Check access
    if current_user.role in [UserRole.CLIENT_OWNER, UserRole.CLIENT_USER]:
        if current_user.client_id != invoice.client_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this invoice"
            )

    return InvoiceResponse(
        id=str(invoice.id),
        invoice_number=invoice.invoice_number,
        client_id=str(invoice.client_id),
        package_id=str(invoice.package_id) if invoice.package_id else None,
        billing_period=invoice.billing_period,
        line_items=invoice.line_items,
        subtotal=invoice.subtotal,
        tax_rate=invoice.tax_rate,
        tax_amount=invoice.tax_amount,
        total_amount=invoice.total_amount,
        currency=invoice.currency,
        status=invoice.status,
        due_date=invoice.due_date,
        pdf_url=invoice.pdf_url,
        issued_at=invoice.issued_at,
        created_at=invoice.created_at,
        updated_at=invoice.updated_at,
    )


@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice_data: InvoiceCreate,
    current_user: User = Depends(require_admin),
):
    """Create a new invoice"""
    # Calculate line item totals
    line_items = []
    subtotal = 0.0

    for item in invoice_data.line_items:
        item_total = item.quantity * item.unit_price
        line_items.append(LineItem(
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total=item_total
        ))
        subtotal += item_total

    # Calculate tax and total
    tax_amount = subtotal * (invoice_data.tax_rate / 100)
    total_amount = subtotal + tax_amount

    # Generate invoice number
    invoice_number = generate_invoice_number()

    invoice = Invoice(
        invoice_number=invoice_number,
        client_id=PyObjectId(invoice_data.client_id),
        package_id=PyObjectId(invoice_data.package_id) if invoice_data.package_id else None,
        billing_period=BillingPeriod(**invoice_data.billing_period.model_dump()),
        line_items=line_items,
        subtotal=subtotal,
        tax_rate=invoice_data.tax_rate,
        tax_amount=tax_amount,
        total_amount=total_amount,
        currency=invoice_data.currency,
        status=InvoiceStatus.DRAFT,
        due_date=invoice_data.due_date,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    await invoice.insert()

    return InvoiceResponse(
        id=str(invoice.id),
        invoice_number=invoice.invoice_number,
        client_id=str(invoice.client_id),
        package_id=str(invoice.package_id) if invoice.package_id else None,
        billing_period=invoice.billing_period,
        line_items=invoice.line_items,
        subtotal=invoice.subtotal,
        tax_rate=invoice.tax_rate,
        tax_amount=invoice.tax_amount,
        total_amount=invoice.total_amount,
        currency=invoice.currency,
        status=invoice.status,
        due_date=invoice.due_date,
        pdf_url=invoice.pdf_url,
        issued_at=invoice.issued_at,
        created_at=invoice.created_at,
        updated_at=invoice.updated_at,
    )


@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: str,
    invoice_data: InvoiceUpdate,
    current_user: User = Depends(require_admin),
):
    """Update an invoice"""
    try:
        invoice = await Invoice.get(ObjectId(invoice_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )

    # Update fields
    update_data = invoice_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(invoice, field):
            setattr(invoice, field, value)

    # If status changed to SENT and issued_at is not set, set it now
    if invoice_data.status == InvoiceStatus.SENT and not invoice.issued_at:
        invoice.issued_at = datetime.utcnow()

    invoice.updated_at = datetime.utcnow()
    await invoice.save()

    return InvoiceResponse(
        id=str(invoice.id),
        invoice_number=invoice.invoice_number,
        client_id=str(invoice.client_id),
        package_id=str(invoice.package_id) if invoice.package_id else None,
        billing_period=invoice.billing_period,
        line_items=invoice.line_items,
        subtotal=invoice.subtotal,
        tax_rate=invoice.tax_rate,
        tax_amount=invoice.tax_amount,
        total_amount=invoice.total_amount,
        currency=invoice.currency,
        status=invoice.status,
        due_date=invoice.due_date,
        pdf_url=invoice.pdf_url,
        issued_at=invoice.issued_at,
        created_at=invoice.created_at,
        updated_at=invoice.updated_at,
    )


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: str,
    current_user: User = Depends(require_admin),
):
    """Delete an invoice (set status to CANCELLED)"""
    try:
        invoice = await Invoice.get(ObjectId(invoice_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )

    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )

    if invoice.status == InvoiceStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete paid invoices"
        )

    invoice.status = InvoiceStatus.CANCELLED
    invoice.updated_at = datetime.utcnow()
    await invoice.save()
