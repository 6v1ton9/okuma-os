"""OKUMA OS - Machines Module Repository
Data access layer for machine model and customer machine CRUD."""

from typing import Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.modules.machines.models import MachineModel, CustomerMachine
from app.modules.clients.models import Client


class MachineModelRepository:
    """Repository for Machine Model catalog operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> MachineModel:
        machine = MachineModel(**data)
        self.db.add(machine)
        self.db.commit()
        self.db.refresh(machine)
        return machine

    def get_by_id(self, model_id: int) -> Optional[MachineModel]:
        return self.db.query(MachineModel).filter(MachineModel.id == model_id).first()

    def get_by_model_number(self, model: str) -> Optional[MachineModel]:
        return self.db.query(MachineModel).filter(MachineModel.model == model).first()

    def list_all(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        sort_by: str = "model",
        sort_order: str = "asc",
    ) -> tuple[list[MachineModel], int]:
        query = self.db.query(MachineModel)

        if search:
            search_filter = or_(
                MachineModel.name.ilike(f"%{search}%"),
                MachineModel.model.ilike(f"%{search}%"),
                MachineModel.line.ilike(f"%{search}%"),
            )
            query = query.filter(search_filter)

        sort_col = getattr(MachineModel, sort_by, MachineModel.model)
        sort_col = sort_col.desc() if sort_order == "desc" else sort_col.asc()

        total = query.count()
        items = query.order_by(sort_col).offset(skip).limit(limit).all()
        return items, total

    def update(self, model_id: int, data: dict) -> Optional[MachineModel]:
        machine = self.get_by_id(model_id)
        if not machine:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(machine, key, value)
        self.db.commit()
        self.db.refresh(machine)
        return machine

    def delete(self, model_id: int) -> bool:
        machine = self.get_by_id(model_id)
        if not machine:
            return False
        machine.active = False
        self.db.commit()
        return True

    def get_active_count(self) -> int:
        return self.db.query(MachineModel).filter(MachineModel.active == True).count()


class CustomerMachineRepository:
    """Repository for Customer Machine operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> CustomerMachine:
        machine = CustomerMachine(**data)
        self.db.add(machine)
        self.db.commit()
        self.db.refresh(machine)
        return machine

    def get_by_id(self, cm_id: int) -> Optional[CustomerMachine]:
        return (
            self.db.query(CustomerMachine)
            .options(
                joinedload(CustomerMachine.client),
                joinedload(CustomerMachine.machine_model),
            )
            .filter(CustomerMachine.id == cm_id)
            .first()
        )

    def get_by_serial(self, serial: str) -> Optional[CustomerMachine]:
        return (
            self.db.query(CustomerMachine)
            .filter(CustomerMachine.serial_number == serial)
            .first()
        )

    def list_all(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        client_id: Optional[int] = None,
        status: Optional[str] = None,
        sort_by: str = "numero_serie",
        sort_order: str = "asc",
    ) -> tuple[list[CustomerMachine], int]:
        query = self.db.query(CustomerMachine).options(
            joinedload(CustomerMachine.client),
            joinedload(CustomerMachine.machine_model),
        )

        if search:
            search_filter = or_(
                CustomerMachine.serial_number.ilike(f"%{search}%"),
                CustomerMachine.location.ilike(f"%{search}%"),
            )
            query = query.filter(search_filter)

        if client_id:
            query = query.filter(CustomerMachine.client_id == client_id)
        if status:
            query = query.filter(CustomerMachine.status == status)

        sort_col = getattr(CustomerMachine, sort_by, CustomerMachine.serial_number)
        sort_col = sort_col.desc() if sort_order == "desc" else sort_col.asc()

        total = query.count()
        items = query.order_by(sort_col).offset(skip).limit(limit).all()
        return items, total

    def update(self, cm_id: int, data: dict) -> Optional[CustomerMachine]:
        machine = self.db.query(CustomerMachine).filter(CustomerMachine.id == cm_id).first()
        if not machine:
            return None
        for key, value in data.items():
            if value is not None:
                setattr(machine, key, value)
        self.db.commit()
        self.db.refresh(machine)
        return machine

    def delete(self, cm_id: int) -> bool:
        machine = self.db.query(CustomerMachine).filter(CustomerMachine.id == cm_id).first()
        if not machine:
            return False
        machine.active = False
        self.db.commit()
        return True

    def get_active_count(self) -> int:
        return self.db.query(CustomerMachine).filter(CustomerMachine.active == True).count()
