from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, time, timedelta

from db.models.admin import Admin
from utils.db import get_db
from utils.auth import get_current_admin, verify_password, create_access_token
from db.schemas.admin import AdminLogin
from db.schemas.class_ import ClassOut
from db.models import class_ as class_model, booking as booking_model

router = APIRouter()

@router.post("/admin/login", tags=["Admin"])
def login_admin(
    login_data: AdminLogin,
    db: Session = Depends(get_db)
):
    admin = db.query(Admin).filter(Admin.username == login_data.username).first()
    if not admin or not verify_password(login_data.password, admin.password):
        raise HTTPException(status_code=401, detail="Μη έγκυρα στοιχεία σύνδεσης.")
    
    access_token = create_access_token(admin)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/admin/classes", response_model=List[ClassOut], tags=["Admin"])
def get_classes_by_day(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    classes = (
        db.query(class_model.Class)
        .filter(class_model.Class.date == target_date)
        .options(joinedload(class_model.Class.bookings).joinedload(booking_model.Booking.user))
        .all()
    )

    for c in classes:
        c.users = [b.user for b in c.bookings if b.user]
        c.current_participants = len(c.users)

    return classes
