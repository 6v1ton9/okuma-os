"""OKUMA OS - Calendar MongoDB Models
Flexible event metadata stored in MongoDB for dynamic fields.

The calendar_events table in PostgreSQL stores structured data (dates,
status, relationships). The corresponding MongoDB document stores
everything else — parts, checklists, photos, custom fields, etc."""

from datetime import datetime, timezone
from typing import Any, Optional
from bson import ObjectId

# =============================================================================
# Collection name
# =============================================================================
METADATA_COLLECTION = "event_metadata"

# =============================================================================
# Helper: serialize ObjectId for JSON responses
# =============================================================================


def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-safe dict, transforming ObjectId."""
    if doc is None:
        return None
    serialized = {}
    for key, value in doc.items():
        if key == "_id":
            serialized["id"] = str(value)
        elif isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()
        elif isinstance(value, list):
            serialized[key] = [
                serialize_doc(item) if isinstance(item, dict) else item
                for item in value
            ]
        elif isinstance(value, dict):
            serialized[key] = serialize_doc(value)
        else:
            serialized[key] = value
    return serialized


# =============================================================================
# Document Structure (no ORM — MongoDB is schemaless by design)
# The following is a reference structure for the event_metadata collection.
# Each document is attached to a calendar_events row via event_id.
#
# Reference shape:
#
# {
#   "_id": ObjectId,
#   "event_id": 1,                    # FK to PostgreSQL calendar_events.id
#   "service_type": "manutencao",     # Tipo de serviço
#   "parts_replaced": [               # Peças substituídas
#       {"name": "Rolamento", "qty": 2, "cost": 450.00},
#       {"name": "Selo Mecânico", "qty": 1, "cost": 320.00}
#   ],
#   "checklist": [                    # Checklist de serviço
#       {"item": "Verificar nível de óleo", "completed": True},
#       {"item": "Calibrar eixos", "completed": False},
#       {"item": "Testar funcionamento", "completed": True}
#   ],
#   "photos": ["url1", "url2"],       # Fotos do serviço (URLs)
#   "signature_url": "url",           # Assinatura digital
#   "machine_readings": {             # Leituras da máquina
#       "horas_trabalhadas": 1250,
#       "ciclos_realizados": 45200
#   },
#   "custom_fields": {                # Campos totalmente dinâmicos
#       "nota_fiscal": "NF-12345",
#       "autorizado_por": "Carlos Silva",
#       "garantia": True
#   },
#   "created_at": "2026-07-28T10:00:00",
#   "updated_at": "2026-07-28T14:30:00"
# }
# =============================================================================


def create_default_metadata(event_id: int) -> dict:
    """Create a default metadata document for a new event."""
    now = datetime.now(timezone.utc)
    return {
        "event_id": event_id,
        "service_type": None,
        "parts_replaced": [],
        "checklist": [],
        "photos": [],
        "signature_url": None,
        "machine_readings": {},
        "custom_fields": {},
        "notes_history": [],
        "created_at": now,
        "updated_at": now,
    }


def update_timestamp(doc: dict) -> dict:
    """Update the updated_at timestamp and return the doc."""
    doc["updated_at"] = datetime.now(timezone.utc)
    return doc
