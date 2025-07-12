from db.database import Base
from sqlalchemy import Boolean, Column, String, Time, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid

class TemplateClass(Base):
    __tablename__ = "template_classes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    class_name = Column(String, nullable=False)
    weekday = Column(Integer, nullable=False)  # 0 = Monday
    time = Column(Time, nullable=False)
    max_participants = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
