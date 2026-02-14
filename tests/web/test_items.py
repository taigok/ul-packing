from ul_packing.models import PackingList
from ul_packing.services import generate_share_token


def test_item_crud_flow(client, session) -> None:
    packing_list = PackingList(title="Test", share_token=generate_share_token())
    session.add(packing_list)
    session.commit()

    add_res = client.post(
        f"/lists/{packing_list.id}/items",
        data={
            "name": "Tent",
            "category": "shelter",
            "weight_grams": 800,
            "quantity": 1,
            "kind": "base",
            "notes": "",
        },
        headers={"HX-Request": "true"},
    )
    assert add_res.status_code == 200
    assert "Tent" in add_res.text

    list_page = client.get(f"/lists/{packing_list.id}")
    assert list_page.status_code == 200


def test_item_validation_error(client, session) -> None:
    packing_list = PackingList(title="Test2", share_token=generate_share_token())
    session.add(packing_list)
    session.commit()

    res = client.post(
        f"/lists/{packing_list.id}/items",
        data={
            "name": "",
            "category": "shelter",
            "weight_grams": 0,
            "quantity": 0,
            "kind": "base",
            "notes": "",
        },
        headers={"HX-Request": "true"},
    )
    assert res.status_code == 400
    assert "入力エラー" in res.text
