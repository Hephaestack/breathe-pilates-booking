from uuid import UUID, uuid4
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from db.models.admin import Admin
from utils.db import get_db
from utils.auth import get_current_admin, verify_password, create_access_token
from db.schemas.admin import AdminLogin
from db.schemas.class_ import ClassOut, AdminClassSummary
from db.schemas.booking import AdminBookingRequest, AdminBookingOut
from db.models import template_class, class_ as class_model, booking as booking_model, user as user_model, subscription as sub_model
from db.schemas.user import UserOut, UserCreate, UserSummary, UserMinimal, UserUpdateRequest
from db.schemas.template_class import TemplateClassCreate
from db.schemas.subscription import SubscriptionCreate, SubscriptionOut, SubscriptionUpdate

GREECE_TZ = ZoneInfo("Europe/Athens")

router = APIRouter()

@router.get("/admin/dev-token", tags=["Admin Login"])
def dev_token(
    db: Session = Depends(get_db)
):
    admin = db.query(Admin).first()
    if not admin:
        raise HTTPException(status_code=404, detail="No admin found")
    return {"access_token": create_access_token(admin)}

@router.post("/admin/login", tags=["Admin Login"])
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
        secure=True,         
        samesite="none",
        max_age=60 * 60 * 24,     
        path="/"
    )

    return response

@router.get("/admin/classes", response_model=List[ClassOut], tags=["Admin Classes"])
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

@router.post("/admin/users", response_model=UserOut, tags=["Admin Users"])
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

    if not user_dict.get("created_at"):
        user_dict["created_at"] = datetime.now(GREECE_TZ)

    new_user = user_model.User(**user_dict)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.get("/admin/users", response_model=List[UserOut], tags=["Admin Users"])
