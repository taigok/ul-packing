from ul_packing.models import PackingList
from ul_packing.services import generate_share_token


def test_share_page_success_and_invalid(client, session) -> None:
    token = generate_share_token()
    packing_list = PackingList(title="Share", share_token=token)
    session.add(packing_list)
    session.commit()

    ok = client.get(f"/s/{token}")
    assert ok.status_code == 200
    assert "共有ビュー" in ok.text

    ng = client.get("/s/not-found-token")
    assert ng.status_code == 404


def test_regenerate_share_token_invalidates_old(client, session) -> None:
    token = generate_share_token()
    packing_list = PackingList(title="Regenerate", share_token=token)
    session.add(packing_list)
    session.commit()

    regen = client.post(f"/lists/{packing_list.id}/share/regenerate", follow_redirects=False)
    assert regen.status_code == 303

    old = client.get(f"/s/{token}")
    assert old.status_code == 404
