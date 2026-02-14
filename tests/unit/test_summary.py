from ul_packing.models import GearItem, ItemKind
from ul_packing.services import compute_summary


def test_compute_summary_by_kind_and_quantity() -> None:
    items = [
        GearItem(name="Tent", category="shelter", weight_grams=800, quantity=1, kind=ItemKind.BASE),
        GearItem(name="Snack", category="food", weight_grams=120, quantity=2, kind=ItemKind.CONSUMABLE),
        GearItem(name="Jacket", category="clothing", weight_grams=250, quantity=1, kind=ItemKind.WORN),
    ]

    summary = compute_summary(items)

    assert summary.base_weight_g == 800
    assert summary.consumable_weight_g == 240
    assert summary.worn_weight_g == 250
    assert summary.total_pack_g == 1290
