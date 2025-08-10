from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from datetime import date, datetime

from db.models.user import UserRole, Gender

class LoginRequest(BaseModel):
    phone: str
    password: int

class LoginResponse(BaseModel):
    id: UUID
    has_accepted_terms: bool

class UserSummary(BaseModel):
    id: UUID
    name: str
    city: Optional[str] = None
    password: Optional[int]
    phone: str
    created_at: Optional[datetime]
    subscriptions: List['SubscriptionOut'] = []

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

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: UUID
    bookings: List['BookingOut'] = []
    subscriptions: List['SubscriptionOut'] = []

    class Config:
        from_attributes = True

class UserMinimal(BaseModel):
    user_id: UUID
    name: str
    booking_id: UUID

class UserUpdateRequest(BaseModel):
    name: Optional[str]
    phone: Optional[str]
    city: Optional[str]
    gender: Optional[Gender]
    role: Optional[UserRole] = None

from db.schemas.booking import BookingOut
from db.schemas.subscription import SubscriptionOut
UserOut.model_rebuild()
