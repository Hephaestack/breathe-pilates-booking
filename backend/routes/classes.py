from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from db.models import booking, class_
from db.schemas.class_ import ClassOut
from utils.db import get_db

router = APIRouter()

@router.get("/classes", response_model=List[ClassOut], tags=["Classes"])
def get_class(
    db: Session = Depends(get_db)
):
    classes = (
        db.query(class_.Class)
        .options(joinedload(class_.Class.bookings).joinedload(booking.Booking.user))
        .all()
    )

    for c in classes:
        c.users = [b.user for b in c.bookings if b.user]
        c.current_participants = len(c.users)

    return classes
