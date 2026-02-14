from __future__ import annotations

import os
from dataclasses import dataclass, field


def _default_allowed_origins() -> list[str]:
    return [
        "http://127.0.0.1:4173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ]


def _parse_allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS")
    if raw is None:
        return _default_allowed_origins()
    if not raw.strip():
        return []
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def _parse_bool_env(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv("DATABASE_URL", "sqlite+pysqlite:///./data/app.db")
    allowed_origins: list[str] = field(default_factory=_parse_allowed_origins)
    seed_sample_data: bool = _parse_bool_env("SEED_SAMPLE_DATA", default=False)


settings = Settings()
