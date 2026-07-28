"""OKUMA OS - Clients Module Schemas
Pydantic models for client API request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, constr


class ClientBase(BaseModel):
    """Base client schema with shared fields."""
    company_name: constr(max_length=255)
    trade_name: constr(max_length=255)
    cnpj: constr(max_length=18)
    state_registration: Optional[constr(max_length=20)] = None
    phone: Optional[constr(max_length=20)] = None
    email: Optional[EmailStr] = None
    contact: Optional[constr(max_length=255)] = None
    address: Optional[constr(max_length=255)] = None
    city: Optional[constr(max_length=100)] = None
    state: Optional[constr(max_length=2)] = None
    zip_code: Optional[constr(max_length=10)] = None
    notes: Optional[str] = None
    status: constr(max_length=20) = "active"


class ClientCreate(ClientBase):
    """Schema for creating a new client."""
    pass


class ClientUpdate(BaseModel):
    """Schema for updating a client. All fields are optional for partial updates."""
    company_name: Optional[constr(max_length=255)] = None
    trade_name: Optional[constr(max_length=255)] = None
    cnpj: Optional[constr(max_length=18)] = None
    state_registration: Optional[constr(max_length=20)] = None
    phone: Optional[constr(max_length=20)] = None
    email: Optional[EmailStr] = None
    contact: Optional[constr(max_length=255)] = None
    address: Optional[constr(max_length=255)] = None
    city: Optional[constr(max_length=100)] = None
    state: Optional[constr(max_length=2)] = None
    zip_code: Optional[constr(max_length=10)] = None
    notes: Optional[str] = None
    status: Optional[constr(max_length=20)] = None


class ClientResponse(ClientBase):
    """Schema for client API responses."""
    id: int
    created_at: datetime
    updated_at: datetime
    active: bool

    model_config = ConfigDict(from_attributes=True)


class ClientListResponse(BaseModel):
    """Schema for paginated client list responses."""
    items: list[ClientResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
