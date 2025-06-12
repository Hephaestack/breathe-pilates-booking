from pydantic import BaseModel
from uuid import UUID
from typing import List
from db.models.user import UserRole, SubscriptionModel


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
    subscription_model: SubscriptionModel
    package_total: int

class UserCreate(UserBase):
    pass


class UserOut(UserBase):
    id: UUID
    bookings: List['BookingOut'] = []

    class Config:
        from_attributes = True

from db.schemas.booking import BookingOut
UserOut.model_rebuild()
