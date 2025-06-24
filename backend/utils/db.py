from uuid import UUID
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import SessionLocal
from db.models.user import User

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(user_id: UUID, db: Session = Depends(get_db)) -> User:
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user ID")
    
    return user