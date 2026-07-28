"""OKUMA OS - Machines Module Schemas
Pydantic models for machine model and customer machine validation."""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, constr


# =============================================================================
# Machine Model Schemas (Catalog)
# =============================================================================

class MachineModelBase(BaseModel):
    """Base schema for machine model catalog entries."""
    name: constr(max_length=255)
    model: constr(max_length=255)
    line: Optional[constr(max_length=255)] = None
    controller: Optional[constr(max_length=255)] = None
    weight: Optional[float] = None
    travel_x: Optional[float] = None
    travel_y: Optional[float] = None
    travel_z: Optional[float] = None
    power: Optional[float] = None
    tech_specs: Optional[str] = None
    notes: Optional[str] = None


class MachineModelCreate(MachineModelBase):
    """Schema for creating a new machine model."""
    pass


class MachineModelUpdate(BaseModel):
    """Schema for updating a machine model. All fields optional."""
    name: Optional[constr(max_length=255)] = None
    model: Optional[constr(max_length=255)] = None
    line: Optional[constr(max_length=255)] = None
    controller: Optional[constr(max_length=255)] = None
    weight: Optional[float] = None
    travel_x: Optional[float] = None
    travel_y: Optional[float] = None
    travel_z: Optional[float] = None
    power: Optional[float] = None
    tech_specs: Optional[str] = None
    notes: Optional[str] = None


class MachineModelResponse(MachineModelBase):
    """Schema for machine model API responses."""
    id: int
    created_at: datetime
    updated_at: datetime
    active: bool

    model_config = ConfigDict(from_attributes=True)


# =============================================================================
# Customer Machine Schemas (Client Units)
# =============================================================================

class CustomerMachineBase(BaseModel):
    """Base schema for customer machine units."""
    client_id: int
    machine_model_id: int
    serial_number: constr(max_length=100)
    year: Optional[int] = None
    installation_date: Optional[date] = None
    location: Optional[constr(max_length=255)] = None
    notes: Optional[str] = None
    status: constr(max_length=20) = "active"


class CustomerMachineCreate(CustomerMachineBase):
    """Schema for creating a new customer machine."""
    pass


class CustomerMachineUpdate(BaseModel):
    """Schema for updating a customer machine. All fields optional."""
    client_id: Optional[int] = None
    machine_model_id: Optional[int] = None
    serial_number: Optional[constr(max_length=100)] = None
    year: Optional[int] = None
    installation_date: Optional[date] = None
    location: Optional[constr(max_length=255)] = None
    notes: Optional[str] = None
    status: Optional[constr(max_length=20)] = None


class CustomerMachineResponse(CustomerMachineBase):
    """Schema for customer machine API responses."""
    id: int
    created_at: datetime
    updated_at: datetime
    active: bool

    model_config = ConfigDict(from_attributes=True)


class CustomerMachineDetail(CustomerMachineResponse):
    """Detailed response with related client and model names."""
    client_name: Optional[str] = None
    machine_model_name: Optional[str] = None
    machine_model_model: Optional[str] = None


# =============================================================================
# Paginated Responses
# =============================================================================

class PaginatedResponse(BaseModel):
    """Generic paginated list response."""
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int
