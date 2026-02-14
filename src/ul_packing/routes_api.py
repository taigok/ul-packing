from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ul_packing.db import get_db
from ul_packing.models import GearItem, PackingList
from ul_packing.schemas_api import (
    CreateItemIn,
    CreateListIn,
    GearListItemOut,
    GearItemOut,
    PackingListDetailOut,
    PackingListListItemOut,
    SetUnitIn,
    SharedPackingListOut,
    SummaryOut,
    UpdateItemIn,
)
from ul_packing.services import compute_summary, generate_share_token

router = APIRouter(prefix="/api/v1", tags=["api"])

_GEAR_INVENTORY_TITLE = "My Gear Inventory"
_GEAR_INVENTORY_DESCRIPTION = "Auto-created list for direct gear registration"


def _api_error(status_code: int, code: str, message: str, details: object | None = None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, "details": details}},
    )


def _get_list_or_404(db: Session, list_id: str) -> PackingList:
    packing_list = db.get(PackingList, list_id)
    if not packing_list:
        raise HTTPException(status_code=404, detail="List not found")
    return packing_list


def _to_summary_out(packing_list: PackingList) -> SummaryOut:
    summary = compute_summary(packing_list.items)
    return SummaryOut(
        base_weight_g=summary.base_weight_g,
        consumable_weight_g=summary.consumable_weight_g,
        worn_weight_g=summary.worn_weight_g,
        total_pack_g=summary.total_pack_g,
    )


def _to_item_out(item: GearItem) -> dict[str, object]:
    return GearItemOut.model_validate(item).model_dump(mode="json")


def _to_gear_list_item_out(item: GearItem, list_title: str) -> dict[str, object]:
    return GearListItemOut(
        id=item.id,
        list_id=item.list_id,
        list_title=list_title,
        name=item.name,
        category=item.category,
        kind=item.kind,
        weight_grams=item.weight_grams,
        quantity=item.quantity,
        notes=item.notes,
        sort_order=item.sort_order,
    ).model_dump(mode="json")


def _to_list_data(packing_list: PackingList, include_items: bool) -> dict[str, object]:
    data: dict[str, object] = PackingListListItemOut.model_validate(packing_list).model_dump(mode="json")
    if include_items:
        detail = PackingListDetailOut(
            **data,
            items=[GearItemOut.model_validate(item) for item in packing_list.items],
            summary=_to_summary_out(packing_list),
        )
        data = detail.model_dump(mode="json")
    return data


def _get_list_item_or_404(db: Session, list_id: str, item_id: str) -> tuple[PackingList, GearItem]:
    packing_list = _get_list_or_404(db, list_id)
    item = db.get(GearItem, item_id)
    if not item or item.list_id != packing_list.id:
        raise HTTPException(status_code=404, detail="Item not found")
    return packing_list, item


def _apply_item_payload(item: GearItem, payload: CreateItemIn | UpdateItemIn) -> None:
    item.name = payload.name.strip()
    item.category = payload.category
    item.weight_grams = payload.weight_grams
    item.quantity = payload.quantity
    item.kind = payload.kind
    item.notes = payload.notes.strip()


def _commit_and_refresh_list(db: Session, packing_list: PackingList) -> None:
    db.commit()
    db.refresh(packing_list)


def _get_or_create_gear_inventory_list(db: Session) -> PackingList:
    inventory = db.execute(
        select(PackingList)
        .where(
            PackingList.title == _GEAR_INVENTORY_TITLE,
            PackingList.description == _GEAR_INVENTORY_DESCRIPTION,
        )
        .order_by(PackingList.created_at.asc())
    ).scalars().first()
    if inventory:
        return inventory

    inventory = PackingList(
        title=_GEAR_INVENTORY_TITLE,
        description=_GEAR_INVENTORY_DESCRIPTION,
        share_token=generate_share_token(),
        is_shared=False,
    )
    db.add(inventory)
    db.commit()
    db.refresh(inventory)
    return inventory


@router.get("/lists")
def get_lists(db: Session = Depends(get_db)):
    lists = db.execute(select(PackingList).order_by(PackingList.created_at.desc())).scalars().all()
    return {"data": [_to_list_data(packing_list, include_items=False) for packing_list in lists]}


@router.get("/gear-items")
def get_gear_items(db: Session = Depends(get_db)):
    rows = db.execute(
        select(GearItem, PackingList.title)
        .join(PackingList, GearItem.list_id == PackingList.id)
        .order_by(PackingList.created_at.desc(), GearItem.sort_order.asc(), GearItem.id.asc())
    ).all()

    data = [_to_gear_list_item_out(item, list_title) for item, list_title in rows]
    return {"data": data}


