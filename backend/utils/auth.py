import os
import uuid
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt

from utils import get_db
from db.models.admin import Admin

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)

def verify_password(plain_pw, hashed_pw):
    return pwd_context.verify(plain_pw, hashed_pw)

def hash_password(pw):
    return pwd_context.hash(pw)

def create_access_token(
    admin: Admin,
    expires_delta: timedelta = None
):
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {
        "sub": str(admin.id),
        "username": admin.username,
        "exp": expire
    }
    print("Final token payload: ", payload)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_token_from_header_or_cookie(
        request: Request,
        authorization: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> str:
    if authorization:
        return authorization.credentials
    
    token = request.cookies.get("token")
    if token:
        return token
    raise HTTPException(status_code=401, detail="Δεν βρήθεκε token.")

def get_current_admin(
    token: str = Depends(get_token_from_header_or_cookie),
    db: Session = Depends(get_db)
) -> Admin:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id = payload.get("sub")
        if not admin_id or admin_id == "None":
            raise HTTPException(status_code=401, detail="Δεν επιτρέπεται η πρόσβαση.")
    
        admin_uuid = uuid.UUID(admin_id)

    except JWTError:
        raise HTTPException(status_code=401, detail="Μη έγκυρο token.")

    admin = db.query(Admin).filter(Admin.id == admin_uuid).first()
    if not admin:
        raise HTTPException(status_code=401, detail="Ο διαχειριστής δεν βρέθηκε.")

    return admin
