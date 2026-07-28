"""OKUMA OS - Alembic Environment Configuration
Auto-detects and imports all SQLAlchemy models for migration generation."""

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Add backend dir to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Alembic config object
config = context.config

# Set SQLAlchemy URL from environment
section = config.config_ini_section
if "DATABASE_URL" in os.environ:
    config.set_section_option(section, "sqlalchemy.url", os.environ["DATABASE_URL"])

# Configure logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import all models so Alembic can detect them
from app.core.database import Base

# Import all module models for auto-detection
from app.modules.clients.models import Client
from app.modules.machines.models import MachineModel, CustomerMachine
from app.modules.technicians.models import Technician, Exam, Training
from app.modules.calendar.models import CalendarEvent, event_technicians

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (emit SQL without connecting)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (connect to DB and execute)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
