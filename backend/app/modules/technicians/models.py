"""OKUMA OS - Technicians Module Models
Technician registration with exams and training records.
"""

from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.models import BaseModel, ActivableMixin


class Technician(BaseModel, ActivableMixin):
    """Technician registration.

    Stores personal and professional information for service technicians.
    """
    __tablename__ = "technicians"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    cpf = Column(String(14), unique=True, nullable=False, index=True)
    rg = Column(String(20), nullable=True)
    birth_date = Column("nascimento", Date, nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    role = Column("cargo", String(100), nullable=True)
    status = Column(String(20), default="active", nullable=False)

    __table_args__ = (
        Index("idx_technician_active_status", "active", "status"),
        Index("idx_technician_name_role", "name", "cargo"),
    )

    # Relationships
    exams = relationship("Exam", back_populates="technician", cascade="all, delete-orphan")
    trainings = relationship("Training", back_populates="technician", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Technician(id={self.id}, name='{self.name}')>"


class Exam(BaseModel):
    """Medical or certification exam for a technician."""
    __tablename__ = "technician_exams"

    id = Column(Integer, primary_key=True, autoincrement=True)
    technician_id = Column(
        Integer, ForeignKey("technicians.id"), nullable=False, index=True
    )
    name = Column(String(255), nullable=False)
    date = Column(Date, nullable=True)
    expiration_date = Column("validade", Date, nullable=True)
    notes = Column("observacao", Text, nullable=True)

    __table_args__ = (
        Index("idx_exam_technician_date", "technician_id", "date"),
        Index("idx_exam_expiration", "validade"),
    )

    # Relationship
    technician = relationship("Technician", back_populates="exams")

    def __repr__(self) -> str:
        return f"<Exam(id={self.id}, name='{self.name}')>"


class Training(BaseModel):
    """Training course or certification for a technician."""
    __tablename__ = "technician_trainings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    technician_id = Column(
        Integer, ForeignKey("technicians.id"), nullable=False, index=True
    )
    name = Column(String(255), nullable=False)
    workload = Column("carga_horaria", Integer, nullable=True)
    date = Column(Date, nullable=True)
    expiration_date = Column("validade", Date, nullable=True)
    notes = Column("observacao", Text, nullable=True)

    __table_args__ = (
        Index("idx_training_technician_date", "technician_id", "date"),
        Index("idx_training_expiration", "validade"),
    )

    # Relationship
    technician = relationship("Technician", back_populates="trainings")

    def __repr__(self) -> str:
        return f"<Training(id={self.id}, name='{self.name}')>"
