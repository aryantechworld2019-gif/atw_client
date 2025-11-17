"""
Time Log management endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.time_log import (
    TimeLog,
    LogType,
    EntryMethod,
    ApprovalStatus,
    Cost
)
from app.models.user import User, UserRole
from app.api.dependencies.auth import get_current_user, require_admin
from app.core.types import PyObjectId
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()


class CostCreate(BaseModel):
    hourly_rate: float
    currency: str = "INR"


class TimeLogCreate(BaseModel):
    query_id: str
    developer_id: str
    client_id: str
    time_spent_minutes: int
    billable_hours: float
    work_description: str
    log_type: LogType = LogType.DEVELOPMENT
    entry_method: EntryMethod = EntryMethod.MANUAL
    timer_start: Optional[datetime] = None
    timer_end: Optional[datetime] = None
    cost: CostCreate


class TimeLogUpdate(BaseModel):
    work_description: Optional[str] = None
    time_spent_minutes: Optional[int] = None
    billable_hours: Optional[float] = None
    log_type: Optional[LogType] = None


class ApprovalUpdate(BaseModel):
    approval_status: ApprovalStatus
    approval_notes: Optional[str] = None
    rejection_reason: Optional[str] = None


class TimeLogResponse(BaseModel):
    id: str
    query_id: str
    developer_id: str
    client_id: str
    time_spent_minutes: int
    billable_hours: float
    work_description: str
    log_type: LogType
    entry_method: EntryMethod
    timer_start: Optional[datetime]
    timer_end: Optional[datetime]
    approval_status: ApprovalStatus
    approved_by: Optional[str]
    approval_notes: Optional[str]
    approved_at: Optional[datetime]
    rejection_reason: Optional[str]
    cost: Cost
    hours_deducted_from_package: bool
    package_id: Optional[str]
    logged_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[TimeLogResponse])
async def get_time_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    approval_status: Optional[ApprovalStatus] = None,
    developer_id: Optional[str] = None,
    client_id: Optional[str] = None,
    query_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """Get all time logs"""
    query = {}

    if approval_status:
        query["approval_status"] = approval_status

    if developer_id:
        query["developer_id"] = PyObjectId(developer_id)

    if client_id:
        query["client_id"] = PyObjectId(client_id)

    if query_id:
        query["query_id"] = PyObjectId(query_id)

    # If client user, only show their time logs
    if current_user.role in [UserRole.CLIENT_OWNER, UserRole.CLIENT_USER]:
        if current_user.client_id:
            query["client_id"] = current_user.client_id

    # If developer, only show their time logs
    if current_user.role == UserRole.DEVELOPER:
        # Would need to get developer_id from user
        # For now, no additional filtering
        pass

    time_logs = await TimeLog.find(query).skip(skip).limit(limit).to_list()

    return [
        TimeLogResponse(
            id=str(log.id),
            query_id=str(log.query_id),
            developer_id=str(log.developer_id),
            client_id=str(log.client_id),
            time_spent_minutes=log.time_spent_minutes,
            billable_hours=log.billable_hours,
            work_description=log.work_description,
            log_type=log.log_type,
            entry_method=log.entry_method,
            timer_start=log.timer_start,
            timer_end=log.timer_end,
            approval_status=log.approval_status,
            approved_by=str(log.approved_by) if log.approved_by else None,
            approval_notes=log.approval_notes,
            approved_at=log.approved_at,
            rejection_reason=log.rejection_reason,
            cost=log.cost,
            hours_deducted_from_package=log.hours_deducted_from_package,
            package_id=str(log.package_id) if log.package_id else None,
            logged_at=log.logged_at,
            created_at=log.created_at,
            updated_at=log.updated_at,
        )
        for log in time_logs
    ]


@router.get("/{log_id}", response_model=TimeLogResponse)
async def get_time_log(
    log_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a specific time log"""
    try:
        log = await TimeLog.get(ObjectId(log_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time log not found"
        )

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time log not found"
        )

    # Check access
    if current_user.role in [UserRole.CLIENT_OWNER, UserRole.CLIENT_USER]:
        if current_user.client_id != log.client_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this time log"
            )

    return TimeLogResponse(
        id=str(log.id),
        query_id=str(log.query_id),
        developer_id=str(log.developer_id),
        client_id=str(log.client_id),
        time_spent_minutes=log.time_spent_minutes,
        billable_hours=log.billable_hours,
        work_description=log.work_description,
        log_type=log.log_type,
        entry_method=log.entry_method,
        timer_start=log.timer_start,
        timer_end=log.timer_end,
        approval_status=log.approval_status,
        approved_by=str(log.approved_by) if log.approved_by else None,
        approval_notes=log.approval_notes,
        approved_at=log.approved_at,
        rejection_reason=log.rejection_reason,
        cost=log.cost,
        hours_deducted_from_package=log.hours_deducted_from_package,
        package_id=str(log.package_id) if log.package_id else None,
        logged_at=log.logged_at,
        created_at=log.created_at,
        updated_at=log.updated_at,
    )


