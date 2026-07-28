"""OKUMA OS - Dashboard Module API Routes
Dashboard summary statistics and KPI endpoints."""

from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.clients.repository.repository import ClientRepository
from app.modules.machines.repository.repository import (
    MachineModelRepository,
    CustomerMachineRepository,
)
from app.modules.technicians.repository.repository import TechnicianRepository
from app.modules.calendar.repository.repository import CalendarEventRepository
from app.modules.calendar.models import CalendarEvent
from app.modules.technicians.models import Technician

router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/summary", response_model=dict)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Get overall dashboard summary with key metrics."""
    client_repo = ClientRepository(db)
    machine_model_repo = MachineModelRepository(db)
    customer_machine_repo = CustomerMachineRepository(db)
    tech_repo = TechnicianRepository(db)
    event_repo = CalendarEventRepository(db)

    return {
        "total_clients": client_repo.get_total_count(),
        "active_clients": client_repo.get_active_count(),
        "total_machine_models": machine_model_repo.get_active_count(),
        "total_customer_machines": customer_machine_repo.get_active_count(),
        "total_technicians": tech_repo.get_active_count(),
        "active_technicians": tech_repo.get_active_count(),
        "upcoming_events": event_repo.get_upcoming_count(),
        "pending_events": 0,
        "confirmed_events": 0,
    }


@router.get("/detail", response_model=dict)
def get_dashboard_detail(db: Session = Depends(get_db)):
    """Get detailed dashboard with breakdowns and technician loads."""
    client_repo = ClientRepository(db)
    machine_model_repo = MachineModelRepository(db)
    customer_machine_repo = CustomerMachineRepository(db)
    tech_repo = TechnicianRepository(db)
    event_repo = CalendarEventRepository(db)

    # Technician loads
    techs = tech_repo.get_active_technicians()
    now = datetime.now(timezone.utc)
    week_from_now = now + timedelta(days=7)

    technician_loads = []
    for tech in techs:
        tech_event_count = (
            db.query(CalendarEvent)
            .filter(
                CalendarEvent.technicians.any(id=tech.id),
                CalendarEvent.start_datetime >= now,
                CalendarEvent.active == True,
            )
            .count()
        )
        technician_loads.append({
            "technician_id": tech.id,
            "technician_name": tech.name,
            "total_events": tech_event_count,
            "upcoming_events": tech_event_count,
        })

    # Events today
    today_start = datetime.combine(date.today(), datetime.min.time(), tzinfo=timezone.utc)
    today_end = datetime.combine(date.today(), datetime.max.time(), tzinfo=timezone.utc)
    today_events = (
        db.query(CalendarEvent)
        .filter(
            CalendarEvent.start_datetime >= today_start,
            CalendarEvent.start_datetime <= today_end,
            CalendarEvent.active == True,
        )
        .count()
    )

    # Events this week
    week_events = (
        db.query(CalendarEvent)
        .filter(
            CalendarEvent.start_datetime >= now,
            CalendarEvent.start_datetime <= week_from_now,
            CalendarEvent.active == True,
        )
        .count()
    )

    # Event status counts
    status_counts = event_repo.get_counts_by_status()

    return {
        "summary": {
            "total_clients": client_repo.get_total_count(),
            "active_clients": client_repo.get_active_count(),
            "total_machine_models": machine_model_repo.get_active_count(),
            "total_customer_machines": customer_machine_repo.get_active_count(),
            "total_technicians": len(techs),
            "active_technicians": len(techs),
            "upcoming_events": event_repo.get_upcoming_count(),
            "pending_events": status_counts.get("pending", 0),
            "confirmed_events": status_counts.get("confirmed", 0),
        },
        "event_status_counts": status_counts,
        "technician_loads": technician_loads,
        "today_events": today_events,
        "this_week_events": week_events,
    }
