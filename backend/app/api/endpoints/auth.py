"""
Authentication endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends, Request
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.models.user import User, UserRole
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.core.validation import validate_password_strength
from app.api.dependencies.auth import get_current_user
from app.core.rate_limit import limiter
from datetime import datetime
from bson import ObjectId

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")  # Limit registrations to prevent abuse
async def register(request: Request, user_data: UserCreate):
    """
    Register a new user
    """
    # Validate password strength
    try:
        validate_password_strength(user_data.password)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Check if user already exists
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Create new user
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role,
        is_active=True,
        is_email_verified=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    await user.insert()

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Prepare user response
    user_response = UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        is_email_verified=user.is_email_verified,
        avatar_url=user.avatar_url,
        created_at=user.created_at
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_response
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")  # Prevent brute force attacks
async def login(request: Request, credentials: UserLogin):
    """
    User login
    """
    # Find user by email
    user = await User.find_one(User.email == credentials.email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Update last login
    user.last_login = datetime.utcnow()
    await user.save()

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Prepare user response
    user_response = UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        is_email_verified=user.is_email_verified,
        avatar_url=user.avatar_url,
        created_at=user.created_at
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_response
    )


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """
    Refresh access token
    """
    # Decode refresh token
    payload = decode_token(refresh_token)

    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    user_id = payload.get("sub")

    # Create new access token
    access_token = create_access_token(data={"sub": user_id})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current user information
    """
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role,
        is_active=current_user.is_active,
        is_email_verified=current_user.is_email_verified,
        avatar_url=current_user.avatar_url,
        created_at=current_user.created_at
    )
