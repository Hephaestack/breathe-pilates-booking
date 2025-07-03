from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.models.admin import Admin
from utils.db import get_db
from utils.auth import verify_password, create_access_token
from db.schemas.admin import AdminLogin

router = APIRouter()

@router.post("/admin/login", tags=["Admin"])
def login_admin(login_data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == login_data.username).first()
    if not admin or not verify_password(login_data.password, admin.password):
        raise HTTPException(status_code=401, detail="Μη έγκυρα στοιχεία σύνδεσης.")
    
    access_token = create_access_token(data={"sub": str(admin.id)})
    return {"access_token": access_token, "token_type": "bearer"}
