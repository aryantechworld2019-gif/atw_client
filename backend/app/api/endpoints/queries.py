"""
Query/Bug management endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query as QueryParam
from app.models.query import Query, QueryStatus, QueryPriority, QueryType
from app.models.user import User, UserRole
from app.api.dependencies.auth import get_current_user
from app.core.types import PyObjectId
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()


class QueryCreate(BaseModel):
    client_id: str
    title: str
    description: str
    type: QueryType
    priority: QueryPriority
    estimated_hours: Optional[float] = None


class QueryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[QueryType] = None
    priority: Optional[QueryPriority] = None
    status: Optional[QueryStatus] = None
    assigned_developer_id: Optional[str] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    resolution: Optional[str] = None


class QueryResponse(BaseModel):
    id: str
    client_id: str
    title: str
    description: str
    type: QueryType
    priority: QueryPriority
    status: QueryStatus
    assigned_developer_id: Optional[str]
    estimated_hours: Optional[float]
    actual_hours: Optional[float]
    created_by: str
    created_at: datetime
    updated_at: datetime
    resolution: Optional[str]
    closed_at: Optional[datetime]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[QueryResponse])
async def get_queries(
    skip: int = QueryParam(0, ge=0),
    limit: int = QueryParam(100, ge=1, le=100),
    status: Optional[QueryStatus] = None,
    priority: Optional[QueryPriority] = None,
    client_id: Optional[str] = None,
    assigned_developer_id: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """Get all queries with filtering"""
    query_filter = {}

    if status:
        query_filter["status"] = status
    if priority:
        query_filter["priority"] = priority
    if client_id:
        query_filter["client_id"] = PyObjectId(client_id)
    if assigned_developer_id:
        query_filter["assigned_developer_id"] = PyObjectId(assigned_developer_id)

    if search:
        query_filter["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]

    # Filter based on role
    if current_user.role == UserRole.DEVELOPER:
        query_filter["assigned_developer_id"] = PyObjectId(current_user.id)
    elif current_user.role in [UserRole.CLIENT_OWNER, UserRole.CLIENT_USER]:
        from app.models.client import Client
        client = await Client.find_one(Client.user_id == PyObjectId(current_user.id))
        if client:
            query_filter["client_id"] = PyObjectId(str(client.id))

    queries = await Query.find(query_filter).skip(skip).limit(limit).to_list()

    return [
        QueryResponse(
            id=str(q.id),
            client_id=str(q.client_id),
            title=q.title,
            description=q.description,
            type=q.type,
            priority=q.priority,
            status=q.status,
            assigned_developer_id=str(q.assigned_developer_id) if q.assigned_developer_id else None,
            estimated_hours=q.estimated_hours,
            actual_hours=q.actual_hours,
            created_by=str(q.created_by),
            created_at=q.created_at,
            updated_at=q.updated_at,
            resolution=q.resolution,
            closed_at=q.closed_at,
        )
        for q in queries
    ]


@router.post("/", response_model=QueryResponse, status_code=status.HTTP_201_CREATED)
async def create_query(
    query_data: QueryCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a new query"""
    new_query = Query(
        client_id=PyObjectId(query_data.client_id),
        title=query_data.title,
        description=query_data.description,
        type=query_data.type,
        priority=query_data.priority,
        status=QueryStatus.OPEN,
        estimated_hours=query_data.estimated_hours,
        created_by=PyObjectId(current_user.id),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    await new_query.insert()

    return QueryResponse(
        id=str(new_query.id),
        client_id=str(new_query.client_id),
        title=new_query.title,
        description=new_query.description,
        type=new_query.type,
        priority=new_query.priority,
        status=new_query.status,
        assigned_developer_id=None,
        estimated_hours=new_query.estimated_hours,
        actual_hours=None,
        created_by=str(new_query.created_by),
        created_at=new_query.created_at,
        updated_at=new_query.updated_at,
        resolution=None,
        closed_at=None,
    )


@router.get("/{query_id}", response_model=QueryResponse)
async def get_query(
    query_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a specific query"""
    try:
        query_obj = await Query.get(ObjectId(query_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found"
        )

    if not query_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found"
        )

    return QueryResponse(
        id=str(query_obj.id),
        client_id=str(query_obj.client_id),
        title=query_obj.title,
        description=query_obj.description,
        type=query_obj.type,
        priority=query_obj.priority,
        status=query_obj.status,
        assigned_developer_id=str(query_obj.assigned_developer_id) if query_obj.assigned_developer_id else None,
        estimated_hours=query_obj.estimated_hours,
        actual_hours=query_obj.actual_hours,
        created_by=str(query_obj.created_by),
        created_at=query_obj.created_at,
        updated_at=query_obj.updated_at,
        resolution=query_obj.resolution,
        closed_at=query_obj.closed_at,
    )


@router.put("/{query_id}", response_model=QueryResponse)
async def update_query(
    query_id: str,
    query_data: QueryUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update a query (only admin or assigned developer)"""
    try:
        query_obj = await Query.get(ObjectId(query_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found"
        )

    if not query_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found"
        )

    # Check permissions: only admin or assigned developer can update
    is_admin = current_user.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN]

    # Check if current user is the assigned developer
    is_assigned_developer = False
    if query_obj.assigned_developer_id:
        # Get developer profile for current user
        from app.models.developer import Developer
        developer = await Developer.find_one(Developer.user_id == PyObjectId(current_user.id))
        if developer:
            is_assigned_developer = (query_obj.assigned_developer_id == developer.id)

    if not is_admin and not is_assigned_developer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin or assigned developer can update this query"
        )

    # Update fields
    update_data = query_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "assigned_developer_id" and value:
            setattr(query_obj, field, PyObjectId(value))
        elif hasattr(query_obj, field):
            setattr(query_obj, field, value)

    # If status changed to closed, set closed_at
    if query_data.status == QueryStatus.CLOSED:
        query_obj.closed_at = datetime.utcnow()

    query_obj.updated_at = datetime.utcnow()
    await query_obj.save()

    return QueryResponse(
        id=str(query_obj.id),
        client_id=str(query_obj.client_id),
        title=query_obj.title,
        description=query_obj.description,
        type=query_obj.type,
        priority=query_obj.priority,
        status=query_obj.status,
        assigned_developer_id=str(query_obj.assigned_developer_id) if query_obj.assigned_developer_id else None,
        estimated_hours=query_obj.estimated_hours,
        actual_hours=query_obj.actual_hours,
        created_by=str(query_obj.created_by),
        created_at=query_obj.created_at,
        updated_at=query_obj.updated_at,
        resolution=query_obj.resolution,
        closed_at=query_obj.closed_at,
    )


@router.delete("/{query_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_query(
    query_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a query"""
    try:
        query_obj = await Query.get(ObjectId(query_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found"
        )

    if not query_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Query not found"
        )

    await query_obj.delete()
    return None
