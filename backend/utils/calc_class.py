from sqlalchemy.orm import Session
from db.models.user import User
from db.models.booking import Booking
from db.models.class_ import Class

def calculate_remaining_classes(user_id: str, db: Session) -> int:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.package_total:
        return 0

    active_bookings = db.query(Booking).join(Class).filter(
        Booking.user_id == user_id,
        Booking.status == "confirmed",
        Class.date >= user.subscription_starts,
        Class.date <= user.subscription_expires
    ).count()

    remaining = user.package_total - active_bookings
    user.remaining_classes = max(0, remaining)
    db.commit()
    return user.remaining_classes
