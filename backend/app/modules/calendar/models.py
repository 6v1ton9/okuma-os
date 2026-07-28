"""OKUMA OS - Calendar Module Models
Event scheduling with technician assignments and status tracking."""

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Table,
)
from sqlalchemy.orm import relationship
from app.core.models import BaseModel, ActivableMixin
from app.core.database import Base

# Association table: many-to-many between events and technicians
event_technicians = Table(
    "event_technicians",
    Base.metadata,
    Column("event_id", Integer, ForeignKey("calendar_events.id"), primary_key=True),
    Column("technician_id", Integer, ForeignKey("technicians.id"), primary_key=True),
)


class CalendarEvent(BaseModel, ActivableMixin):
    """Scheduled event in the technician calendar/spreadsheet view.
    
    Each event represents a service visit at a client site.
    """
    __tablename__ = "calendar_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(
        Integer, ForeignKey("clients.id"), nullable=False, index=True
    )
    customer_machine_id = Column(
        Integer, ForeignKey("customer_machines.id"), nullable=True
    )
    description = Column(String(500), nullable=False)
    start_datetime = Column("data_inicio", DateTime(timezone=True), nullable=False)
    end_datetime = Column("data_fim", DateTime(timezone=True), nullable=False)
    status = Column(String(30), default="pending", nullable=False, index=True)
    notes = Column("observacoes", Text, nullable=True)
    city = Column(String(100), nullable=True)
    metadata_id = Column(String(50), nullable=True, index=True)

    # Relationships
    client = relationship("Client")
    customer_machine = relationship("CustomerMachine")
    technicians = relationship(
        "Technician", secondary=event_technicians, lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<CalendarEvent(id={self.id}, status='{self.status}')>"
