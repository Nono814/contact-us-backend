from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime
import re


UUID_V4_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$"
)


class UTM(BaseModel):
    model_config = ConfigDict(extra='forbid')
    source: Optional[str] = None
    medium: Optional[str] = None
    campaign: Optional[str] = None
    term: Optional[str] = None
    content: Optional[str] = None


class Device(BaseModel):
    model_config = ConfigDict(extra='forbid')
    ua: Optional[str] = None
    platform: Optional[str] = None
    screen: Optional[str] = None


class Event(BaseModel):
    model_config = ConfigDict(extra='forbid')
    version: str = Field("v1")
    eventName: str
    eventId: str
    rid: Optional[str] = None
    timestamp: datetime
    sessionId: Optional[str] = None
    userIdHash: Optional[str] = None
    isLoggedIn: Optional[bool] = False
    language: Optional[str] = None
    routeFrom: Optional[str] = None
    routeTo: Optional[str] = None
    utm: Optional[UTM] = None
    device: Optional[Device] = None
    eventProps: Optional[Dict[str, Any]] = None

    @field_validator("eventId")
    @classmethod
    def validate_event_id(cls, v: str) -> str:
        if not UUID_V4_RE.match(v):
            raise ValueError("eventId must be uuid v4")
        return v

    @field_validator("rid")
    @classmethod
    def validate_rid(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not UUID_V4_RE.match(v):
            raise ValueError("rid must be uuid v4 when provided")
        return v

    @field_validator("sessionId")
    @classmethod
    def validate_session_id(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not UUID_V4_RE.match(v):
            raise ValueError("sessionId must be uuid v4 when provided")
        return v


class Batch(BaseModel):
    model_config = ConfigDict(extra='forbid')
    version: str = Field("v1")
    events: List[Event]


