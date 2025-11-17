"""
Audit Log management endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from app.models.audit_log import (
    AuditLog,
    ActionType,
    EntityType
)
from app.models.user import User
from app.api.dependencies.auth import get_current_user, require_admin
from app.core.types import PyObjectId
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()


class AuditLogCreate(BaseModel):
    action_type: ActionType
    entity_type: EntityType
    entity_id: str
    changes: Optional[dict] = None
    description: Optional[str] = None
    metadata: Optional[dict] = None


class AuditLogResponse(BaseModel):
    id: str
    user_id: str
    action_type: ActionType
    entity_type: EntityType
    entity_id: str
    changes: Optional[dict]
    ip_address: Optional[str]
    user_agent: Optional[str]
    request_method: Optional[str]
    request_path: Optional[str]
    description: Optional[str]
    metadata: Optional[dict]
    timestamp: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[AuditLogResponse])
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    action_type: Optional[ActionType] = None,
    entity_type: Optional[EntityType] = None,
    entity_id: Optional[str] = None,
    user_id: Optional[str] = None,
    current_user: User = Depends(require_admin),
):
    """Get audit logs (admin only)"""
    query = {}

    if action_type:
        query["action_type"] = action_type

    if entity_type:
        query["entity_type"] = entity_type

    if entity_id:
        query["entity_id"] = PyObjectId(entity_id)

    if user_id:
        query["user_id"] = PyObjectId(user_id)

    logs = await AuditLog.find(query).sort("-timestamp").skip(skip).limit(limit).to_list()

    return [
        AuditLogResponse(
            id=str(log.id),
            user_id=str(log.user_id),
            action_type=log.action_type,
            entity_type=log.entity_type,
            entity_id=str(log.entity_id),
            changes=log.changes,
            ip_address=log.ip_address,
            user_agent=log.user_agent,
            request_method=log.request_method,
            request_path=log.request_path,
            description=log.description,
            metadata=log.metadata,
            timestamp=log.timestamp,
        )
        for log in logs
    ]


@router.get("/{log_id}", response_model=AuditLogResponse)
async def get_audit_log(
    log_id: str,
    current_user: User = Depends(require_admin),
):
    """Get a specific audit log (admin only)"""
    try:
        log = await AuditLog.get(ObjectId(log_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found"
        )

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found"
        )

    return AuditLogResponse(
        id=str(log.id),
        user_id=str(log.user_id),
        action_type=log.action_type,
        entity_type=log.entity_type,
        entity_id=str(log.entity_id),
        changes=log.changes,
        ip_address=log.ip_address,
        user_agent=log.user_agent,
        request_method=log.request_method,
        request_path=log.request_path,
        description=log.description,
        metadata=log.metadata,
        timestamp=log.timestamp,
    )


@router.post("/", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
async def create_audit_log(
    log_data: AuditLogCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
):
    """Create a new audit log"""
    # Extract request context
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    log = AuditLog(
        user_id=PyObjectId(current_user.id),
        action_type=log_data.action_type,
        entity_type=log_data.entity_type,
        entity_id=PyObjectId(log_data.entity_id),
        changes=log_data.changes,
        ip_address=ip_address,
        user_agent=user_agent,
        request_method=request.method,
        request_path=str(request.url.path),
        description=log_data.description,
        metadata=log_data.metadata,
        timestamp=datetime.utcnow(),
    )

    await log.insert()

    return AuditLogResponse(
        id=str(log.id),
        user_id=str(log.user_id),
        action_type=log.action_type,
        entity_type=log.entity_type,
        entity_id=str(log.entity_id),
        changes=log.changes,
        ip_address=log.ip_address,
        user_agent=log.user_agent,
        request_method=log.request_method,
        request_path=log.request_path,
        description=log.description,
        metadata=log.metadata,
        timestamp=log.timestamp,
    )


@router.get("/entity/{entity_type}/{entity_id}", response_model=List[AuditLogResponse])
async def get_entity_audit_trail(
    entity_type: EntityType,
    entity_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_admin),
):
    """Get audit trail for a specific entity (admin only)"""
    logs = await AuditLog.find(
        {
            "entity_type": entity_type,
            "entity_id": PyObjectId(entity_id)
        }
    ).sort("-timestamp").skip(skip).limit(limit).to_list()

    return [
        AuditLogResponse(
            id=str(log.id),
            user_id=str(log.user_id),
            action_type=log.action_type,
            entity_type=log.entity_type,
            entity_id=str(log.entity_id),
            changes=log.changes,
            ip_address=log.ip_address,
            user_agent=log.user_agent,
            request_method=log.request_method,
            request_path=log.request_path,
            description=log.description,
            metadata=log.metadata,
            timestamp=log.timestamp,
        )
        for log in logs
    ]


@router.get("/user/{user_id}/activity", response_model=List[AuditLogResponse])
async def get_user_activity(
    user_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_admin),
):
    """Get activity logs for a specific user (admin only)"""
    logs = await AuditLog.find(
        {"user_id": PyObjectId(user_id)}
    ).sort("-timestamp").skip(skip).limit(limit).to_list()

    return [
        AuditLogResponse(
            id=str(log.id),
            user_id=str(log.user_id),
            action_type=log.action_type,
            entity_type=log.entity_type,
            entity_id=str(log.entity_id),
            changes=log.changes,
            ip_address=log.ip_address,
            user_agent=log.user_agent,
            request_method=log.request_method,
            request_path=log.request_path,
            description=log.description,
            metadata=log.metadata,
            timestamp=log.timestamp,
        )
        for log in logs
    ]
