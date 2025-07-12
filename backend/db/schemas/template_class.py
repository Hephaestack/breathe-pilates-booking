from pydantic import BaseModel
from uuid import UUID
from datetime import time

class TemplateClassBase(BaseModel):
    class_name: str
    weekday: int
    time: time
    max_participants: int
    is_active: bool

class TemplateClassCreate(TemplateClassBase):
    id: UUID

class TemplateClassOut(TemplateClassBase):
    id: UUID

    class Config:
        from_attributes = True
