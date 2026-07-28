"""OKUMA OS - Settings Module Repository
In-memory settings management (extend with DB table if needed)."""

import json
import os
from typing import Optional

from app.modules.settings.schemas.schemas import (
    SystemSettings,
    SystemSettingsUpdate,
    EventStatusConfig,
)

# Simple file-based settings storage
_SETTINGS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "data",
)
_SETTINGS_FILE = os.path.join(_SETTINGS_DIR, "settings.json")


class SettingsRepository:
    """Repository for system settings (file-based, extendable to DB)."""

    def __init__(self):
        self._defaults = SystemSettings()
        self._status_config = EventStatusConfig()

    def get_settings(self) -> SystemSettings:
        """Get current system settings."""
        if os.path.exists(_SETTINGS_FILE):
            try:
                with open(_SETTINGS_FILE, "r") as f:
                    data = json.load(f)
                return SystemSettings(**data)
            except (json.JSONDecodeError, IOError):
                pass
        return self._defaults

    def update_settings(self, data: SystemSettingsUpdate) -> SystemSettings:
        """Update system settings."""
        settings = self.get_settings()
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                setattr(settings, key, value)

        # Persist with directory creation
        os.makedirs(_SETTINGS_DIR, exist_ok=True)
        with open(_SETTINGS_FILE, "w") as f:
            json.dump(settings.model_dump(), f, indent=2)

        return settings

    def get_event_statuses(self) -> EventStatusConfig:
        """Get event status configuration (names and colors)."""
        return self._status_config

    def get_status_color(self, status: str) -> Optional[str]:
        """Get the color for a specific event status."""
        for s in self._status_config.statuses:
            if s.status == status:
                return s.color
        return None
