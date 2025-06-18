from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from datetime import date

from db.models.user import UserRole, SubscriptionModel

class LoginRequest(BaseModel):
    phone: str
    password: int

class LoginResponse(BaseModel):
    id: UUID 

class UserSummary(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True



class UserBase(BaseModel):
    phone: str
    password: int
    name: str
    role: UserRole
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

from db.schemas.booking import BookingOut
UserOut.model_rebuild()
