"""
Client management endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.client import Client, ClientStatus
from app.models.user import User, UserRole
from app.api.dependencies.auth import get_current_user, require_admin
from app.core.types import PyObjectId
from bson import ObjectId
from datetime import datetime

router = APIRouter()


# Pydantic schemas
from pydantic import BaseModel, EmailStr


class ContactInfo(BaseModel):
    name: str
    email: EmailStr
    phone: str
    designation: str


class Address(BaseModel):
    street: str
    city: str
    state: str
    country: str
    pincode: str


class ClientCreate(BaseModel):
    company_name: str
    industry: str
    website: Optional[str] = None
    contact_info: ContactInfo
    address: Address
    billing_email: EmailStr
    tax_id: Optional[str] = None


class ClientUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    contact_info: Optional[ContactInfo] = None
    address: Optional[Address] = None
    status: Optional[ClientStatus] = None
    billing_email: Optional[EmailStr] = None
    tax_id: Optional[str] = None


class ClientResponse(BaseModel):
    id: str
    company_name: str
    industry: str
    website: Optional[str]
    status: ClientStatus
    contact_info: ContactInfo
    address: Address
    billing_email: str
    tax_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[ClientResponse])
async def get_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[ClientStatus] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """Get all clients with pagination and filtering"""
    query = {}

    if status:
        query["status"] = status

    if search:
        query["$or"] = [
            {"company_name": {"$regex": search, "$options": "i"}},
            {"industry": {"$regex": search, "$options": "i"}},
        ]

    # If client user, only show their own client
    if current_user.role in [UserRole.CLIENT_OWNER, UserRole.CLIENT_USER]:
        client = await Client.find_one(Client.user_id == PyObjectId(current_user.id))
        return [client] if client else []

    clients = await Client.find(query).skip(skip).limit(limit).to_list()

    return [
        ClientResponse(
            id=str(client.id),
            company_name=client.company_name,
            industry=client.industry,
            website=client.website,
            status=client.status,
            contact_info=client.contact_info,
            address=client.address,
            billing_email=client.billing_email,
            tax_id=client.tax_id,
            created_at=client.created_at,
            updated_at=client.updated_at,
        )
        for client in clients
    ]


@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    client_data: ClientCreate,
    current_user: User = Depends(require_admin),
):
    """Create a new client"""
    # Create new client
    client = Client(
        user_id=PyObjectId(current_user.id),
        company_name=client_data.company_name,
        industry=client_data.industry,
        website=client_data.website,
        contact_info=client_data.contact_info.model_dump(),
        address=client_data.address.model_dump(),
        billing_email=client_data.billing_email,
        tax_id=client_data.tax_id,
        status=ClientStatus.ACTIVE,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    await client.insert()

    return ClientResponse(
        id=str(client.id),
        company_name=client.company_name,
        industry=client.industry,
        website=client.website,
        status=client.status,
        contact_info=client.contact_info,
        address=client.address,
        billing_email=client.billing_email,
        tax_id=client.tax_id,
        created_at=client.created_at,
        updated_at=client.updated_at,
    )


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a specific client"""
    try:
        client = await Client.get(ObjectId(client_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    # Check permissions
    if current_user.role in [UserRole.CLIENT_OWNER, UserRole.CLIENT_USER]:
        own_client = await Client.find_one(Client.user_id == PyObjectId(current_user.id))
        if not own_client or str(own_client.id) != client_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this client"
            )

    return ClientResponse(
        id=str(client.id),
        company_name=client.company_name,
        industry=client.industry,
        website=client.website,
        status=client.status,
        contact_info=client.contact_info,
        address=client.address,
        billing_email=client.billing_email,
        tax_id=client.tax_id,
        created_at=client.created_at,
        updated_at=client.updated_at,
    )


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    client_data: ClientUpdate,
    current_user: User = Depends(require_admin),
):
    """Update a client"""
    try:
        client = await Client.get(ObjectId(client_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    # Update fields
    update_data = client_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(client, field):
            setattr(client, field, value)

    client.updated_at = datetime.utcnow()
    await client.save()

    return ClientResponse(
        id=str(client.id),
        company_name=client.company_name,
        industry=client.industry,
        website=client.website,
        status=client.status,
        contact_info=client.contact_info,
        address=client.address,
        billing_email=client.billing_email,
        tax_id=client.tax_id,
        created_at=client.created_at,
        updated_at=client.updated_at,
    )


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: str,
    current_user: User = Depends(require_admin),
):
    """Delete a client (soft delete)"""
    try:
        client = await Client.get(ObjectId(client_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    # Soft delete
    client.status = ClientStatus.SUSPENDED
    client.deleted_at = datetime.utcnow()
    await client.save()

    return None


@router.get("/{client_id}/stats")
async def get_client_stats(
    client_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get client statistics"""
    try:
        client = await Client.get(ObjectId(client_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    # Import here to avoid circular dependency
    from app.models.query import Query
    from app.models.maintenance_package import MaintenancePackage
    from app.models.invoice import Invoice

    # Get statistics
    total_queries = await Query.find(Query.client_id == PyObjectId(client_id)).count()
    active_package = await MaintenancePackage.find_one(
        MaintenancePackage.client_id == PyObjectId(client_id),
        MaintenancePackage.status == "active"
    )
    total_invoices = await Invoice.find(Invoice.client_id == PyObjectId(client_id)).count()

    return {
        "total_queries": total_queries,
        "active_package": {
            "id": str(active_package.id),
            "package_name": active_package.package_name,
            "remaining_hours": active_package.remaining_hours,
        } if active_package else None,
        "total_invoices": total_invoices,
    }
