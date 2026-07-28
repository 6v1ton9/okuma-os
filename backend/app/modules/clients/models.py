"""OKUMA OS - Clients Module Models
SQLAlchemy models for enterprise (client) registration."""

from sqlalchemy import Column, Integer, String, Text
from app.core.models import BaseModel, ActivableMixin


class Client(BaseModel, ActivableMixin):
    """Enterprise client registration.
    
    Stores complete company information including tax IDs and contact details.
    """
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column("razao_social", String(255), nullable=False, index=True)
    trade_name = Column("nome_fantasia", String(255), nullable=False)
    cnpj = Column(String(18), unique=True, nullable=False, index=True)
    state_registration = Column("inscricao_estadual", String(20), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    contact = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(2), nullable=True)
    zip_code = Column("cep", String(10), nullable=True)
    notes = Column("observacoes", Text, nullable=True)
    status = Column(String(20), default="active", nullable=False)

    def __repr__(self) -> str:
        return f"<Client(id={self.id}, company='{self.company_name}')>"
