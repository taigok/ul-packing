from ul_packing.services import generate_share_token


def test_generate_share_token_is_unique() -> None:
    token_a = generate_share_token()
    token_b = generate_share_token()

    assert token_a != token_b
    assert len(token_a) >= 32
    assert len(token_b) >= 32
