"""
User management endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.user import User, UserRole, UserStatus
from app.api.dependencies.auth import get_current_user, require_admin
from app.core.types import PyObjectId
from app.core.security import get_password_hash
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel, EmailStr

router = APIRouter()


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CLIENT_USER


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str]
    role: UserRole
    status: UserStatus
    is_active: bool
    is_email_verified: bool
    avatar_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    role: Optional[UserRole] = None,
    status: Optional[UserStatus] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_admin),
):
    """Get all users (admin only)"""
    query = {}

    if role:
        query["role"] = role

    if status:
        query["status"] = status

    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}},
        ]

    users = await User.find(query).skip(skip).limit(limit).to_list()

    return [
        UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            role=user.role,
            status=user.status,
            is_active=user.is_active,
            is_email_verified=user.is_email_verified,
            avatar_url=user.avatar_url,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
        for user in users
    ]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(require_admin),
):
    """Get a specific user (admin only)"""
    try:
        user = await User.get(ObjectId(user_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        status=user.status,
        is_active=user.is_active,
        is_email_verified=user.is_email_verified,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin),
):
    """Create a new user (admin only)"""
    # Check if user already exists
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = get_password_hash(user_data.password)

    # Create user
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role,
        status=UserStatus.ACTIVE,
        is_active=True,
        is_email_verified=True,  # Admin-created users are auto-verified
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    await new_user.insert()

    return UserResponse(
        id=str(new_user.id),
        email=new_user.email,
        full_name=new_user.full_name,
        phone=new_user.phone,
        role=new_user.role,
        status=new_user.status,
        client_id=str(new_user.client_id) if new_user.client_id else None,
        is_verified=new_user.is_verified,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at,
    )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(require_admin),
):
    """Update a user (admin only)"""
    try:
        user = await User.get(ObjectId(user_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update fields
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(user, field):
            setattr(user, field, value)

    user.updated_at = datetime.utcnow()
    await user.save()

    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        status=user.status,
        is_active=user.is_active,
        is_email_verified=user.is_email_verified,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: User = Depends(require_admin),
):
    """Delete a user (soft delete by setting status to INACTIVE)"""
    try:
        user = await User.get(ObjectId(user_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Don't allow deleting yourself
    if str(user.id) == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    # Soft delete
    user.status = UserStatus.INACTIVE
    user.updated_at = datetime.utcnow()
    await user.save()


@router.post("/{user_id}/activate", response_model=UserResponse)
async def activate_user(
    user_id: str,
    current_user: User = Depends(require_admin),
):
    """Activate a user (admin only)"""
    try:
        user = await User.get(ObjectId(user_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.status = UserStatus.ACTIVE
    user.updated_at = datetime.utcnow()
    await user.save()

    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        status=user.status,
        is_active=user.is_active,
        is_email_verified=user.is_email_verified,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )
