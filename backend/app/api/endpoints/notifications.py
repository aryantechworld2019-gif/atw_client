"""
Notification management endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.notification import (
    Notification,
    NotificationType,
    NotificationPriority,
    NotificationChannels,
    InAppChannel
)
from app.models.user import User
from app.api.dependencies.auth import get_current_user
from app.core.types import PyObjectId
from bson import ObjectId
from datetime import datetime, timedelta
from pydantic import BaseModel

router = APIRouter()


class NotificationCreate(BaseModel):
    user_id: str
    query_id: Optional[str] = None
    title: str
    message: str
    notification_type: NotificationType
    action_url: Optional[str] = None
    priority: NotificationPriority = NotificationPriority.NORMAL


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    query_id: Optional[str]
    title: str
    message: str
    notification_type: NotificationType
    is_read: bool
    read_at: Optional[datetime]
    action_url: Optional[str]
    priority: NotificationPriority
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    is_read: Optional[bool] = None,
    notification_type: Optional[NotificationType] = None,
    current_user: User = Depends(get_current_user),
):
    """Get notifications for the current user"""
    query = {"user_id": PyObjectId(current_user.id)}

    if is_read is not None:
        query["channels.in_app.is_read"] = is_read

    if notification_type:
        query["notification_type"] = notification_type

    notifications = await Notification.find(query).sort("-created_at").skip(skip).limit(limit).to_list()

    return [
        NotificationResponse(
            id=str(notif.id),
            user_id=str(notif.user_id),
            query_id=str(notif.query_id) if notif.query_id else None,
            title=notif.title,
            message=notif.message,
            notification_type=notif.notification_type,
            is_read=notif.channels.in_app.is_read,
            read_at=notif.channels.in_app.read_at,
            action_url=notif.action_url,
            priority=notif.priority,
            created_at=notif.created_at,
        )
        for notif in notifications
    ]


@router.get("/unread-count", response_model=dict)
async def get_unread_count(
    current_user: User = Depends(get_current_user),
):
    """Get count of unread notifications"""
    count = await Notification.find(
        {
            "user_id": PyObjectId(current_user.id),
            "channels.in_app.is_read": False
        }
    ).count()

    return {"count": count}


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a specific notification"""
    try:
        notification = await Notification.get(ObjectId(notification_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    # Check if notification belongs to current user
    if notification.user_id != PyObjectId(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this notification"
        )

    return NotificationResponse(
        id=str(notification.id),
        user_id=str(notification.user_id),
        query_id=str(notification.query_id) if notification.query_id else None,
        title=notification.title,
        message=notification.message,
        notification_type=notification.notification_type,
        is_read=notification.channels.in_app.is_read,
        read_at=notification.channels.in_app.read_at,
        action_url=notification.action_url,
        priority=notification.priority,
        created_at=notification.created_at,
    )


@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a new notification"""
    notification = Notification(
        user_id=PyObjectId(notification_data.user_id),
        query_id=PyObjectId(notification_data.query_id) if notification_data.query_id else None,
        title=notification_data.title,
        message=notification_data.message,
        notification_type=notification_data.notification_type,
        action_url=notification_data.action_url,
        priority=notification_data.priority,
        channels=NotificationChannels(
            in_app=InAppChannel(sent=True, is_read=False)
        ),
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=30),
    )

    await notification.insert()

    return NotificationResponse(
        id=str(notification.id),
        user_id=str(notification.user_id),
        query_id=str(notification.query_id) if notification.query_id else None,
        title=notification.title,
        message=notification.message,
        notification_type=notification.notification_type,
        is_read=notification.channels.in_app.is_read,
        read_at=notification.channels.in_app.read_at,
        action_url=notification.action_url,
        priority=notification.priority,
        created_at=notification.created_at,
    )


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
):
    """Mark notification as read"""
    try:
        notification = await Notification.get(ObjectId(notification_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    # Check if notification belongs to current user
    if notification.user_id != PyObjectId(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this notification"
        )

    notification.channels.in_app.is_read = True
    notification.channels.in_app.read_at = datetime.utcnow()
    await notification.save()

    return NotificationResponse(
        id=str(notification.id),
        user_id=str(notification.user_id),
        query_id=str(notification.query_id) if notification.query_id else None,
        title=notification.title,
        message=notification.message,
        notification_type=notification.notification_type,
        is_read=notification.channels.in_app.is_read,
        read_at=notification.channels.in_app.read_at,
        action_url=notification.action_url,
        priority=notification.priority,
        created_at=notification.created_at,
    )


@router.put("/mark-all-read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read for current user"""
    notifications = await Notification.find(
        {
            "user_id": PyObjectId(current_user.id),
            "channels.in_app.is_read": False
        }
    ).to_list()

    for notification in notifications:
        notification.channels.in_app.is_read = True
        notification.channels.in_app.read_at = datetime.utcnow()
        await notification.save()


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a notification"""
    try:
        notification = await Notification.get(ObjectId(notification_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    # Check if notification belongs to current user
    if notification.user_id != PyObjectId(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this notification"
        )

    await notification.delete()
