"""OKUMA OS - Auth Module
Authentication endpoints: login, register, and user management."""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import Session

from app.core.database import Base, get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
# =============================================================================
# User Model
# =============================================================================

class User(Base):
    """Application user account."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="admin", nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


# =============================================================================
# Schemas
# =============================================================================

class LoginRequest(BaseModel):
    """Login credentials."""
    email: str
    password: str


class LoginResponse(BaseModel):
    """Login response with access token."""
    access_token: str
    token_type: str = "bearer"
    user: dict


class RegisterRequest(BaseModel):
    """User registration data."""
    email: str
    name: str
    password: str


class UserResponse(BaseModel):
    """User data response."""
    id: int
    email: str
    name: str
    role: str
    active: bool


class AdminCreateUserRequest(BaseModel):
    """Admin creates a new user."""
    email: str
    name: str
    password: str


# =============================================================================
# Helper: check super_admin role
# =============================================================================

def require_super_admin(current_user: dict = Depends(get_current_user)):
    """Dependency that ensures the user has super_admin role."""
    if current_user.get("role") != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas Super Administradores podem acessar este recurso",
        )
    return current_user


# =============================================================================
# API Router
# =============================================================================

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticação"],
)


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha inválidos",
        )

    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo",
        )

    access_token = create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role}
    )

    return LoginResponse(
        access_token=access_token,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
        },
    )


@router.post("/register", response_model=LoginResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user and return JWT token."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email já cadastrado",
        )

    user = User(
        email=data.email,
        name=data.name,
        hashed_password=hash_password(data.password),
        role="admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(
        data={"sub": user.email, "id": user.id, "role": user.role}
    )

    return LoginResponse(
        access_token=access_token,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
        },
    )


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current authenticated user information."""
    user = db.query(User).filter(User.email == current_user.get("email")).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        active=user.active,
    )


@router.post("/logout", status_code=200)
def logout(current_user: dict = Depends(get_current_user)):
    """Logout the current user.
    
    In a JWT-based auth system, logout is handled client-side
    by discarding the token. This endpoint exists for API completeness
    and can be extended with token blacklisting.
    """
    return {"message": "Logout realizado com sucesso"}


class PasswordRecoveryRequest(BaseModel):
    """Password recovery email request."""
    email: str


@router.post("/recover-password", status_code=200)
def recover_password(data: PasswordRecoveryRequest, db: Session = Depends(get_db)):
    """Request password recovery.
    
    In production, this would send a recovery email.
    For now, returns a placeholder success message.
    """
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Don't reveal whether the email exists
        pass

    return {
        "message": "Se o email estiver cadastrado, você receberá instruções de recuperação"
    }


# =============================================================================
# Super Admin - User Management Endpoints
# =============================================================================

admin_router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Administração"],
    dependencies=[Depends(require_super_admin)],
)


@admin_router.get("/users", response_model=dict)
def list_users(
    db: Session = Depends(get_db),
):
    """List all system users (super admin only)."""
    users = db.query(User).order_by(User.name).all()
    return {
        "items": [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "role": u.role,
                "active": u.active,
            }
            for u in users
        ],
        "total": len(users),
    }


@admin_router.post("/users", response_model=UserResponse, status_code=201)
def create_user(
    data: AdminCreateUserRequest,
    db: Session = Depends(get_db),
):
    """Create a new admin user (super admin only)."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email já cadastrado",
        )

    user = User(
        email=data.email,
        name=data.name,
        hashed_password=hash_password(data.password),
        role="admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        active=user.active,
    )
