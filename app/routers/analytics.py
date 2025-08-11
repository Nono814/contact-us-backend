from fastapi import APIRouter, Request, Response, status
from typing import List, Optional
import orjson
import uuid
from pydantic import ValidationError
from fastapi.responses import JSONResponse

from app.schemas.analytics import Event, Batch
from app.services.db import get_db_pool
from app.services.ingest import insert_events
from app.config import settings
import logging

logger = logging.getLogger(__name__)


router = APIRouter()


def _parse_body_as_json(raw: bytes):
    return orjson.loads(raw)


@router.post("/track", status_code=status.HTTP_204_NO_CONTENT)
async def track(request: Request):
    raw = await request.body()
    if raw and len(raw) > settings.max_request_bytes:
        return Response(status_code=413)
    if not raw:
        return Response(status_code=204)
    try:
        payload = _parse_body_as_json(raw)
    except Exception:
        return Response(status_code=400)

    def _safe_pydantic_errors(ve: ValidationError):
        items = []
        for err in ve.errors():
            items.append({
                "loc": err.get("loc"),
                "msg": err.get("msg"),
                "type": err.get("type"),
            })
        return items

    try:
        if "events" in payload:
            events: List[Event] = [Event.model_validate(e) for e in payload["events"]]
        else:
            events = [Event.model_validate(payload)]
    except ValidationError as ve:
        return JSONResponse(
            status_code=422,
            content={
                "code": "INVALID_PAYLOAD",
                "message": "validation error",
                "details": _safe_pydantic_errors(ve),
            },
        )

    # rid 兜底：如果缺失则生成
    for e in events:
        if not e.rid:
            e.rid = str(uuid.uuid4())

    client_ip = request.client.host if request.client else None
    server_ip = request.headers.get("X-Server-IP")

    pool = get_db_pool(request.app)
    try:
        await insert_events(pool, events, client_ip, server_ip)
    except Exception as e:
        logger.exception("failed to insert events")
        return JSONResponse(status_code=500, content={"code": "INTERNAL", "message": str(e)})

    rid = events[0].rid if events else None
    resp = Response(status_code=204)
    if rid:
        resp.headers["X-Request-Id"] = rid
    return resp


@router.post("/track/batch", status_code=status.HTTP_204_NO_CONTENT)
async def track_batch(request: Request):
    return await track(request)