@router.post("/lists")
def create_list(payload: CreateListIn, db: Session = Depends(get_db)):
    title = payload.title.strip()
    if not title:
        return _api_error(422, "validation_error", "Title is required")

    packing_list = PackingList(
        title=title,
        description=payload.description.strip(),
        share_token=generate_share_token(),
    )
    db.add(packing_list)
    db.commit()
    db.refresh(packing_list)
    return {"data": _to_list_data(packing_list, include_items=False)}


@router.get("/lists/{list_id}")
def get_list_detail(list_id: str, db: Session = Depends(get_db)):
    packing_list = _get_list_or_404(db, list_id)
    return {"data": _to_list_data(packing_list, include_items=True)}


@router.post("/lists/{list_id}/items")
def create_item(list_id: str, payload: CreateItemIn, db: Session = Depends(get_db)):
    packing_list = _get_list_or_404(db, list_id)

    max_order = max([item.sort_order for item in packing_list.items], default=-1)
    item = GearItem(
        list_id=packing_list.id,
        name="",
        category=payload.category,
        weight_grams=payload.weight_grams,
        quantity=payload.quantity,
        kind=payload.kind,
        notes="",
        sort_order=max_order + 1,
    )
    _apply_item_payload(item, payload)
    db.add(item)
    _commit_and_refresh_list(db, packing_list)

    return {"data": _to_list_data(packing_list, include_items=True)}


@router.post("/gear-items")
def create_gear_item(payload: CreateItemIn, db: Session = Depends(get_db)):
    inventory_list = _get_or_create_gear_inventory_list(db)
    max_order = db.execute(
        select(GearItem.sort_order)
        .where(GearItem.list_id == inventory_list.id)
        .order_by(GearItem.sort_order.desc())
    ).scalars().first()

    item = GearItem(
        list_id=inventory_list.id,
        name="",
        category=payload.category,
        weight_grams=payload.weight_grams,
        quantity=payload.quantity,
        kind=payload.kind,
        notes="",
        sort_order=(max_order if max_order is not None else -1) + 1,
    )
    _apply_item_payload(item, payload)
    db.add(item)
    db.commit()
    db.refresh(item)

    return {"data": _to_gear_list_item_out(item, inventory_list.title)}


@router.patch("/lists/{list_id}/items/{item_id}")
def update_item(list_id: str, item_id: str, payload: UpdateItemIn, db: Session = Depends(get_db)):
    packing_list, item = _get_list_item_or_404(db, list_id, item_id)
    _apply_item_payload(item, payload)
    _commit_and_refresh_list(db, packing_list)

    return {"data": _to_list_data(packing_list, include_items=True)}


@router.delete("/lists/{list_id}/items/{item_id}")
def delete_item(list_id: str, item_id: str, db: Session = Depends(get_db)):
    packing_list, item = _get_list_item_or_404(db, list_id, item_id)
    db.delete(item)
    _commit_and_refresh_list(db, packing_list)

    return {"data": _to_list_data(packing_list, include_items=True)}


@router.patch("/lists/{list_id}/unit")
def set_unit(list_id: str, payload: SetUnitIn, db: Session = Depends(get_db)):
    packing_list = _get_list_or_404(db, list_id)
    packing_list.unit = payload.unit
    _commit_and_refresh_list(db, packing_list)
    return {"data": _to_list_data(packing_list, include_items=True)}


@router.get("/shared/{share_token}")
def shared_view(share_token: str, db: Session = Depends(get_db)):
    packing_list = db.execute(select(PackingList).where(PackingList.share_token == share_token)).scalar_one_or_none()
    if not packing_list or not packing_list.is_shared:
        raise HTTPException(status_code=404, detail="Shared list not found")

    shared = SharedPackingListOut(
        id=packing_list.id,
        title=packing_list.title,
        description=packing_list.description,
        unit=packing_list.unit,
        items=[GearItemOut.model_validate(item) for item in packing_list.items],
        summary=_to_summary_out(packing_list),
    )
    return {"data": shared.model_dump(mode="json")}


@router.post("/lists/{list_id}/share/regenerate")
def regenerate_share_token(list_id: str, db: Session = Depends(get_db)):
    packing_list = _get_list_or_404(db, list_id)
    packing_list.share_token = generate_share_token()
    _commit_and_refresh_list(db, packing_list)
    return {"data": _to_list_data(packing_list, include_items=True)}