def get_users(
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    return db.query(user_model.User).all()

@router.post("/admin/generate_schedule", tags=["Admin Classes"])
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

@router.get("/admin/template_classes", tags=["Admin Classes"])
def get_template_classes(
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    return db.query(template_class.TemplateClass).all()

@router.get("/admin/bookings/{class_id}", response_model=List[UserMinimal], tags=["Admin Bookings"])
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

    return [
        UserMinimal(
            user_id = booking.user.id,
            name = booking.user.name,
            booking_id = booking.id,
        )
        for booking in bookings if booking.user
    ]

@router.post("/admin/bookings", tags=["Admin Bookings"])
def admin_create_booking(
    data: AdminBookingRequest,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    print("Searching for trainee name:", data.trainee_name)
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
        created_at = datetime.now(GREECE_TZ)
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # calculate_remaining_classes(user.id, db)

    return {
        "message": f"{user.name} booked successfully for {cls_.class_name} on {cls_.date} at {cls_.time}.",
        "user_id": str(user.id),
        "class_id": str(cls_.id)
    }

@router.delete("/admin/users/{user_id}", tags=["Admin Users"])
def delete_user(
    user_id: UUID = Path(..., description="Το ID του χρήστη που θα διαγραφεί"),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Ο χρήστης δεν βρέθηκε.")
    
    db.query(booking_model.Booking).filter(booking_model.Booking.user_id == user_id).delete()

    db.delete(user)
    db.commit()

    return {"message": f"Ο χρήστης με ID {user_id} διαγράφτηκε επιτυχώς."}

@router.delete("/admin/bookings/{booking_id}", tags=["Admin Bookings"])
def delete_booking(
    booking_id: UUID = Path(..., description="Το ID της κράτησης."),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    booking = db.query(booking_model.Booking).filter(booking_model.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Η κράτηση δεν βρέθηκε.")
    
    db.delete(booking)
    db.commit()

    # calculate_remaining_classes(booking.user_id, db)

    return {"message": f"Η κράτηση με ID {booking_id} διαγράφηκε επιτυχώς."}

@router.get("/admin/bookings", response_model= List[AdminBookingOut], tags=["Admin Bookings"])
def get_bookings(
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    bookings = (
        db.query(booking_model.Booking)
        .join(booking_model.Booking.user)
        .join(booking_model.Booking.class_)
        .all()
    )

    return [
        AdminBookingOut(
            booking_id = booking.id,
            user_name = booking.user.name,
            class_ = AdminClassSummary(
                id=booking.class_.id,
                class_name=booking.class_.class_name,
                date=booking.class_.date,
                time=booking.class_.time
            )
        )
        for booking in bookings
    ]

@router.get("/admin/users/{user_id}/bookings", response_model=List[AdminBookingOut], tags=["Admin Users"])
def get_user_bookings(
    user_id: UUID,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Ο χρήστης δεν βρέθηκε.")

    bookings = (
        db.query(booking_model.Booking)
        .options(joinedload(booking_model.Booking.class_))
        .filter(booking_model.Booking.user_id == user_id)
        .all()
    )

    return [
        AdminBookingOut(
            booking_id = booking.id,
            user_name = user.name,
            class_ = AdminClassSummary(
                id = booking.class_.id,
                class_name = booking.class_.class_name,
                date = booking.class_.date,
                time = booking.class_.time
            )
        )
        for booking in bookings
    ]

@router.put("/admin/users/{user_id}", tags=["Admin Users"])
def update_user(
    user_id: UUID,
    data: UserUpdateRequest,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Ο χρήστης δεν βρέθηκε.")
    
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)

    db.commit()
    return {"detail": "Τα στοιχεία του χρήστη ανανεώθηκαν επιτυχώς."}

@router.get("/admin/subscriptions", tags=["Admin Subscriptions"])
def get_subscription_models(
    admin: Admin = Depends(get_current_admin)
):
    return [model.value for model in sub_model.SubscriptionModel]

@router.get("/subscriptions/{user_id}", response_model=List[SubscriptionOut], tags=["Admin Subscriptions"])
def get_user_subscriptions(
    user_id: UUID,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Ο χρήστης δεν βρέθηκε.")
    
    return user.subscriptions

@router.delete("/admin/classes/{class_id}", tags=["Admin Classes"])
def delete_class(
    class_id: UUID,
    db: Session = Depends(get_db),
    # admin: Admin = Depends(get_current_admin)
):
    class_obj = db.query(class_model.Class).filter(class_model.Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Το τμήμα δεν βρέθηκε.")
    
    active_bookings = db.query(booking_model.Booking).filter(booking_model.Booking.class_id == class_id).count()
    print(active_bookings)

    if active_bookings > 0:
        raise HTTPException(status_code=404, detail="Το τμήμα έχει κρατήσεις.")
    
    db.delete(class_obj)
    db.commit()
    
    return {"detail": "Το τμήμα διαγράφηκε επιτυχώς."}

@router.post("/admin/template_classes/", tags=["Admin Classes"])
def create_template_class(
    data: TemplateClassCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    new_template = template_class.TemplateClass(
        class_name=data.class_name,
        weekday=data.weekday,
        time=data.time,
        max_participants=data.max_participants,
        is_active=True,
    )
    
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    
    return new_template

@router.delete("/admin/template_classes/{template_id}", tags=["Admin Classes"])
def delete_template_class(
    template_id: UUID,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    template = db.query(template_class.TemplateClass).filter(template_class.TemplateClass.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Το μάθημα δεν βρέθηκε.")
    
    db.delete(template)
    db.commit()

    return {"detail": "Το μάθημα διαγράφηκε με επιτυχία."}

@router.post("/admin/subscriptions/{user_id}", response_model=SubscriptionOut, tags=["Admin Subscriptions"])
def create_subscription(
    user_id: UUID,
    data: SubscriptionCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Ο χρήστης δεν βρέθηκε.")

    new_subscription = sub_model.Subscription(
        id = uuid4(),
        user_id=user_id,
        **data.model_dump()
    )
    db.add(new_subscription)
    db.commit()
    db.refresh(new_subscription)
    return new_subscription

@router.put("/admin/subscriptions/{subscription_id}", response_model=SubscriptionOut, tags=["Admin Subscriptions"])
def update_subscription(
    subscription_id: UUID,
    data: SubscriptionUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    subscription = db.query(sub_model.Subscription).filter(sub_model.Subscription.id == subscription_id).first()
    if not subscription:
        raise HTTPException(status_code=404, detail="Η συνδρομή δεν βρέθηκε.")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(subscription, key, value)

    db.commit()
    db.refresh(subscription)
    return subscription

@router.delete("/admin/subscriptions/{subscription_id}", tags=["Admin Subscriptions"])
def delete_subscription(
    subscription_id: UUID,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    subscription = db.query(sub_model.Subscription).filter(sub_model.Subscription.id == subscription_id).first()
    if not subscription:
        raise HTTPException(status_code=404, detail="Η συνδρομή δεν βρέθηκε.")

    db.delete(subscription)
    db.commit()
    return {"detail": "Η συνδρομή διαγράφηκε επιτυχώς."}
