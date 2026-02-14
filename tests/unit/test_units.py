from ul_packing.services import format_weight


def test_format_weight_in_grams() -> None:
    assert format_weight(1250, "g") == "1250 g"


def test_format_weight_in_ounces() -> None:
    assert format_weight(1000, "oz") == "35.3 oz"
