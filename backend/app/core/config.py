"""OKUMA OS - Core Configuration
Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # Application
    APP_NAME: str = "OKUMA OS"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Sistema de Gerenciamento Operacional OKUMA"
    DEBUG: bool = False

    # Database - Supabase PostgreSQL
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/okuma_os"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # Auth - Supabase
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    JWT_SECRET: str = "okuma-os-jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 0  # 0 = sem expiração (token vitalício)

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "okuma_os"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    class Config:
        """Pydantic config for env file support."""
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
