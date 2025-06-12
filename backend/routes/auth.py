from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from utils.auth import create_access_token
from db.models import user as user_model
from db.schemas.token import LoginRequest, Token
from utils import get_db

router = APIRouter()

@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(user_model.User).filter(user_model.User.phone == data.phone).first()
    if not db_user or db_user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": str(db_user.id), "role": db_user.role.name})
    return {"access_token": token, "token_type": "bearer"}
