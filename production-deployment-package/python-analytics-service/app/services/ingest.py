from typing import List, Optional, Dict
from datetime import datetime, timezone
import ipaddress
import aiomysql
import orjson

from app.schemas.analytics import Event
from app.config import settings


def _ip_to_bin(ip: str) -> bytes:
    try:
        return ipaddress.ip_address(ip).packed
    except Exception:
        return None  # type: ignore


async def insert_events(pool: aiomysql.Pool, events: List[Event], client_ip: Optional[str], server_ip: Optional[str]) -> None:
    if not events:
        return

    # 请求体大小在网关层限制；这里再做事件条数限制
    if len(events) > settings.max_batch_events:
        events = events[: settings.max_batch_events]

    now_received_at = datetime.now(timezone.utc)

    # 1) 预查询已有 event_id 的 received_at（使用 MIN 保证唯一）
    # 复合主键 (event_id, received_at) 下，幂等需要复用已有的 received_at 才会命中重复键
    existing_map: Dict[bytes, datetime] = {}
    event_ids = [e.eventId for e in events if e.eventId]
    if event_ids:
        placeholders = ",".join(["UNHEX(REPLACE(%s,'-',''))"] * len(event_ids))
        select_sql = f"""
            SELECT event_id, MIN(received_at) AS received_at
            FROM analytics_events
            WHERE event_id IN ({placeholders})
            GROUP BY event_id
        """
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute(select_sql, tuple(event_ids))
                rows = await cur.fetchall()
                # rows: List[Tuple[bytes, datetime]]
                for eid_bin, rcv_at in rows:
                    existing_map[eid_bin] = rcv_at

    def _uuid_to_bin(u: str) -> bytes:
        import uuid as _uuid
        return _uuid.UUID(u).bytes

    values = []
    for e in events:
        eid_bin = _uuid_to_bin(e.eventId)
        per_received_at = existing_map.get(eid_bin, now_received_at)
        values.append(
            (
                e.eventId,
                e.version,
                e.eventName,
                e.rid,
                e.timestamp,
                e.sessionId,
                e.userIdHash,
                int(bool(e.isLoggedIn)),
                e.language,
                e.routeFrom,
                e.routeTo,
                e.utm.source if e.utm else None,
                e.utm.medium if e.utm else None,
                e.utm.campaign if e.utm else None,
                e.utm.term if e.utm else None,
                e.utm.content if e.utm else None,
                (e.device.ua if e.device else None),
                (e.device.platform if e.device else None),
                (e.device.screen if e.device else None),
                _ip_to_bin(client_ip) if client_ip else None,
                _ip_to_bin(server_ip) if server_ip else None,
                orjson.dumps(e.eventProps).decode() if e.eventProps else None,
                per_received_at,
            )
        )

    sql = (
        """
        INSERT INTO analytics_events (
          event_id, version, event_name, rid, event_timestamp,
          session_id, user_id_hash, is_logged_in, language,
          route_from, route_to,
          utm_source, utm_medium, utm_campaign, utm_term, utm_content,
          device_ua, device_platform, device_screen,
          client_ip, server_ip, event_props, received_at
        ) VALUES (
          UNHEX(REPLACE(%s,'-','')), %s, %s, UNHEX(REPLACE(%s,'-','')), %s,
          UNHEX(REPLACE(%s,'-','')), %s, %s, %s,
          %s, %s,
          %s, %s, %s, %s, %s,
          %s, %s, %s,
          %s, %s, CAST(%s AS JSON), %s
        )
        ON DUPLICATE KEY UPDATE event_id = event_id
        """
    )

    async with pool.acquire() as conn:  # type: aiomysql.Connection
        async with conn.cursor() as cur:  # type: aiomysql.Cursor
            await cur.executemany(sql, values)


