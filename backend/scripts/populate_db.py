import csv
from datetime import datetime
from sqlalchemy.orm import Session
from db.database import SessionLocal
from db.models.user import User, UserRole, SubscriptionModel

def parse_date(value: str):
    return datetime.strptime(value, "%Y-%m-%d").date() if value else None

def parse_int(value: str):
    return int(value) if value else None

def parse_enum(enum_class, value: str):
    try:
        return enum_class[value] if value else None
    except KeyError:
        return None

def import_users_from_csv(file_path: str):
    db: Session = SessionLocal()
    added = 0
    skipped = 0

    with open("breathe_data.csv", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            existing = db.query(User).filter(User.phone == row["phone"]).first()
            if existing:
                print(f"Skipping duplicate phone: {row['phone']}")
                skipped += 1
                continue

            user = User(
                name=row["name"],
                phone=row["phone"],
                password=parse_int(row["password"]),
                role=parse_enum(UserRole, row["role"]),
                city=row["city"] or None,
                subscription_model=parse_enum(SubscriptionModel, row["subscription_model"]),
                subscription_starts=parse_date(row["subscription_starts"]),
                subscription_expires=parse_date(row["subscription_expires"]),
                package_total=parse_int(row["package_total"]),
                remaining_classes=parse_int(row["remaining_classes"]),
            )

            db.add(user)
            added += 1

        db.commit()
        db.close()
        print(f"Import complete! {added} added, {skipped} skipped.")

if __name__ == "__main__":
    import_users_from_csv("users.csv")
