from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException
from enum import Enum

from db.models import booking, class_, user
from db.models.user import SubscriptionModel
from utils.calc_class import calculate_remaining_classes

def validate_booking_rules(db: Session, current_user: user.User, class_obj: class_.Class):
    subscription = current_user.subscription_model
    # Check if subscription exist
    if not subscription:
        raise HTTPException(status_code=400, detail="Δεν έχετε ενεργή συνδρομή.")
    
    # Check subscription expiration
    if current_user.subscription_expires and current_user.subscription_expires < class_obj.date:
        raise HTTPException(status_code=400, detail="Η συνδρομή σας θα έχει λήξει μέχρι την ημέρα του μαθήματος. Παρακαλώ ανανεώστε πριν κάνετε κράτηση.")
    
    user_id = current_user.id
    class_name = class_obj.class_name.lower()

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

    start_of_week = class_obj.date - timedelta(days=class_obj.date.weekday())
    end_of_week = start_of_week + timedelta(days=6)

    # Weekly bookings
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

    # Cadillac class rules
    is_cadillac_subscription = subscription in [
        SubscriptionModel.family_3_cadillac,
        SubscriptionModel.cadillac_package_5,
        SubscriptionModel.cadillac_package_10
    ]
    if "cadillac" in class_name.lower() and not is_cadillac_subscription:
        raise HTTPException(status_code=400, detail="Μόνο οι συνδρομές Cadillac μπορούν να κλείσουν Cadillac Flow μαθήματα.")

    # Rules
    # Weekly subs
    if subscription == SubscriptionModel.subscription_2 and weekly_bookings >= 2:
        raise HTTPException(status_code=400, detail="Η συνδρομή σας, σας επιτρέπει έως 2 κρατήσεις την εβδομάδα.")
    elif subscription == SubscriptionModel.subscription_3 and weekly_bookings >= 3:
        raise HTTPException(status_code=400, detail="Η συνδρομή σας, σας επιτρέπει έως 3 κρατήσεις την εβδομάδα.")
    elif subscription == SubscriptionModel.subscription_5 and weekly_bookings >= 5:
        raise HTTPException(status_code=400, detail="Η συνδρομή σας, σας επιτρέπει έως 5 κρατήσεις την εβδομάδα.")
    
    # Package subs
    elif subscription in [
        SubscriptionModel.package_10,
        SubscriptionModel.package_15,
        SubscriptionModel.package_20,
        SubscriptionModel.cadillac_package_5,
        SubscriptionModel.cadillac_package_10
    ]:
        remaining = calculate_remaining_classes(user_id, db)
        if remaining <= 0:
            raise HTTPException(status_code=400, detail="Έχετε ολοκληρώσει το πακέτο μαθημάτων.")

        if subscription in [
            SubscriptionModel.cadillac_package_5,
            SubscriptionModel.cadillac_package_10
        ]:
            if "cadillac" not in class_name:
                raise HTTPException(status_code=400, detail="Το πακέτο αυτό ισχύει μόνο για Cadillac Flow μαθήματα.")
