from uuid import uuid4
from datetime import date

from db.database import Base, engine, SessionLocal
from db.models.user import User, UserRole
from db.models.subscription import SubscriptionModel
from db.models.class_ import Class
from db.models.booking import Booking

Base.metadata.create_all(bind=engine)

db = SessionLocal()

user1 = User(
    id=uuid4(),
    name="Μαρία Παπαδοπούλου",
    phone="6941234567",
    password=1,
    role=UserRole.client,
    subscription_model=SubscriptionModel.subscription_2,
    package_total=None,
    subscription_starts=date(2025, 6, 1),
    subscription_expires=date(2025, 6, 30),
    remaining_classes=None,
)

user2 = User(
    id=uuid4(),
    name="Γιώργος Κωνσταντίνου",
    phone="6947654321",
    password=2,
    role=UserRole.client,
    subscription_model=SubscriptionModel.package_10,
    package_total=10,
    subscription_starts=None,
    subscription_expires=None,
    remaining_classes=8,
)

class1 = Class(
    id=uuid4(),
    class_name="Pilates Reformer",
    date=date(2025, 6, 25),
    time="18:00",
    max_participants=8,
)

class2 = Class(
    id=uuid4(),
    class_name="Pilates Mat",
    date=date(2025, 6, 26),
    time="10:00",
    max_participants=6,
)

class3 = Class(
    id=uuid4(),
    class_name="Yoga",
    date=date(2025, 6, 26),
    time="11:00",
    max_participants=5,
)

booking1 = Booking(user_id=user1.id, class_id=class1.id)
booking2 = Booking(user_id=user2.id, class_id=class1.id)

db.add_all([user1, user2, class1, class2, booking1, booking2])
db.commit()

print("Inserted test data:")
print("User1 ID:", user1.id)
print("User2 ID:", user2.id)
print("Class1 ID:", class1.id)
print("Class2 ID:", class2.id)
