"""OKUMA OS - Core Configuration
Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings
from typing import Optional, List


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

    # Auth - JWT
    JWT_SECRET: str = "okuma-os-jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 480  # 8 horas — token expira após esse período
    JWT_REFRESH_EXPIRATION_DAYS: int = 7  # Refresh token válido por 7 dias

    # Rate Limiting
    LOGIN_RATE_LIMIT: int = 5  # Máximo de tentativas de login
    LOGIN_RATE_WINDOW_MINUTES: int = 15  # Janela de tempo em minutos

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "okuma_os"

    # CORS - parsed from env as JSON string, e.g. CORS_ORIGINS='["http://localhost:3000"]'
    CORS_ORIGINS: str = '["http://localhost:3000","http://127.0.0.1:3000"]'

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    class Config:
        """Pydantic config for env file support."""
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# Parse CORS_ORIGINS JSON string into list
import json
CORS_ORIGINS_LIST: List[str] = json.loads(settings.CORS_ORIGINS)
