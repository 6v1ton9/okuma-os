"""OKUMA OS - Calendar Module API Routes
RESTful endpoints for calendar events with MongoDB flexible metadata."""

from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.mongodb import get_mongodb
from app.modules.calendar.schemas.schemas import (
    CalendarEventCreate,
    CalendarEventUpdate,
    CalendarEventResponse,
)
from app.modules.calendar.schemas.metadata_schemas import (
    EventMetadataResponse,
    EventMetadataUpdate,
    EventMetadataCreate,
    MetadataAddNote,
    MetadataAddPhoto,
    MetadataCustomFieldUpdate,
)
from app.modules.calendar.repository.repository import CalendarEventRepository
from app.modules.calendar.mongodb_models import (
    METADATA_COLLECTION,
    create_default_metadata,
    update_timestamp,
    serialize_doc,
)
from app.modules.technicians.repository.repository import TechnicianRepository

from pymongo.database import Database as MongoDatabase
from pymongo.errors import DuplicateKeyError

router = APIRouter(
    prefix="/api/v1/calendar",
    tags=["Agenda"],
    dependencies=[Depends(get_current_user)],
)


def _event_to_response(event) -> dict:
    """Convert a CalendarEvent ORM object to a response dict."""
    return {
        "id": event.id,
        "client_id": event.client_id,
        "customer_machine_id": event.customer_machine_id,
        "description": event.description,
        "start_datetime": event.start_datetime.isoformat() if event.start_datetime else None,
        "end_datetime": event.end_datetime.isoformat() if event.end_datetime else None,
        "status": event.status,
        "notes": event.notes,
        "city": event.city,
        "metadata_id": event.metadata_id,
        "technician_ids": [t.id for t in (event.technicians or [])],
        "created_at": event.created_at.isoformat() if event.created_at else None,
        "updated_at": event.updated_at.isoformat() if event.updated_at else None,
        "active": event.active,
        "client_name": event.client.company_name if event.client else None,
        "client_city": event.client.city if event.client else None,
        "serial_number": (
            event.customer_machine.serial_number
            if event.customer_machine else None
        ),
        "technician_names": [t.name for t in (event.technicians or [])],
    }


# =============================================================================
# Event CRUD Endpoints
# =============================================================================

