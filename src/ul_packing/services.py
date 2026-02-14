from __future__ import annotations

import secrets
from collections.abc import Iterable

from ul_packing.models import GearItem, ItemKind
from ul_packing.schemas import Summary


def generate_share_token() -> str:
    return secrets.token_urlsafe(24)


def compute_summary(items: Iterable[GearItem]) -> Summary:
    base = 0
    consumable = 0
    worn = 0

    for item in items:
        total = item.weight_grams * item.quantity
        if item.kind == ItemKind.BASE:
            base += total
        elif item.kind == ItemKind.CONSUMABLE:
            consumable += total
        elif item.kind == ItemKind.WORN:
            worn += total

    return Summary(
        base_weight_g=base,
        consumable_weight_g=consumable,
        worn_weight_g=worn,
        total_pack_g=base + consumable + worn,
    )


def to_ounces(weight_grams: int) -> float:
    return round(weight_grams / 28.349523125, 1)


def format_weight(weight_grams: int, unit: str) -> str:
    if unit == "oz":
        return f"{to_ounces(weight_grams):.1f} oz"
    return f"{weight_grams} g"
