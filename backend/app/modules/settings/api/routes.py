"""OKUMA OS - Settings Module API Routes
System settings and event status configuration endpoints."""

from fastapi import APIRouter, Depends, status
from app.core.security import get_current_user
from app.modules.settings.schemas.schemas import (
    SystemSettings,
    SystemSettingsUpdate,
    EventStatusConfig,
)
from app.modules.settings.repository.repository import SettingsRepository

router = APIRouter(
    prefix="/api/v1/settings",
    tags=["Configurações"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=SystemSettings)
def get_settings():
    """Get current system settings."""
    repo = SettingsRepository()
    return repo.get_settings()


@router.put("/", response_model=SystemSettings)
def update_settings(data: SystemSettingsUpdate):
    """Update system settings."""
    repo = SettingsRepository()
    return repo.update_settings(data)


@router.get("/event-statuses", response_model=EventStatusConfig)
def get_event_statuses():
    """Get event status configuration with display colors."""
    repo = SettingsRepository()
    return repo.get_event_statuses()


@router.get("/event-statuses/{status}")
def get_status_color(status: str):
    """Get the color for a specific event status."""
    repo = SettingsRepository()
    color = repo.get_status_color(status)
    return {"status": status, "color": color}
