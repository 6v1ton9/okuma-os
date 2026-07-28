"""OKUMA OS - Settings Module Schemas
System configuration and event status definitions."""

from typing import Optional
from pydantic import BaseModel, constr


class EventStatusColor(BaseModel):
    """Event status with its display color."""
    status: str
    label: str
    color: str  # Hex color code
    order: int = 0


class SystemSettings(BaseModel):
    """Application system settings."""
    app_name: str = "OKUMA OS"
    company_name: str = "OKUMA"
    default_event_duration_hours: int = 4
    working_days: list[int] = [0, 1, 2, 3, 4, 5]  # Mon-Sat
    working_hours_start: str = "08:00"
    working_hours_end: str = "18:00"


class SystemSettingsUpdate(BaseModel):
    """Partial update for system settings."""
    app_name: Optional[str] = None
    company_name: Optional[str] = None
    default_event_duration_hours: Optional[int] = None
    working_days: Optional[list[int]] = None
    working_hours_start: Optional[str] = None
    working_hours_end: Optional[str] = None


class EventStatusConfig(BaseModel):
    """Configuration for event statuses and their associated colors."""
    statuses: list[EventStatusColor] = [
        EventStatusColor(status="pending", label="Aguardando Confirmação", color="#EAB308", order=1),
        EventStatusColor(status="confirmed", label="Confirmada", color="#22C55E", order=2),
        EventStatusColor(status="unavailable", label="Indisponível", color="#60A5FA", order=3),
        EventStatusColor(status="completed", label="Concluída", color="#6B7280", order=4),
        EventStatusColor(status="cancelled", label="Cancelada", color="#EF4444", order=5),
    ]
