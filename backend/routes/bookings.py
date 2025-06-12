from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.models import booking, class_
from db.schemas.booking import BookingCreate, BookingOut
from utils import get_db

router = APIRouter()

@router.post("/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(booking_data: BookingCreate, db: Session = Depends(get_db)):
    # checking for existing booking of user in same class
    existing = (
        db.query(booking.Booking)
        .filter(
            booking.Booking.user_id == booking_data.user_id,
            booking.Booking.class_id == booking_data.class_id
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Booking already exists")

    # creates new booking
    new_booking = booking.Booking(**booking_data.model_dump())
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # joined class_
    db.refresh(new_booking)
    db.expunge(new_booking)
    new_booking.class_ = db.query(class_.Class).get(new_booking.class_id)

    return new_booking
