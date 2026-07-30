"""OKUMA OS - Main Application
FastAPI entry point with automatic module router registration."""

import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

# Ensure the backend directory is in the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings, CORS_ORIGINS_LIST


# ---------------------------------------------------------------------------
# Lifespan handler — ONLY startup/shutdown tasks (defined BEFORE app)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events.
    
    Route registration happens at module level below, not here.
    This lifespan only handles startup tasks (DB, setup, connections).
    With workers > 1, each worker runs its own lifespan, but routes
    are already registered at import time — no duplicates or conflicts.
    """
    print(f"[OKUMA] Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # Auto-create all PostgreSQL tables (fallback caso init.sql não tenha rodado)
    try:
        from app.core.database import Base, engine
        Base.metadata.create_all(bind=engine)
        print(f"[OKUMA] PostgreSQL tables synchronized")
    except Exception as exc:
        print(f"[OKUMA] Warning: Could not create tables: {exc}")

    # Ensure admin user and demo data exist
    try:
        from app.core.setup import ensure_admin_user, seed_demo_data
        ensure_admin_user()
        seed_demo_data()
    except Exception as exc:
        print(f"[OKUMA] Warning: Setup error (database may not be ready): {exc}")

    # Initialize MongoDB connection and indexes
    try:
        from app.core.mongodb import MongoDBManager
        mongo_ok = MongoDBManager.health_check()
        if mongo_ok:
            print(f"[OKUMA] MongoDB connected: {settings.MONGODB_URL}")
            MongoDBManager.ensure_indexes()
        else:
            print(f"[OKUMA] MongoDB not available (graceful: calendar metadata features will be limited)")
    except Exception as exc:
        print(f"[OKUMA] MongoDB connection error: {exc}")
        print(f"[OKUMA] MongoDB not available (graceful: calendar metadata features will be limited)")

    print(f"[OKUMA] All systems ready")
    yield
    # Shutdown
    from app.core.mongodb import MongoDBManager
    MongoDBManager.close()
    print(f"[OKUMA] Shutting down {settings.APP_NAME}")


# ---------------------------------------------------------------------------
# Application Factory — routers registered at MODULE LEVEL
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ---------------------------------------------------------------------------
# Middleware (applied before routes)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compressão GZip para respostas JSON (reduz tráfego em ~70%)
app.add_middleware(GZipMiddleware, minimum_size=500)


# ---------------------------------------------------------------------------
# Auto-register all routers at MODULE LEVEL (not inside lifespan!)
# This guarantees routes are registered once during import, not once per worker
# ---------------------------------------------------------------------------
def _register_core_modules():
    """Register core auth/admin routers at module level."""
    from app.core.auth_module import router as auth_router, admin_router
    app.include_router(auth_router)
    app.include_router(admin_router)


def _discover_module_routes():
    """Discover all module API routes automatically."""
    import importlib

    routes = []
    modules_path = os.path.join(os.path.dirname(__file__), "modules")

    if not os.path.isdir(modules_path):
        return routes

    for entry in os.listdir(modules_path):
        module_dir = os.path.join(modules_path, entry)
        if os.path.isdir(module_dir) and not entry.startswith("_"):
            api_routes_path = os.path.join(module_dir, "api", "routes.py")
            if os.path.isfile(api_routes_path):
                try:
                    module_name = f"app.modules.{entry}.api.routes"
                    mod = importlib.import_module(module_name)
                    if hasattr(mod, "router"):
                        routes.append((entry, mod.router))
                except ImportError as exc:
                    print(f"[OKUMA] Warning: Could not load module '{entry}': {exc}")

    return routes


# Register all routes now (at import time, once only)
_register_core_modules()
registered_modules = _discover_module_routes()
for module_name, router in registered_modules:
    app.include_router(router)
    print(f"[OKUMA] Module registered: {module_name}")
print(f"[OKUMA] Core + {len(registered_modules)} modules loaded successfully")


# ---------------------------------------------------------------------------
# Health check & root
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
def root():
    """API root - system information."""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint for monitoring and Docker."""
    return {"status": "healthy", "app": settings.APP_NAME}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=2,
    )
