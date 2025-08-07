import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from zoneinfo import ZoneInfo

from db.database import Base

GREECE_TZ = ZoneInfo("Europe/Athens")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"))
    status = Column(String, default="confirmed")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(GREECE_TZ))

    user = relationship("User", back_populates="bookings")
    class_ = relationship("Class", back_populates="bookings")
