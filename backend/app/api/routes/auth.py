from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
    encrypt_api_key,
    decrypt_api_key,
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


# ── Schemas ──────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    assistant_mode: str


class UserProfile(BaseModel):
    username: str
    email: str
    assistant_mode: str
    default_ai_provider: str
    voice_calibrated_at: Optional[str] = None
    has_openai: bool
    has_gemini: bool
    has_anthropic: bool
    has_serpapi: bool


class UpdateProfileRequest(BaseModel):
    assistant_mode: Optional[str] = None
    default_ai_provider: Optional[str] = None
    openai_api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    serpapi_key: Optional[str] = None


class VoiceProfileUpdate(BaseModel):
    voice_profile: str  # JSON string with calibration data


# ── Helpers ──────────────────────────────────────────────────────────────────

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    username: str = payload.get("sub")
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register", status_code=201)
async def register(body: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == body.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        username=body.username,
        email=body.email,
        hashed_password=get_password_hash(body.password),
    )
    db.add(user)
    await db.commit()
    return {"message": "User created successfully"}


@router.post("/token", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    token = create_access_token({"sub": user.username})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user.username,
        assistant_mode=user.assistant_mode,
    )


@router.get("/me", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserProfile(
        username=current_user.username,
        email=current_user.email,
        assistant_mode=current_user.assistant_mode,
        default_ai_provider=current_user.default_ai_provider,
        voice_calibrated_at=current_user.voice_calibrated_at.isoformat() if current_user.voice_calibrated_at else None,
        has_openai=bool(current_user.openai_api_key_enc),
        has_gemini=bool(current_user.gemini_api_key_enc),
        has_anthropic=bool(current_user.anthropic_api_key_enc),
        has_serpapi=bool(current_user.serpapi_key_enc),
    )


@router.put("/me")
async def update_profile(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.assistant_mode in ("jarvis", "friday"):
        current_user.assistant_mode = body.assistant_mode
    if body.default_ai_provider in ("auto", "openai", "gemini", "anthropic"):
        current_user.default_ai_provider = body.default_ai_provider
    if body.openai_api_key is not None:
        current_user.openai_api_key_enc = encrypt_api_key(body.openai_api_key) if body.openai_api_key else None
    if body.gemini_api_key is not None:
        current_user.gemini_api_key_enc = encrypt_api_key(body.gemini_api_key) if body.gemini_api_key else None
    if body.anthropic_api_key is not None:
        current_user.anthropic_api_key_enc = encrypt_api_key(body.anthropic_api_key) if body.anthropic_api_key else None
    if body.serpapi_key is not None:
        current_user.serpapi_key_enc = encrypt_api_key(body.serpapi_key) if body.serpapi_key else None

    await db.commit()
    return {"message": "Profile updated"}


@router.post("/voice-calibration")
async def update_voice_calibration(
    body: VoiceProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime
    current_user.voice_profile = body.voice_profile
    current_user.voice_calibrated_at = datetime.utcnow()
    await db.commit()
    return {"message": "Voice profile updated", "calibrated_at": current_user.voice_calibrated_at.isoformat()}
