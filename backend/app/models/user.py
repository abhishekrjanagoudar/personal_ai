from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(200))
    assistant_mode: Mapped[str] = mapped_column(String(10), default="jarvis")  # jarvis | friday

    # Encrypted AI API keys
    openai_api_key_enc: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    gemini_api_key_enc: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    anthropic_api_key_enc: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    serpapi_key_enc: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    default_ai_provider: Mapped[str] = mapped_column(String(20), default="auto")

    # Voice profile metadata
    voice_calibrated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    voice_profile: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
