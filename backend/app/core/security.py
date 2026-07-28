"""OKUMA OS - Security & Authentication
JWT token handling and password hashing utilities."""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token security scheme
security = HTTPBearer()


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt.

    Args:
        password: Plain-text password.

    Returns:
        str: Bcrypt hashed password.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash.

    Args:
        plain_password: Plain-text password to verify.
        hashed_password: Bcrypt hashed password.

    Returns:
        bool: True if password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token.

    Args:
        data: Claims to embed in the token (must include 'sub').
        expires_delta: Optional custom expiration time.

    Returns:
        str: Encoded JWT token.

    Se JWT_EXPIRATION_MINUTES for 0 ou None, o token não terá expiração (vitalício).
    """
    to_encode = data.copy()
    
    # Só adiciona exp se houver um tempo de expiração configurado
    expiry_minutes = expires_delta or settings.JWT_EXPIRATION_MINUTES
    if expiry_minutes:
        if isinstance(expiry_minutes, timedelta):
            expire = datetime.now(timezone.utc) + expiry_minutes
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=expiry_minutes)
        to_encode.update({"exp": expire})
    
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token.

    Args:
        token: JWT token string.

    Returns:
        Optional[dict]: Decoded claims if valid, None otherwise.
    """
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> dict:
    """Dependency that extracts and validates the current authenticated user.

    Args:
        credentials: Bearer token from Authorization header.
        db: Database session.

    Returns:
        dict: Current user information.

    Raises:
        HTTPException: 401 if token is invalid or user not found.
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify user exists in database
    from app.core.auth_module import User
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado ou inativo",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"email": user.email, "id": user.id, "name": user.name, "role": user.role}
