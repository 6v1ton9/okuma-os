"""OKUMA OS - Calendar Module Schemas
Pydantic models for calendar events with technician assignment."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, constr


class CalendarEventBase(BaseModel):
    """Base schema for calendar events."""
    client_id: int
    customer_machine_id: Optional[int] = None
    description: constr(max_length=500)
    start_datetime: datetime
    end_datetime: datetime
    status: constr(max_length=30) = "pending"
    notes: Optional[str] = None
    city: Optional[constr(max_length=100)] = None
    technician_ids: list[int] = []
    # MongoDB flexible metadata (optional on create)
    metadata: Optional[dict] = None


class CalendarEventCreate(CalendarEventBase):
    """Schema for creating a new calendar event."""
    pass


class CalendarEventUpdate(BaseModel):
    """Schema for updating a calendar event. All fields optional."""
    client_id: Optional[int] = None
    customer_machine_id: Optional[int] = None
    description: Optional[constr(max_length=500)] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    status: Optional[constr(max_length=30)] = None
    notes: Optional[str] = None
    city: Optional[constr(max_length=100)] = None
    technician_ids: Optional[list[int]] = None
    # MongoDB flexible metadata
    metadata: Optional[dict] = None


class CalendarEventResponse(CalendarEventBase):
    """Schema for calendar event API responses."""
    id: int
    created_at: datetime
    updated_at: datetime
    active: bool

    # Resolved relationship info
    client_name: Optional[str] = None
    client_city: Optional[str] = None
    serial_number: Optional[str] = None
    technician_names: list[str] = []
    # MongoDB metadata_id reference
    metadata_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CalendarEventListResponse(BaseModel):
    """Paginated calendar event list response."""
    items: list[CalendarEventResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Spreadsheet view: grouped by technician per day
class CalendarDayEvent(BaseModel):
    """A single event card for the spreadsheet view."""
    id: int
    client_name: str
    description: str
    status: str
    start_datetime: datetime
    end_datetime: datetime
    city: Optional[str] = None
    serial_number: Optional[str] = None


class TechnicianDaySchedule(BaseModel):
    """Events for one technician on one day."""
    technician_id: int
    technician_name: str
    date: str
    events: list[CalendarDayEvent]


class CalendarSpreadsheet(BaseModel):
    """Complete spreadsheet view data."""
    technicians: list[dict]  # List of technician summary
    days: list[str]  # Date strings
    events: dict[str, dict[str, list[CalendarDayEvent]]]  # date -> technician_id -> events
