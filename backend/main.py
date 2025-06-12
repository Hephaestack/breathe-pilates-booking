from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from fastapi.middleware.cors import CORSMiddleware
from uuid import UUID
from typing import List

from db.database import SessionLocal, engine, Base
from db.models import user, booking, class_
from db.schemas import UserOut, UserCreate, ClassOut, BookingCreate, BookingOut, UserSummary

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/users", response_model=List[UserSummary])
def get_users(db: Session = Depends(get_db)):
    return db.query(user.User).all()


@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
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


@app.get("/classes", response_model=List[ClassOut])
def get_class(db: Session = Depends(get_db)):
    classes = (
        db.query(class_.Class)
        .options(joinedload(class_.Class.bookings).joinedload(booking.Booking.user))
        .all()
    )

    for c in classes:
        c.users = [b.user for b in c.bookings if b.user]
        c.current_participants = len(c.users)

    return classes


@app.post("/users", response_model=UserOut)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
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


@app.post("/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
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
