from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException

from db.models import booking, class_, user
from db.models.subscription import SubscriptionModel, Subscription
from utils.calc_class import calculate_remaining_classes

def validate_booking_rules(db: Session, current_user: user.User, class_obj: class_.Class):
    user_id = current_user.id
    class_name = class_obj.class_name.lower()

    # Check for weekly subscriptions
    active_sub = (
        db.query(Subscription)
        .filter(Subscription.user_id == user_id)
        .filter(Subscription.start_date <= class_obj.date, Subscription.end_date >= class_obj.date)
        .order_by(Subscription.start_date.desc())
        .first()
    )

    if not active_sub:
        raise HTTPException(status_code=400, detail="Δεν έχετε ενεργή συνδρομή.")

    # One booking per day
    same_day_bookings = (
        db.query(booking.Booking)
        .join(class_.Class)
        .filter(
            booking.Booking.user_id == user_id,
            class_.Class.date == class_obj.date
        )
        .count()
    )
    if same_day_bookings >= 1:
        raise HTTPException(status_code=400, detail="Μπορείτε να κάνετε μόνο 1 κράτηση ανά ημέρα.")

    sub_model = active_sub.subscription_model

    # Weekly subscriptions rules
    if sub_model in [
        SubscriptionModel.subscription_2,
        SubscriptionModel.subscription_3,
        SubscriptionModel.subscription_5,
        SubscriptionModel.family_2,
        SubscriptionModel.family_3,
    ]:
        start_of_week = class_obj.date - timedelta(days=class_obj.date.weekday())
        end_of_week = start_of_week + timedelta(days=6)

        weekly_bookings = (
            db.query(booking.Booking)
            .join(class_.Class)
            .filter(
                booking.Booking.user_id == user_id,
                class_.Class.date >= start_of_week,
                class_.Class.date <= end_of_week
            )
            .count()
        )

        allowed = {
            SubscriptionModel.subscription_2: 2,
            SubscriptionModel.subscription_3: 3,
            SubscriptionModel.subscription_5: 5,
            SubscriptionModel.family_2: 2,
            SubscriptionModel.family_3: 3,
        }[sub_model]

        if weekly_bookings >= allowed:
            raise HTTPException(status_code=400, detail=f"Η συνδρομή σας, σας επιτρέπει έως {allowed} κρατήσεις την εβδομάδα.")

    # Check for package subscriptions
    eligible = find_eligible_subscription_for_class(current_user, class_obj, db)

    if "package" in sub_model.name.lower():
        if not eligible:
            raise HTTPException(status_code=400, detail="Δεν έχετε ενεργό πακέτο με διαθέσιμα μαθήματα.")
        
        # Extra Cadillac validation
        if "cadillac" in eligible["subscription"].subscription_model.name.lower() and "cadillac" not in class_name:
            raise HTTPException(status_code=400, detail="Το πακέτο αυτό ισχύει μόνο για Cadillac Flow μαθήματα.")
        if "cadillac" not in eligible["subscription"].subscription_model.name.lower() and "cadillac" in class_name:
            raise HTTPException(status_code=400, detail="Το πακέτο αυτό δεν περιλαμβάνει Cadillac Flow μαθήματα.")

def find_eligible_subscription_for_class(user: user.User, class_obj: class_.Class, db: Session) -> dict | None:
    """Returns the first matching active subscription with available classes for a specific class_obj"""
    eligible_subs = []

    for sub in user.subscriptions:
        model = sub.subscription_model.name.lower()

        # Skip if not a package subscription
        if "package" not in model:
            continue

        # Check subscription date validity
        if not (sub.start_date <= class_obj.date <= sub.end_date):
            continue

        # Cadillac logic
        if "cadillac" in model and "cadillac" not in class_obj.class_name.lower():
            continue
        if "cadillac" not in model and "cadillac" in class_obj.class_name.lower():
            continue

        # Define class filter
        class_filter = (
            class_.Class.class_name.ilike("%cadillac%")
            if "cadillac" in model
            else ~class_.Class.class_name.ilike("%cadillac%")
        )

        # Count bookings within subscription date and class type
        booking_count = (
            db.query(booking.Booking)
            .join(class_.Class)
            .filter(
                booking.Booking.user_id == user.id,
                booking.Booking.status == "confirmed",
                class_.Class.date >= sub.start_date,
                class_.Class.date <= sub.end_date,
                class_filter
            )
            .count()
        )

        remaining = max(0, sub.package_total - booking_count)

        if remaining > 0:
            eligible_subs.append({
                "subscription": sub,
                "remaining": remaining
            })

    return eligible_subs[0] if eligible_subs else None
