"""OKUMA OS - Base SQLAlchemy Models
Provides base model class with common timestamp columns."""

from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Boolean
from app.core.database import Base


class TimestampMixin:
    """Mixin that adds created_at and updated_at timestamp columns."""

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class ActivableMixin:
    """Mixin that adds an 'active' boolean column for soft-deletion."""

    active = Column(Boolean, default=True, nullable=False)


class BaseModel(Base, TimestampMixin):
    """Abstract base model with timestamps for all database entities."""

    __abstract__ = True
