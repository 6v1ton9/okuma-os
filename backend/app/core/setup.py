"""OKUMA OS - Database Setup
Creates default super admin user on first run with proper password hashing."""

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.auth_module import User
from app.core.security import hash_password


def ensure_admin_user():
    """Create default super admin user if it doesn't exist.
    
    Features:
    - Generates proper bcrypt hash via Python (not pre-computed SQL)
    - Sets must_change_password=True so admin is forced to change on first login
    - Logs credentials to console for initial access
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
            role="super_admin",
            must_change_password=True,  # 🔥 Força troca de senha no primeiro login!
        )
        db.add(admin)
        db.commit()
        print("[OKUMA] Super admin user created")
        print("[OKUMA]   Email: admin@okuma.com.br")
        print("[OKUMA]   Senha: admin123")
        print("[OKUMA]   ⚠️  Altere a senha no primeiro login!")
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
