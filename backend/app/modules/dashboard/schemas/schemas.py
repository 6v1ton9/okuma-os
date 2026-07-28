"""OKUMA OS - Dashboard Module Schemas
Dashboard summary statistics and KPIs."""

from datetime import date
from typing import Optional
from pydantic import BaseModel


class DashboardSummary(BaseModel):
    """Overall dashboard summary with key metrics."""
    total_clients: int = 0
    active_clients: int = 0
    total_machine_models: int = 0
    total_customer_machines: int = 0
    total_technicians: int = 0
    active_technicians: int = 0
    upcoming_events: int = 0
    pending_events: int = 0
    confirmed_events: int = 0


class EventStatusCount(BaseModel):
    """Count of events by status."""
    pending: int = 0
    confirmed: int = 0
    unavailable: int = 0
    completed: int = 0
    cancelled: int = 0


class TechnicianLoad(BaseModel):
    """Technician workload summary."""
    technician_id: int
    technician_name: str
    total_events: int
    upcoming_events: int


class DashboardDetail(BaseModel):
    """Detailed dashboard with breakdowns."""
    summary: DashboardSummary
    event_status_counts: EventStatusCount
    technician_loads: list[TechnicianLoad] = []
    today_events: int = 0
    this_week_events: int = 0


class DashboardTrend(BaseModel):
    """Monthly trend data point."""
    month: str
    year: int
    total_events: int
    new_clients: int
