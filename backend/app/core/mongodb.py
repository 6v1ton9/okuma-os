"""OKUMA OS - MongoDB Connection
Manages the MongoDB client connection for flexible document storage."""

from pymongo import MongoClient
from pymongo.database import Database
from typing import Optional

from app.core.config import settings


class MongoDBManager:
    """Singleton MongoDB client manager.
    
    Provides a single MongoClient instance for the application lifecycle.
    Connects to MongoDB for flexible document storage (event metadata,
    custom fields, service visit details, etc.)
    """

    _client: Optional[MongoClient] = None
    _db: Optional[Database] = None

    @classmethod
    def get_client(cls) -> MongoClient:
        """Get or create the MongoDB client singleton."""
        if cls._client is None:
            cls._client = MongoClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
            )
        return cls._client

    @classmethod
    def get_db(cls) -> Database:
        """Get the application database instance."""
        if cls._db is None:
            client = cls.get_client()
            cls._db = client[settings.MONGODB_DB_NAME]
        return cls._db

    @classmethod
    def close(cls):
        """Close the MongoDB connection gracefully."""
        if cls._client:
            cls._client.close()
            cls._client = None
            cls._db = None

    @classmethod
    def health_check(cls) -> bool:
        """Check if MongoDB server is reachable."""
        try:
            cls.get_client().admin.command("ping")
            return True
        except Exception:
            return False

    @classmethod
    def ensure_indexes(cls):
        """Create required indexes on startup."""
        try:
            db = cls.get_db()
            meta_collection = db["event_metadata"]

            # Unique index on event_id prevents duplicate metadata documents
            meta_collection.create_index("event_id", unique=True)

            print(f"[OKUMA] MongoDB indexes ensured")
        except Exception as exc:
            print(f"[OKUMA] Warning: Could not create MongoDB indexes: {exc}")


def get_mongodb() -> Database:
    """Dependency that provides the MongoDB database instance.
    
    Usage in endpoints:
        @router.get("/...")
        def my_endpoint(mongo: Database = Depends(get_mongodb)):
            collection = mongo["event_metadata"]
    """
    return MongoDBManager.get_db()
