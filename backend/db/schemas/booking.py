from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class BookingBase(BaseModel):
    user_id: UUID
    class_id: UUID
    status: Optional[str] = "confirmed"


class BookingCreate(BookingBase):
    pass


class BookingOut(BookingBase):
    id: UUID
    created_at: datetime
    class_: 'ClassSummary'

    class Config:
        orm_mode = True

from db.schemas.class_ import ClassSummary
BookingOut.model_rebuild()
