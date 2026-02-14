from __future__ import annotations

import os
from dataclasses import dataclass, field


def _parse_allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "")
    if not raw.strip():
        return []
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv("DATABASE_URL", "sqlite+pysqlite:///./data/app.db")
    allowed_origins: list[str] = field(default_factory=_parse_allowed_origins)


settings = Settings()
