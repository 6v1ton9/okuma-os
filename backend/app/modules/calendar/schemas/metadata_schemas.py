"""OKUMA OS - Calendar Metadata Schemas
Pydantic models for the flexible (MongoDB) portion of calendar events."""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


# =============================================================================
# Parts & Checklist nested schemas
# =============================================================================

class ReplacedPart(BaseModel):
    """A part replaced during a service visit."""
    name: str
    quantity: int = 1
    cost: float = 0.0
    part_number: Optional[str] = None


class ChecklistItem(BaseModel):
    """A checklist item for a service procedure."""
    item: str
    completed: bool = False
    notes: Optional[str] = None


class MachineReading(BaseModel):
    """Machine operational readings during service."""
    hours_worked: Optional[float] = None
    cycles_completed: Optional[int] = None
    power_consumption: Optional[float] = None
    additional: dict[str, Any] = Field(default_factory=dict)


class NoteEntry(BaseModel):
    """A timestamped note entry."""
    text: str
    author: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)


# =============================================================================
# Event Metadata — MongoDB flexible document
# =============================================================================

class EventMetadataCreate(BaseModel):
    """Schema for creating/updating event metadata in MongoDB."""
    service_type: Optional[str] = None
    parts_replaced: list[ReplacedPart] = Field(default_factory=list)
    checklist: list[ChecklistItem] = Field(default_factory=list)
    photos: list[str] = Field(default_factory=list)
    signature_url: Optional[str] = None
    machine_readings: Optional[MachineReading] = None
    custom_fields: dict[str, Any] = Field(default_factory=dict)


class EventMetadataResponse(BaseModel):
    """Schema for event metadata API responses."""
    id: str
    event_id: int
    service_type: Optional[str] = None
    parts_replaced: list[dict] = Field(default_factory=list)
    checklist: list[dict] = Field(default_factory=list)
    photos: list[str] = Field(default_factory=list)
    signature_url: Optional[str] = None
    machine_readings: Optional[dict] = None
    custom_fields: dict[str, Any] = Field(default_factory=dict)
    notes_history: list[dict] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class EventMetadataUpdate(BaseModel):
    """Schema for partial metadata update (only provided fields change)."""
    service_type: Optional[str] = None
    parts_replaced: Optional[list[ReplacedPart]] = None
    checklist: Optional[list[ChecklistItem]] = None
    photos: Optional[list[str]] = None
    signature_url: Optional[str] = None
    machine_readings: Optional[MachineReading] = None
    custom_fields: Optional[dict[str, Any]] = None


class MetadataAddNote(BaseModel):
    """Add a timestamped note to event metadata."""
    text: str
    author: Optional[str] = None


class MetadataAddPhoto(BaseModel):
    """Add a photo URL to event metadata."""
    url: str
    caption: Optional[str] = None


class MetadataCustomFieldUpdate(BaseModel):
    """Update a single custom field."""
    key: str
    value: Any
