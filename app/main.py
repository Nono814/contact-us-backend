from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.services.db import init_db_pool, close_db_pool
from app.routers.analytics import router as analytics_router


def create_app() -> FastAPI:
    app = FastAPI(title="Analytics Ingest Service", version="1.0.0")

    # CORS
    if settings.allowed_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.allowed_origins,
            allow_credentials=False,
            allow_methods=["POST", "OPTIONS"],
            allow_headers=["Content-Type", "User-Agent", "X-Request-Id"],
            max_age=600,
        )

    @app.on_event("startup")
    async def _startup() -> None:
        await init_db_pool(app)

    @app.on_event("shutdown")
    async def _shutdown() -> None:
        await close_db_pool(app)

    @app.get("/healthz")
    async def healthz() -> dict:
        return {"status": "ok"}

    app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
    # 兼容网关前缀 /api/analytics/*
    app.include_router(analytics_router, prefix="/api/analytics", tags=["analytics-proxy"])
    return app


app = create_app()


