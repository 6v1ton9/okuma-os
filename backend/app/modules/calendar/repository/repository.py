"""OKUMA OS - Calendar Module Repository
Hybrid data access: PostgreSQL for structured data + MongoDB for flexible metadata."""

from datetime import date, datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_

from app.modules.calendar.models import CalendarEvent
from app.modules.calendar.mongodb_models import (
    METADATA_COLLECTION,
    create_default_metadata,
    update_timestamp,
    serialize_doc,
)
from bson.objectid import ObjectId
from app.core.mongodb import MongoDBManager


class CalendarEventRepository:
    """Repository for CalendarEvent CRUD and spreadsheet view.
    
    Operates on TWO databases:
    - PostgreSQL: calendar_events table (structured data)
    - MongoDB:    event_metadata collection (flexible fields)
    """

    def __init__(self, db: Session):
        self.db = db
        try:
            self.mongo = MongoDBManager.get_db()
        except Exception:
            self.mongo = None

    def _get_metadata_collection(self):
        """Get the MongoDB metadata collection, or None if unavailable."""
        if self.mongo is None:
            return None
        return self.mongo[METADATA_COLLECTION]

    def _attach_metadata(self, event: CalendarEvent) -> dict:
        """Convert ORM event to dict and attach MongoDB metadata if present."""
        result = {
            "id": event.id,
            "client_id": event.client_id,
            "customer_machine_id": event.customer_machine_id,
            "description": event.description,
            "start_datetime": event.start_datetime,
            "end_datetime": event.end_datetime,
            "status": event.status,
            "notes": event.notes,
            "city": event.city,
            "metadata_id": event.metadata_id,
            "created_at": event.created_at,
            "updated_at": event.updated_at,
            "active": event.active,
            "client_name": event.client.company_name if event.client else None,
            "client_city": event.client.city if event.client else None,
            "serial_number": (
                event.customer_machine.serial_number
                if event.customer_machine else None
            ),
            "technician_ids": [t.id for t in (event.technicians or [])],
            "technician_names": [t.name for t in (event.technicians or [])],
        }

        # Attach MongoDB metadata
        if event.metadata_id and self.mongo is not None:
            try:
                meta = self._get_metadata_collection().find_one(
                    {"_id": ObjectId(event.metadata_id)}
                )
                if meta:
                    result["metadata"] = serialize_doc(meta)
            except Exception:
                result["metadata"] = None
        else:
            result["metadata"] = None

        # Standardize datetime objects to ISO strings for consistent JSON serialization
        for field in ["start_datetime", "end_datetime", "created_at", "updated_at"]:
            if isinstance(result.get(field), datetime):
                result[field] = result[field].isoformat()

        return result

    def create(self, data: dict) -> CalendarEvent:
        """Create a calendar event in PostgreSQL + optional metadata in MongoDB."""
        metadata_data = data.pop("metadata", None) or data.pop("metadata_data", None)
        tech_ids = data.pop("technician_ids", [])

        # Create PostgreSQL record
        event = CalendarEvent(**data)
        self.db.add(event)
        self.db.flush()  # Get event.id

        # Assign technicians
        if tech_ids:
            from app.modules.technicians.models import Technician
            technicians = (
                self.db.query(Technician)
                .filter(Technician.id.in_(tech_ids))
                .all()
            )
            event.technicians = technicians

        # Create MongoDB metadata if flex data provided
        if metadata_data is not None and self.mongo is not None:
            try:
                meta_doc = create_default_metadata(event.id)
                meta_doc.update(metadata_data)
                result = self._get_metadata_collection().insert_one(meta_doc)
                event.metadata_id = str(result.inserted_id)
            except Exception as exc:
                print(f"[OKUMA] Warning: MongoDB metadata not saved: {exc}")

        self.db.commit()
        self.db.refresh(event)
        return event

    def get_by_id(self, event_id: int) -> Optional[CalendarEvent]:
        return (
            self.db.query(CalendarEvent)
            .options(
                joinedload(CalendarEvent.client),
                joinedload(CalendarEvent.customer_machine),
                joinedload(CalendarEvent.technicians),
            )
            .filter(CalendarEvent.id == event_id)
            .first()
        )

    def get_with_metadata(self, event_id: int) -> Optional[dict]:
        """Get event with MongoDB metadata attached."""
        event = self.get_by_id(event_id)
        if not event:
            return None
        return self._attach_metadata(event)

    def list_all(
        self,
        skip: int = 0,
        limit: int = 20,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        status: Optional[str] = None,
        client_id: Optional[int] = None,
        technician_id: Optional[int] = None,
        search: Optional[str] = None,
        sort_by: str = "data_inicio",
        sort_order: str = "asc",
    ) -> tuple[list[CalendarEvent], int]:
        query = self.db.query(CalendarEvent).options(
            joinedload(CalendarEvent.client),
            joinedload(CalendarEvent.customer_machine),
            joinedload(CalendarEvent.technicians),
        )

        if start_date:
            query = query.filter(
                CalendarEvent.start_datetime >= datetime.combine(start_date, datetime.min.time(), tzinfo=timezone.utc)
            )
        if end_date:
            query = query.filter(
                CalendarEvent.end_datetime <= datetime.combine(end_date, datetime.max.time(), tzinfo=timezone.utc)
            )
        if status:
            query = query.filter(CalendarEvent.status == status)
        if client_id:
            query = query.filter(CalendarEvent.client_id == client_id)
        if technician_id:
            query = query.filter(
                CalendarEvent.technicians.any(id=technician_id)
            )
        if search:
            search_filter = or_(
                CalendarEvent.description.ilike(f"%{search}%"),
                CalendarEvent.city.ilike(f"%{search}%"),
            )
            query = query.filter(search_filter)

        sort_col = getattr(CalendarEvent, sort_by, CalendarEvent.start_datetime)
        sort_col = sort_col.desc() if sort_order == "desc" else sort_col.asc()

        total = query.count()
        items = query.order_by(sort_col).offset(skip).limit(limit).all()
        return items, total

    def get_spreadsheet_data(
        self,
        start_date: date,
        end_date: date,
        technician_ids: Optional[list[int]] = None,
    ) -> list[CalendarEvent]:
        """Get events within a date range, optionally filtered by technicians."""
        query = self.db.query(CalendarEvent).options(
            joinedload(CalendarEvent.client),
            joinedload(CalendarEvent.customer_machine),
            joinedload(CalendarEvent.technicians),
        ).filter(
            and_(
                CalendarEvent.start_datetime >= datetime.combine(start_date, datetime.min.time(), tzinfo=timezone.utc),
                CalendarEvent.end_datetime <= datetime.combine(end_date, datetime.max.time(), tzinfo=timezone.utc),
            )
        )

        if technician_ids:
            from app.modules.technicians.models import Technician
            query = query.filter(
                CalendarEvent.technicians.any(Technician.id.in_(technician_ids))
            )

        return query.order_by(CalendarEvent.start_datetime).all()

    def update(self, event_id: int, data: dict) -> Optional[CalendarEvent]:
        event = self.get_by_id(event_id)
        if not event:
            return None

        metadata_data = data.pop("metadata", None) or data.pop("metadata_data", None)
        tech_ids = data.pop("technician_ids", None)

        # Update PostgreSQL fields
        for key, value in data.items():
            if value is not None:
                setattr(event, key, value)

        # Update technician assignments
        if tech_ids is not None:
            from app.modules.technicians.models import Technician
            technicians = (
                self.db.query(Technician)
                .filter(Technician.id.in_(tech_ids))
                .all()
            )
            event.technicians = technicians

        # Update MongoDB metadata
        if metadata_data is not None and self.mongo is not None:
            try:
                collection = self._get_metadata_collection()

                if event.metadata_id:
                    # Update existing
                    meta_doc = collection.find_one({"_id": ObjectId(event.metadata_id)})
                    if meta_doc:
                        meta_doc.update(metadata_data)
                        update_timestamp(meta_doc)
                        collection.replace_one({"_id": ObjectId(event.metadata_id)}, meta_doc)
                else:
                    # Create new metadata document
                    meta_doc = create_default_metadata(event.id)
                    meta_doc.update(metadata_data)
                    result = collection.insert_one(meta_doc)
                    event.metadata_id = str(result.inserted_id)
            except Exception as exc:
                print(f"[OKUMA] Warning: MongoDB metadata not updated: {exc}")

        self.db.commit()
        self.db.refresh(event)
        return event

    def delete(self, event_id: int) -> bool:
        event = self.db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
        if not event:
            return False

        # Delete MongoDB metadata if present
        if event.metadata_id and self.mongo is not None:
            try:
                self._get_metadata_collection().delete_one(
                    {"_id": ObjectId(event.metadata_id)}
                )
            except Exception as exc:
                print(f"[OKUMA] Warning: MongoDB metadata not deleted: {exc}")

        event.active = False
        self.db.commit()
        return True

    def get_counts_by_status(self) -> dict[str, int]:
        """Get event counts grouped by status."""
        from sqlalchemy import func
        results = (
            self.db.query(
                CalendarEvent.status,
                func.count(CalendarEvent.id),
            )
            .filter(CalendarEvent.active == True)
            .group_by(CalendarEvent.status)
            .all()
        )
        return {status: count for status, count in results}

    def get_upcoming_count(self) -> int:
        """Get count of upcoming (pending + confirmed) events."""
        now = datetime.now(timezone.utc)
        return (
            self.db.query(CalendarEvent)
            .filter(
                CalendarEvent.start_datetime >= now,
                CalendarEvent.active == True,
            )
            .count()
        )
