import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from zoneinfo import ZoneInfo

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

GREECE_TZ = ZoneInfo("Europe/Athens")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_pw, hashed_pw):
    return pwd_context.verify(plain_pw, hashed_pw)

def hash_password(pw):
    return pwd_context.hash(pw)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(GREECE_TZ) + (expires_delta or timedelta(minutes=15))
    to_encode.update({
        "sub": data.get("id"),
        "username": data.get("username"),
        "exp": expire
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
