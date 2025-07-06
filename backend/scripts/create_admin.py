from db.database import SessionLocal
from db.models.admin import Admin
from utils.auth import hash_password

db = SessionLocal()

new_admin = Admin(
    username="admin1",
    email="admin1@yourapp.com",
    password=hash_password("admin123")
)

db.add(new_admin)
db.commit()
