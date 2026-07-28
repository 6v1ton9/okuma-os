"""OKUMA OS - Clients Module Repository
Data access layer for client CRUD operations."""

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.modules.clients.models import Client


class ClientRepository:
    """Repository for Client database operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict) -> Client:
        """Create a new client record."""
        client = Client(**data)
        self.db.add(client)
        self.db.commit()
        self.db.refresh(client)
        return client

    def get_by_id(self, client_id: int) -> Optional[Client]:
        """Get a client by primary key."""
        return self.db.query(Client).filter(Client.id == client_id).first()

    def get_by_cnpj(self, cnpj: str) -> Optional[Client]:
        """Get a client by CNPJ (unique tax ID)."""
        return self.db.query(Client).filter(Client.cnpj == cnpj).first()

    def list_all(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "razao_social",
        sort_order: str = "asc",
    ) -> tuple[list[Client], int]:
        """List clients with pagination, search, and filtering.

        Args:
            skip: Number of records to skip (offset).
            limit: Maximum number of records to return.
            search: Optional search term for company name, trade name, or CNPJ.
            status: Optional status filter.
            sort_by: Column name to sort by.
            sort_order: 'asc' or 'desc'.

        Returns:
            tuple: (list of Client records, total count).
        """
        query = self.db.query(Client)

        # Search filter
        if search:
            search_filter = or_(
                Client.company_name.ilike(f"%{search}%"),
                Client.trade_name.ilike(f"%{search}%"),
                Client.cnpj.ilike(f"%{search}%"),
                Client.city.ilike(f"%{search}%"),
            )
            query = query.filter(search_filter)

        # Status filter
        if status:
            query = query.filter(Client.status == status)

        # Sort direction
        sort_column = getattr(Client, sort_by, Client.company_name)
        if sort_order == "desc":
            sort_column = sort_column.desc()
        else:
            sort_column = sort_column.asc()

        total = query.count()
        clients = query.order_by(sort_column).offset(skip).limit(limit).all()

        return clients, total

    def update(self, client_id: int, data: dict) -> Optional[Client]:
        """Update an existing client record."""
        client = self.get_by_id(client_id)
        if not client:
            return None

        for key, value in data.items():
            if value is not None:
                setattr(client, key, value)

        self.db.commit()
        self.db.refresh(client)
        return client

    def delete(self, client_id: int) -> bool:
        """Soft-delete a client by setting active=False."""
        client = self.get_by_id(client_id)
        if not client:
            return False

        client.active = False
        client.status = "inactive"
        self.db.commit()
        return True

    def get_active_count(self) -> int:
        """Get count of active clients."""
        return self.db.query(Client).filter(Client.active == True).count()

    def get_total_count(self) -> int:
        """Get total count of all clients."""
        return self.db.query(Client).count()
