from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from db.models import booking, user as user_model
from db.schemas.user import UserOut, LoginRequest, LoginResponse, SubscriptionOut
from utils.db import get_db

router = APIRouter()

@router.post("/login", response_model=LoginResponse, tags=["Login"])
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    db_user = db.query(user_model.User).filter(user_model.User.phone == data.phone).first()
    if not db_user or db_user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"id": db_user.id}

@router.get("/users/{user_id}", response_model=UserOut, tags=["Users"])
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    user_obj = (
        db.query(user_model.User)
        .options(joinedload(user_model.User.bookings).joinedload(booking.Booking.class_))
        .filter(user_model.User.id == user_id)
        .first()
    )

    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")

    for b in user_obj.bookings:
        if b.class_:
            b.class_.current_participants = len([
                bk for bk in b.class_.bookings
                if bk.status == "confirmed"
            ])

    return user_obj

@router.post("/subscription", response_model=SubscriptionOut, tags=["Subscription"])
def get_user_subscription(
    user_id:UUID,
    db: Session = Depends(get_db)
):
    user_obj = (
        db.query(user_model.User)
        .options(joinedload(user_model.User.bookings).joinedload(booking.Booking.class_))
        .filter(user_model.User.id == user_id)
        .first()
    )

    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "subscription_model": user_obj.subscription_model,
        "package_total": user_obj.package_total or 0,
        "subscription_starts": user_obj.subscription_starts or None,
        "subscription_expires": user_obj.subscription_expires or None,
        "remaining_classes": user_obj.remaining_classes or 0,
    }
