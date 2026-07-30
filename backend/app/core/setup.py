"""OKUMA OS - Database Setup
Creates default super admin user on first run with proper password hashing."""

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.auth_module import User
from app.core.security import hash_password


def ensure_admin_user():
    """Create default super admin user if it doesn't exist.
    
    Uses Python's bcrypt to generate a proper password hash,
    avoiding the issue of pre-computed hashes in SQL seeds.
    """
    db: Session = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "admin@okuma.com.br").first()
        if existing:
            return

        admin = User(
            email="admin@okuma.com.br",
            name="Administrador",
            hashed_password=hash_password("admin123"),
            role="super_admin",  # Primeiro usuário é super_admin
        )
        db.add(admin)
        db.commit()
        print("[OKUMA] Super admin user created (admin@okuma.com.br / admin123)")
    finally:
        db.close()


def seed_demo_data():
    """Seed optional demo data for development."""
    from app.modules.technicians.models import Technician

    db: Session = SessionLocal()
    try:
        existing = db.query(Technician).filter(Technician.cpf == "000.000.000-00").first()
        if existing:
            return

        demo_tech = Technician(
            name="Administrador",
            cpf="000.000.000-00",
            email="admin@okuma.com.br",
            role="Administrador",
            status="active",
        )
        db.add(demo_tech)
        db.commit()
        print("[OKUMA] Demo technician created")
    finally:
        db.close()
