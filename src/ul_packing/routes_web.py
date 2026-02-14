from __future__ import annotations

from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import select
from sqlalchemy.orm import Session

from ul_packing.db import get_db
from ul_packing.models import Category, GearItem, ItemKind, PackingList, Unit
from ul_packing.services import compute_summary, format_weight, generate_share_token

router = APIRouter()
templates = Jinja2Templates(directory="templates")

def _ctx(request: Request, **kwargs):
    return {"request": request, "format_weight": format_weight, **kwargs}


def _is_hx(request: Request) -> bool:
    return request.headers.get("HX-Request", "").lower() == "true"


def _get_list_or_404(db: Session, list_id: str) -> PackingList:
    packing_list = db.get(PackingList, list_id)
    if not packing_list:
        raise HTTPException(status_code=404, detail="List not found")
    return packing_list


def _validate_item(name: str, weight_grams: int, quantity: int) -> str | None:
    if not name.strip():
        return "入力エラー: 装備名は必須です"
    if weight_grams <= 0:
        return "入力エラー: 重量は1以上で入力してください"
    if quantity <= 0:
        return "入力エラー: 個数は1以上で入力してください"
    return None


@router.get("/", response_class=HTMLResponse)
def lists_index(request: Request, db: Session = Depends(get_db)):
    lists = db.execute(select(PackingList).order_by(PackingList.created_at.desc())).scalars().all()
    return templates.TemplateResponse(request, "pages/lists_index.html", _ctx(request, lists=lists, error=None))


@router.post("/lists", response_class=HTMLResponse)
def create_list(
    request: Request,
    title: str = Form(default=""),
    description: str = Form(default=""),
    db: Session = Depends(get_db),
):
    title = title.strip()
    if not title:
        lists = db.execute(select(PackingList).order_by(PackingList.created_at.desc())).scalars().all()
        return templates.TemplateResponse(
            request,
            "pages/lists_index.html",
            _ctx(request, lists=lists, error="タイトルは必須です"),
            status_code=400,
        )
    if len(title) > 100:
        lists = db.execute(select(PackingList).order_by(PackingList.created_at.desc())).scalars().all()
        return templates.TemplateResponse(
            request,
            "pages/lists_index.html",
            _ctx(request, lists=lists, error="タイトルは100文字以内で入力してください"),
            status_code=400,
        )

    packing_list = PackingList(title=title, description=description.strip(), share_token=generate_share_token())
    db.add(packing_list)
    db.commit()
    return RedirectResponse(url=f"/lists/{packing_list.id}", status_code=303)


@router.get("/lists/{list_id}", response_class=HTMLResponse)
def list_detail(request: Request, list_id: str, db: Session = Depends(get_db)):
    packing_list = _get_list_or_404(db, list_id)
    summary = compute_summary(packing_list.items)
    return templates.TemplateResponse(
        request,
        "pages/list_detail.html",
        _ctx(request, packing_list=packing_list, summary=summary, item_error=None),
    )


@router.post("/lists/{list_id}/items", response_class=HTMLResponse)
def create_item(
    request: Request,
    list_id: str,
    name: str = Form(default=""),
    category: Category = Form(default=Category.OTHER),
    weight_grams: int = Form(...),
    quantity: int = Form(default=1),
    kind: ItemKind = Form(default=ItemKind.BASE),
    notes: str = Form(default=""),
    db: Session = Depends(get_db),
):
    packing_list = _get_list_or_404(db, list_id)

    err = _validate_item(name, weight_grams, quantity)
    if err:
        summary = compute_summary(packing_list.items)
        template = "partials/items_section.html" if _is_hx(request) else "pages/list_detail.html"
        return templates.TemplateResponse(
            request,
            template,
            _ctx(request, packing_list=packing_list, summary=summary, item_error=err),
            status_code=400,
        )

    max_order = max([item.sort_order for item in packing_list.items], default=-1)
    item = GearItem(
        list_id=packing_list.id,
        name=name.strip(),
        category=category,
        weight_grams=weight_grams,
        quantity=quantity,
        kind=kind,
        notes=notes.strip(),
        sort_order=max_order + 1,
    )
    db.add(item)
    db.commit()
    db.refresh(packing_list)

    if _is_hx(request):
        summary = compute_summary(packing_list.items)
        return templates.TemplateResponse(
            request,
            "partials/items_section.html",
            _ctx(request, packing_list=packing_list, summary=summary, item_error=None),
        )

    return RedirectResponse(url=f"/lists/{packing_list.id}", status_code=303)