@router.get("/", response_model=dict)
def list_events(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    client_id: Optional[int] = Query(None),
    technician_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    """List calendar events with pagination and filters."""
    repo = CalendarEventRepository(db)
    skip = (page - 1) * page_size
    items, total = repo.list_all(
        skip=skip, limit=page_size,
        start_date=start_date, end_date=end_date,
        status=status, client_id=client_id,
        technician_id=technician_id, search=search,
        sort_order=sort_order,
    )
    return {
        "items": [_event_to_response(e) for e in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/spreadsheet", response_model=dict)
def get_spreadsheet(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
):
    """Get calendar data in spreadsheet format (technicians x days)."""
    repo = CalendarEventRepository(db)
    tech_repo = TechnicianRepository(db)

    technicians = tech_repo.get_active_technicians()
    events = repo.get_spreadsheet_data(start_date, end_date)

    from datetime import timedelta
    days = []
    current = start_date
    while current <= end_date:
        days.append(current.isoformat())
        current += timedelta(days=1)

    grid: dict[str, dict[int, list[dict]]] = {}
    for day in days:
        grid[day] = {}
        for tech in technicians:
            grid[day][tech.id] = []

    for event in events:
        event_date = event.start_datetime.date().isoformat()
        for tech in (event.technicians or []):
            if event_date in grid and tech.id in grid[event_date]:
                grid[event_date][tech.id].append({
                    "id": event.id,
                    "client_name": event.client.company_name if event.client else "",
                    "description": event.description,
                    "status": event.status,
                    "start_datetime": event.start_datetime.isoformat(),
                    "end_datetime": event.end_datetime.isoformat(),
                    "city": event.city or (event.client.city if event.client else None),
                    "serial_number": (
                        event.customer_machine.serial_number
                        if event.customer_machine else None
                    ),
                    "has_metadata": event.metadata_id is not None,
                })

    return {
        "technicians": [
            {"id": t.id, "name": t.name, "role": t.role}
            for t in technicians
        ],
        "days": days,
        "events": {
            day: {
                str(tech_id): evts
                for tech_id, evts in tech_events.items()
            }
            for day, tech_events in grid.items()
        },
    }


@router.get("/{event_id}", response_model=dict)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """Get a single event with its MongoDB metadata attached."""
    repo = CalendarEventRepository(db)
    result = repo.get_with_metadata(event_id)
    if not result:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return result


@router.post("/", response_model=dict, status_code=201)
def create_event(
    data: CalendarEventCreate,
    db: Session = Depends(get_db),
):
    """Create a new event. Metadata (flexible fields) will be stored in MongoDB."""
    repo = CalendarEventRepository(db)
    event = repo.create(data.model_dump())
    result = _event_to_response(event)

    # Attach metadata if it was created
    if event.metadata_id:
        result_with_meta = repo.get_with_metadata(event.id)
        if result_with_meta:
            return result_with_meta

    return result


@router.put("/{event_id}", response_model=dict)
def update_event(
    event_id: int,
    data: CalendarEventUpdate,
    db: Session = Depends(get_db),
):
    """Update an event. If metadata is provided, it merges into MongoDB."""
    repo = CalendarEventRepository(db)
    event = repo.update(event_id, data.model_dump(exclude_unset=True))
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    result = repo.get_with_metadata(event_id)
    return result


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Delete an event (soft-delete in PG + removes MongoDB document)."""
    repo = CalendarEventRepository(db)
    if not repo.delete(event_id):
        raise HTTPException(status_code=404, detail="Evento não encontrado")


@router.get("/status/counts", response_model=dict)
def get_event_status_counts(db: Session = Depends(get_db)):
    """Get event counts grouped by status for dashboard widgets."""
    repo = CalendarEventRepository(db)
    return repo.get_counts_by_status()


# =============================================================================
# Flexible Metadata Endpoints (MongoDB)
# These endpoints operate directly on the MongoDB event_metadata collection.
# =============================================================================

def _get_metadata_or_404(mongo: MongoDatabase, event_id: int) -> dict:
    """Get metadata document or raise 404."""
    meta = mongo[METADATA_COLLECTION].find_one({"event_id": event_id})
    if not meta:
        raise HTTPException(
            status_code=404,
            detail="Metadados do evento não encontrados. Crie-os primeiro via POST /metadata.",
        )
    return meta


@router.get("/{event_id}/metadata", response_model=EventMetadataResponse)
def get_event_metadata(
    event_id: int,
    mongo: MongoDatabase = Depends(get_mongodb),
):
    """Get the flexible metadata for an event from MongoDB."""
    meta = mongo[METADATA_COLLECTION].find_one({"event_id": event_id})
    if not meta:
        raise HTTPException(
            status_code=404,
            detail="Metadados do evento não encontrados",
        )
    return EventMetadataResponse(**serialize_doc(meta))


@router.post("/{event_id}/metadata", response_model=EventMetadataResponse, status_code=201)
def create_event_metadata(
    event_id: int,
    data: EventMetadataCreate,
    mongo: MongoDatabase = Depends(get_mongodb),
    db: Session = Depends(get_db),
):
    """Create flexible metadata for an event (stored in MongoDB).
    
    Use this to add parts_replaced, checklists, photos, custom_fields, etc.
    """
    # Verify event exists
    repo = CalendarEventRepository(db)
    event = repo.get_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    # Check if metadata already exists
    existing = mongo[METADATA_COLLECTION].find_one({"event_id": event_id})
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Metadados já existem para este evento. Use PUT para atualizar.",
        )

    # Create metadata document
    meta_doc = create_default_metadata(event_id)
    meta_doc.update(data.model_dump(exclude_unset=True))

    # Unique index on event_id prevents races — catch duplicate gracefully
    try:
        result = mongo[METADATA_COLLECTION].insert_one(meta_doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Metadados já existem para este evento. Use PUT para atualizar.",
        )

    # Link metadata_id back to PostgreSQL
    event.metadata_id = str(result.inserted_id)
    db.commit()

    return EventMetadataResponse(**serialize_doc(
        mongo[METADATA_COLLECTION].find_one({"_id": result.inserted_id})
    ))


@router.put("/{event_id}/metadata", response_model=EventMetadataResponse)
def update_event_metadata(
    event_id: int,
    data: EventMetadataUpdate,
    mongo: MongoDatabase = Depends(get_mongodb),
):
    """Update flexible metadata for an event (merged into MongoDB)."""
    meta = _get_metadata_or_404(mongo, event_id)
    update_data = data.model_dump(exclude_unset=True)
    meta.update(update_data)
    update_timestamp(meta)

    mongo[METADATA_COLLECTION].replace_one({"event_id": event_id}, meta)
    updated = mongo[METADATA_COLLECTION].find_one({"event_id": event_id})
    return EventMetadataResponse(**serialize_doc(updated))


@router.patch("/{event_id}/metadata/custom", response_model=EventMetadataResponse)
def update_custom_field(
    event_id: int,
    data: MetadataCustomFieldUpdate,
    mongo: MongoDatabase = Depends(get_mongodb),
):
    """Update a single custom field in event metadata."""
    meta = _get_metadata_or_404(mongo, event_id)
    if "custom_fields" not in meta or meta["custom_fields"] is None:
        meta["custom_fields"] = {}
    meta["custom_fields"][data.key] = data.value
    update_timestamp(meta)
    mongo[METADATA_COLLECTION].replace_one({"event_id": event_id}, meta)
    updated = mongo[METADATA_COLLECTION].find_one({"event_id": event_id})
    return EventMetadataResponse(**serialize_doc(updated))


@router.post("/{event_id}/metadata/notes", response_model=EventMetadataResponse)
def add_event_note(
    event_id: int,
    data: MetadataAddNote,
    mongo: MongoDatabase = Depends(get_mongodb),
):
    """Add a timestamped note to the event's metadata."""
    meta = _get_metadata_or_404(mongo, event_id)
    if "notes_history" not in meta or meta["notes_history"] is None:
        meta["notes_history"] = []

    note = {
        "text": data.text,
        "author": data.author or "Sistema",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    meta["notes_history"].append(note)
    update_timestamp(meta)
    mongo[METADATA_COLLECTION].replace_one({"event_id": event_id}, meta)
    updated = mongo[METADATA_COLLECTION].find_one({"event_id": event_id})
    return EventMetadataResponse(**serialize_doc(updated))


@router.post("/{event_id}/metadata/photos", response_model=EventMetadataResponse)
def add_event_photo(
    event_id: int,
    data: MetadataAddPhoto,
    mongo: MongoDatabase = Depends(get_mongodb),
):
    """Add a photo URL to the event's metadata."""
    meta = _get_metadata_or_404(mongo, event_id)
    if "photos" not in meta or meta["photos"] is None:
        meta["photos"] = []

    photo_entry = {
        "url": data.url,
        "caption": data.caption or "",
        "added_at": datetime.now(timezone.utc).isoformat(),
    }
    meta["photos"].append(photo_entry)
    update_timestamp(meta)
    mongo[METADATA_COLLECTION].replace_one({"event_id": event_id}, meta)
    updated = mongo[METADATA_COLLECTION].find_one({"event_id": event_id})
    return EventMetadataResponse(**serialize_doc(updated))


@router.delete("/{event_id}/metadata", status_code=204)
def delete_event_metadata(
    event_id: int,
    mongo: MongoDatabase = Depends(get_mongodb),
    db: Session = Depends(get_db),
):
    """Delete the event's flexible metadata from MongoDB."""
    meta = _get_metadata_or_404(mongo, event_id)
    mongo[METADATA_COLLECTION].delete_one({"event_id": event_id})

    # Remove metadata_id link from PostgreSQL
    repo = CalendarEventRepository(db)
    event = repo.get_by_id(event_id)
    if event:
        event.metadata_id = None
        db.commit()
