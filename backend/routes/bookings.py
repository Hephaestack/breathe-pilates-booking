from datetime import datetime, timedelta
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.models import booking, class_
from db.schemas.booking import BookingCreate, BookingOut
from utils.db import get_db, get_current_user
from db.models.user import User

router = APIRouter()

@router.post("/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED, tags=["Bookings"])
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

    class_obj = db.query(class_.Class).get(booking_data.class_id)
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")

    class_datetime_str = f"{class_obj.date} {class_obj.time}"
    class_datetime = datetime.strptime(class_datetime_str, "%Y-%m-%d %H:%M")

    if class_datetime - datetime.now() < timedelta(hours=1.5):
        raise HTTPException(status_code=400, detail="Booking cannot be booked")

    # creates new booking
    new_booking = booking.Booking(
        user_id = user_id,
        class_id = booking_data.class_id,
        status = booking_data.status
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    new_booking.class_ = class_obj
    class_obj.current_participants = len([b for b in class_obj.bookings if b.user])

    return new_booking

@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Bookings"])
def cancel_booking(
    booking_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking_obj = db.query(booking.Booking).get(booking_id)
    if not booking_obj:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking_obj.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to cancel this booking")

    class_obj = db.query(class_.Class).get(booking_obj.class_id)
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    
    class_datetime_str = f"{class_obj.date} {class_obj.time}"
    class_datetime = datetime.strptime(class_datetime_str, "%Y-%m-%d %H:%M")

    if class_datetime - datetime.now() < timedelta(hours=2):
        raise HTTPException(status_code=400, detail="Booking cannot be canceled")

    db.delete(booking_obj)
    db.commit()

    return
