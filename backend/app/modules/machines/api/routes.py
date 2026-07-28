"""OKUMA OS - Machines Module API Routes
RESTful endpoints for machine models and customer machines."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.machines.schemas.schemas import (
    MachineModelCreate,
    MachineModelUpdate,
    MachineModelResponse,
    CustomerMachineCreate,
    CustomerMachineUpdate,
    CustomerMachineResponse,
    CustomerMachineDetail,
)
from app.modules.machines.repository.repository import (
    MachineModelRepository,
    CustomerMachineRepository,
)

router = APIRouter(
    prefix="/api/v1/machines",
    tags=["Máquinas"],
    dependencies=[Depends(get_current_user)],
)


# =============================================================================
# Machine Model Endpoints (Catalog)
# =============================================================================

@router.get("/models", response_model=dict)
def list_machine_models(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    sort_by: str = Query("model"),
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    """List machine models with pagination."""
    repo = MachineModelRepository(db)
    skip = (page - 1) * page_size
    items, total = repo.list_all(
        skip=skip, limit=page_size, search=search,
        sort_by=sort_by, sort_order=sort_order,
    )
    return {
        "items": [MachineModelResponse.model_validate(m) for m in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/models/{model_id}", response_model=MachineModelResponse)
def get_machine_model(model_id: int, db: Session = Depends(get_db)):
    repo = MachineModelRepository(db)
    machine = repo.get_by_id(model_id)
    if not machine:
        raise HTTPException(status_code=404, detail="Modelo não encontrado")
    return MachineModelResponse.model_validate(machine)


@router.post("/models", response_model=MachineModelResponse, status_code=201)
def create_machine_model(data: MachineModelCreate, db: Session = Depends(get_db)):
    repo = MachineModelRepository(db)
    machine = repo.create(data.model_dump())
    return MachineModelResponse.model_validate(machine)


@router.put("/models/{model_id}", response_model=MachineModelResponse)
def update_machine_model(model_id: int, data: MachineModelUpdate, db: Session = Depends(get_db)):
    repo = MachineModelRepository(db)
    machine = repo.update(model_id, data.model_dump(exclude_unset=True))
    if not machine:
        raise HTTPException(status_code=404, detail="Modelo não encontrado")
    return MachineModelResponse.model_validate(machine)


@router.delete("/models/{model_id}", status_code=204)
def delete_machine_model(model_id: int, db: Session = Depends(get_db)):
    repo = MachineModelRepository(db)
    if not repo.delete(model_id):
        raise HTTPException(status_code=404, detail="Modelo não encontrado")


# =============================================================================
# Customer Machine Endpoints
# =============================================================================

@router.get("/customer", response_model=dict)
def list_customer_machines(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    client_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: str = Query("numero_serie"),
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    """List customer machines with pagination and filters."""
    repo = CustomerMachineRepository(db)
    skip = (page - 1) * page_size
    items, total = repo.list_all(
        skip=skip, limit=page_size, search=search,
        client_id=client_id, status=status,
        sort_by=sort_by, sort_order=sort_order,
    )
    response_items = []
    for m in items:
        detail = CustomerMachineDetail(
            id=m.id,
            client_id=m.client_id,
            machine_model_id=m.machine_model_id,
            serial_number=m.serial_number,
            year=m.year,
            installation_date=m.installation_date,
            location=m.location,
            notes=m.notes,
            status=m.status,
            created_at=m.created_at,
            updated_at=m.updated_at,
            active=m.active,
            client_name=m.client.company_name if m.client else None,
            machine_model_name=m.machine_model.name if m.machine_model else None,
            machine_model_model=m.machine_model.model if m.machine_model else None,
        )
        response_items.append(detail)

    return {
        "items": [r.model_dump() for r in response_items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/customer/{machine_id}", response_model=CustomerMachineDetail)
def get_customer_machine(machine_id: int, db: Session = Depends(get_db)):
    repo = CustomerMachineRepository(db)
    machine = repo.get_by_id(machine_id)
    if not machine:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    return CustomerMachineDetail(
        id=machine.id,
        client_id=machine.client_id,
        machine_model_id=machine.machine_model_id,
        serial_number=machine.serial_number,
        year=machine.year,
        installation_date=machine.installation_date,
        location=machine.location,
        notes=machine.notes,
        status=machine.status,
        created_at=machine.created_at,
        updated_at=machine.updated_at,
        active=machine.active,
        client_name=machine.client.company_name if machine.client else None,
        machine_model_name=machine.machine_model.name if machine.machine_model else None,
        machine_model_model=machine.machine_model.model if machine.machine_model else None,
    )


@router.post("/customer", response_model=CustomerMachineResponse, status_code=201)
def create_customer_machine(data: CustomerMachineCreate, db: Session = Depends(get_db)):
    repo = CustomerMachineRepository(db)
    machine = repo.create(data.model_dump())
    return CustomerMachineResponse.model_validate(machine)


@router.put("/customer/{machine_id}", response_model=CustomerMachineResponse)
def update_customer_machine(machine_id: int, data: CustomerMachineUpdate, db: Session = Depends(get_db)):
    repo = CustomerMachineRepository(db)
    machine = repo.update(machine_id, data.model_dump(exclude_unset=True))
    if not machine:
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
    return CustomerMachineResponse.model_validate(machine)


@router.delete("/customer/{machine_id}", status_code=204)
def delete_customer_machine(machine_id: int, db: Session = Depends(get_db)):
    repo = CustomerMachineRepository(db)
    if not repo.delete(machine_id):
        raise HTTPException(status_code=404, detail="Máquina não encontrada")
