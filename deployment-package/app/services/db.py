from typing import Any
import aiomysql
from fastapi import FastAPI
from app.config import settings


DB_POOL_KEY = "db_pool"


async def init_db_pool(app: FastAPI) -> None:
    pool = await aiomysql.create_pool(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        db=settings.db_name,
        minsize=settings.db_min_pool_size,
        maxsize=settings.db_max_pool_size,
        autocommit=True,
        charset="utf8mb4",
    )
    setattr(app.state, DB_POOL_KEY, pool)


async def close_db_pool(app: FastAPI) -> None:
    pool = getattr(app.state, DB_POOL_KEY, None)
    if pool is not None:
        pool.close()
        await pool.wait_closed()


def get_db_pool(app: FastAPI) -> aiomysql.Pool:
    pool = getattr(app.state, DB_POOL_KEY, None)
    if pool is None:
        raise RuntimeError("DB pool is not initialized")
    return pool


