"""
Maintenance Package management endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.maintenance_package import (
    MaintenancePackage,
    PackageType,
    PackageStatus,
    BillingCycle,
    PackageFeatures,
    HourAdjustment,
    AdjustmentType
)
from app.models.user import User, UserRole
from app.api.dependencies.auth import get_current_user, require_admin
from app.core.types import PyObjectId
from bson import ObjectId
from datetime import datetime, timedelta
from pydantic import BaseModel

router = APIRouter()


class PackageFeaturesCreate(BaseModel):
    priority_support: bool = False
    support_24x7: bool = False
    dedicated_developer: bool = False
    response_time_sla: str = "24 hours"
    max_concurrent_queries: int = 3


class MaintenancePackageCreate(BaseModel):
    client_id: str
    package_type: PackageType
    package_name: str
    total_hours: float
    price: float
    currency: str = "INR"
    billing_cycle: BillingCycle = BillingCycle.MONTHLY
    start_date: datetime
    end_date: datetime
    auto_renew: bool = True
    features: Optional[PackageFeaturesCreate] = None


class MaintenancePackageUpdate(BaseModel):
    package_name: Optional[str] = None
    status: Optional[PackageStatus] = None
    price: Optional[float] = None
    auto_renew: Optional[bool] = None
    features: Optional[PackageFeaturesCreate] = None


class HourAdjustmentCreate(BaseModel):
    hours_changed: float
    adjustment_type: AdjustmentType
    reason: str


class MaintenancePackageResponse(BaseModel):
    id: str
    client_id: str
    package_type: PackageType
    package_name: str
    total_hours: float
    consumed_hours: float
    remaining_hours: float
    rollover_hours: float
    price: float
    currency: str
    billing_cycle: BillingCycle
    start_date: datetime
    end_date: datetime
    renewal_date: datetime
    auto_renew: bool
    status: PackageStatus
    features: PackageFeatures
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[MaintenancePackageResponse])
async def get_packages(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[PackageStatus] = None,
    client_id: Optional[str] = None,
    package_type: Optional[PackageType] = None,
    current_user: User = Depends(get_current_user),
):
    """Get all maintenance packages"""
    query = {}

    if status:
        query["status"] = status

    if client_id:
        query["client_id"] = PyObjectId(client_id)

    if package_type:
        query["package_type"] = package_type

    # If client user, only show their packages
    if current_user.role in [UserRole.CLIENT_OWNER, UserRole.CLIENT_USER]:
        # Get client from user's client_id
        if current_user.client_id:
            query["client_id"] = current_user.client_id

    packages = await MaintenancePackage.find(query).skip(skip).limit(limit).to_list()

    return [
        MaintenancePackageResponse(
            id=str(pkg.id),
            client_id=str(pkg.client_id),
            package_type=pkg.package_type,
            package_name=pkg.package_name,
            total_hours=pkg.total_hours,
            consumed_hours=pkg.consumed_hours,
            remaining_hours=pkg.remaining_hours,
            rollover_hours=pkg.rollover_hours,
            price=pkg.price,
            currency=pkg.currency,
            billing_cycle=pkg.billing_cycle,
            start_date=pkg.start_date,
            end_date=pkg.end_date,
            renewal_date=pkg.renewal_date,
            auto_renew=pkg.auto_renew,
            status=pkg.status,
            features=pkg.features,
            created_at=pkg.created_at,
            updated_at=pkg.updated_at,
        )
        for pkg in packages
    ]


@router.get("/{package_id}", response_model=MaintenancePackageResponse)
async def get_package(
    package_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a specific maintenance package"""
    try:
        package = await MaintenancePackage.get(ObjectId(package_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )

    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )

    # Check access
    if current_user.role in [UserRole.CLIENT_OWNER, UserRole.CLIENT_USER]:
        if current_user.client_id != package.client_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this package"
            )

    return MaintenancePackageResponse(
        id=str(package.id),
        client_id=str(package.client_id),
        package_type=package.package_type,
        package_name=package.package_name,
        total_hours=package.total_hours,
        consumed_hours=package.consumed_hours,
        remaining_hours=package.remaining_hours,
        rollover_hours=package.rollover_hours,
        price=package.price,
        currency=package.currency,
        billing_cycle=package.billing_cycle,
        start_date=package.start_date,
        end_date=package.end_date,
        renewal_date=package.renewal_date,
        auto_renew=package.auto_renew,
        status=package.status,
        features=package.features,
        created_at=package.created_at,
        updated_at=package.updated_at,
    )


