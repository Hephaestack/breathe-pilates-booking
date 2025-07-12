from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class BookingBase(BaseModel):
    class_id: UUID
    status: Optional[str] = "confirmed"

class BookingCreate(BookingBase):
    pass

class BookingOut(BookingBase):
    id: UUID
    created_at: datetime
    class_: 'ClassSummary'

    class Config:
        from_attributes = True

class AdminBookingRequest(BaseModel):
    class_id: UUID
    trainee_name: str

class AdminBookingOut(BaseModel):
    booking_id: UUID
    user_name: str
    class_name: str

from db.schemas.class_ import ClassSummary
BookingOut.model_rebuild()
