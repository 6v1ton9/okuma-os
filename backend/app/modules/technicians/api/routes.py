"""OKUMA OS - Technicians Module API Routes
RESTful endpoints for technicians, exams, and trainings."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.technicians.schemas.schemas import (
    TechnicianCreate,
    TechnicianUpdate,
    TechnicianResponse,
    TechnicianDetail,
    ExamCreate,
    ExamUpdate,
    ExamResponse,
    TrainingCreate,
    TrainingUpdate,
    TrainingResponse,
)
from app.modules.technicians.repository.repository import (
    TechnicianRepository,
    ExamRepository,
    TrainingRepository,
)

router = APIRouter(
    prefix="/api/v1/technicians",
    tags=["Técnicos"],
    dependencies=[Depends(get_current_user)],
)


# =============================================================================
# Technician Endpoints
# =============================================================================

@router.get("/", response_model=dict)
def list_technicians(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: str = Query("name"),
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    """List technicians with pagination."""
    repo = TechnicianRepository(db)
    skip = (page - 1) * page_size
    items, total = repo.list_all(
        skip=skip, limit=page_size, search=search,
        status=status, sort_by=sort_by, sort_order=sort_order,
    )
    return {
        "items": [TechnicianResponse.model_validate(t) for t in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/{tech_id}", response_model=TechnicianDetail)
def get_technician(tech_id: int, db: Session = Depends(get_db)):
    repo = TechnicianRepository(db)
    tech = repo.get_by_id(tech_id)
    if not tech:
        raise HTTPException(status_code=404, detail="Técnico não encontrado")
    return TechnicianDetail(
        id=tech.id,
        name=tech.name,
        cpf=tech.cpf,
        rg=tech.rg,
        birth_date=tech.birth_date,
        phone=tech.phone,
        email=tech.email,
        role=tech.role,
        status=tech.status,
        created_at=tech.created_at,
        updated_at=tech.updated_at,
        active=tech.active,
        exams=[ExamResponse.model_validate(e) for e in (tech.exams or [])],
        trainings=[TrainingResponse.model_validate(t) for t in (tech.trainings or [])],
    )


@router.get("/active/list", response_model=list[TechnicianResponse])
def list_active_technicians(db: Session = Depends(get_db)):
    """List all active technicians (for calendar dropdowns)."""
    repo = TechnicianRepository(db)
    techs = repo.get_active_technicians()
    return [TechnicianResponse.model_validate(t) for t in techs]


@router.post("/", response_model=TechnicianResponse, status_code=201)
def create_technician(data: TechnicianCreate, db: Session = Depends(get_db)):
    repo = TechnicianRepository(db)
    existing = repo.get_by_cpf(data.cpf)
    if existing:
        raise HTTPException(status_code=409, detail="CPF já cadastrado")
    tech = repo.create(data.model_dump())
    return TechnicianResponse.model_validate(tech)


@router.put("/{tech_id}", response_model=TechnicianResponse)
def update_technician(tech_id: int, data: TechnicianUpdate, db: Session = Depends(get_db)):
    repo = TechnicianRepository(db)
    tech = repo.update(tech_id, data.model_dump(exclude_unset=True))
    if not tech:
        raise HTTPException(status_code=404, detail="Técnico não encontrado")
    return TechnicianResponse.model_validate(tech)


@router.delete("/{tech_id}", status_code=204)
def delete_technician(tech_id: int, db: Session = Depends(get_db)):
    repo = TechnicianRepository(db)
    if not repo.delete(tech_id):
        raise HTTPException(status_code=404, detail="Técnico não encontrado")


# =============================================================================
# Exam Sub-resource Endpoints
# =============================================================================

@router.get("/{tech_id}/exams", response_model=list[ExamResponse])
def list_technician_exams(tech_id: int, db: Session = Depends(get_db)):
    tech_repo = TechnicianRepository(db)
    tech = tech_repo.get_by_id(tech_id)
    if not tech:
        raise HTTPException(status_code=404, detail="Técnico não encontrado")
    return [ExamResponse.model_validate(e) for e in (tech.exams or [])]


@router.post("/{tech_id}/exams", response_model=ExamResponse, status_code=201)
def create_technician_exam(tech_id: int, data: ExamCreate, db: Session = Depends(get_db)):
    repo = ExamRepository(db)
    exam = repo.create({"technician_id": tech_id, **data.model_dump(exclude={"technician_id"})})
    return ExamResponse.model_validate(exam)


@router.put("/{tech_id}/exams/{exam_id}", response_model=ExamResponse)
def update_technician_exam(exam_id: int, data: ExamUpdate, db: Session = Depends(get_db)):
    repo = ExamRepository(db)
    exam = repo.update(exam_id, data.model_dump(exclude_unset=True))
    if not exam:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    return ExamResponse.model_validate(exam)


@router.delete("/{tech_id}/exams/{exam_id}", status_code=204)
def delete_technician_exam(exam_id: int, db: Session = Depends(get_db)):
    repo = ExamRepository(db)
    if not repo.delete(exam_id):
        raise HTTPException(status_code=404, detail="Exame não encontrado")


# =============================================================================
# Training Sub-resource Endpoints
# =============================================================================

@router.get("/{tech_id}/trainings", response_model=list[TrainingResponse])
def list_technician_trainings(tech_id: int, db: Session = Depends(get_db)):
    tech_repo = TechnicianRepository(db)
    tech = tech_repo.get_by_id(tech_id)
    if not tech:
        raise HTTPException(status_code=404, detail="Técnico não encontrado")
    return [TrainingResponse.model_validate(t) for t in (tech.trainings or [])]


@router.post("/{tech_id}/trainings", response_model=TrainingResponse, status_code=201)
def create_technician_training(tech_id: int, data: TrainingCreate, db: Session = Depends(get_db)):
    repo = TrainingRepository(db)
    training = repo.create({"technician_id": tech_id, **data.model_dump(exclude={"technician_id"})})
    return TrainingResponse.model_validate(training)


@router.put("/{tech_id}/trainings/{training_id}", response_model=TrainingResponse)
def update_technician_training(training_id: int, data: TrainingUpdate, db: Session = Depends(get_db)):
    repo = TrainingRepository(db)
    training = repo.update(training_id, data.model_dump(exclude_unset=True))
    if not training:
        raise HTTPException(status_code=404, detail="Treinamento não encontrado")
    return TrainingResponse.model_validate(training)


@router.delete("/{tech_id}/trainings/{training_id}", status_code=204)
def delete_technician_training(training_id: int, db: Session = Depends(get_db)):
    repo = TrainingRepository(db)
    if not repo.delete(training_id):
        raise HTTPException(status_code=404, detail="Treinamento não encontrado")
