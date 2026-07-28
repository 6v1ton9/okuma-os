"""OKUMA OS - Machines Module Models
Two entities: MachineModel (catalog) and CustomerMachine (client units)."""

from sqlalchemy import Column, Integer, String, Text, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.models import BaseModel, ActivableMixin


class MachineModel(BaseModel, ActivableMixin):
    """Machine model catalog entry.
    
    Represents an official machine model from the manufacturer's catalog.
    Contains technical specifications and dimensions.
    """
    __tablename__ = "machine_models"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    model = Column(String(255), nullable=False, index=True)
    line = Column(String(255), nullable=True)
    controller = Column(String(255), nullable=True)
    weight = Column(Float, nullable=True)
    travel_x = Column("curso_x", Float, nullable=True)
    travel_y = Column("curso_y", Float, nullable=True)
    travel_z = Column("curso_z", Float, nullable=True)
    power = Column("potencia", Float, nullable=True)
    tech_specs = Column("especificacoes_tecnicas", Text, nullable=True)
    notes = Column("observacoes", Text, nullable=True)

    # Relationship: one model can have many customer machines
    customer_machines = relationship("CustomerMachine", back_populates="machine_model")

    def __repr__(self) -> str:
        return f"<MachineModel(id={self.id}, model='{self.model}')>"


class CustomerMachine(BaseModel, ActivableMixin):
    """A specific machine unit installed at a client site.
    
    Links a client to a machine model with serial number and location info.
    """
    __tablename__ = "customer_machines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False, index=True)
    machine_model_id = Column(
        Integer, ForeignKey("machine_models.id"), nullable=False, index=True
    )
    serial_number = Column("numero_serie", String(100), unique=True, nullable=False)
    year = Column(Integer, nullable=True)
    installation_date = Column("data_instalacao", Date, nullable=True)
    location = Column("localizacao", String(255), nullable=True)
    notes = Column("observacoes", Text, nullable=True)
    status = Column(String(20), default="active", nullable=False)

    # Relationships
    client = relationship("Client")
    machine_model = relationship("MachineModel", back_populates="customer_machines")

    def __repr__(self) -> str:
        return (
            f"<CustomerMachine(id={self.id}, serial='{self.serial_number}')>"
        )
