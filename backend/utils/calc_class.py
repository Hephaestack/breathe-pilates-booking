from fastapi import HTTPException
from sqlalchemy.orm import Session
from db.models.user import User
from db.models.booking import Booking
from db.models.class_ import Class
from db.models.subscription import Subscription

def calculate_remaining_classes(user_id: str, db: Session) -> int:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Ο χρήστης δεν βρέθηκε.")

    results = []

    for sub in user.subscriptions:
        model = sub.subscription_model.name.lower()
        if "package" in model:
            
            if "cadillac" in model:
                class_filter = Class.class_name.ilike("%cadillac%")
            else:
                class_filter = ~Class.class_name.ilike("%cadillac%")
            
            booking_count = db.query(Booking).join(Class).filter(
                Booking.user_id == user.id,
                Booking.status == "confirmed",
                Class.date >= sub.start_date,
                Class.date <= sub.end_date,
                class_filter
            ).count()

            remaining = max(0, sub.package_total - booking_count)

            sub.remaining_classes = remaining

            results.append({
                "subscription_id": sub.id,
                "subscription_model": sub.subscription_model.value,
                "start_date": sub.start_date,
                "end_date": sub.end_date,
                "used_classes": booking_count,
                "remaining_classes": remaining
            })

    db.commit()
    return results

def calculate_remaining_classes_for_subscription(user_id: str, subscription_id: str, db: Session) -> dict:
    sub = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == user_id
    ).first()

    if not sub:
        raise HTTPException(status_code=404, detail="Η συνδρομή δεν βρέθηκε για τον χρήστη.")

    model = sub.subscription_model.name.lower()
    if "package" not in model:
        return {
            "subscription_id": str(sub.id),
            "subscription_model": sub.subscription_model.value,
            "remaining_classes": None,
            "message": "Η συνδρομή δεν είναι πακέτο με συγκεκριμένο αριθμό μαθημάτων."
        }

    # Filter for Cadillac if needed
    if "cadillac" in model:
        class_filter = Class.class_name.ilike("%cadillac%")
    else:
        class_filter = ~Class.class_name.ilike("%cadillac%")

    booking_count = db.query(Booking).join(Class).filter(
        Booking.user_id == user_id,
        Booking.status == "confirmed",
        Class.date >= sub.start_date,
        Class.date <= sub.end_date,
        class_filter
    ).count()

    remaining = max(0, sub.package_total - booking_count)

    return {
        "subscription_id": str(sub.id),
        "subscription_model": sub.subscription_model.value,
        "start_date": sub.start_date,
        "end_date": sub.end_date,
        "used_classes": booking_count,
        "remaining_classes": remaining
    }
