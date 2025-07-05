from uuid import uuid4
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta, date

from db.models import template_class
from db.models import booking, class_
from db.schemas.class_ import ClassOut
from utils.db import get_db
from utils.auth import get_current_admin
from db.models.admin import Admin

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

@router.post("/admin/generater-schedule", tags=["Admin"])
def generate_schedule(
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    # admin: Admin = Depends(get_current_admin)
):
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date.")
    
    templates = db.query(template_class.TemplateClass).filter(template_class.TemplateClass.is_active == True).all()
    created_classes = []

    days = (end_date - start_date).days + 1
    for i in range(days):
        current_date = start_date + timedelta(days=i)
        weekday = current_date.weekday()

        for template in templates:
            if template.weekday == weekday:
                exists = db.query(class_.Class).filter(
                    class_.Class.date == current_date,
                    class_.Class.time == template.time,
                    class_.Class.class_name == template.class_name
                ).first()

                if not exists:
                    new_class = class_.Class(
                        id=uuid4(),
                        class_name = template.class_name,
                        date=current_date,
                        time=template.time,
                        current_participants=0,
                        max_participants=template.max_participants
                    )
                    db.add(new_class)
                    created_classes.append(new_class)
    
    db.commit()

    return {
        "created": len(created_classes),
        "message": f"{len(created_classes)} classes created from {start_date} to {end_date}"
    }
