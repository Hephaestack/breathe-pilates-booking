from uuid import UUID, uuid4
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from datetime import date, datetime, timedelta

from db.models.admin import Admin
from utils.db import get_db
from utils.auth import get_current_admin, verify_password, create_access_token
from db.schemas.admin import AdminLogin
from db.schemas.class_ import ClassOut
from db.schemas.booking import AdminBookingRequest
from db.models import template_class, class_ as class_model, booking as booking_model, user as user_model
from db.schemas.user import UserOut, UserCreate, UserSummary, UserMinimal

router = APIRouter()

@router.get("/admin/dev-token", tags=["Admin"])
def dev_token(
    db: Session = Depends(get_db)
):
    admin = db.query(Admin).first()
    if not admin:
        raise HTTPException(status_code=404, detail="No admin found")
    return {"access_token": create_access_token(admin)}

@router.post("/admin/login", tags=["Admin"])
def login_admin(
    login_data: AdminLogin,
    db: Session = Depends(get_db)
):
    admin = db.query(Admin).filter(Admin.username == login_data.username).first()
    if not admin or not verify_password(login_data.password, admin.password):
        raise HTTPException(status_code=401, detail="Μη έγκυρα στοιχεία σύνδεσης.")
    
    access_token = create_access_token(admin)

    response = JSONResponse(
        content={"message": "Επιτυχής σύνδεση"}
    )

    response.set_cookie(
        key="token",
        value=access_token,
        httponly=True,
        secure=False,         
        samesite="lax",
        max_age=60 * 60,     
        path="/"
    )

    return response

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

@router.post("/admin/users", response_model=UserOut, tags=["Admin"])
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    existing = db.query(user_model.User).filter(user_model.User.phone == user_data.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user_dict = user_data.model_dump()
    requested_password = user_dict.get("password")

    if not requested_password:
        latest = (
            db.query(user_model.User)
            .filter(user_model.User.password != None)
            .order_by(user_model.User.password.desc())
            .first()
        )
        next_password = (latest.password + 1) if latest and latest.password else 1
        user_dict["password"] = next_password

    new_user = user_model.User(**user_dict)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.get("/admin/users", response_model=List[UserSummary], tags=["Admin"])
def get_users(
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    return db.query(user_model.User).all()

@router.post("/admin/generater-schedule", tags=["Admin"])
def generate_schedule(
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
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
                exists = db.query(class_model.Class).filter(
                    class_model.Class.date == current_date,
                    class_model.Class.time == template.time,
                    class_model.Class.class_name == template.class_name
                ).first()

                if not exists:
                    new_class = class_model.Class(
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

@router.get("/admin/template_classes", tags=["Admin"])
def get_template_classes(
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    return db.query(template_class.TemplateClass).all()

@router.get("/admin/bookings/{class_id}", response_model=List[UserMinimal], tags=["Admin"])
def get_class_bookings(
    class_id: UUID,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    bookings = (
        db.query(booking_model.Booking)
        .filter(booking_model.Booking.class_id == class_id)
        .join(booking_model.Booking.user)
        .all()
    )

    users = [booking.user for booking in bookings if booking.user]
    return users

@router.post("/admin/post-booking", tags=["Admin"])
def admin_create_booking(
    data: AdminBookingRequest,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    cls_ = db.query(class_model.Class).filter(class_model.Class.id == data.class_id).first()
    if not cls_:
        raise HTTPException(status_code=404, detail="Το μάθημα δεν βρέθηκε.")
    
    user = (db.query(user_model.User).filter(user_model.User.name.ilike(f"%{data.trainee_name}%")).first())
    if not user:
        raise HTTPException(status_code=404, detail="Δεν υπάρχει ασκούμενος με αυτό το όνομα.")
    
    existing = (
        db.query(booking_model.Booking)
        .filter(
            booking_model.Booking.class_id == cls_.id,
            booking_model.Booking.user_id == user.id
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Ο ασκούμενος έχει ήδη κλείσει θέση σε αυτό το μάθημα.")

    new_booking = booking_model.Booking(
        id = uuid4(),
        class_id = cls_.id,
        user_id = user.id,
        created_at = datetime.now()
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return {
        "message": f"{user.name} booked successfully for {cls_.class_name} on {cls_.date} at {cls_.time}.",
        "user_id": str(user.id),
        "class_id": str(cls_.id)
    }

@router.delete("/admin/users/{user_id}", tags=["Admin"])
def delete_user(
    user_id: UUID = Path(..., description="Το ID του χρήστη που θα διαγραφεί"),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Ο χρήστης δεν βρέθηκε.")
    
    db.delete(user)
    db.commit()

    return {"message": f"Ο χρήστης με ID {user_id} διαγράφτηκε επιτυχώς."}
