from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from datetime import date, datetime

from db.models.user import UserRole, SubscriptionModel, Gender

class LoginRequest(BaseModel):
    phone: str
    password: int

class LoginResponse(BaseModel):
    id: UUID

class SubscriptionOut(BaseModel):
    subscription_model: SubscriptionModel
    package_total: Optional[int] = None
    subscription_starts: Optional[date] = None
    subscription_expires: Optional[date] = None
    remaining_classes: Optional[int] = None

class UserSummary(BaseModel):
    id: UUID
    name: str
    city: Optional[str] = None
    gender: Optional[Gender] = "Γυναίκα"
    phone: str
    created_at: Optional[datetime]
    subscription_model: Optional[SubscriptionModel] = None
    subscription_expires: Optional[date] = None

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    phone: str
    password: Optional[int] = None
    name: str
    city: Optional[str] = None
    gender: Optional[Gender] = "Γυναίκα"
    created_at: Optional[datetime] = None
    role: Optional[UserRole] = None
    subscription_model: Optional[SubscriptionModel] = None
    package_total: Optional[int] = None
    subscription_starts: Optional[date] = None
    subscription_expires: Optional[date] = None
    remaining_classes: Optional[int] = None

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: UUID
    bookings: List['BookingOut'] = []

    class Config:
        from_attributes = True

class UserMinimal(BaseModel):
    id: UUID
    name: str

class UserUpdateRequest(BaseModel):
    name: Optional[str]
    phone: Optional[str]
    city: Optional[str]
    gender: Optional[Gender]
    role: Optional[UserRole]
    subscription_model: Optional[SubscriptionModel]
    package_total: Optional[int]
    subscription_starts: Optional[date]
    subscription_expires: Optional[date]
    remaining_classes: Optional[int]

from db.schemas.booking import BookingOut
UserOut.model_rebuild()
