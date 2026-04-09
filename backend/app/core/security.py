from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet
import base64
import os

from app.core.config import get_settings

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None


def _get_fernet() -> Fernet:
    key = settings.encryption_key
    if not key:
        # Generate a stable key from the secret_key for development
        import hashlib
        raw = hashlib.sha256(settings.secret_key.encode()).digest()
        key = base64.urlsafe_b64encode(raw).decode()
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_api_key(api_key: str) -> str:
    f = _get_fernet()
    return f.encrypt(api_key.encode()).decode()


def decrypt_api_key(encrypted_key: str) -> str:
    f = _get_fernet()
    return f.decrypt(encrypted_key.encode()).decode()
