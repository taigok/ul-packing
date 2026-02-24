from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ul_packing.db import Base


class Unit(StrEnum):
    G = "g"
    OZ = "oz"


class Category(StrEnum):
    SHELTER = "shelter"
    SLEEPING = "sleeping"
    BACKPACK = "backpack"
    CLOTHING = "clothing"
    COOKING = "cooking"
    FOOD = "food"
    WATER = "water"
    ELECTRONICS = "electronics"
    OTHER = "other"


class ItemKind(StrEnum):
    BASE = "base"
    CONSUMABLE = "consumable"
    WORN = "worn"


class PackingList(Base):
    __tablename__ = "packing_lists"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    unit: Mapped[Unit] = mapped_column(Enum(Unit), default=Unit.G, nullable=False)
    share_token: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    is_shared: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_template: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    items: Mapped[list[GearItem]] = relationship(
        back_populates="packing_list",
        cascade="all, delete-orphan",
        order_by="GearItem.sort_order",
    )


class GearItem(Base):
    __tablename__ = "gear_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    list_id: Mapped[str] = mapped_column(String(36), ForeignKey("packing_lists.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[Category] = mapped_column(Enum(Category), nullable=False)
    weight_grams: Mapped[int] = mapped_column(Integer, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    kind: Mapped[ItemKind] = mapped_column(Enum(ItemKind), nullable=False, default=ItemKind.BASE)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    packing_list: Mapped[PackingList] = relationship(back_populates="items")
