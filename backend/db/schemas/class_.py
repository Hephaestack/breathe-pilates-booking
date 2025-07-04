from pydantic import BaseModel
from uuid import UUID
from datetime import date, time
from typing import List, Optional

class ClassSummary(BaseModel):
    id: UUID
    class_name: str
    date: date
    time: time
    current_participants: int
    max_participants: int

    class Config:
        from_attributes = True

class ClassBase(BaseModel):
    class_name: str
    date: date
    time: time
    max_participants: int

class ClassCreate(ClassBase):
    pass

class ClassOut(ClassBase):
    id: UUID
    current_participants: Optional[int] = 0
    max_participants: int
    users: List['UserSummary'] = []

    class Config:
        from_attributes = True

from db.schemas.user import UserSummary
ClassOut.model_rebuild()
