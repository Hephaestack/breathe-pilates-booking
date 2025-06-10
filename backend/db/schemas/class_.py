from pydantic import BaseModel
from uuid import UUID
from datetime import date
from typing import List

class ClassSummary(BaseModel):
    id: UUID
    class_name: str
    date: date
    time: str
    current_participants: int
    max_participants: int

    class Config:
        orm_mode = True

class ClassBase(BaseModel):
    class_name: str
    date: date
    time: str
    max_participants: int

class ClassCreate(ClassBase):
    pass

class ClassOut(ClassBase):
    id: UUID
    current_participants: int
    max_participants: int
    users: List['UserSummary'] = []

    class Config:
        orm_mode = True

from db.schemas.user import UserSummary
ClassOut.model_rebuild()
