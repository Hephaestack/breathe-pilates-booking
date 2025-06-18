from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.models import booking, class_
from db.schemas.booking import BookingCreate, BookingOut
from utils.db import get_db, get_current_user
from db.models.user import User

router = APIRouter()

@router.post("/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id
    
    # checking for existing booking of user in same class
    existing = (
        db.query(booking.Booking)
        .filter(
            booking.Booking.user_id == user_id,
            booking.Booking.class_id == booking_data.class_id
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Booking already exists")

    # creates new booking
    new_booking = booking.Booking(
        user_id = user_id,
        class_id = booking_data.class_id,
        status = booking_data.status
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # joined class_
    db.refresh(new_booking)
    db.expunge(new_booking)
    new_booking.class_ = db.query(class_.Class).get(new_booking.class_id)

    return new_booking