@router.post("/", response_model=TimeLogResponse, status_code=status.HTTP_201_CREATED)
async def create_time_log(
    log_data: TimeLogCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a new time log"""
    # Calculate total cost
    total_cost = log_data.billable_hours * log_data.cost.hourly_rate

    cost = Cost(
        hourly_rate=log_data.cost.hourly_rate,
        total_cost=total_cost,
        currency=log_data.cost.currency,
    )

    log = TimeLog(
        query_id=PyObjectId(log_data.query_id),
        developer_id=PyObjectId(log_data.developer_id),
        client_id=PyObjectId(log_data.client_id),
        time_spent_minutes=log_data.time_spent_minutes,
        billable_hours=log_data.billable_hours,
        work_description=log_data.work_description,
        log_type=log_data.log_type,
        entry_method=log_data.entry_method,
        timer_start=log_data.timer_start,
        timer_end=log_data.timer_end,
        approval_status=ApprovalStatus.PENDING,
        cost=cost,
        hours_deducted_from_package=False,
        logged_at=datetime.utcnow(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    await log.insert()

    return TimeLogResponse(
        id=str(log.id),
        query_id=str(log.query_id),
        developer_id=str(log.developer_id),
        client_id=str(log.client_id),
        time_spent_minutes=log.time_spent_minutes,
        billable_hours=log.billable_hours,
        work_description=log.work_description,
        log_type=log.log_type,
        entry_method=log.entry_method,
        timer_start=log.timer_start,
        timer_end=log.timer_end,
        approval_status=log.approval_status,
        approved_by=str(log.approved_by) if log.approved_by else None,
        approval_notes=log.approval_notes,
        approved_at=log.approved_at,
        rejection_reason=log.rejection_reason,
        cost=log.cost,
        hours_deducted_from_package=log.hours_deducted_from_package,
        package_id=str(log.package_id) if log.package_id else None,
        logged_at=log.logged_at,
        created_at=log.created_at,
        updated_at=log.updated_at,
    )


@router.put("/{log_id}", response_model=TimeLogResponse)
async def update_time_log(
    log_id: str,
    log_data: TimeLogUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update a time log"""
    try:
        log = await TimeLog.get(ObjectId(log_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time log not found"
        )

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time log not found"
        )

    # Can only update pending logs
    if log.approval_status != ApprovalStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update pending time logs"
        )

    # Update fields
    update_data = log_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(log, field):
            setattr(log, field, value)

    # Recalculate cost if billable_hours changed
    if log_data.billable_hours:
        log.cost.total_cost = log.billable_hours * log.cost.hourly_rate

    log.updated_at = datetime.utcnow()
    await log.save()

    return TimeLogResponse(
        id=str(log.id),
        query_id=str(log.query_id),
        developer_id=str(log.developer_id),
        client_id=str(log.client_id),
        time_spent_minutes=log.time_spent_minutes,
        billable_hours=log.billable_hours,
        work_description=log.work_description,
        log_type=log.log_type,
        entry_method=log.entry_method,
        timer_start=log.timer_start,
        timer_end=log.timer_end,
        approval_status=log.approval_status,
        approved_by=str(log.approved_by) if log.approved_by else None,
        approval_notes=log.approval_notes,
        approved_at=log.approved_at,
        rejection_reason=log.rejection_reason,
        cost=log.cost,
        hours_deducted_from_package=log.hours_deducted_from_package,
        package_id=str(log.package_id) if log.package_id else None,
        logged_at=log.logged_at,
        created_at=log.created_at,
        updated_at=log.updated_at,
    )


@router.post("/{log_id}/approve", response_model=TimeLogResponse)
async def approve_time_log(
    log_id: str,
    approval_data: ApprovalUpdate,
    current_user: User = Depends(require_admin),
):
    """Approve or reject a time log"""
    try:
        log = await TimeLog.get(ObjectId(log_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time log not found"
        )

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time log not found"
        )

    if log.approval_status != ApprovalStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Time log has already been processed"
        )

    log.approval_status = approval_data.approval_status
    log.approved_by = PyObjectId(current_user.id)
    log.approval_notes = approval_data.approval_notes
    log.rejection_reason = approval_data.rejection_reason
    log.approved_at = datetime.utcnow()
    log.updated_at = datetime.utcnow()

    await log.save()

    return TimeLogResponse(
        id=str(log.id),
        query_id=str(log.query_id),
        developer_id=str(log.developer_id),
        client_id=str(log.client_id),
        time_spent_minutes=log.time_spent_minutes,
        billable_hours=log.billable_hours,
        work_description=log.work_description,
        log_type=log.log_type,
        entry_method=log.entry_method,
        timer_start=log.timer_start,
        timer_end=log.timer_end,
        approval_status=log.approval_status,
        approved_by=str(log.approved_by) if log.approved_by else None,
        approval_notes=log.approval_notes,
        approved_at=log.approved_at,
        rejection_reason=log.rejection_reason,
        cost=log.cost,
        hours_deducted_from_package=log.hours_deducted_from_package,
        package_id=str(log.package_id) if log.package_id else None,
        logged_at=log.logged_at,
        created_at=log.created_at,
        updated_at=log.updated_at,
    )


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_time_log(
    log_id: str,
    current_user: User = Depends(require_admin),
):
    """Delete a time log"""
    try:
        log = await TimeLog.get(ObjectId(log_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time log not found"
        )

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time log not found"
        )

    if log.approval_status == ApprovalStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete approved time logs"
        )

    await log.delete()
