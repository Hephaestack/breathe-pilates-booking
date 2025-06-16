from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from db.database import SessionLocal
from db.models import booking, user
from db.schemas.user import UserCreate, UserOut, UserSummary
from utils.db import get_db

router = APIRouter()

@router.get("/users", response_model=List[UserSummary])
def get_users(
    db: Session = Depends(get_db)
):
    return db.query(user.User).all()

@router.get("/users/{user_id}", response_model=UserOut)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    user_obj = (
        db.query(user.User)
        .options(joinedload(user.User.bookings).joinedload(booking.Booking.class_))
        .filter(user.User.id == user_id)
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

@router.post("/users", response_model=UserOut)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(user.User).filter(user.User.phone == user_data.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user_dict = user_data.model_dump()
    requested_password = user_dict.get("password")

    if not requested_password:
        latest = (
            db.query(user.User)
            .filter(user.User.password != None)
            .order_by(user.User.password.desc())
            .first()
        )
        next_password = (latest.password + 1) if latest and latest.password else 1
        user_dict["password"] = next_password

    new_user = user.User(**user_dict)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