@router.post("/", response_model=MaintenancePackageResponse, status_code=status.HTTP_201_CREATED)
async def create_package(
    package_data: MaintenancePackageCreate,
    current_user: User = Depends(require_admin),
):
    """Create a new maintenance package"""
    # Calculate renewal date based on billing cycle
    if package_data.billing_cycle == BillingCycle.MONTHLY:
        renewal_date = package_data.end_date
    elif package_data.billing_cycle == BillingCycle.QUARTERLY:
        renewal_date = package_data.start_date + timedelta(days=90)
    else:  # ANNUAL
        renewal_date = package_data.start_date + timedelta(days=365)

    # Create features if provided, otherwise use defaults
    features = PackageFeatures()
    if package_data.features:
        features = PackageFeatures(**package_data.features.model_dump())

    package = MaintenancePackage(
        client_id=PyObjectId(package_data.client_id),
        package_type=package_data.package_type,
        package_name=package_data.package_name,
        total_hours=package_data.total_hours,
        consumed_hours=0.0,
        remaining_hours=package_data.total_hours,
        rollover_hours=0.0,
        price=package_data.price,
        currency=package_data.currency,
        billing_cycle=package_data.billing_cycle,
        start_date=package_data.start_date,
        end_date=package_data.end_date,
        renewal_date=renewal_date,
        auto_renew=package_data.auto_renew,
        status=PackageStatus.ACTIVE,
        features=features,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    await package.insert()

    return MaintenancePackageResponse(
        id=str(package.id),
        client_id=str(package.client_id),
        package_type=package.package_type,
        package_name=package.package_name,
        total_hours=package.total_hours,
        consumed_hours=package.consumed_hours,
        remaining_hours=package.remaining_hours,
        rollover_hours=package.rollover_hours,
        price=package.price,
        currency=package.currency,
        billing_cycle=package.billing_cycle,
        start_date=package.start_date,
        end_date=package.end_date,
        renewal_date=package.renewal_date,
        auto_renew=package.auto_renew,
        status=package.status,
        features=package.features,
        created_at=package.created_at,
        updated_at=package.updated_at,
    )


@router.put("/{package_id}", response_model=MaintenancePackageResponse)
async def update_package(
    package_id: str,
    package_data: MaintenancePackageUpdate,
    current_user: User = Depends(require_admin),
):
    """Update a maintenance package"""
    try:
        package = await MaintenancePackage.get(ObjectId(package_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )

    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )

    # Update fields
    update_data = package_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "features" and value:
            package.features = PackageFeatures(**value)
        elif hasattr(package, field):
            setattr(package, field, value)

    package.updated_at = datetime.utcnow()
    await package.save()

    return MaintenancePackageResponse(
        id=str(package.id),
        client_id=str(package.client_id),
        package_type=package.package_type,
        package_name=package.package_name,
        total_hours=package.total_hours,
        consumed_hours=package.consumed_hours,
        remaining_hours=package.remaining_hours,
        rollover_hours=package.rollover_hours,
        price=package.price,
        currency=package.currency,
        billing_cycle=package.billing_cycle,
        start_date=package.start_date,
        end_date=package.end_date,
        renewal_date=package.renewal_date,
        auto_renew=package.auto_renew,
        status=package.status,
        features=package.features,
        created_at=package.created_at,
        updated_at=package.updated_at,
    )


@router.delete("/{package_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_package(
    package_id: str,
    current_user: User = Depends(require_admin),
):
    """Delete a maintenance package (soft delete by setting status to CANCELLED)"""
    try:
        package = await MaintenancePackage.get(ObjectId(package_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )

    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )

    package.status = PackageStatus.CANCELLED
    package.updated_at = datetime.utcnow()
    await package.save()


@router.post("/{package_id}/adjust-hours", response_model=MaintenancePackageResponse)
async def adjust_package_hours(
    package_id: str,
    adjustment_data: HourAdjustmentCreate,
    current_user: User = Depends(require_admin),
):
    """Adjust hours for a maintenance package"""
    try:
        package = await MaintenancePackage.get(ObjectId(package_id))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )

    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )

    # Create adjustment record
    adjustment = HourAdjustment(
        adjustment_id=str(ObjectId()),
        hours_changed=adjustment_data.hours_changed,
        adjustment_type=adjustment_data.adjustment_type,
        reason=adjustment_data.reason,
        adjusted_by=PyObjectId(current_user.id),
        adjusted_at=datetime.utcnow(),
    )

    # Update hours
    if adjustment_data.adjustment_type == AdjustmentType.ADDED:
        package.total_hours += adjustment_data.hours_changed
    else:  # DEDUCTED
        package.total_hours -= adjustment_data.hours_changed

    # Recalculate remaining hours
    package.update_remaining_hours()

    # Add adjustment to history
    package.adjustments.append(adjustment)
    package.updated_at = datetime.utcnow()

    await package.save()

    return MaintenancePackageResponse(
        id=str(package.id),
        client_id=str(package.client_id),
        package_type=package.package_type,
        package_name=package.package_name,
        total_hours=package.total_hours,
        consumed_hours=package.consumed_hours,
        remaining_hours=package.remaining_hours,
        rollover_hours=package.rollover_hours,
        price=package.price,
        currency=package.currency,
        billing_cycle=package.billing_cycle,
        start_date=package.start_date,
        end_date=package.end_date,
        renewal_date=package.renewal_date,
        auto_renew=package.auto_renew,
        status=package.status,
        features=package.features,
        created_at=package.created_at,
        updated_at=package.updated_at,
    )
