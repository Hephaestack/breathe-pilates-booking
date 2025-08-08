from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from db.models.subscription import SubscriptionModel, PaymentStatus

class SubscriptionOut(BaseModel):
    id: UUID
    subscription_model: SubscriptionModel
    start_date: datetime
    end_date: datetime
    package_total: Optional[int] = None
    remaining_classes: Optional[int] = None
    price: Optional[float] = None
    payment_status: Optional[PaymentStatus] = PaymentStatus.pending
    note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SubscriptionCreate(BaseModel):
    subscription_model: SubscriptionModel
    start_date: datetime
    end_date: datetime
    package_total: Optional[int] = None
    remaining_classes: Optional[int] = None
    price: Optional[float] = None
    payment_status: Optional[PaymentStatus] = PaymentStatus.pending
    note: Optional[str] = None

class SubscriptionUpdate(BaseModel):
    subscription_model: Optional[SubscriptionModel] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    package_total: Optional[int] = None
    remaining_classes: Optional[int] = None
    price: Optional[float] = None
    payment_status: Optional[PaymentStatus] = PaymentStatus.pending
    note: Optional[str] = None