"""OKUMA OS - Clients Module API Routes
RESTful endpoints for client CRUD operations."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.clients.schemas.schemas import (
    ClientCreate,
    ClientUpdate,
    ClientResponse,
    ClientListResponse,
)
from app.modules.clients.repository.repository import ClientRepository

router = APIRouter(
    prefix="/api/v1/clients",
    tags=["Clientes"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/", response_model=ClientListResponse)
def list_clients(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    status: Optional[str] = Query(None, description="Filter by status"),
    sort_by: str = Query("razao_social", description="Sort column"),
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    """List clients with pagination, search, and filters."""
    repo = ClientRepository(db)
    skip = (page - 1) * page_size
    clients, total = repo.list_all(
        skip=skip,
        limit=page_size,
        search=search,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return ClientListResponse(
        items=[ClientResponse.model_validate(c) for c in clients],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db)):
    """Get a single client by ID."""
    repo = ClientRepository(db)
    client = repo.get_by_id(client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado",
        )
    return ClientResponse.model_validate(client)


@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(data: ClientCreate, db: Session = Depends(get_db)):
    """Create a new client."""
    repo = ClientRepository(db)

    # Check CNPJ uniqueness
    existing = repo.get_by_cnpj(data.cnpj)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="CNPJ já cadastrado",
        )

    client = repo.create(data.model_dump())
    return ClientResponse.model_validate(client)


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, data: ClientUpdate, db: Session = Depends(get_db)):
    """Update an existing client."""
    repo = ClientRepository(db)
    client = repo.update(client_id, data.model_dump(exclude_unset=True))
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado",
        )
    return ClientResponse.model_validate(client)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    """Soft-delete a client."""
    repo = ClientRepository(db)
    deleted = repo.delete(client_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado",
        )
