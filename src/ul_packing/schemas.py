from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Summary:
    base_weight_g: int
    consumable_weight_g: int
    worn_weight_g: int
    total_pack_g: int
