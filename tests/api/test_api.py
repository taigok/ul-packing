from ul_packing.models import GearItem, PackingList
from ul_packing.services import generate_share_token


def test_list_api_crud_and_share_flow(client, session) -> None:
    create_list = client.post(
        "/api/v1/lists",
        json={"title": "API List", "description": "for api tests"},
    )
    assert create_list.status_code == 200
    list_id = create_list.json()["data"]["id"]

    update_list = client.patch(
        f"/api/v1/lists/{list_id}",
        json={"title": "API List Updated", "description": "patched"},
    )
    assert update_list.status_code == 200
    assert update_list.json()["data"]["title"] == "API List Updated"
    assert update_list.json()["data"]["description"] == "patched"

    add_item = client.post(
        f"/api/v1/lists/{list_id}/items",
        json={
            "name": "Tent",
            "category": "shelter",
            "weight_grams": 800,
            "quantity": 1,
            "kind": "base",
            "notes": "",
        },
    )
    assert add_item.status_code == 200
    assert add_item.json()["data"]["summary"]["base_weight_g"] == 800

    item_id = add_item.json()["data"]["items"][0]["id"]

    update_item = client.patch(
        f"/api/v1/lists/{list_id}/items/{item_id}",
        json={
            "name": "Tent 2",
            "category": "shelter",
            "weight_grams": 900,
            "quantity": 1,
            "kind": "base",
            "notes": "new",
        },
    )
    assert update_item.status_code == 200
    assert update_item.json()["data"]["items"][0]["name"] == "Tent 2"

    unit_res = client.patch(f"/api/v1/lists/{list_id}/unit", json={"unit": "oz"})
    assert unit_res.status_code == 200
    assert unit_res.json()["data"]["unit"] == "oz"

    share_token = unit_res.json()["data"]["share_token"]
    shared = client.get(f"/api/v1/shared/{share_token}")
    assert shared.status_code == 200

    regen = client.post(f"/api/v1/lists/{list_id}/share/regenerate")
    assert regen.status_code == 200

    old_shared = client.get(f"/api/v1/shared/{share_token}")
    assert old_shared.status_code == 404

    delete_item = client.delete(f"/api/v1/lists/{list_id}/items/{item_id}")
    assert delete_item.status_code == 200
    assert delete_item.json()["data"]["items"] == []


def test_api_validation_and_not_found(client, session) -> None:
    invalid_list = client.post("/api/v1/lists", json={"title": "", "description": ""})
    assert invalid_list.status_code == 422
    assert invalid_list.json()["error"]["code"] == "validation_error"

    token = generate_share_token()
    packing_list = PackingList(title="Share", share_token=token)
    session.add(packing_list)
    session.commit()

    not_found_item = client.patch(
        f"/api/v1/lists/{packing_list.id}/items/not-found",
        json={
            "name": "A",
            "category": "other",
            "weight_grams": 1,
            "quantity": 1,
            "kind": "base",
            "notes": "",
        },
    )
    assert not_found_item.status_code == 404
    assert not_found_item.json()["error"]["code"] == "not_found"


def test_get_lists_returns_desc_order(client, session) -> None:
    session.add(PackingList(title="Older", share_token=generate_share_token()))
    session.commit()
    session.add(PackingList(title="Newer", share_token=generate_share_token()))
    session.commit()

    response = client.get("/api/v1/lists")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 2
    assert data[0]["title"] == "Newer"


def test_shared_not_found(client) -> None:
    response = client.get("/api/v1/shared/not-found")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"


def test_get_gear_items_returns_cross_list_items(client, session) -> None:
    older = PackingList(title="Older List", share_token=generate_share_token())
    session.add(older)
    session.commit()

    newer = PackingList(title="Newer List", share_token=generate_share_token())
    session.add(newer)
    session.commit()

    older_item = GearItem(
        list_id=older.id,
        name="Stove",
        category="cooking",
        weight_grams=200,
        quantity=1,
        kind="base",
        notes="",
        sort_order=0,
    )
    newer_item_2 = GearItem(
        list_id=newer.id,
        name="Tent",
        category="shelter",
        weight_grams=800,
        quantity=1,
        kind="base",
        notes="",
        sort_order=1,
    )
    newer_item_1 = GearItem(
        list_id=newer.id,
        name="Pack",
        category="backpack",
        weight_grams=500,
        quantity=1,
        kind="base",
        notes="",
        sort_order=0,
    )
    session.add_all([older_item, newer_item_2, newer_item_1])
    session.commit()

    response = client.get("/api/v1/gear-items")

    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 3

    assert data[0]["name"] == "Pack"
    assert data[0]["list_id"] == newer.id
    assert data[0]["list_title"] == "Newer List"
    assert data[1]["name"] == "Tent"
    assert data[1]["list_id"] == newer.id
    assert data[1]["list_title"] == "Newer List"
    assert data[2]["name"] == "Stove"
    assert data[2]["list_id"] == older.id
    assert data[2]["list_title"] == "Older List"


def test_create_gear_item_without_list_creates_inventory_list(client, session) -> None:
    response = client.post(
        "/api/v1/gear-items",
        json={
            "name": "Quilt",
            "category": "sleeping",
            "weight_grams": 450,
            "quantity": 1,
            "kind": "base",
            "notes": "",
        },
    )
    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["name"] == "Quilt"
    assert payload["list_title"] == "マイギア一覧"

    inventory_list = session.get(PackingList, payload["list_id"])
    assert inventory_list is not None
    assert inventory_list.title == "マイギア一覧"
    assert inventory_list.is_shared is False

    follow_up = client.post(
        "/api/v1/gear-items",
        json={
            "name": "Spoon",
            "category": "cooking",
            "weight_grams": 12,
            "quantity": 1,
            "kind": "base",
            "notes": "",
        },
    )
    assert follow_up.status_code == 200
    assert follow_up.json()["data"]["list_id"] == payload["list_id"]


def test_cors_preflight_for_spa_origin(client) -> None:
    response = client.options(
        "/api/v1/lists",
        headers={
            "Origin": "http://127.0.0.1:4173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:4173"
