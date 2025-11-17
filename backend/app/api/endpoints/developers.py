"""
Developer management endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.developer import Developer, AvailabilityStatus, Skill, ProficiencyLevel
from app.models.user import User, UserRole
from app.api.dependencies.auth import get_current_user, require_admin
from app.core.types import PyObjectId
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel, EmailStr

router = APIRouter()


class SkillCreate(BaseModel):
    name: str
    proficiency: ProficiencyLevel


class DeveloperCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    designation: str = "Developer"
    skills: List[SkillCreate] = []
    expertise_areas: List[str] = []
    hourly_rate: float = 1500
    max_concurrent_queries: int = 5


class DeveloperUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    skills: Optional[List[SkillCreate]] = None
    expertise_areas: Optional[List[str]] = None
    hourly_rate: Optional[float] = None
    availability_status: Optional[AvailabilityStatus] = None
    max_concurrent_queries: Optional[int] = None


class DeveloperResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    phone: Optional[str]
    designation: str
    skills: List[dict]
    expertise_areas: List[str]
    availability_status: str
    max_concurrent_queries: int
    current_active_queries: int
    hourly_rate: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[DeveloperResponse])
async def get_developers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    availability_status: Optional[AvailabilityStatus] = None,
    skill: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """Get all developers"""
    query = {}

    if availability_status:
        query["availability_status"] = availability_status

    if skill:
        query["skills.name"] = skill

    developers = await Developer.find(query).skip(skip).limit(limit).to_list()

    return [
        DeveloperResponse(
            id=str(dev.id),
            user_id=str(dev.user_id),
            full_name=dev.full_name,
            email=dev.email,
            phone=dev.phone,
            designation=dev.designation,
            skills=[skill.model_dump() for skill in dev.skills],
            expertise_areas=dev.expertise_areas,
            availability_status=dev.availability_status.value,
            max_concurrent_queries=dev.max_concurrent_queries,
            current_active_queries=dev.current_active_queries,
            hourly_rate=dev.hourly_rate,
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
    # Check if developer already exists with this email
    existing = await Developer.find_one(Developer.email == developer_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Developer with this email already exists"
        )

    # Convert skill create objects to Skill model objects
    skills = [Skill(name=s.name, proficiency=s.proficiency) for s in developer_data.skills]

    developer = Developer(
        user_id=PyObjectId(str(current_user.id)),  # Use current user's ID
        full_name=developer_data.full_name,
        email=developer_data.email,
        phone=developer_data.phone,
        designation=developer_data.designation,
        skills=skills,
        expertise_areas=developer_data.expertise_areas,
        hourly_rate=developer_data.hourly_rate,
        max_concurrent_queries=developer_data.max_concurrent_queries,
        availability_status=AvailabilityStatus.AVAILABLE,
        current_active_queries=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    await developer.insert()

    return DeveloperResponse(
        id=str(developer.id),
        user_id=str(developer.user_id),
        full_name=developer.full_name,
        email=developer.email,
        phone=developer.phone,
        designation=developer.designation,
        skills=[skill.model_dump() for skill in developer.skills],
        expertise_areas=developer.expertise_areas,
        availability_status=developer.availability_status.value,
        max_concurrent_queries=developer.max_concurrent_queries,
        current_active_queries=developer.current_active_queries,
        hourly_rate=developer.hourly_rate,
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
        full_name=developer.full_name,
        email=developer.email,
        phone=developer.phone,
        designation=developer.designation,
        skills=[skill.model_dump() for skill in developer.skills],
        expertise_areas=developer.expertise_areas,
        availability_status=developer.availability_status.value,
        max_concurrent_queries=developer.max_concurrent_queries,
        current_active_queries=developer.current_active_queries,
        hourly_rate=developer.hourly_rate,
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

    # Convert skills if provided
    if "skills" in update_data and update_data["skills"]:
        update_data["skills"] = [Skill(name=s["name"], proficiency=s["proficiency"]) for s in update_data["skills"]]

    for field, value in update_data.items():
        if hasattr(developer, field):
            setattr(developer, field, value)

    developer.updated_at = datetime.utcnow()
    await developer.save()

    return DeveloperResponse(
        id=str(developer.id),
        user_id=str(developer.user_id),
        full_name=developer.full_name,
        email=developer.email,
        phone=developer.phone,
        designation=developer.designation,
        skills=[skill.model_dump() for skill in developer.skills],
        expertise_areas=developer.expertise_areas,
        availability_status=developer.availability_status.value,
        max_concurrent_queries=developer.max_concurrent_queries,
        current_active_queries=developer.current_active_queries,
        hourly_rate=developer.hourly_rate,
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
