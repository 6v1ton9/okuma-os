"""OKUMA OS - Technicians Module Repository
Data access layer for technicians, exams, and trainings."""

from typing import Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.modules.technicians.models import Technician, Exam, Training


class TechnicianRepository:
    """Repository for Technician CRUD operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> Technician:
        tech = Technician(**data)
        self.db.add(tech)
        self.db.commit()
        self.db.refresh(tech)
        return tech

    def get_by_id(self, tech_id: int) -> Optional[Technician]:
        return (
            self.db.query(Technician)
            .options(
                joinedload(Technician.exams),
                joinedload(Technician.trainings),
            )
            .filter(Technician.id == tech_id)
            .first()
        )

    def get_by_cpf(self, cpf: str) -> Optional[Technician]:
        return self.db.query(Technician).filter(Technician.cpf == cpf).first()

    def list_all(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "name",
        sort_order: str = "asc",
    ) -> tuple[list[Technician], int]:
        query = self.db.query(Technician)

        if search:
            search_filter = or_(
                Technician.name.ilike(f"%{search}%"),
                Technician.cpf.ilike(f"%{search}%"),
                Technician.email.ilike(f"%{search}%"),
                Technician.role.ilike(f"%{search}%"),
            )
            query = query.filter(search_filter)

        if status:
            query = query.filter(Technician.status == status)

        sort_col = getattr(Technician, sort_by, Technician.name)
        sort_col = sort_col.desc() if sort_order == "desc" else sort_col.asc()

        total = query.count()
        items = query.order_by(sort_col).offset(skip).limit(limit).all()
        return items, total

    def update(self, tech_id: int, data: dict) -> Optional[Technician]:
        tech = self.db.query(Technician).filter(Technician.id == tech_id).first()
        if not tech:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(tech, key, value)
        self.db.commit()
        self.db.refresh(tech)
        return tech

    def delete(self, tech_id: int) -> bool:
        tech = self.db.query(Technician).filter(Technician.id == tech_id).first()
        if not tech:
            return False
        tech.active = False
        tech.status = "inactive"
        self.db.commit()
        return True

    def get_active_technicians(self) -> list[Technician]:
        """Get all active technicians (for calendar assignment)."""
        return (
            self.db.query(Technician)
            .filter(Technician.active == True, Technician.status == "active")
            .order_by(Technician.name)
            .all()
        )

    def get_active_count(self) -> int:
        return self.db.query(Technician).filter(Technician.active == True).count()


class ExamRepository:
    """Repository for Exam CRUD."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> Exam:
        exam = Exam(**data)
        self.db.add(exam)
        self.db.commit()
        self.db.refresh(exam)
        return exam

    def update(self, exam_id: int, data: dict) -> Optional[Exam]:
        exam = self.db.query(Exam).filter(Exam.id == exam_id).first()
        if not exam:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(exam, key, value)
        self.db.commit()
        self.db.refresh(exam)
        return exam

    def delete(self, exam_id: int) -> bool:
        exam = self.db.query(Exam).filter(Exam.id == exam_id).first()
        if not exam:
            return False
        self.db.delete(exam)
        self.db.commit()
        return True


class TrainingRepository:
    """Repository for Training CRUD."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> Training:
        training = Training(**data)
        self.db.add(training)
        self.db.commit()
        self.db.refresh(training)
        return training

    def update(self, training_id: int, data: dict) -> Optional[Training]:
        training = self.db.query(Training).filter(Training.id == training_id).first()
        if not training:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(training, key, value)
        self.db.commit()
        self.db.refresh(training)
        return training

    def delete(self, training_id: int) -> bool:
        training = self.db.query(Training).filter(Training.id == training_id).first()
        if not training:
            return False
        self.db.delete(training)
        self.db.commit()
        return True
