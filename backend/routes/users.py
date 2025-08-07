from datetime import datetime
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from zoneinfo import ZoneInfo

from db.models import booking, user as user_model
from db.schemas.user import UserOut, LoginRequest, LoginResponse
from db.schemas.subscription import SubscriptionOut
from utils.db import get_db
from utils.calc_class import calculate_remaining_classes, calculate_remaining_classes_for_subscription

router = APIRouter()

GREECE_TZ = ZoneInfo("Europe/Athens")

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

@router.post("/subscription", response_model=List[SubscriptionOut], tags=["Subscription"])
def get_user_subscription(
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
        raise HTTPException(status_code=404, detail="Ο χρήστης δεν βρέθηκε.")
    
    now = datetime.now(GREECE_TZ)
    active_subs = [
        sub for sub in user_obj.subscriptions
        if sub.start_date <= now <= sub.end_date
    ]

    return active_subs

@router.post("/users/{user_id}/remaining_classes", tags=["Users"])
def get_remaining_classes(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Ο χρήστης δεν βρέθηκε.")
    
    remaining = calculate_remaining_classes(user_id=str(user_id), db=db)
    return remaining

@router.get("/users/{user_id}/subscriptions/{subscription_id}/remaining_classes", tags=["Users"])
def get_remaining_classes_for_subscription(
    user_id: UUID,
    subscription_id: UUID,
    db: Session = Depends(get_db)
):
    return calculate_remaining_classes_for_subscription(str(user_id), str(subscription_id), db)

@router.post("/users/{user_id}/accept_terms", tags=["Users"])
def accept_terms(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Ο χρήστης δεν βρέθηκε.")

    if user.has_accepted_terms:
        return {"detail": "Ο χρήστης έχει ήδη αποδεχθεί τους όρους."}

    user.has_accepted_terms = True
    db.commit()
    return {"detail": "Οι όροι χρήσης αποδέχθηκαν επιτυχώς."}