@router.post("/lists/{list_id}/items/{item_id}", response_class=HTMLResponse)
def update_item(
    request: Request,
    list_id: str,
    item_id: str,
    name: str = Form(default=""),
    category: Category = Form(default=Category.OTHER),
    weight_grams: int = Form(...),
    quantity: int = Form(default=1),
    kind: ItemKind = Form(default=ItemKind.BASE),
    notes: str = Form(default=""),
    db: Session = Depends(get_db),
):
    packing_list = _get_list_or_404(db, list_id)
    item = db.get(GearItem, item_id)
    if not item or item.list_id != packing_list.id:
        raise HTTPException(status_code=404, detail="Item not found")

    err = _validate_item(name, weight_grams, quantity)
    if err:
        summary = compute_summary(packing_list.items)
        return templates.TemplateResponse(
            request,
            "partials/items_section.html",
            _ctx(request, packing_list=packing_list, summary=summary, item_error=err),
            status_code=400,
        )

    item.name = name.strip()
    item.category = category
    item.weight_grams = weight_grams
    item.quantity = quantity
    item.kind = kind
    item.notes = notes.strip()
    db.commit()
    db.refresh(packing_list)

    summary = compute_summary(packing_list.items)
    template = "partials/items_section.html" if _is_hx(request) else "pages/list_detail.html"
    return templates.TemplateResponse(
        request,
        template,
        _ctx(request, packing_list=packing_list, summary=summary, item_error=None),
    )


@router.post("/lists/{list_id}/items/{item_id}/delete")
def delete_item(request: Request, list_id: str, item_id: str, db: Session = Depends(get_db)):
    packing_list = _get_list_or_404(db, list_id)
    item = db.get(GearItem, item_id)
    if not item or item.list_id != packing_list.id:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    db.refresh(packing_list)

    if _is_hx(request):
        summary = compute_summary(packing_list.items)
        return templates.TemplateResponse(
            request,
            "partials/items_section.html",
            _ctx(request, packing_list=packing_list, summary=summary, item_error=None),
        )

    return RedirectResponse(url=f"/lists/{packing_list.id}", status_code=303)


@router.post("/lists/{list_id}/unit")
def set_unit(
    list_id: str,
    unit: Unit = Form(...),
    db: Session = Depends(get_db),
):
    packing_list = _get_list_or_404(db, list_id)
    packing_list.unit = unit
    db.commit()
    return RedirectResponse(url=f"/lists/{packing_list.id}", status_code=303)


@router.get("/s/{share_token}", response_class=HTMLResponse)
def shared_view(request: Request, share_token: str, db: Session = Depends(get_db)):
    packing_list = db.execute(select(PackingList).where(PackingList.share_token == share_token)).scalar_one_or_none()
    if not packing_list or not packing_list.is_shared:
        raise HTTPException(status_code=404, detail="Shared list not found")
    summary = compute_summary(packing_list.items)
    return templates.TemplateResponse(
        request,
        "pages/shared_view.html",
        _ctx(request, packing_list=packing_list, summary=summary),
    )


@router.post("/lists/{list_id}/share/regenerate")
def regenerate_share_token(list_id: str, db: Session = Depends(get_db)):
    packing_list = _get_list_or_404(db, list_id)
    packing_list.share_token = generate_share_token()
    db.commit()
    return RedirectResponse(url=f"/lists/{packing_list.id}", status_code=303)
