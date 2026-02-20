from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from ul_packing.gear_inventory import GEAR_INVENTORY_DESCRIPTION, GEAR_INVENTORY_TITLE
from ul_packing.models import Category, GearItem, ItemKind, PackingList
from ul_packing.services import generate_share_token

_SAMPLE_GEAR_ITEMS: tuple[dict[str, object], ...] = (
    {"name": "DCFタープ", "category": Category.SHELTER, "weight_grams": 310, "quantity": 1, "kind": ItemKind.BASE, "notes": "ガイライン込み"},
    {"name": "ポリクロシート", "category": Category.SHELTER, "weight_grams": 55, "quantity": 1, "kind": ItemKind.BASE, "notes": "グランドシート"},
    {"name": "ペグセット", "category": Category.SHELTER, "weight_grams": 82, "quantity": 8, "kind": ItemKind.BASE, "notes": "アルミペグ"},
    {"name": "ダウンキルト 20F", "category": Category.SLEEPING, "weight_grams": 560, "quantity": 1, "kind": ItemKind.BASE, "notes": "3シーズン"},
    {"name": "エアマット", "category": Category.SLEEPING, "weight_grams": 415, "quantity": 1, "kind": ItemKind.BASE, "notes": "R値3.5"},
    {"name": "フォームマット", "category": Category.SLEEPING, "weight_grams": 170, "quantity": 1, "kind": ItemKind.BASE, "notes": "休憩用"},
    {"name": "バックパック 40L", "category": Category.BACKPACK, "weight_grams": 690, "quantity": 1, "kind": ItemKind.BASE, "notes": "フレームレス"},
    {"name": "防水スタッフサック", "category": Category.BACKPACK, "weight_grams": 36, "quantity": 3, "kind": ItemKind.BASE, "notes": "容量違い"},
    {"name": "ウインドシェル", "category": Category.CLOTHING, "weight_grams": 105, "quantity": 1, "kind": ItemKind.WORN, "notes": "行動着"},
    {"name": "レインジャケット", "category": Category.CLOTHING, "weight_grams": 198, "quantity": 1, "kind": ItemKind.BASE, "notes": "防水透湿"},
    {"name": "レインパンツ", "category": Category.CLOTHING, "weight_grams": 156, "quantity": 1, "kind": ItemKind.BASE, "notes": "非常時"},
    {"name": "ダウンジャケット", "category": Category.CLOTHING, "weight_grams": 245, "quantity": 1, "kind": ItemKind.BASE, "notes": "停滞用"},
    {"name": "予備ソックス", "category": Category.CLOTHING, "weight_grams": 43, "quantity": 1, "kind": ItemKind.BASE, "notes": "就寝用"},
    {"name": "アルコールストーブ", "category": Category.COOKING, "weight_grams": 18, "quantity": 1, "kind": ItemKind.BASE, "notes": "五徳不要"},
    {"name": "チタンマグ 550ml", "category": Category.COOKING, "weight_grams": 72, "quantity": 1, "kind": ItemKind.BASE, "notes": "クッカー兼用"},
    {"name": "スプーン", "category": Category.COOKING, "weight_grams": 14, "quantity": 1, "kind": ItemKind.BASE, "notes": "ロング"},
    {"name": "燃料アルコール", "category": Category.FOOD, "weight_grams": 250, "quantity": 1, "kind": ItemKind.CONSUMABLE, "notes": "2日分"},
    {"name": "行動食", "category": Category.FOOD, "weight_grams": 480, "quantity": 1, "kind": ItemKind.CONSUMABLE, "notes": "バー・ナッツ"},
    {"name": "夕食フリーズドライ", "category": Category.FOOD, "weight_grams": 220, "quantity": 2, "kind": ItemKind.CONSUMABLE, "notes": "2泊分"},
    {"name": "浄水器", "category": Category.WATER, "weight_grams": 58, "quantity": 1, "kind": ItemKind.BASE, "notes": "0.1ミクロン"},
    {"name": "ソフトボトル 1L", "category": Category.WATER, "weight_grams": 38, "quantity": 2, "kind": ItemKind.BASE, "notes": "予備含む"},
    {"name": "携帯水 1.5L", "category": Category.WATER, "weight_grams": 1500, "quantity": 1, "kind": ItemKind.CONSUMABLE, "notes": "出発時"},
    {"name": "ヘッドランプ", "category": Category.ELECTRONICS, "weight_grams": 52, "quantity": 1, "kind": ItemKind.BASE, "notes": "予備電池込み"},
    {"name": "モバイルバッテリー 10000", "category": Category.ELECTRONICS, "weight_grams": 182, "quantity": 1, "kind": ItemKind.BASE, "notes": "ケーブル含む"},
    {"name": "ファーストエイド", "category": Category.OTHER, "weight_grams": 95, "quantity": 1, "kind": ItemKind.BASE, "notes": "絆創膏・常備薬"},
    {"name": "地図・コンパス", "category": Category.OTHER, "weight_grams": 61, "quantity": 1, "kind": ItemKind.BASE, "notes": "紙地図"},
)


def seed_sample_gear_inventory_data(db: Session) -> None:
    inventory = db.execute(
        select(PackingList)
        .where(
            PackingList.title == GEAR_INVENTORY_TITLE,
            PackingList.description == GEAR_INVENTORY_DESCRIPTION,
        )
        .order_by(PackingList.created_at.asc())
    ).scalars().first()

    if inventory is None:
        inventory = PackingList(
            title=GEAR_INVENTORY_TITLE,
            description=GEAR_INVENTORY_DESCRIPTION,
            share_token=generate_share_token(),
            is_shared=False,
        )
        db.add(inventory)
        db.flush()

    existing_names = {
        name for name in db.execute(select(GearItem.name).where(GearItem.list_id == inventory.id)).scalars().all()
    }
    max_order = db.execute(
        select(GearItem.sort_order)
        .where(GearItem.list_id == inventory.id)
        .order_by(GearItem.sort_order.desc())
    ).scalars().first()
    next_order = (max_order if max_order is not None else -1) + 1

    for item in _SAMPLE_GEAR_ITEMS:
        if str(item["name"]) in existing_names:
            continue
        db.add(
            GearItem(
                list_id=inventory.id,
                name=str(item["name"]),
                category=item["category"],
                weight_grams=int(item["weight_grams"]),
                quantity=int(item["quantity"]),
                kind=item["kind"],
                notes=str(item["notes"]),
                sort_order=next_order,
            )
        )
        next_order += 1

    db.commit()
