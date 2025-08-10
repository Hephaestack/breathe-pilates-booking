import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, Enum, String, Integer, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from zoneinfo import ZoneInfo
from db.database import Base

GREECE_TZ = ZoneInfo("Europe/Athens")

class PaymentStatus(str, enum.Enum):
    pending = "Εκκρεμεί"
    paid = "Πληρωμένη"

class SubscriptionModel(str, enum.Enum):
    subscription_2 = "συνδρομή *2"
    subscription_3 = "συνδρομή *3"
    subscription_5 = "συνδρομή *5"
    family_2 = "family *2"
    family_3 = "family *3"
    family_3_cadillac = "family *3 + Cadillac"
    yoga_4 = "πακέτο 4 YOGA"
    package_10 = "πακέτο 10"
    package_15 = "πακέτο 15"
    package_20 = "πακέτο 20"
    cadillac_package_5 = "πακέτο Cadillac 5"
    cadillac_package_10 = "πακέτο Cadillac 10"
    free = "ελεύθερη"

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    subscription_model = Column(Enum(SubscriptionModel), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    package_total = Column(Integer, nullable=True)
    remaining_classes = Column(Integer, nullable=True)
    price = Column(Float, nullable=True)
    payment_status = Column(Enum(PaymentStatus), nullable=True)
    note = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(GREECE_TZ), nullable=False)

    user = relationship("User", back_populates="subscriptions")
