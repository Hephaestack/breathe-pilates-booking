from datetime import datetime, timedelta
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from zoneinfo import ZoneInfo

from db.models import booking, class_
from db.schemas.booking import BookingCreate, BookingOut
from utils.db import get_db, get_current_user
from utils.subscription import validate_booking_rules
from utils.calc_class import calculate_remaining_classes
from db.models.user import User

router = APIRouter()

GREECE_TZ = ZoneInfo("Europe/Athens")

@router.post("/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED, tags=["Bookings"])
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id
    
    existing = (
        db.query(booking.Booking)
        .filter(
            booking.Booking.user_id == user_id,
            booking.Booking.class_id == booking_data.class_id
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Έχετε ήδη κάνει κράτηση σε αυτό το μάθημα.")

    class_obj = db.query(class_.Class).filter_by(id=booking_data.class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Το μάθημα δεν βρέθηκε.")

    class_datetime_str = f"{class_obj.date} {class_obj.time}"
    class_datetime_str = class_datetime_str[:16]
    class_datetime = datetime.strptime(class_datetime_str, "%Y-%m-%d %H:%M")

    now = datetime.now(GREECE_TZ)
    class_datetime = datetime.strptime(class_datetime_str, "%Y-%m-%d %H:%M").replace(tzinfo=GREECE_TZ)

    if class_datetime - now < timedelta(hours=1.5):
        raise HTTPException(status_code=400, detail="Η κράτηση πρέπει να γίνεται τουλάχιστον 1.5 ώρα πριν την έναρξη του μαθήματος.")

    validate_booking_rules(db=db, current_user=current_user, class_obj=class_obj)

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

    # calculate_remaining_classes(user_id, db)

    return new_booking

@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Bookings"])
def cancel_booking(
    booking_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking_obj = db.query(booking.Booking).get(booking_id)
    if not booking_obj:
        raise HTTPException(status_code=404, detail="Η κράτηση δεν βρέθηκε.")
    
    if booking_obj.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Δεν έχετε δικαίωμα να ακυρώσετε αυτή την κράτηση.")

    class_obj = db.query(class_.Class).get(booking_obj.class_id)
    if not class_obj:
        raise HTTPException(status_code=404, detail="Το μάθημα δεν βρέθηκε.")
    
    class_datetime_str = f"{class_obj.date} {class_obj.time}"
    class_datetime_str = class_datetime_str[:16]
    class_datetime = datetime.strptime(class_datetime_str, "%Y-%m-%d %H:%M")

    now = datetime.now(GREECE_TZ)
    class_datetime = datetime.strptime(class_datetime_str, "%Y-%m-%d %H:%M").replace(tzinfo=GREECE_TZ)

    if class_datetime - now < timedelta(hours=2):
        raise HTTPException(status_code=400, detail="Η ακύρωση πρέπει να γίνεται τουλάχιστον 2 ώρες πριν την έναρξη του μαθήματος.")

    db.delete(booking_obj)
    db.commit()

    # calculate_remaining_classes(booking_obj.user_id, db)

    return
