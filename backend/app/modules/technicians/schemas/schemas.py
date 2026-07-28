"""OKUMA OS - Technicians Module Schemas
Pydantic models for technicians, exams, and trainings."""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, constr


# =============================================================================
# Exam Schemas
# =============================================================================

class ExamBase(BaseModel):
    """Base schema for technician exams."""
    name: constr(max_length=255)
    date: Optional[date] = None
    expiration_date: Optional[date] = None
    notes: Optional[str] = None


class ExamCreate(ExamBase):
    """Schema for creating a new exam."""
    technician_id: int


class ExamUpdate(BaseModel):
    """Schema for updating an exam. All fields optional."""
    name: Optional[constr(max_length=255)] = None
    date: Optional[date] = None
    expiration_date: Optional[date] = None
    notes: Optional[str] = None


class ExamResponse(ExamBase):
    """Schema for exam API responses."""
    id: int
    technician_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Training Schemas
# =============================================================================

class TrainingBase(BaseModel):
    """Base schema for technician trainings."""
    name: constr(max_length=255)
    workload: Optional[int] = None
    date: Optional[date] = None
    expiration_date: Optional[date] = None
    notes: Optional[str] = None


class TrainingCreate(TrainingBase):
    """Schema for creating a new training."""
    technician_id: int


class TrainingUpdate(BaseModel):
    """Schema for updating a training. All fields optional."""
    name: Optional[constr(max_length=255)] = None
    workload: Optional[int] = None
    date: Optional[date] = None
    expiration_date: Optional[date] = None
    notes: Optional[str] = None


class TrainingResponse(TrainingBase):
    """Schema for training API responses."""
    id: int
    technician_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Technician Schemas
# =============================================================================

class TechnicianBase(BaseModel):
    """Base schema for technician registration."""
    name: constr(max_length=255)
    cpf: constr(max_length=14)
    rg: Optional[constr(max_length=20)] = None
    birth_date: Optional[date] = None
    phone: Optional[constr(max_length=20)] = None
    email: Optional[constr(max_length=255)] = None
    role: Optional[constr(max_length=100)] = None
    status: constr(max_length=20) = "active"


class TechnicianCreate(TechnicianBase):
    """Schema for creating a new technician."""
    pass


class TechnicianUpdate(BaseModel):
    """Schema for updating a technician. All fields optional."""
    name: Optional[constr(max_length=255)] = None
    cpf: Optional[constr(max_length=14)] = None
    rg: Optional[constr(max_length=20)] = None
    birth_date: Optional[date] = None
    phone: Optional[constr(max_length=20)] = None
    email: Optional[constr(max_length=255)] = None
    role: Optional[constr(max_length=100)] = None
    status: Optional[constr(max_length=20)] = None


class TechnicianResponse(TechnicianBase):
    """Schema for technician API responses."""
    id: int
    created_at: datetime
    updated_at: datetime
    active: bool

    model_config = ConfigDict(from_attributes=True)


class TechnicianDetail(TechnicianResponse):
    """Detailed technician response with exams and trainings included."""
    exams: list[ExamResponse] = []
    trainings: list[TrainingResponse] = []


class TechnicianListResponse(BaseModel):
    """Paginated technician list response."""
    items: list[TechnicianResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
