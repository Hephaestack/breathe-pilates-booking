import uuid
import enum
from sqlalchemy import Column, DateTime, String, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from zoneinfo import ZoneInfo

from db.database import Base

GREECE_TZ = ZoneInfo("Europe/Athens")

class Gender(str, enum.Enum):
    male = "Άνδρας"
    female = "Γυναίκα"

class UserRole(str, enum.Enum):
    client = "client"
    instructor = "instructor"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String, unique=True, nullable=False)
    password = Column(Integer, unique=True, index=True, nullable=True)
    name = Column(String, nullable=False)
    city = Column(String)
    gender = Column(Enum(Gender, name="gender"))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(GREECE_TZ), nullable=False)
    role = Column(Enum(UserRole), nullable=True)

    bookings = relationship("Booking", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
