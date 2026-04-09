import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    database_url: str = "sqlite+aiosqlite:///./personal_ai.db"
    encryption_key: str = ""

    openai_api_key: str = ""
    gemini_api_key: str = ""
    anthropic_api_key: str = ""
    serpapi_key: str = ""

    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
