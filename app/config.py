from typing import List, Optional
from pydantic import AnyUrl, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Service
    app_name: str = Field(default="analytics-ingest-service")
    log_level: str = Field(default="INFO")
    port: int = Field(default=8080)

    # CORS
    allowed_origins: List[str] = Field(default_factory=list)

    # Database (defaults from workspace rules for convenience)
    db_host: str = Field(default="dbconn.sealosbja.site")
    db_port: int = Field(default=43919)
    db_user: str = Field(default="root")
    db_password: str = Field(default="qrzk4ts4")
    db_name: str = Field(default="analytics")
    db_min_pool_size: int = Field(default=1)
    db_max_pool_size: int = Field(default=10)

    # Ingest limits
    max_batch_events: int = Field(default=50)
    max_request_bytes: int = Field(default=200 * 1024)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()


