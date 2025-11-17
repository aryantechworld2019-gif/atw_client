"""
Developer management endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.developer import Developer, DeveloperStatus
from app.models.user import User, UserRole
from app.api.dependencies.auth import get_current_user, require_admin
from app.core.types import PyObjectId
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel, EmailStr

router = APIRouter()


class DeveloperCreate(BaseModel):
    user_id: str
    skills: List[str]
    hourly_rate: float
    availability_hours: float = 40.0


class DeveloperUpdate(BaseModel):
    skills: Optional[List[str]] = None
    hourly_rate: Optional[float] = None
    status: Optional[DeveloperStatus] = None
    availability_hours: Optional[float] = None


class DeveloperResponse(BaseModel):
    id: str
    user_id: str
    skills: List[str]
    hourly_rate: float
    status: DeveloperStatus
    availability_hours: float
    total_hours_worked: float
    projects_completed: int
    average_rating: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[DeveloperResponse])
async def get_developers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[DeveloperStatus] = None,
    skill: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """Get all developers"""
    query = {}

    if status:
        query["status"] = status

    if skill:
        query["skills"] = {"$in": [skill]}

    developers = await Developer.find(query).skip(skip).limit(limit).to_list()

    return [
        DeveloperResponse(
            id=str(dev.id),
            user_id=str(dev.user_id),
            skills=dev.skills,
            hourly_rate=dev.hourly_rate,
            status=dev.status,
            availability_hours=dev.availability_hours,
            total_hours_worked=dev.total_hours_worked,
            projects_completed=dev.projects_completed,
            average_rating=dev.average_rating,
            created_at=dev.created_at,
            updated_at=dev.updated_at,
        )
        for dev in developers
    ]


@router.post("/", response_model=DeveloperResponse, status_code=status.HTTP_201_CREATED)
async def create_developer(
    developer_data: DeveloperCreate,
    current_user: User = Depends(require_admin),
):
    """Create a new developer"""
    # Check if developer already exists for this user
    existing = await Developer.find_one(Developer.user_id == PyObjectId(developer_data.user_id))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Developer profile already exists for this user"
        )

    developer = Developer(
        user_id=PyObjectId(developer_data.user_id),
        skills=developer_data.skills,
        hourly_rate=developer_data.hourly_rate,
        status=DeveloperStatus.AVAILABLE,
        availability_hours=developer_data.availability_hours,
        total_hours_worked=0.0,
        projects_completed=0,
        average_rating=0.0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    await developer.insert()

    return DeveloperResponse(
        id=str(developer.id),
        user_id=str(developer.user_id),
        skills=developer.skills,
        hourly_rate=developer.hourly_rate,
        status=developer.status,
        availability_hours=developer.availability_hours,
        total_hours_worked=developer.total_hours_worked,
        projects_completed=developer.projects_completed,
        average_rating=developer.average_rating,
        created_at=developer.created_at,
        updated_at=developer.updated_at,
    )


@router.get("/{developer_id}", response_model=DeveloperResponse)
async def get_developer(
    developer_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a specific developer"""
    try:
        developer = await Developer.get(ObjectId(developer_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Developer not found"
        )

    if not developer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Developer not found"
        )

    return DeveloperResponse(
        id=str(developer.id),
        user_id=str(developer.user_id),
        skills=developer.skills,
        hourly_rate=developer.hourly_rate,
        status=developer.status,
        availability_hours=developer.availability_hours,
        total_hours_worked=developer.total_hours_worked,
        projects_completed=developer.projects_completed,
        average_rating=developer.average_rating,
        created_at=developer.created_at,
        updated_at=developer.updated_at,
    )


@router.put("/{developer_id}", response_model=DeveloperResponse)
async def update_developer(
    developer_id: str,
    developer_data: DeveloperUpdate,
    current_user: User = Depends(require_admin),
):
    """Update a developer"""
    try:
        developer = await Developer.get(ObjectId(developer_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Developer not found"
        )

    if not developer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Developer not found"
        )

    # Update fields
    update_data = developer_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(developer, field):
            setattr(developer, field, value)

    developer.updated_at = datetime.utcnow()
    await developer.save()

    return DeveloperResponse(
        id=str(developer.id),
        user_id=str(developer.user_id),
        skills=developer.skills,
        hourly_rate=developer.hourly_rate,
        status=developer.status,
        availability_hours=developer.availability_hours,
        total_hours_worked=developer.total_hours_worked,
        projects_completed=developer.projects_completed,
        average_rating=developer.average_rating,
        created_at=developer.created_at,
        updated_at=developer.updated_at,
    )


@router.delete("/{developer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_developer(
    developer_id: str,
    current_user: User = Depends(require_admin),
):
    """Delete a developer"""
    try:
        developer = await Developer.get(ObjectId(developer_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Developer not found"
        )

    if not developer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Developer not found"
        )

    await developer.delete()
    return None
