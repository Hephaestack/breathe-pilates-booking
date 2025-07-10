import uuid
import enum
from sqlalchemy import Column, DateTime, String, Enum, Date, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from db.database import Base

class Gender(str, enum.Enum):
    male = "Άνδρας"
    female = "Γυναίκα"

class SubscriptionModel(str, enum.Enum):
    subscription_2 = "συνδρομή *2"
    subscription_3 = "συνδρομή 3"
    subscription_5 = "συνδρομή 5"
    package_10 = "πακέτο 10"
    package_15 = "πακέτο 15"
    package_20 = "πακέτο 20"
    cadillac_package_5 = "πακέτο Cadillac 5"
    cadillac_package_10 = "πακέτο Cadillac 10"
    free = "ελεύθερη"

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
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    role = Column(Enum(UserRole), nullable=True)
    subscription_model = Column(Enum(SubscriptionModel), nullable=True)
    package_total = Column(Integer, nullable=True)
    subscription_starts = Column(Date, nullable=True)
    subscription_expires = Column(Date, nullable=True)
    remaining_classes = Column(Integer, nullable=True)

    bookings = relationship("Booking", back_populates="user")
