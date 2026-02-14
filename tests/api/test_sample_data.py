from ul_packing.models import Category, GearItem, ItemKind, PackingList
from ul_packing.sample_data import seed_sample_gear_inventory_data


def test_seed_sample_gear_inventory_data_inserts_many_items(session) -> None:
    seed_sample_gear_inventory_data(session)

    inventory = session.query(PackingList).filter(PackingList.title == "マイギア一覧").one_or_none()
    assert inventory is not None
    assert inventory.description == "ギア直接登録用に自動作成されたリスト"
    assert inventory.is_shared is False

    items = session.query(GearItem).filter(GearItem.list_id == inventory.id).order_by(GearItem.sort_order.asc()).all()
    assert len(items) >= 20


def test_seed_sample_gear_inventory_data_is_idempotent(session) -> None:
    seed_sample_gear_inventory_data(session)
    first_count = session.query(GearItem).count()

    seed_sample_gear_inventory_data(session)
    second_count = session.query(GearItem).count()

    assert first_count == second_count


def test_seed_sample_gear_inventory_data_preserves_existing_items(session) -> None:
    seed_sample_gear_inventory_data(session)
    inventory = session.query(PackingList).filter(PackingList.title == "マイギア一覧").one()
    session.add(
        GearItem(
            list_id=inventory.id,
            name="自分のメモ帳",
            category=Category.OTHER,
            weight_grams=20,
            quantity=1,
            kind=ItemKind.BASE,
            notes="",
            sort_order=999,
        )
    )
    session.commit()
    with_custom_item = session.query(GearItem).count()

    seed_sample_gear_inventory_data(session)

    final_count = session.query(GearItem).count()
    assert final_count == with_custom_item
