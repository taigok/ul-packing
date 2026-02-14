from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from ul_packing.models import Category, ItemKind, Unit


class ApiError(BaseModel):
    code: str
    message: str
    details: Any | None = None


class ApiErrorResponse(BaseModel):
    error: ApiError


class SummaryOut(BaseModel):
    base_weight_g: int
    consumable_weight_g: int
    worn_weight_g: int
    total_pack_g: int


class GearItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    list_id: str
    name: str
    category: Category
    weight_grams: int
    quantity: int
    kind: ItemKind
    notes: str
    sort_order: int


class GearListItemOut(BaseModel):
    id: str
    list_id: str
    list_title: str
    name: str
    category: Category
    kind: ItemKind
    weight_grams: int
    quantity: int
    notes: str
    sort_order: int


class PackingListListItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    unit: Unit
    share_token: str
    is_shared: bool
    created_at: datetime
    updated_at: datetime


class PackingListDetailOut(PackingListListItemOut):
    items: list[GearItemOut]
    summary: SummaryOut


class SharedPackingListOut(BaseModel):
    id: str
    title: str
    description: str
    unit: Unit
    items: list[GearItemOut]
    summary: SummaryOut


class DataResponse(BaseModel):
    data: Any


class CreateListIn(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)


class UpdateListIn(CreateListIn):
    pass


class CreateItemIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: Category = Category.OTHER
    weight_grams: int = Field(ge=1)
    quantity: int = Field(default=1, ge=1)
    kind: ItemKind = ItemKind.BASE
    notes: str = ""


class UpdateItemIn(CreateItemIn):
    pass


class SetUnitIn(BaseModel):
    unit: Unit
